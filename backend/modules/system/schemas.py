# -*- coding: utf-8 -*-
"""
System module - Pydantic schemas
"""
from typing import Optional
from pydantic import BaseModel


class SystemConfig(BaseModel):
    """System configuration model"""
    theme: Optional[str] = "dark"
    language: Optional[str] = "zh"
    minirunontray: Optional[bool] = True
