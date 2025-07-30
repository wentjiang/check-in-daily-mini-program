# 本地启动后端服务指南

## 前提条件

1. **Python 3.7+** 已安装
2. **MySQL Docker容器** 已启动（端口3306）
3. **Git** 已安装

## 快速开始

### 1. 进入后端目录
```bash
cd backend
```

### 2. 初始化环境（首次使用）
```bash
./start_local.sh setup
```

这个命令会：
- 检查Python环境
- 创建虚拟环境
- 安装依赖包
- 复制环境配置文件

### 3. 配置数据库连接

编辑 `.env` 文件，确保 `DATABASE_URL` 指向你的MySQL Docker容器：

```bash
# 数据库配置
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/checkin_app
```

请根据你的MySQL Docker配置修改：
- `root`: MySQL用户名
- `password`: MySQL密码
- `localhost`: MySQL主机地址
- `3306`: MySQL端口
- `checkin_app`: 数据库名称

### 4. 初始化数据库
```bash
./start_local.sh init
```

### 5. 启动后端服务
```bash
./start_local.sh start
```

## 服务访问地址

启动成功后，你可以访问以下地址：

- **API文档**: http://localhost:8000/docs
- **ReDoc文档**: http://localhost:8000/redoc
- **健康检查**: http://localhost:8000/health
- **API接口**: http://localhost:8000/api/

## 其他命令

```bash
# 检查环境
./start_local.sh check

# 查看帮助
./start_local.sh help
```

## 故障排除

### 1. MySQL连接失败
- 确保MySQL Docker容器正在运行
- 检查 `.env` 文件中的数据库连接配置
- 确认MySQL端口3306没有被其他服务占用

### 2. 依赖包安装失败
- 确保网络连接正常
- 尝试使用国内镜像源：
  ```bash
  pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple/
  ```

### 3. 端口被占用
- 检查8000端口是否被其他服务占用
- 可以在 `.env` 文件中修改 `PORT` 配置

### 4. 虚拟环境问题
- 删除 `venv` 目录重新创建：
  ```bash
  rm -rf venv
  ./start_local.sh setup
  ```

## 开发模式

服务启动后支持热重载，修改代码后会自动重启服务。

## 停止服务

在终端中按 `Ctrl+C` 停止服务。 