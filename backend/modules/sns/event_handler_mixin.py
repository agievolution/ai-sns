from sqlalchemy.orm import Session
from backend.database.models.chat import AiChatCfg
from backend.modules.sns.map_task_manager import MapTaskManager
from backend.modules.sns.js_task_manager import JsTaskManager
from backend.modules.sns.xmpp_client import XMPPClientManager
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


class EventHandlerMixin:

    def handle_event_before_decistion(self, tool_name, ask_content):
        self.command_status = "handle_event_before_decistion"
        tool_record = query_single_tool(name=tool_name)
        tool_id = tool_record.id
        what_to_do = ask_content if ask_content else "请执行"
        self.ask_agent_to_run_a_tool(tool_id, tool_name, what_to_do)

    def handle_event_before_decistion_result(self, ask_content):
        self.command_status = "ask_agent_instruction_to_process_activity"
        self.handle_ask_agent_instruction_to_process_activity(ask_content)

    async def handle_event_after_decistion(self, tool_name, instruction):
        self.command_status = "handle_event_after_decistion"
        tool_record = query_single_tool(name=tool_name)
        tool_id = tool_record.id
        what_to_do = instruction
        await self.ask_agent_to_run_a_tool(tool_id, tool_name, what_to_do)

    def handle_event_after_decistion_result(self, instruction):
        self.command_status = ""
        self.handle_parse_agent_instruction_for_process_activity(instruction)

    def handle_event_receive_msg(self, tool_name, content, from_str):
        self.command_status = "handle_event_receive_msg"
        tool_record = query_single_tool(name=tool_name)
        tool_id = tool_record.id
        what_to_do = content
        self.ask_agent_to_run_a_tool_sync(tool_id, tool_name, what_to_do)

    def handle_event_receive_msg_result(self, content):
        self.command_status = ""
        from_str = self.current_talk_people["account"]
        asyncio.create_task(self.handle_receiveMessage(content, from_str))

    def handle_event_before_send_msg(self, tool_name, content, conversation_type):
        self.command_status = "handle_event_before_send_msg"
        tool_record = query_single_tool(name=tool_name)
        tool_id = tool_record.id
        what_to_do = content
        self.ask_agent_to_run_a_tool_sync(tool_id, tool_name, what_to_do)

    def handle_event_before_send_msg_result(self, content):
        self.command_status = ""
        if self.talk_type == "sell":
            self.handle_agent_review_conversation_sell_result_final(content)
        else:
            self.handle_agent_review_conversation_result_final(content)

    def handle_event_before_decistion(self, tool_name, ask_content):
        self.command_status = "handle_event_before_decistion"
        tool_record = query_single_tool(name=tool_name)
        tool_id = tool_record.id
        what_to_do = ask_content if ask_content else "请执行"
        self.ask_agent_to_run_a_tool_sync(tool_id, tool_name, what_to_do)

    def handle_event_before_decistion_result(self, ask_content):
        self.command_status = "ask_agent_instruction_to_process_activity"
        asyncio.create_task(self.handle_ask_agent_instruction_to_process_activity(ask_content))

