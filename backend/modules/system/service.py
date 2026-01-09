# -*- coding: utf-8 -*-
"""
System module - Service layer
"""
import logging
from typing import Dict, Any

from db.DBFactory import query_SystemCfg, update_SystemCfg

logger = logging.getLogger(__name__)


class SystemService:
    """Service for managing system configuration"""

    @staticmethod
    def get_system_config() -> Dict[str, Any]:
        """Get system configuration"""
        config = query_SystemCfg()
        return {
            "theme": getattr(config, 'theme', 'dark'),
            "language": getattr(config, 'language', 'zh'),
            "minirunontray": getattr(config, 'minirunontray', True)
        }

    @staticmethod
    def update_system_config(**kwargs) -> None:
        """Update system configuration"""
        update_SystemCfg(**kwargs)
