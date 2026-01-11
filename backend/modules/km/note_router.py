# -*- coding: utf-8 -*-
"""
KM Note Router - 笔记API路由
"""
import logging
from fastapi import APIRouter, HTTPException
from typing import List

from .note_schemas import NoteCreate, NoteUpdate, NoteResponse
from .note_service import NoteService

logger = logging.getLogger(__name__)

router = APIRouter()
note_service = NoteService()


@router.get("/notes", response_model=List[NoteResponse])
async def get_all_notes():
    """获取所有笔记列表"""
    try:
        notes = note_service.get_all_notes()
        return notes
    except Exception as e:
        logger.error(f"Error getting notes: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/notes/{note_id}", response_model=NoteResponse)
async def get_note(note_id: int):
    """获取单个笔记"""
    try:
        note = note_service.get_note(note_id)
        if not note:
            raise HTTPException(status_code=404, detail="Note not found")
        return note
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting note: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/notes", response_model=NoteResponse)
async def create_note(note_data: NoteCreate):
    """创建新笔记"""
    try:
        note = note_service.create_note(
            title=note_data.title,
            content=note_data.content,
            tags=note_data.tags
        )
        return note
    except Exception as e:
        logger.error(f"Error creating note: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/notes/{note_id}", response_model=NoteResponse)
async def update_note(note_id: int, note_data: NoteUpdate):
    """更新笔记"""
    try:
        note = note_service.update_note(
            note_id=note_id,
            title=note_data.title,
            content=note_data.content,
            tags=note_data.tags,
            is_pinned=note_data.is_pinned
        )
        if not note:
            raise HTTPException(status_code=404, detail="Note not found")
        return note
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating note: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/notes/{note_id}")
async def delete_note(note_id: int):
    """删除笔记"""
    try:
        success = note_service.delete_note(note_id)
        if not success:
            raise HTTPException(status_code=404, detail="Note not found")
        return {"success": True, "message": "Note deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting note: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/notes/{note_id}/toggle-pin", response_model=NoteResponse)
async def toggle_pin_note(note_id: int):
    """切换笔记置顶状态"""
    try:
        note = note_service.toggle_pin(note_id)
        if not note:
            raise HTTPException(status_code=404, detail="Note not found")
        return note
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error toggling pin: {e}")
        raise HTTPException(status_code=500, detail=str(e))
