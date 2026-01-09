# -*- coding: utf-8 -*-
"""
Plugins module - Service layer
"""
import logging
from typing import List, Dict, Any
from pathlib import Path

logger = logging.getLogger(__name__)


class PluginService:
    """Service for managing plugins"""

    @staticmethod
    def get_all_plugins() -> List[Dict[str, Any]]:
        """Get all available plugins"""
        plugins = []
        plugin_dir = Path("pluginsmanager/plugins_gui")

        if plugin_dir.exists():
            for plugin_path in plugin_dir.iterdir():
                if plugin_path.is_dir() and (plugin_path / "main.py").exists():
                    plugins.append({
                        "name": plugin_path.name,
                        "path": str(plugin_path),
                        "enabled": True
                    })

        return plugins

    @staticmethod
    def get_plugin_info(plugin_name: str) -> Dict[str, Any]:
        """
        Get information about a specific plugin

        Args:
            plugin_name: Plugin name

        Returns:
            Plugin information
        """
        plugin_dir = Path("pluginsmanager/plugins_gui") / plugin_name

        if not plugin_dir.exists():
            raise ValueError(f"Plugin '{plugin_name}' not found")

        return {
            "name": plugin_name,
            "path": str(plugin_dir),
            "enabled": True,
            "has_main": (plugin_dir / "main.py").exists(),
            "has_application": (plugin_dir / "application.py").exists()
        }
