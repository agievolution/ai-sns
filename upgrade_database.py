#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数据库升级脚本：为note_mng表添加新字段
"""
import sqlite3
import sys
import time
from pathlib import Path

# 数据库路径
project_root = Path(__file__).resolve().parent
db_path = project_root / "db" / "db.sqlite"


def upgrade_database():
    """升级数据库，添加新字段"""

    if not db_path.exists():
        print("❌ 数据库文件不存在，请先运行应用程序创建数据库")
        return False

    print(f"📂 数据库路径: {db_path}")

    # 尝试连接数据库，设置超时时间
    max_retries = 3
    for attempt in range(max_retries):
        try:
            conn = sqlite3.connect(str(db_path), timeout=10.0)
            break
        except sqlite3.OperationalError as e:
            if attempt < max_retries - 1:
                print(f"⏳ 数据库正忙，等待 2 秒后重试... (尝试 {attempt + 1}/{max_retries})")
                time.sleep(2)
            else:
                print(f"❌ 无法连接到数据库: {e}")
                return False

    cursor = conn.cursor()

    try:
        # 检查表是否存在
        cursor.execute("""
            SELECT name FROM sqlite_master
            WHERE type='table' AND name='note_mng'
        """)
        if not cursor.fetchone():
            print("✅ note_mng表不存在，将在首次运行时自动创建")
            return True

        # 获取现有列
        cursor.execute("PRAGMA table_info(note_mng)")
        columns = [row[1] for row in cursor.fetchall()]
        print(f"📋 现有字段: {', '.join(columns)}")

        changes_made = False

        # 添加tags字段
        if 'tags' not in columns:
            print("➕ 添加 'tags' 字段...")
            cursor.execute("ALTER TABLE note_mng ADD COLUMN tags TEXT")
            changes_made = True
            print("✅ tags 字段添加成功")
        else:
            print("✓ tags 字段已存在")

        # 添加is_pinned字段
        if 'is_pinned' not in columns:
            print("➕ 添加 'is_pinned' 字段...")
            cursor.execute("ALTER TABLE note_mng ADD COLUMN is_pinned BOOLEAN DEFAULT 0")
            changes_made = True
            print("✅ is_pinned 字段添加成功")
        else:
            print("✓ is_pinned 字段已存在")

        # 添加updated_at字段
        if 'updated_at' not in columns:
            print("➕ 添加 'updated_at' 字段...")
            cursor.execute("ALTER TABLE note_mng ADD COLUMN updated_at DATETIME")
            # 为现有记录设置updated_at = create_time
            cursor.execute("UPDATE note_mng SET updated_at = create_time WHERE updated_at IS NULL")
            changes_made = True
            print("✅ updated_at 字段添加成功")
        else:
            print("✓ updated_at 字段已存在")

        if changes_made:
            conn.commit()
            print("\n✅ 数据库升级完成!")
        else:
            print("\n✅ 数据库已是最新版本，无需升级")

        return True

    except Exception as e:
        conn.rollback()
        print(f"\n❌ 数据库升级失败: {e}")
        return False
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    print("=" * 60)
    print("数据库升级工具")
    print("为 note_mng 表添加新字段")
    print("=" * 60)
    print()

    success = upgrade_database()

    print("\n" + "=" * 60)
    if success:
        print("升级完成！可以使用新功能了")
    else:
        print("升级失败，请检查错误信息")
        print("\n提示：如果数据库被锁定，请：")
        print("1. 停止所有正在运行的后端服务")
        print("2. 等待几秒钟")
        print("3. 再次运行此脚本")
    print("=" * 60)
