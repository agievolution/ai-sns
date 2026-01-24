#!/usr/bin/env python3
"""
诊断 KM 模块导入问题
在 Windows 上运行此脚本来检查 KM 模块是否能正确导入
"""
import sys
import traceback

print("=" * 60)
print("KM 模块导入诊断")
print("=" * 60)

# 测试 1: 检查 Python 路径
print("\n1. Python 路径:")
for i, path in enumerate(sys.path, 1):
    print(f"   {i}. {path}")

# 测试 2: 尝试导入 backend 包
print("\n2. 测试导入 backend 包:")
try:
    import backend
    print(f"   ✓ backend 包导入成功")
    print(f"   路径: {backend.__file__}")
except Exception as e:
    print(f"   ✗ backend 包导入失败: {e}")
    traceback.print_exc()

# 测试 3: 尝试导入 backend.modules
print("\n3. 测试导入 backend.modules:")
try:
    import backend.modules
    print(f"   ✓ backend.modules 导入成功")
except Exception as e:
    print(f"   ✗ backend.modules 导入失败: {e}")
    traceback.print_exc()

# 测试 4: 尝试导入 backend.modules.km
print("\n4. 测试导入 backend.modules.km:")
try:
    import backend.modules.km
    print(f"   ✓ backend.modules.km 导入成功")
except Exception as e:
    print(f"   ✗ backend.modules.km 导入失败: {e}")
    traceback.print_exc()

# 测试 5: 尝试导入 KM router
print("\n5. 测试导入 KM router:")
try:
    from backend.modules.km.router import router as km_router
    print(f"   ✓ KM router 导入成功")
    print(f"   Router 类型: {type(km_router)}")
    print(f"   Router 路由数量: {len(km_router.routes)}")
except Exception as e:
    print(f"   ✗ KM router 导入失败: {e}")
    traceback.print_exc()

# 测试 6: 检查依赖
print("\n6. 检查 KM 模块依赖:")
dependencies = [
    "chromadb",
    "openai",
    "pypdf",
    "docx",
    "pptx",
    "openpyxl"
]

for dep in dependencies:
    try:
        if dep == "docx":
            __import__("docx")
            print(f"   ✓ python-docx 已安装")
        elif dep == "pptx":
            __import__("pptx")
            print(f"   ✓ python-pptx 已安装")
        else:
            __import__(dep)
            print(f"   ✓ {dep} 已安装")
    except ImportError:
        print(f"   ✗ {dep} 未安装")

# 测试 7: 检查数据库
print("\n7. 检查数据库:")
try:
    import sqlite3
    import os

    db_path = "db/db.sqlite"
    if os.path.exists(db_path):
        print(f"   ✓ 数据库文件存在: {db_path}")

        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # 检查 km_cfg 表
        cursor.execute("SELECT COUNT(*) FROM km_cfg")
        count = cursor.fetchone()[0]
        print(f"   ✓ km_cfg 表有 {count} 条记录")

        # 检查 key_value 表结构
        cursor.execute("PRAGMA table_info(key_value)")
        columns = [row[1] for row in cursor.fetchall()]
        if "km_id" in columns:
            print(f"   ✓ key_value 表包含 km_id 字段")
        else:
            print(f"   ✗ key_value 表缺少 km_id 字段")

        conn.close()
    else:
        print(f"   ✗ 数据库文件不存在: {db_path}")
except Exception as e:
    print(f"   ✗ 数据库检查失败: {e}")

print("\n" + "=" * 60)
print("诊断完成")
print("=" * 60)
