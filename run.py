

import os
import sys
from app import app, init_db

def main():
    print("=" * 60)
    print("[SHIELD] CyberSecure SOC - AI/ML Threat Detection System")
    print("=" * 60)
    print("Initializing database...")
    
    try:
        # Initialize database
        init_db()
        print("[OK] Database initialized successfully!")
    except Exception as e:
        print(f"[ERROR] Database initialization failed: {e}")
        print("Please check if the database file is accessible.")
        sys.exit(1)
    
    print("\n[START] Starting Flask application...")
    print("[INFO] Dashboard will be available at: http://localhost:5000")
    print("\n[FEATURES] Available features:")
    print("   * Real-time log monitoring")
    print("   * AI/ML threat detection")
    print("   * Automated response system")
    print("   * 4 threat simulation scenarios")
    print("\n[CTRL] Press Ctrl+C to stop the server")
    print("=" * 60)
    
    try:
        app.run(host='127.0.0.1', port=5000, debug=False)
    except KeyboardInterrupt:
        print("\n\n[STOP] Server stopped by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n\n[ERROR] Server error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()