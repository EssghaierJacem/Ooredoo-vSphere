#!/usr/bin/env python3
"""
vSphere Monitoring API Server
Run this script to start the FastAPI server
"""

import uvicorn
import os
from app.config import settings

if __name__ == "__main__":
    # Validate vSphere configuration
    try:
        settings.validate_vsphere_config()
        print("✅ vSphere configuration validated successfully")
    except ValueError as e:
        print(f"❌ Configuration error: {e}")
        print("Please check your .env file and ensure all required variables are set:")
        print("  - VCENTER_URL")
        print("  - VCENTER_USER") 
        print("  - VCENTER_PASSWORD")
        print("  - VCENTER_PORT (optional, defaults to 443)")
        exit(1)
    
    # Start the server
    print("🚀 Starting vSphere Monitoring API Server...")
    print(f"📊 API Documentation: http://localhost:8000/docs")
    print(f"🔍 Alternative Docs: http://localhost:8000/redoc")
    print(f"💚 Health Check: http://localhost:8000/system/health")
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level=settings.LOG_LEVEL.lower()
    )
