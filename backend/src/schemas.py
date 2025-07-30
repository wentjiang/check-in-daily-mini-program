from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# 用户相关模式
class UserBase(BaseModel):
    nick_name: Optional[str] = None
    avatar_url: Optional[str] = None
    gender: Optional[int] = None
    country: Optional[str] = None
    province: Optional[str] = None
    city: Optional[str] = None
    language: Optional[str] = None

class UserLogin(BaseModel):
    code: str
    user_info: Optional[UserBase] = None

class UserProfile(UserBase):
    id: int
    openid: str
    unionid: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserLoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserProfile

class UserProfileUpdate(UserBase):
    pass

# 打卡记录相关模式
class CheckinRecordBase(BaseModel):
    timestamp: int
    date: str
    time: str
    type: str
    note: Optional[str] = None
    custom_type: Optional[str] = None
    location: Optional[str] = None

class CheckinRecordCreate(CheckinRecordBase):
    pass

class CheckinRecord(CheckinRecordBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# 统计相关模式
class CheckinStats(BaseModel):
    total_count: int
    continuous_days: int
    this_month: int

# Token相关模式
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None 