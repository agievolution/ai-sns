# -*- coding: utf-8 -*-
"""
KM Note schemas - 笔记相关的数据模型
"""
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime


class NoteCreate(BaseModel):
    """创建笔记的请求模型"""
    title: str
    content: str
    tags: Optional[List[str]] = []
    km_id: Optional[str] = None  # Knowledge base ID


class NoteUpdate(BaseModel):
    """更新笔记的请求模型"""
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    is_pinned: Optional[bool] = None


class NoteResponse(BaseModel):
    """笔记响应模型"""
    id: int
    title: str
    content: str
    tags: List[str] = []
    is_pinned: bool = False
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
