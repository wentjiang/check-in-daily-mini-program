# Docker Compose 部署指南

## 🐳 一键启动所有服务

使用Docker Compose可以一键启动整个后端服务栈，包括：
- MySQL 8.0 数据库
- Python FastAPI 后端服务

## 📋 前置要求

### 1. 安装Docker和Docker Compose

#### macOS
```bash
# 安装Docker Desktop
brew install --cask docker

# 或者下载安装包
# https://www.docker.com/products/docker-desktop
```

#### Ubuntu/Debian
```bash
# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### Windows
```bash
# 下载Docker Desktop for Windows
# https://www.docker.com/products/docker-desktop
```

### 2. 验证安装
```bash
docker --version
docker-compose --version
```

## 🚀 快速启动

### 方法一：使用启动脚本（推荐）

```bash
# 启动所有服务
./start.sh

# 查看服务状态
./start.sh status

# 查看服务日志
./start.sh logs

# 停止所有服务
./start.sh stop

# 重启服务
./start.sh restart

# 清理所有服务（包括数据）
./start.sh clean

# 查看帮助
./start.sh help
```

### 方法二：直接使用Docker Compose

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f

# 停止所有服务
docker-compose down

# 重启服务
docker-compose restart

# 清理所有服务（包括数据）
docker-compose down -v
```

## ⚙️ 配置说明

### 1. 环境变量配置

创建 `.env` 文件：
```bash
# 微信小程序配置
WECHAT_APPID=your-wechat-appid
WECHAT_SECRET=your-wechat-secret

# 其他配置
SECRET_KEY=your-secret-key-here
```

### 2. 数据库配置

默认配置：
- **数据库**: MySQL 8.0
- **端口**: 3306
- **数据库名**: checkin_app
- **用户名**: checkin_user
- **密码**: checkin123456
- **root密码**: root123456

### 3. 服务端口

- **API服务**: http://localhost:8000
- **MySQL**: localhost:3306

## 📊 服务访问地址

启动成功后，可以访问以下地址：

### API文档
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 健康检查
- **API健康检查**: http://localhost:8000/health
- **服务状态**: http://localhost:8000/

### 数据库管理
```bash
# 连接MySQL
docker-compose exec mysql mysql -u checkin_user -p checkin_app

# 查看数据库
docker-compose exec mysql mysql -u root -proot123456 -e "SHOW DATABASES;"
```

## 🔧 自定义配置

### 1. 修改数据库配置

编辑 `docker-compose.yml`：
```yaml
mysql:
  environment:
    MYSQL_ROOT_PASSWORD: your-root-password
    MYSQL_DATABASE: your-database-name
    MYSQL_USER: your-username
    MYSQL_PASSWORD: your-password
```

### 2. 修改服务端口

编辑 `docker-compose.yml`：
```yaml
services:
  mysql:
    ports:
      - "3307:3306"  # 修改为3307端口
  backend:
    ports:
      - "8001:8000"  # 修改为8001端口
```

## 🐛 故障排除

### 1. 端口冲突
```bash
# 检查端口占用
lsof -i :3306
lsof -i :8000

# 停止占用端口的服务
sudo kill -9 <PID>
```

### 2. 数据库连接失败
```bash
# 检查MySQL容器状态
docker-compose ps mysql

# 查看MySQL日志
docker-compose logs mysql

# 重启MySQL服务
docker-compose restart mysql
```

### 3. 后端服务启动失败
```bash
# 查看后端日志
docker-compose logs backend

# 重新构建后端镜像
docker-compose build backend

# 重启后端服务
docker-compose restart backend
```

### 4. 权限问题
```bash
# 给启动脚本添加执行权限
chmod +x start.sh

# 创建必要的目录
mkdir -p logs
```

## 📈 性能优化

### 1. 资源限制

编辑 `docker-compose.yml`：
```yaml
services:
  mysql:
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
  
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

### 2. 数据库优化

```sql
-- 添加索引
CREATE INDEX idx_checkin_user_date ON checkin_records(user_id, date);
CREATE INDEX idx_checkin_timestamp ON checkin_records(timestamp);

-- 优化查询
EXPLAIN SELECT * FROM checkin_records WHERE user_id = 1 AND date = '2024-01-01';
```

## 🔒 安全配置

### 1. 生产环境配置

```bash
# 修改默认密码
MYSQL_ROOT_PASSWORD=strong-password-here
MYSQL_PASSWORD=strong-user-password

# 使用环境变量
export WECHAT_APPID=your-real-appid
export WECHAT_SECRET=your-real-secret
```

### 2. 防火墙配置

```bash
# 只开放必要端口
sudo ufw allow 8000/tcp
sudo ufw deny 3306/tcp  # 禁止外部访问MySQL
```

## 📝 日志管理

### 1. 查看日志
```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs backend
docker-compose logs mysql

# 实时查看日志
docker-compose logs -f backend
```

### 2. 日志轮转
```bash
# 创建日志轮转配置
sudo tee /etc/logrotate.d/docker-compose << EOF
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=1M
    missingok
    delaycompress
    copytruncate
}
EOF
```

## 🚀 部署到生产环境

### 1. 使用Docker Swarm
```bash
# 初始化Swarm
docker swarm init

# 部署服务栈
docker stack deploy -c docker-compose.yml checkin
```

### 2. 使用Kubernetes
```bash
# 转换Docker Compose为Kubernetes配置
kompose convert -f docker-compose.yml

# 部署到Kubernetes
kubectl apply -f k8s/
```

### 3. 使用云服务
- **AWS**: 使用ECS或EKS
- **Azure**: 使用AKS
- **Google Cloud**: 使用GKE
- **阿里云**: 使用ACK

## 📞 支持

如果遇到问题，请检查：
1. Docker和Docker Compose版本
2. 端口是否被占用
3. 环境变量配置
4. 服务日志输出

更多帮助请参考：
- [Docker官方文档](https://docs.docker.com/)
- [Docker Compose文档](https://docs.docker.com/compose/)
- [FastAPI文档](https://fastapi.tiangolo.com/) 