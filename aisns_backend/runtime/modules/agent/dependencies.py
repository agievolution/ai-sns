# -*- coding: utf-8 -*-
"""
Agent module - Dependencies
"""
from .service import AgentService


def get_agent_service() -> AgentService:
    """Get agent service instance"""
    return AgentService()
