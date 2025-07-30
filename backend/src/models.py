from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    openid = Column(String(100), unique=True, index=True, nullable=False)
    unionid = Column(String(100), unique=True, index=True, nullable=True)
    nick_name = Column(String(100), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    gender = Column(Integer, nullable=True)  # 0: 未知, 1: 男, 2: 女
    country = Column(String(50), nullable=True)
    province = Column(String(50), nullable=True)
    city = Column(String(50), nullable=True)
    language = Column(String(20), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 关联打卡记录
    checkin_records = relationship("CheckinRecord", back_populates="user", cascade="all, delete-orphan")

class CheckinRecord(Base):
    __tablename__ = "checkin_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    timestamp = Column(Integer, nullable=False)  # Unix时间戳
    date = Column(String(20), nullable=False)  # 日期字符串
    time = Column(String(20), nullable=False)  # 时间字符串
    type = Column(String(20), nullable=False)  # quick/detailed
    note = Column(Text, nullable=True)
    custom_type = Column(String(50), nullable=True)
    location = Column(String(200), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 关联用户
    user = relationship("User", back_populates="checkin_records") 