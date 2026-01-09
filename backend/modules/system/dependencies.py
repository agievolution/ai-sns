# -*- coding: utf-8 -*-
"""
System module - Dependencies
"""
from .service import SystemService


def get_system_service() -> SystemService:
    """Get system service instance"""
    return SystemService()
