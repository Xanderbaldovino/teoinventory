"""
Quick verification script to test if all dependencies are installed correctly
"""
import sys

def check_dependencies():
    print("=" * 50)
    print("VAPE INVENTORY MANAGER - Setup Verification")
    print("=" * 50)
    print()
    
    errors = []
    
    # Check Python version
    print("✓ Checking Python version...")
    if sys.version_info < (3, 8):
        errors.append("Python 3.8 or higher required")
        print(f"  ✗ Python {sys.version_info.major}.{sys.version_info.minor} (Need 3.8+)")
    else:
        print(f"  ✓ Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")
    
    # Check Flask
    print("\n✓ Checking Flask...")
    try:
        import flask
        print(f"  ✓ Flask {flask.__version__}")
    except ImportError:
        errors.append("Flask not installed")
        print("  ✗ Flask not found")
    
    # Check Flask-CORS
    print("\n✓ Checking Flask-CORS...")
    try:
        import flask_cors
        print("  ✓ Flask-CORS installed")
    except ImportError:
        errors.append("Flask-CORS not installed")
        print("  ✗ Flask-CORS not found")
    
    # Check Pandas
    print("\n✓ Checking Pandas...")
    try:
        import pandas as pd
        print(f"  ✓ Pandas {pd.__version__}")
    except ImportError:
        errors.append("Pandas not installed")
        print("  ✗ Pandas not found")
    
    # Check openpyxl
    print("\n✓ Checking openpyxl...")
    try:
        import openpyxl
        print(f"  ✓ openpyxl {openpyxl.__version__}")
    except ImportError:
        errors.append("openpyxl not installed")
        print("  ✗ openpyxl not found")
    
    # Check xlsxwriter
    print("\n✓ Checking xlsxwriter...")
    try:
        import xlsxwriter
        print(f"  ✓ xlsxwriter {xlsxwriter.__version__}")
    except ImportError:
        errors.append("xlsxwriter not installed")
        print("  ✗ xlsxwriter not found")
    
    print("\n" + "=" * 50)
    
    if errors:
        print("❌ SETUP INCOMPLETE")
        print("\nMissing dependencies:")
        for error in errors:
            print(f"  - {error}")
        print("\nRun: pip install -r requirements.txt")
        return False
    else:
        print("✅ ALL DEPENDENCIES INSTALLED!")
        print("\nYou're ready to start the application!")
        print("Run: start_app.bat")
        return True

if __name__ == "__main__":
    success = check_dependencies()
    sys.exit(0 if success else 1)
