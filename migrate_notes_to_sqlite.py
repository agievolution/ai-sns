#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数据迁移脚本：将JSON文件中的笔记数据迁移到SQLite数据库
"""
import json
import os
import sys
from pathlib import Path
from datetime import datetime

# 添加项目根目录到路径
project_root = Path(__file__).resolve().parent
sys.path.insert(0, str(project_root))

from backend.database.base import SessionLocal, create_all_tables
from backend.database.models.km import NoteMng


def migrate_notes_from_json():
    """从JSON文件迁移笔记到SQLite数据库"""

    # JSON文件路径
    json_file = project_root / "km" / "notes" / "notes.json"

    if not json_file.exists():
        print(f"❌ JSON文件不存在: {json_file}")
        print("✅ 没有需要迁移的数据")
        return

    # 读取JSON数据
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            notes_data = json.load(f)
    except Exception as e:
        print(f"❌ 读取JSON文件失败: {e}")
        return

    if not notes_data:
        print("✅ JSON文件为空，没有需要迁移的数据")
        return

    print(f"📋 找到 {len(notes_data)} 条笔记需要迁移")

    # 确保数据库表已创建
    create_all_tables()
    print("✅ 数据库表已创建/确认")

    # 获取数据库会话
    session = SessionLocal()

    try:
        migrated_count = 0
        skipped_count = 0

        for note_data in notes_data:
            try:
                # 解析日期
                created_at = note_data.get('created_at')
                updated_at = note_data.get('updated_at')

                if isinstance(created_at, str):
                    created_at = datetime.fromisoformat(created_at)
                else:
                    created_at = datetime.now()

                if isinstance(updated_at, str):
                    updated_at = datetime.fromisoformat(updated_at)
                else:
                    updated_at = datetime.now()

                # 创建数据库记录
                note = NoteMng(
                    title=note_data.get('title', ''),
                    content=note_data.get('content', ''),
                    tags=json.dumps(note_data.get('tags', []), ensure_ascii=False),
                    is_pinned=note_data.get('is_pinned', False),
                    is_delete=False,
                    create_time=created_at,
                    updated_at=updated_at,
                    stick_time=updated_at if note_data.get('is_pinned', False) else None
                )

                session.add(note)
                migrated_count += 1

            except Exception as e:
                print(f"⚠️  迁移笔记失败: {note_data.get('title', 'Unknown')}, 错误: {e}")
                skipped_count += 1
                continue

        # 提交所有更改
        session.commit()
        print(f"\n✅ 迁移完成!")
        print(f"   成功迁移: {migrated_count} 条")
        if skipped_count > 0:
            print(f"   跳过: {skipped_count} 条")

        # 备份JSON文件
        backup_file = json_file.parent / f"notes_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        json_file.rename(backup_file)
        print(f"\n📦 原JSON文件已备份到: {backup_file}")

    except Exception as e:
        session.rollback()
        print(f"\n❌ 迁移失败: {e}")
        raise
    finally:
        session.close()


def verify_migration():
    """验证迁移结果"""
    session = SessionLocal()
    try:
        count = session.query(NoteMng).filter(NoteMng.is_delete == False).count()
        print(f"\n🔍 验证：数据库中共有 {count} 条笔记")

        if count > 0:
            # 显示前5条笔记
            notes = session.query(NoteMng).filter(NoteMng.is_delete == False).limit(5).all()
            print("\n前5条笔记：")
            for note in notes:
                print(f"  - ID: {note.id}, 标题: {note.title}, 置顶: {note.is_pinned}")
    finally:
        session.close()


if __name__ == "__main__":
    print("=" * 60)
    print("笔记数据迁移工具")
    print("从 JSON 文件迁移到 SQLite 数据库")
    print("=" * 60)
    print()

    migrate_notes_from_json()
    verify_migration()

    print("\n" + "=" * 60)
    print("迁移完成！现在可以使用SQLite数据库了")
    print("=" * 60)
