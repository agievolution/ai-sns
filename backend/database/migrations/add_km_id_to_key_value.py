#!/usr/bin/env python3
"""
Migration: Add km_id column to key_value table
"""
import sqlite3
import sys
import os

def migrate():
    """Add km_id column to key_value table"""
    db_path = 'db/db.sqlite'

    if not os.path.exists(db_path):
        print(f"Error: Database file not found: {db_path}")
        return False

    try:
        conn = sqlite3.connect(db_path, timeout=60)
        cursor = conn.cursor()

        # Check if column already exists
        cursor.execute("PRAGMA table_info(key_value)")
        columns = [row[1] for row in cursor.fetchall()]

        if 'km_id' in columns:
            print("✓ km_id column already exists in key_value table")
            conn.close()
            return True

        # Add km_id column
        print("Adding km_id column to key_value table...")
        cursor.execute("ALTER TABLE key_value ADD COLUMN km_id VARCHAR(100)")
        conn.commit()

        # Verify
        cursor.execute("PRAGMA table_info(key_value)")
        print("\nUpdated table structure:")
        for row in cursor.fetchall():
            print(f"  {row[0]}: {row[1]} {row[2]}")

        print("\n✓ Migration completed successfully")
        conn.close()
        return True

    except sqlite3.OperationalError as e:
        if 'locked' in str(e).lower():
            print(f"Error: Database is locked. Please stop all services accessing the database.")
            print("Try: pkill -f api_server.py")
        else:
            print(f"Error: {e}")
        return False
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = migrate()
    sys.exit(0 if success else 1)
