#!/usr/bin/env python3
"""
Add a kmtype=2 (Key-Value) knowledge base to the temp database
"""
import sqlite3
from datetime import datetime

def add_kv_kb():
    """Add a Key-Value knowledge base"""
    conn = sqlite3.connect('db/db_temp_kv.sqlite', timeout=30)
    cursor = conn.cursor()

    try:
        # Check if already exists
        cursor.execute("""
            SELECT id, km_id, name FROM km_cfg
            WHERE km_id = 'kv_store' AND is_delete = 0
        """)
        existing = cursor.fetchone()

        if existing:
            print(f"✅ Key-Value KB already exists: id={existing[0]}, km_id={existing[1]}, name={existing[2]}")
            return existing[0]

        # Insert new KB
        cursor.execute("""
            INSERT INTO km_cfg (km_id, name, kmtype, is_delete, create_time)
            VALUES (?, ?, ?, ?, ?)
        """, ('kv_store', 'Key-Value Store', 2, 0, datetime.now()))

        conn.commit()
        kb_id = cursor.lastrowid

        print(f"✅ Created Key-Value KB: id={kb_id}, km_id=kv_store, name=Key-Value Store")

        # Verify
        cursor.execute("SELECT id, km_id, name, kmtype FROM km_cfg WHERE kmtype=2")
        result = cursor.fetchone()
        print(f"✅ Verified: {result}")

        return kb_id

    except Exception as e:
        print(f"❌ Error: {e}")
        conn.rollback()
        return None
    finally:
        conn.close()

if __name__ == '__main__':
    add_kv_kb()
