#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
使用SQLAlchemy进行数据库升级 - 添加缺失的列
"""
import sys
from pathlib import Path

# 添加项目根目录到路径
project_root = Path(__file__).resolve().parent
sys.path.insert(0, str(project_root))

from sqlalchemy import text, inspect
from backend.database.base import engine, Base
from backend.database.models.km import NoteMng


def upgrade_database_with_sqlalchemy():
    """使用SQLAlchemy升级数据库"""

    print("=" * 60)
    print("使用 SQLAlchemy 进行数据库升级")
    print("=" * 60)
    print()

    try:
        # 获取检查器
        inspector = inspect(engine)

        # 检查表是否存在
        if 'note_mng' not in inspector.get_table_names():
            print("✅ note_mng 表不存在，将创建新表...")
            Base.metadata.create_all(engine)
            print("✅ 表创建完成！")
            return True

        # 获取现有列
        columns = [col['name'] for col in inspector.get_columns('note_mng')]
        print(f"📋 现有字段: {', '.join(columns)}")

        # 需要添加的列
        columns_to_add = []

        if 'tags' not in columns:
            columns_to_add.append(('tags', 'TEXT'))

        if 'is_pinned' not in columns:
            columns_to_add.append(('is_pinned', 'BOOLEAN DEFAULT 0'))

        if 'updated_at' not in columns:
            columns_to_add.append(('updated_at', 'DATETIME'))

        if not columns_to_add:
            print("\n✅ 所有字段都已存在，无需升级！")
            return True

        # 使用原始SQL添加列
        print(f"\n需要添加 {len(columns_to_add)} 个字段...")

        with engine.connect() as conn:
            for col_name, col_type in columns_to_add:
                try:
                    print(f"➕ 添加字段: {col_name} ({col_type})")
                    sql = text(f"ALTER TABLE note_mng ADD COLUMN {col_name} {col_type}")
                    conn.execute(sql)
                    conn.commit()
                    print(f"   ✅ {col_name} 添加成功")
                except Exception as e:
                    if "duplicate column name" in str(e).lower():
                        print(f"   ⚠️  {col_name} 已存在，跳过")
                    else:
                        print(f"   ❌ {col_name} 添加失败: {e}")
                        raise

            # 为 updated_at 设置默认值
            if 'updated_at' in [col[0] for col in columns_to_add]:
                print("\n设置 updated_at 的默认值...")
                sql = text("UPDATE note_mng SET updated_at = create_time WHERE updated_at IS NULL")
                conn.execute(sql)
                conn.commit()
                print("✅ 默认值设置完成")

        print("\n" + "=" * 60)
        print("✅ 数据库升级成功完成！")
        print("=" * 60)
        return True

    except Exception as e:
        print(f"\n❌ 升级失败: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = upgrade_database_with_sqlalchemy()
    sys.exit(0 if success else 1)
