# -*- coding: utf-8 -*-
"""
Plugins module - API router
"""
import logging
from fastapi import APIRouter, HTTPException, Depends

from .schemas import PluginInfo
from .service import PluginService
from .dependencies import get_plugin_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("", response_model=dict)
async def get_plugins(service: PluginService = Depends(get_plugin_service)):
    """
    Get all available plugins

    Returns:
        List of plugin information
    """
    try:
        plugins = service.get_all_plugins()
        return {"success": True, "data": plugins}
    except Exception as e:
        logger.error(f"Error getting plugins: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{plugin_name}", response_model=dict)
async def get_plugin_info(
    plugin_name: str,
    service: PluginService = Depends(get_plugin_service)
):
    """
    Get information about a specific plugin

    Args:
        plugin_name: Plugin name

    Returns:
        Plugin information
    """
    try:
        plugin_info = service.get_plugin_info(plugin_name)
        return {"success": True, "data": plugin_info}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting plugin info: {e}")
        raise HTTPException(status_code=500, detail=str(e))
