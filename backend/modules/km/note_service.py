# -*- coding: utf-8 -*-
"""
KM Note Service - 笔记服务（向后兼容版本）
使用SQLite数据库存储笔记数据，兼容旧表结构
"""
import json
from datetime import datetime
from typing import List, Optional, Dict
from sqlalchemy import and_, or_, text
from sqlalchemy.orm import Session

from backend.database.base import SessionLocal, create_all_tables, engine
from backend.database.models.km import NoteMng


class NoteService:
    """笔记服务类 - 使用SQLite数据库（向后兼容）"""

    def __init__(self):
        """初始化笔记服务"""
        # 确保数据库表已创建
        create_all_tables()

        # 检查表结构并添加缺失的列
        self._ensure_columns()

    def _ensure_columns(self):
        """确保所有必要的列都存在"""
        try:
            with engine.connect() as conn:
                # 检查列是否存在
                result = conn.execute(text("PRAGMA table_info(note_mng)"))
                columns = [row[1] for row in result]

                # 添加缺失的列
                if 'tags' not in columns:
                    try:
                        conn.execute(text("ALTER TABLE note_mng ADD COLUMN tags TEXT"))
                        conn.commit()
                        print("✅ 已添加 tags 列")
                    except Exception as e:
                        print(f"⚠️  添加 tags 列失败: {e}")

                if 'is_pinned' not in columns:
                    try:
                        conn.execute(text("ALTER TABLE note_mng ADD COLUMN is_pinned BOOLEAN DEFAULT 0"))
                        conn.commit()
                        print("✅ 已添加 is_pinned 列")
                    except Exception as e:
                        print(f"⚠️  添加 is_pinned 列失败: {e}")

                if 'updated_at' not in columns:
                    try:
                        conn.execute(text("ALTER TABLE note_mng ADD COLUMN updated_at DATETIME"))
                        conn.execute(text("UPDATE note_mng SET updated_at = create_time WHERE updated_at IS NULL"))
                        conn.commit()
                        print("✅ 已添加 updated_at 列")
                    except Exception as e:
                        print(f"⚠️  添加 updated_at 列失败: {e}")

        except Exception as e:
            print(f"⚠️  检查/添加列时出错: {e}")

    def _get_session(self) -> Session:
        """获取数据库会话"""
        return SessionLocal()

    def _note_to_dict(self, note: NoteMng) -> Dict:
        """将数据库模型转换为字典"""
        # 解析tags字段
        tags = []
        if hasattr(note, 'tags') and note.tags:
            try:
                tags = json.loads(note.tags)
            except:
                tags = []

        # 安全获取字段
        is_pinned = getattr(note, 'is_pinned', False) or False
        updated_at = getattr(note, 'updated_at', None)

        if not updated_at and note.create_time:
            updated_at = note.create_time

        return {
            'id': note.id,
            'title': note.title or '',
            'content': note.content or '',
            'tags': tags,
            'is_pinned': is_pinned,
            'created_at': note.create_time.isoformat() if note.create_time else datetime.now().isoformat(),
            'updated_at': updated_at.isoformat() if updated_at else datetime.now().isoformat()
        }

    def create_note(self, title: str, content: str, tags: List[str] = None, km_id: str = None) -> Dict:
        """创建新笔记"""
        session = self._get_session()
        try:
            now = datetime.now()
            note_data = {
                'title': title,
                'content': content,
                'is_delete': False,
                'create_time': now,
            }

            # Add km_id if provided
            if km_id:
                note_data['km_id'] = km_id

            # 只在列存在时才设置
            try:
                note_data['tags'] = json.dumps(tags or [], ensure_ascii=False)
                note_data['is_pinned'] = False
                note_data['updated_at'] = now
            except:
                pass

            note = NoteMng(**note_data)

            session.add(note)
            session.commit()
            session.refresh(note)

            return self._note_to_dict(note)
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()

    def get_all_notes(self) -> List[Dict]:
        """获取所有笔记（未删除的）"""
        session = self._get_session()
        try:
            notes = session.query(NoteMng).filter(
                NoteMng.is_delete == False
            ).all()

            return [self._note_to_dict(note) for note in notes]
        finally:
            session.close()

    def get_note(self, note_id: int) -> Optional[Dict]:
        """获取单个笔记"""
        session = self._get_session()
        try:
            note = session.query(NoteMng).filter(
                and_(
                    NoteMng.id == note_id,
                    NoteMng.is_delete == False
                )
            ).first()

            if note:
                return self._note_to_dict(note)
            return None
        finally:
            session.close()

    def update_note(self, note_id: int, title: str = None, content: str = None,
                   tags: List[str] = None, is_pinned: bool = None) -> Optional[Dict]:
        """更新笔记"""
        session = self._get_session()
        try:
            note = session.query(NoteMng).filter(
                and_(
                    NoteMng.id == note_id,
                    NoteMng.is_delete == False
                )
            ).first()

            if not note:
                return None

            # 更新字段
            if title is not None:
                note.title = title
            if content is not None:
                note.content = content

            # 只在列存在时才更新
            try:
                if tags is not None and hasattr(note, 'tags'):
                    note.tags = json.dumps(tags, ensure_ascii=False)
                if is_pinned is not None and hasattr(note, 'is_pinned'):
                    note.is_pinned = is_pinned
                    if is_pinned and hasattr(note, 'stick_time'):
                        note.stick_time = datetime.now()
                    elif hasattr(note, 'stick_time'):
                        note.stick_time = None
                if hasattr(note, 'updated_at'):
                    note.updated_at = datetime.now()
            except Exception as e:
                print(f"⚠️  更新扩展字段时出错: {e}")

            session.commit()
            session.refresh(note)

            return self._note_to_dict(note)
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()

    def delete_note(self, note_id: int) -> bool:
        """删除笔记（软删除）"""
        session = self._get_session()
        try:
            note = session.query(NoteMng).filter(
                and_(
                    NoteMng.id == note_id,
                    NoteMng.is_delete == False
                )
            ).first()

            if not note:
                return False

            note.is_delete = True

            try:
                if hasattr(note, 'updated_at'):
                    note.updated_at = datetime.now()
            except:
                pass

            session.commit()
            return True
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()

    def toggle_pin(self, note_id: int) -> Optional[Dict]:
        """切换笔记置顶状态"""
        session = self._get_session()
        try:
            note = session.query(NoteMng).filter(
                and_(
                    NoteMng.id == note_id,
                    NoteMng.is_delete == False
                )
            ).first()

            if not note:
                return None

            # 只在列存在时才更新
            try:
                if hasattr(note, 'is_pinned'):
                    note.is_pinned = not note.is_pinned
                    if hasattr(note, 'stick_time'):
                        note.stick_time = datetime.now() if note.is_pinned else None
                if hasattr(note, 'updated_at'):
                    note.updated_at = datetime.now()
            except Exception as e:
                print(f"⚠️  切换置顶状态时出错: {e}")

            session.commit()
            session.refresh(note)

            return self._note_to_dict(note)
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()


    def search_notes(self, query: str = "", km_id: str = None) -> List[Dict]:
        """
        搜索笔记

        Args:
            query: 搜索关键词（搜索标题、内容、标签）
            km_id: 知识库ID（字符串，如"note_store"，可选，用于过滤特定知识库的笔记）

        Returns:
            符合条件的笔记列表
        """
        session = SessionLocal()
        try:
            # 构建查询
            filters = [NoteMng.is_delete == False]

            # 添加知识库过滤
            if km_id is not None:
                filters.append(NoteMng.km_id == km_id)

            # 添加搜索条件
            if query and query.strip():
                search_term = f"%{query}%"
                filters.append(
                    or_(
                        NoteMng.title.like(search_term),
                        NoteMng.content.like(search_term),
                        NoteMng.tags.like(search_term)
                    )
                )

            # 执行查询
            notes = session.query(NoteMng).filter(and_(*filters)).all()

            # 转换为字典列表
            result = [self._note_to_dict(note) for note in notes]

            # 按置顶和更新时间排序
            result.sort(key=lambda x: (
                not x.get('is_pinned', False),  # 置顶的在前
                -(datetime.fromisoformat(x.get('updated_at') or x.get('create_time') or datetime.now().isoformat()).timestamp())  # 新的在前
            ))

            return result
        except Exception as e:
            raise e
        finally:
            session.close()
