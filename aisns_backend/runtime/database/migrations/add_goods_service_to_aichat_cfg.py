"""
Migration: Add goods/service description and price columns to aisns_cfg table
"""

import os
import sqlite3


def migrate() -> bool:
    db_path = os.path.join(os.path.dirname(__file__), "../../../db/db.sqlite")

    try:
        conn = sqlite3.connect(db_path, timeout=60)
        cursor = conn.cursor()

        cursor.execute("PRAGMA table_info(aisns_cfg)")
        columns = [row[1] for row in cursor.fetchall()]

        changed = False

        if "goods_or_service_description" not in columns:
            print("Adding goods_or_service_description column to aisns_cfg table...")
            cursor.execute("ALTER TABLE aisns_cfg ADD COLUMN goods_or_service_description TEXT")
            changed = True

        if "goods_or_service_price" not in columns:
            print("Adding goods_or_service_price column to aisns_cfg table...")
            cursor.execute("ALTER TABLE aisns_cfg ADD COLUMN goods_or_service_price VARCHAR(100)")
            changed = True

        if changed:
            conn.commit()
            print("Migration completed successfully")
        else:
            print("goods/service columns already exist")

        conn.close()
        return True

    except sqlite3.OperationalError as e:
        if "locked" in str(e).lower():
            print("Error: Database is locked. Please stop all services accessing the database.")
        else:
            print(f"Error during migration: {e}")
        return False
    except Exception as e:
        print(f"Error during migration: {e}")
        return False


if __name__ == "__main__":
    migrate()
