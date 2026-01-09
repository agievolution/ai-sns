# -*- coding: utf-8 -*-
"""
Agent module - Service layer
"""
import logging
from typing import List, Dict, Any
from db.DBFactory import (
    add_AgentCfg,
    query_AgentCfg_All,
    update_AgentCfg,
    delete_AgentCfg
)

logger = logging.getLogger(__name__)


class AgentService:
    """Service for managing agents"""

    @staticmethod
    def get_all_agents() -> List[Dict[str, Any]]:
        """Get all agent configurations"""
        agents = query_AgentCfg_All()
        result = []
        for agent in agents:
            result.append({
                "id": agent.id,
                "name": agent.name,
                "description": getattr(agent, 'description', ''),
                "model": getattr(agent, 'model', 'gpt-4'),
                "is_active": getattr(agent, 'is_active', True)
            })
        return result

    @staticmethod
    def create_agent(
        name: str,
        description: str = "",
        model: str = "gpt-4",
        api_key: str = "",
        temperature: float = 0.7,
        max_tokens: int = 2048,
        system_prompt: str = ""
    ) -> int:
        """Create a new agent"""
        agent_id = add_AgentCfg(
            name=name,
            description=description,
            model=model,
            api_key=api_key,
            temperature=temperature,
            max_tokens=max_tokens,
            system_prompt=system_prompt
        )
        return agent_id

    @staticmethod
    def update_agent(agent_id: int, **kwargs) -> None:
        """Update agent configuration"""
        update_AgentCfg(agent_id, **kwargs)

    @staticmethod
    def delete_agent(agent_id: int) -> None:
        """Delete an agent"""
        delete_AgentCfg(agent_id)
