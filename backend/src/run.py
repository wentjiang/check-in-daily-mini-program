#!/usr/bin/env python3
"""
打卡小程序后端服务启动脚本
"""
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    
    print(f"启动服务器: http://{host}:{port}")
    print("API文档: http://localhost:8000/docs")
    
    uvicorn.run(
        "src.app:app",
        host=host,
        port=port,
        reload=True,  # 开发模式，自动重载
        log_level="info"
    ) 