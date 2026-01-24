#!/usr/bin/env python3
"""
Test script for ChromaDB vector functionality
"""
import os
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / 'backend'))

def test_imports():
    """Test if all required modules can be imported"""
    print("Testing imports...")
    try:
        from backend.modules.km.vector_service import VectorService, get_vector_service
        from backend.modules.km.document_loader import DocumentLoader
        print("✓ All imports successful")
        return True
    except ImportError as e:
        print(f"✗ Import error: {e}")
        return False

def test_openai_key():
    """Test if OpenAI API key is set"""
    print("\nTesting OpenAI API key...")
    api_key = os.getenv('OPENAI_API_KEY')
    if api_key:
        print(f"✓ OpenAI API key is set (length: {len(api_key)})")
        return True
    else:
        print("✗ OpenAI API key is not set")
        print("  Please set: export OPENAI_API_KEY='your-key-here'")
        return False

def test_vector_service():
    """Test vector service initialization"""
    print("\nTesting vector service...")
    try:
        from backend.modules.km.vector_service import get_vector_service
        service = get_vector_service()
        print(f"✓ Vector service initialized")
        print(f"  Persist directory: {service.persist_directory}")
        return True
    except Exception as e:
        print(f"✗ Vector service error: {e}")
        return False

def test_document_loader():
    """Test document loader"""
    print("\nTesting document loader...")
    try:
        from backend.modules.km.document_loader import DocumentLoader

        # Create a test text file
        test_file = Path("test_document.txt")
        test_file.write_text("This is a test document for vector search.")

        # Load it
        text = DocumentLoader.load_document(test_file)

        # Clean up
        test_file.unlink()

        if text:
            print(f"✓ Document loader works")
            print(f"  Loaded text: {text[:50]}...")
            return True
        else:
            print("✗ Document loader returned no text")
            return False
    except Exception as e:
        print(f"✗ Document loader error: {e}")
        return False

def test_embedding():
    """Test OpenAI embedding"""
    print("\nTesting OpenAI embedding...")

    if not os.getenv('OPENAI_API_KEY'):
        print("⊘ Skipping (no API key)")
        return None

    try:
        from backend.modules.km.vector_service import get_vector_service
        service = get_vector_service()

        embedding = service.get_embedding("test text")
        print(f"✓ Embedding generated")
        print(f"  Dimension: {len(embedding)}")
        return True
    except Exception as e:
        print(f"✗ Embedding error: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("ChromaDB Vector Functionality Test")
    print("=" * 60)

    results = []

    results.append(("Imports", test_imports()))
    results.append(("OpenAI Key", test_openai_key()))
    results.append(("Vector Service", test_vector_service()))
    results.append(("Document Loader", test_document_loader()))
    results.append(("Embedding", test_embedding()))

    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)

    for name, result in results:
        if result is True:
            status = "✓ PASS"
        elif result is False:
            status = "✗ FAIL"
        else:
            status = "⊘ SKIP"
        print(f"{name:20s} {status}")

    passed = sum(1 for _, r in results if r is True)
    failed = sum(1 for _, r in results if r is False)
    skipped = sum(1 for _, r in results if r is None)

    print(f"\nTotal: {passed} passed, {failed} failed, {skipped} skipped")

    if failed > 0:
        print("\n⚠ Some tests failed. Please check the errors above.")
        sys.exit(1)
    else:
        print("\n✓ All tests passed!")
        sys.exit(0)

if __name__ == '__main__':
    main()
