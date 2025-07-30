# Python后端部署指南

## 项目结构

```
backend/
├── app.py              # FastAPI主应用
├── database.py         # 数据库配置
├── models.py           # 数据模型
├── schemas.py          # Pydantic模式
├── crud.py             # CRUD操作
├── auth.py             # 认证模块
├── run.py              # 启动脚本
├── requirements.txt    # Python依赖
├── env.example         # 环境配置示例
└── README.md           # 说明文档
```

## 1. 环境准备

### 安装Python 3.8+
```bash
# 检查Python版本
python3 --version

# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

### 安装依赖
```bash
cd backend
pip install -r requirements.txt
```

## 2. 数据库配置

### 安装MySQL
```bash
# Ubuntu/Debian
sudo apt-get install mysql-server

# macOS
brew install mysql

# Windows
# 下载MySQL安装包
```

### 创建数据库
```sql
CREATE DATABASE checkin_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'checkin_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON checkin_app.* TO 'checkin_user'@'localhost';
FLUSH PRIVILEGES;
```

## 3. 环境配置

### 复制环境配置文件
```bash
cp env.example .env
```

### 编辑.env文件
```bash
# 数据库配置
DATABASE_URL=mysql+pymysql://checkin_user:your_password@localhost:3306/checkin_app

# JWT配置
SECRET_KEY=your-secret-key-here-change-this-in-production

# 微信小程序配置
WECHAT_APPID=your-wechat-appid
WECHAT_SECRET=your-wechat-secret

# 服务器配置
HOST=0.0.0.0
PORT=8000
```

## 4. 启动服务

### 开发模式
```bash
python run.py
```

### 生产模式
```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --workers 4
```

## 5. API文档

启动服务后，访问以下地址查看API文档：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 6. API接口说明

### 用户相关
- `POST /api/users/login` - 用户登录
- `GET /api/users/profile` - 获取用户信息
- `PUT /api/users/profile` - 更新用户信息

### 打卡记录相关
- `POST /api/checkin` - 创建打卡记录
- `GET /api/checkin/records` - 获取打卡记录列表
- `GET /api/checkin/records/{record_id}` - 获取单个打卡记录
- `DELETE /api/checkin/records/{record_id}` - 删除打卡记录
- `DELETE /api/checkin/records` - 清空所有打卡记录

### 统计相关
- `GET /api/checkin/stats` - 获取打卡统计
- `GET /api/checkin/today` - 检查今天是否已打卡

## 7. 认证机制

API使用JWT认证，流程如下：
1. 用户通过微信登录获取code
2. 调用`/api/users/login`接口，传入code和用户信息
3. 服务端验证code并返回access_token
4. 后续请求在Header中携带`Authorization: Bearer {token}`

## 8. 部署到生产环境

### 使用Gunicorn
```bash
pip install gunicorn
gunicorn app:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### 使用Docker
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 使用Nginx反向代理
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 9. 安全配置

### 生产环境安全建议
1. 使用强密码和随机SECRET_KEY
2. 配置HTTPS
3. 设置适当的CORS策略
4. 使用环境变量管理敏感信息
5. 定期备份数据库
6. 监控服务器日志

### 数据库安全
```sql
-- 创建只读用户用于备份
CREATE USER 'backup_user'@'localhost' IDENTIFIED BY 'backup_password';
GRANT SELECT ON checkin_app.* TO 'backup_user'@'localhost';
```

## 10. 监控和维护

### 日志配置
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
```

### 健康检查
```bash
curl http://localhost:8000/health
```

## 11. 故障排除

### 常见问题
1. **数据库连接失败**: 检查数据库配置和网络连接
2. **JWT认证失败**: 检查SECRET_KEY配置
3. **微信API调用失败**: 检查APPID和SECRET配置
4. **CORS错误**: 检查前端域名是否在允许列表中

### 调试模式
```bash
# 启用详细日志
uvicorn app:app --reload --log-level debug
```

## 12. 性能优化

### 数据库优化
1. 为常用查询字段添加索引
2. 使用数据库连接池
3. 定期清理过期数据

### 应用优化
1. 使用Redis缓存热点数据
2. 实现API限流
3. 使用异步处理耗时操作 