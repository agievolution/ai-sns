# -*- coding: utf-8 -*-
"""
Plugins module - Pydantic schemas
"""
from typing import Optional
from pydantic import BaseModel


class PluginInfo(BaseModel):
    """Plugin information model"""
    name: str
    path: str
    enabled: bool
    description: Optional[str] = ""
    version: Optional[str] = "1.0.0"
