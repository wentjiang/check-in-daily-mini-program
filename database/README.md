# 数据库配置

本项目使用Docker部署MySQL 8.0数据库，提供完整的数据库管理功能。

## 目录结构

```
database/
├── conf/           # MySQL配置文件
├── init/           # 数据库初始化脚本
├── scripts/        # 数据库管理脚本
├── backups/        # 数据库备份文件
├── data/           # 数据持久化目录
├── logs/           # 日志文件目录
├── Dockerfile      # MySQL Docker镜像配置
├── docker-compose.yml  # Docker Compose配置
├── manage.sh       # 数据库管理主脚本
└── README.md       # 本文档
```

## 快速开始

### 1. 启动数据库

```bash
cd database
./manage.sh start
```

### 2. 检查数据库状态

```bash
./manage.sh status
```

### 3. 查看数据库日志

```bash
./manage.sh logs
```

## 数据库配置

### 连接信息

- **主机**: localhost
- **端口**: 3306
- **数据库名**: checkin_app
- **用户名**: checkin_user
- **密码**: checkin123456
- **Root密码**: root123456

### 数据库表结构

数据库包含以下表：

1. **users** - 用户信息表
2. **checkin_records** - 打卡记录表

详细的表结构请参考 `init/init.sql` 文件。

## 管理命令

### 基本操作

```bash
# 启动数据库
./manage.sh start

# 停止数据库
./manage.sh stop

# 重启数据库
./manage.sh restart

# 查看状态
./manage.sh status

# 查看日志
./manage.sh logs
```

### 数据管理

```bash
# 备份数据库
./manage.sh backup

# 恢复数据库
./manage.sh restore backups/backup_20231201_120000.sql

# 进入MySQL命令行
./manage.sh shell
```

### 镜像管理

```bash
# 构建镜像
./manage.sh build

# 清理数据（谨慎使用）
./manage.sh clean
```

## 备份和恢复

### 自动备份

数据库备份文件保存在 `backups/` 目录下，文件名格式为：
`backup_YYYYMMDD_HHMMSS.sql`

### 手动备份

```bash
# 备份指定数据库
./manage.sh backup checkin_app

# 备份并指定文件名
./manage.sh backup checkin_app my_backup.sql
```

### 恢复数据

```bash
# 从备份文件恢复
./manage.sh restore backups/backup_20231201_120000.sql
```

## 配置说明

### MySQL配置

主要配置文件位于 `conf/my.cnf`，包含：

- 字符集设置（UTF8MB4）
- 性能优化参数
- 安全设置
- 日志配置

### 环境变量

可以通过修改 `env.example` 文件来调整数据库配置：

- `MYSQL_ROOT_PASSWORD`: Root用户密码
- `MYSQL_DATABASE`: 默认数据库名
- `MYSQL_USER`: 应用用户名
- `MYSQL_PASSWORD`: 应用用户密码
- `MYSQL_PORT`: 数据库端口

## 故障排除

### 常见问题

1. **端口冲突**
   - 检查3306端口是否被占用
   - 修改 `docker-compose.yml` 中的端口映射

2. **权限问题**
   - 确保脚本有执行权限：`chmod +x manage.sh`
   - 检查Docker权限

3. **数据丢失**
   - 检查数据卷挂载是否正确
   - 使用备份文件恢复数据

### 日志查看

```bash
# 查看MySQL错误日志
docker exec checkin_mysql cat /var/log/mysql/error.log

# 查看慢查询日志
docker exec checkin_mysql cat /var/log/mysql/slow.log
```

## 安全建议

1. **生产环境**
   - 修改默认密码
   - 限制数据库访问IP
   - 启用SSL连接
   - 定期备份数据

2. **网络安全**
   - 不要暴露数据库端口到公网
   - 使用防火墙限制访问
   - 定期更新MySQL版本

## 性能优化

1. **内存配置**
   - 根据服务器内存调整 `innodb_buffer_pool_size`
   - 优化查询缓存大小

2. **连接池**
   - 调整 `max_connections` 参数
   - 监控连接数使用情况

3. **索引优化**
   - 为常用查询字段添加索引
   - 定期分析慢查询日志 