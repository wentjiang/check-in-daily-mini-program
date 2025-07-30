from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import uvicorn
from datetime import datetime, timedelta

from .database import get_db, engine
from . import models
from . import schemas
from . import crud
from .auth import get_current_user

# 创建数据库表
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="打卡小程序API",
    description="微信小程序打卡系统后端API",
    version="1.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该指定具体的域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 健康检查端点
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "服务运行正常"}

@app.get("/")
async def root():
    return {"message": "打卡小程序API服务运行中"}

# 用户相关API
@app.post("/api/users/login", response_model=schemas.UserLoginResponse)
async def login(user_data: schemas.UserLogin):
    """用户登录，获取或创建用户信息"""
    return crud.login_user(user_data)

@app.get("/api/users/profile", response_model=schemas.UserProfile)
async def get_user_profile(current_user: models.User = Depends(get_current_user)):
    """获取用户信息"""
    return current_user

@app.put("/api/users/profile", response_model=schemas.UserProfile)
async def update_user_profile(
    profile: schemas.UserProfileUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新用户信息"""
    return crud.update_user_profile(db, current_user.id, profile)

# 打卡记录相关API
@app.post("/api/checkin", response_model=schemas.CheckinRecord)
async def create_checkin_record(
    checkin_data: schemas.CheckinRecordCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建打卡记录"""
    return crud.create_checkin_record(db, current_user.id, checkin_data)

@app.get("/api/checkin/records", response_model=List[schemas.CheckinRecord])
async def get_checkin_records(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取用户打卡记录列表"""
    return crud.get_checkin_records(db, current_user.id, skip=skip, limit=limit)

@app.get("/api/checkin/records/{record_id}", response_model=schemas.CheckinRecord)
async def get_checkin_record(
    record_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取单个打卡记录"""
    record = crud.get_checkin_record(db, record_id, current_user.id)
    if not record:
        raise HTTPException(status_code=404, detail="打卡记录不存在")
    return record

@app.delete("/api/checkin/records/{record_id}")
async def delete_checkin_record(
    record_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除打卡记录"""
    success = crud.delete_checkin_record(db, record_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="打卡记录不存在")
    return {"message": "删除成功"}

@app.delete("/api/checkin/records")
async def clear_all_checkin_records(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """清空用户所有打卡记录"""
    crud.clear_all_checkin_records(db, current_user.id)
    return {"message": "清空成功"}

# 统计相关API
@app.get("/api/checkin/stats", response_model=schemas.CheckinStats)
async def get_checkin_stats(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取用户打卡统计信息"""
    return crud.get_checkin_stats(db, current_user.id)

@app.get("/api/checkin/today")
async def check_today_checkin(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """检查今天是否已打卡"""
    return {"checked": crud.is_today_checked(db, current_user.id)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 