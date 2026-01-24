#!/usr/bin/env python3
"""
Test key-value knowledge base functionality
"""
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

def test_km_service():
    """Test KM service can read the key-value KB"""
    print("Testing KM Service...")
    print("=" * 60)

    try:
        from backend.modules.km.service import KMService

        # Get all knowledge bases
        kbs = KMService.get_all_knowledge_bases()

        # Find kmtype=2
        kv_kbs = [kb for kb in kbs if str(kb.get('kmtype')) == '2']

        print(f"\n✓ Found {len(kv_kbs)} key-value knowledge base(s)")

        for kb in kv_kbs:
            print(f"\n  ID: {kb['id']}")
            print(f"  km_id: {kb['km_id']}")
            print(f"  Name: {kb['name']}")
            print(f"  Type: {kb['kmtype']}")
            print(f"  Visible: {kb['is_show']}")

            # Get key-values for this KB
            kb_id = kb['id']
            kvs = KMService.get_key_values(kb_id)

            print(f"\n  Key-Value pairs: {len(kvs)}")
            for kv in kvs:
                value_preview = kv['value'][:50] + '...' if len(kv['value']) > 50 else kv['value']
                print(f"    - {kv['key']}: {value_preview}")

        return True

    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("Key-Value Knowledge Base Test")
    print("=" * 60)

    success = test_km_service()

    print("\n" + "=" * 60)
    if success:
        print("✓ All tests passed!")
        print("\nThe key-value knowledge base is ready to use!")
        print("Start the backend server to access it from the frontend.")
    else:
        print("✗ Tests failed")
        sys.exit(1)

if __name__ == '__main__':
    main()
