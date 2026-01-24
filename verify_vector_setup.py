#!/usr/bin/env python3
"""
Quick verification of vector functionality setup
"""
import sys

print("Checking vector functionality setup...")
print("=" * 60)

# 1. Check imports
print("\n1. Checking imports...")
try:
    import chromadb
    print(f"   ✓ chromadb {chromadb.__version__}")
except ImportError as e:
    print(f"   ✗ chromadb not found: {e}")
    sys.exit(1)

try:
    import openai
    print(f"   ✓ openai {openai.__version__}")
except ImportError as e:
    print(f"   ✗ openai not found: {e}")
    sys.exit(1)

try:
    import pypdf
    print(f"   ✓ pypdf")
except ImportError as e:
    print(f"   ✗ pypdf not found: {e}")

try:
    from docx import Document
    print(f"   ✓ python-docx")
except ImportError as e:
    print(f"   ✗ python-docx not found: {e}")

# 2. Check OpenAI API key
print("\n2. Checking OpenAI API key...")
import os
api_key = os.getenv('OPENAI_API_KEY')
if api_key:
    print(f"   ✓ OPENAI_API_KEY is set (length: {len(api_key)})")
else:
    print(f"   ⚠ OPENAI_API_KEY is not set")
    print(f"     Set it with: export OPENAI_API_KEY='your-key-here'")

# 3. Check module files
print("\n3. Checking module files...")
from pathlib import Path

files_to_check = [
    "backend/modules/km/vector_service.py",
    "backend/modules/km/document_loader.py",
    "backend/modules/km/service.py"
]

for file_path in files_to_check:
    if Path(file_path).exists():
        print(f"   ✓ {file_path}")
    else:
        print(f"   ✗ {file_path} not found")

print("\n" + "=" * 60)
print("Setup verification complete!")
print("\nNext steps:")
print("1. Set OPENAI_API_KEY environment variable")
print("2. Start the backend server: python3 api_server.py")
print("3. Upload a file to test vectorization")
print("4. Try vector search from the frontend")
