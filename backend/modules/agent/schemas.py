# -*- coding: utf-8 -*-
"""
Agent module - Pydantic schemas
"""
from typing import Optional
from pydantic import BaseModel


class AgentConfig(BaseModel):
    """Agent configuration model"""
    id: Optional[int] = None
    name: str
    description: Optional[str] = ""
    model: Optional[str] = "gpt-4"
    api_key: Optional[str] = ""
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 2048
    system_prompt: Optional[str] = ""
    is_active: Optional[bool] = True


class AgentResponse(BaseModel):
    """Agent response model"""
    id: int
    name: str
    description: Optional[str] = ""
    model: Optional[str] = "gpt-4"
    is_active: Optional[bool] = True
