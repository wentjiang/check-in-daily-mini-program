from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from typing import List, Optional
import models
import schemas
from auth import create_access_token, get_wechat_openid

# 用户相关CRUD操作
def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_openid(db: Session, openid: str):
    return db.query(models.User).filter(models.User.openid == openid).first()

def create_user(db: Session, openid: str, user_info: Optional[schemas.UserBase] = None):
    db_user = models.User(
        openid=openid,
        nick_name=user_info.nick_name if user_info else None,
        avatar_url=user_info.avatar_url if user_info else None,
        gender=user_info.gender if user_info else None,
        country=user_info.country if user_info else None,
        province=user_info.province if user_info else None,
        city=user_info.city if user_info else None,
        language=user_info.language if user_info else None
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_profile(db: Session, user_id: int, profile: schemas.UserProfileUpdate):
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None
    
    for field, value in profile.dict(exclude_unset=True).items():
        setattr(db_user, field, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

def login_user(user_data: schemas.UserLogin):
    """用户登录，获取或创建用户"""
    from database import SessionLocal
    db = SessionLocal()
    
    try:
        # 获取openid
        openid = get_wechat_openid(user_data.code)
        if not openid:
            raise Exception("获取openid失败")
        
        # 查找或创建用户
        user = get_user_by_openid(db, openid)
        if not user:
            user = create_user(db, openid, user_data.user_info)
        elif user_data.user_info:
            # 更新用户信息
            user = update_user_profile(db, user.id, user_data.user_info)
        
        # 创建访问令牌
        access_token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=timedelta(minutes=30)
        )
        
        return schemas.UserLoginResponse(
            access_token=access_token,
            token_type="bearer",
            user=user
        )
    finally:
        db.close()

# 打卡记录相关CRUD操作
def create_checkin_record(db: Session, user_id: int, checkin_data: schemas.CheckinRecordCreate):
    db_checkin = models.CheckinRecord(
        user_id=user_id,
        timestamp=checkin_data.timestamp,
        date=checkin_data.date,
        time=checkin_data.time,
        type=checkin_data.type,
        note=checkin_data.note,
        custom_type=checkin_data.custom_type,
        location=checkin_data.location
    )
    db.add(db_checkin)
    db.commit()
    db.refresh(db_checkin)
    return db_checkin

def get_checkin_records(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.CheckinRecord).filter(
        models.CheckinRecord.user_id == user_id
    ).order_by(models.CheckinRecord.timestamp.desc()).offset(skip).limit(limit).all()

def get_checkin_record(db: Session, record_id: int, user_id: int):
    return db.query(models.CheckinRecord).filter(
        and_(
            models.CheckinRecord.id == record_id,
            models.CheckinRecord.user_id == user_id
        )
    ).first()

def delete_checkin_record(db: Session, record_id: int, user_id: int):
    db_checkin = get_checkin_record(db, record_id, user_id)
    if db_checkin:
        db.delete(db_checkin)
        db.commit()
        return True
    return False

def clear_all_checkin_records(db: Session, user_id: int):
    db.query(models.CheckinRecord).filter(
        models.CheckinRecord.user_id == user_id
    ).delete()
    db.commit()

def is_today_checked(db: Session, user_id: int):
    """检查今天是否已打卡"""
    today = datetime.now().date()
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())
    
    record = db.query(models.CheckinRecord).filter(
        and_(
            models.CheckinRecord.user_id == user_id,
            models.CheckinRecord.timestamp >= int(start_of_day.timestamp() * 1000),
            models.CheckinRecord.timestamp <= int(end_of_day.timestamp() * 1000)
        )
    ).first()
    
    return record is not None

def get_checkin_stats(db: Session, user_id: int):
    """获取用户打卡统计信息"""
    # 总打卡次数
    total_count = db.query(func.count(models.CheckinRecord.id)).filter(
        models.CheckinRecord.user_id == user_id
    ).scalar()
    
    # 本月打卡次数
    now = datetime.now()
    start_of_month = datetime(now.year, now.month, 1)
    end_of_month = datetime(now.year, now.month + 1, 1) if now.month < 12 else datetime(now.year + 1, 1, 1)
    
    this_month = db.query(func.count(models.CheckinRecord.id)).filter(
        and_(
            models.CheckinRecord.user_id == user_id,
            models.CheckinRecord.timestamp >= int(start_of_month.timestamp() * 1000),
            models.CheckinRecord.timestamp < int(end_of_month.timestamp() * 1000)
        )
    ).scalar()
    
    # 计算连续打卡天数
    continuous_days = calculate_continuous_days(db, user_id)
    
    return schemas.CheckinStats(
        total_count=total_count,
        continuous_days=continuous_days,
        this_month=this_month
    )

def calculate_continuous_days(db: Session, user_id: int):
    """计算连续打卡天数"""
    # 获取所有打卡记录，按时间倒序
    records = db.query(models.CheckinRecord).filter(
        models.CheckinRecord.user_id == user_id
    ).order_by(models.CheckinRecord.timestamp.desc()).all()
    
    if not records:
        return 0
    
    continuous_days = 0
    current_date = datetime.now().date()
    
    for i in range(365):  # 最多检查365天
        check_date = current_date - timedelta(days=i)
        start_of_day = datetime.combine(check_date, datetime.min.time())
        end_of_day = datetime.combine(check_date, datetime.max.time())
        
        # 检查这一天是否有打卡记录
        has_record = db.query(models.CheckinRecord).filter(
            and_(
                models.CheckinRecord.user_id == user_id,
                models.CheckinRecord.timestamp >= int(start_of_day.timestamp() * 1000),
                models.CheckinRecord.timestamp <= int(end_of_day.timestamp() * 1000)
            )
        ).first()
        
        if has_record:
            continuous_days += 1
        else:
            break
    
    return continuous_days 