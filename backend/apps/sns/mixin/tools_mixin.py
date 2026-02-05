from sqlalchemy.orm import Session
from backend.database.models.chat import AiChatCfg
from backend.apps.sns.map_task_manager import MapTaskManager
from backend.apps.sns.js_task_manager import JsTaskManager
from backend.apps.sns.xmpp_client import XMPPClientManager
from backend.modules.agent.agent_manager import agent_manager
from backend.shared.websocket_manager import manager as websocket_manager

# *********
import os
import math
# 主要用于发送附件
import asyncio
import zipfile
import shutil
import time

import logging

import re

log = logging.getLogger(__name__)
from db.DBFactory import (query_AgentCfg, add_AIChatMessages, get_prompt_by_title, query_function_mng,
                          add_function_mng, update_map_task, add_map_visit, get_key_value,
                          update_map_trade, add_map_trade, add_map_tool, query_single_map_trade, update_AiChatCfg_by_user_id, update_AiChatCfg_map, query_AiChatCfg_map, add_mcp_mng, query_mcp_mng,
                          delete_map_preset_msg, query_map_preset_msg_all, add_map_preset_msg, query_tool_list, query_single_tool, query_AiChatCfg_map_setting)
from util import (generate_random_id, add_memory_list)
from i18n import lt
from enum import Enum
from typing import List, Dict, Optional
import json
import logging
import requests
import geopy.distance
from geopy.distance import distance
from geopy.point import Point
from geographiclib.geodesic import Geodesic
import random

logger = logging.getLogger(__name__)


class ToolsMixin:

    def use_service(self, action_str, instrunction):
        asyncio.create_task(
            self.ask_agent_to_use_service(
                action_str,
                human_objective_to_achieve=instrunction,
            )
        )

    def get_service_list(self):
        url = "http://www.ai-sns.org/api/get_service_list/"

        pos = self.aichatcfg_record.current_position

        params = {
            "lng": pos[0],
            "lat": pos[1]
        }
        service_list = self.http_request(url, params)
        return service_list

    def update_service_list(self):
        url = "http://www.ai-sns.org/api/get_service"
        params = {
            "lng": self.aichatcfg_record.current_position[0],
            "lat": self.aichatcfg_record.current_position[1]
        }
        # people={
        #     "name":"Same",
        #     "position":[121.121,23.4554]
        # }
        service_list = self.http_request(url, params)

        return service_list

    async def ask_agent_to_use_service(self, objective_to_achieve, human_objective_to_achieve=""):
        service_list = json.dumps(self.get_service_list(), indent=4, ensure_ascii=False)
        objective_to_achieve = f"{human_objective_to_achieve}{objective_to_achieve}"
        role_prompt = get_prompt_by_title("__ask_agent_use_service__")
        role_prompt = role_prompt.replace("__service_list__", service_list)
        # role_prompt = role_prompt.replace("__objective_to_achieve__", objective_to_achieve)

        question = f"当前的目标是：{objective_to_achieve}。请根据相关的任务要求，准确选择服务，如果没有合适的服务请返回空列表。"

        self.command_status = "ask_agent_to_use_service"
        await self.ask_agent_and_get_instruction(question, role_prompt)

    def on_ask_agent_to_use_service_return(self, content):
        self.parse_content_to_call_service(content)


    def parse_content_to_call_service(self, content):
        try:
            data = json.loads(content)
            url = data["address"]
            method = data.get("method", "get").lower()  # Default to 'get' if not specified or invalid
            params = data.get("Parameter", {})  # Use "Parameter" key, handle missing key gracefully

            if not isinstance(url, str) or not url.startswith("http"):
                raise ValueError("Invalid 'address' value. Must be a valid URL.")

            if method not in ["get", "post", "put", "delete", "patch"]:  # Validate method
                raise ValueError("Invalid 'method' value. Supported methods: get, post, put, delete, patch")

            response = self.call_service(url, method, **params)
            return response  # Return the response

        except (json.JSONDecodeError, KeyError, ValueError) as e:
            print(f"Error processing content: {e}")
            return None  # or raise the exception, depending on desired behavior

    def call_service(self, url, method, **params):
        try:
            if method == "get":
                response = requests.get(url, params=params)
            elif method == "post":
                response = requests.post(url, json=params)  # Use 'data' for post
            elif method == "put":
                response = requests.put(url, json=params)
            elif method == "delete":
                response = requests.delete(url, params=params)
            elif method == "patch":
                response = requests.patch(url, json=params)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")

            response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)
            self.handle_service_called_result(response.text)  # Assuming the response is JSON, parse and return it
            return response.text
        except requests.exceptions.RequestException as e:
            print(f"Error calling service: {e}")
            return None  # Or handle the error as needed, e.g., retry, log, etc.
        except ValueError as e:
            print(f"Error calling service: {e}")
            return None

    def handle_service_called_result(self, response_text):
        action_result = response_text
        self.action_result = action_result
        self.taskmng.add_process_info_to_list(f"system:调用了Web Service获得如下结果:{action_result}")
        self.write_task_process_to_pane(action_result + "\n\n")
        self.show_alert_on_map(action_result)
        ask_content = ""
        asyncio.create_task(self.taskmng.process_task(action="process_activity", ask_content=ask_content))
