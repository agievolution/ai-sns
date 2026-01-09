# -*- coding: utf-8 -*-
"""
Agent module - API router
"""
import logging
from typing import List
from fastapi import APIRouter, HTTPException, Depends

from .schemas import AgentConfig, AgentResponse
from .service import AgentService
from .dependencies import get_agent_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("", response_model=dict)
async def get_agents(service: AgentService = Depends(get_agent_service)):
    """
    Get all agent configurations

    Returns:
        List of agent configurations
    """
    try:
        agents = service.get_all_agents()
        return {"success": True, "data": agents}
    except Exception as e:
        logger.error(f"Error getting agents: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=dict)
async def create_agent(
    config: AgentConfig,
    service: AgentService = Depends(get_agent_service)
):
    """
    Create a new agent

    Args:
        config: Agent configuration

    Returns:
        Created agent ID
    """
    try:
        agent_id = service.create_agent(
            name=config.name,
            description=config.description,
            model=config.model,
            api_key=config.api_key,
            temperature=config.temperature,
            max_tokens=config.max_tokens,
            system_prompt=config.system_prompt
        )
        return {"success": True, "data": {"id": agent_id}}
    except Exception as e:
        logger.error(f"Error creating agent: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{agent_id}", response_model=dict)
async def update_agent(
    agent_id: int,
    config: AgentConfig,
    service: AgentService = Depends(get_agent_service)
):
    """
    Update agent configuration

    Args:
        agent_id: Agent ID
        config: Updated agent configuration

    Returns:
        Success status
    """
    try:
        service.update_agent(agent_id, **config.dict(exclude_unset=True))
        return {"success": True}
    except Exception as e:
        logger.error(f"Error updating agent: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{agent_id}", response_model=dict)
async def delete_agent(
    agent_id: int,
    service: AgentService = Depends(get_agent_service)
):
    """
    Delete an agent

    Args:
        agent_id: Agent ID

    Returns:
        Success status
    """
    try:
        service.delete_agent(agent_id)
        return {"success": True}
    except Exception as e:
        logger.error(f"Error deleting agent: {e}")
        raise HTTPException(status_code=500, detail=str(e))
