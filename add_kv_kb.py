#!/usr/bin/env python3
"""
Add a kmtype=2 (Key-Value) knowledge base to the database
"""
import sys
import os
from datetime import datetime

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.database.base import SessionLocal
from backend.database.models.km import KMCfg

def add_kv_kb():
    """Add a Key-Value knowledge base"""
    session = SessionLocal()
    try:
        # Check if already exists
        existing = session.query(KMCfg).filter(
            KMCfg.km_id == 'kv_store',
            KMCfg.is_delete == False
        ).first()

        if existing:
            print(f"✅ Key-Value KB already exists: id={existing.id}, km_id={existing.km_id}, name={existing.name}")
            return existing.id

        # Create new KB
        kb = KMCfg(
            km_id='kv_store',
            name='Key-Value Store',
            kmtype=2,
            is_delete=False,
            create_time=datetime.now()
        )

        session.add(kb)
        session.commit()
        session.refresh(kb)

        print(f"✅ Created Key-Value KB: id={kb.id}, km_id={kb.km_id}, name={kb.name}")
        return kb.id

    except Exception as e:
        print(f"❌ Error: {e}")
        session.rollback()
        return None
    finally:
        session.close()

if __name__ == '__main__':
    add_kv_kb()
