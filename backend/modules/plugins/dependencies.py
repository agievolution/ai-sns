# -*- coding: utf-8 -*-
"""
Plugins module - Dependencies
"""
from .service import PluginService


def get_plugin_service() -> PluginService:
    """Get plugin service instance"""
    return PluginService()
