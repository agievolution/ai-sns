# -*- coding: utf-8 -*-
"""
System module - API router
"""
import logging
from fastapi import APIRouter, HTTPException, Depends
from typing import List

from .schemas import SystemConfig
from .service import SystemService
from .dependencies import get_system_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/config", response_model=dict)
async def get_system_config(service: SystemService = Depends(get_system_service)):
    """
    Get system configuration

    Returns:
        System configuration
    """
    try:
        config = service.get_system_config()
        return {"success": True, "data": config}
    except Exception as e:
        logger.error(f"Error getting system config: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/config", response_model=dict)
async def update_system_config(
    config: SystemConfig,
    service: SystemService = Depends(get_system_service)
):
    """
    Update system configuration

    Args:
        config: Updated system configuration

    Returns:
        Success status
    """
    try:
        service.update_system_config(**config.dict(exclude_unset=True))
        return {"success": True}
    except Exception as e:
        logger.error(f"Error updating system config: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/web-mng", response_model=dict)
async def get_web_mng(service: SystemService = Depends(get_system_service)):
    """
    Get web management data (LLM and Tools)

    Returns:
        List of web management items
    """
    try:
        data = service.get_web_mng()
        return {"success": True, "data": data}
    except Exception as e:
        logger.error(f"Error getting web-mng data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/web-mng", response_model=dict)
async def create_web_mng(
    item: dict,
    service: SystemService = Depends(get_system_service)
):
    """
    Create new web management item

    Args:
        item: Web management item data

    Returns:
        Created item
    """
    try:
        result = service.create_web_mng(item)
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"Error creating web-mng item: {e}")
        raise HTTPException(status_code=500, detail=str(e))
