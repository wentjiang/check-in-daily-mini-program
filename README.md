# 每日打卡小程序

这是一个微信小程序项目，包含前端和后端代码。

## 项目结构

```
check-in-daily-mini-program/
├── frontend/          # 小程序前端代码
├── backend/           # 后端API服务
├── database/          # 数据库配置
└── README.md
```

## 在微信开发者工具中打开项目

### 方法一：直接打开根目录（推荐）

1. 打开微信开发者工具
2. 选择"导入项目"
3. 选择项目根目录：`check-in-daily-mini-program`
4. 输入你的 AppID：`wx3ad997ea9fce70ba`
5. 点击导入

项目已经配置了 `miniprogramRoot: "frontend/"`，所以微信开发者工具会自动识别小程序代码在 `frontend` 目录下。

### 方法二：直接打开 frontend 目录

1. 打开微信开发者工具
2. 选择"导入项目"
3. 选择 `frontend` 目录
4. 输入你的 AppID：`wx3ad997ea9fce70ba`
5. 点击导入

## 开发说明

- 小程序代码位于 `frontend/` 目录
- 后端API服务位于 `backend/` 目录
- 数据库配置位于 `database/` 目录

## 技术栈

- 前端：微信小程序 + TypeScript
- 后端：Python + FastAPI
- 数据库：MySQL

## 开发环境设置

1. 启动数据库：
   ```bash
   cd database
   docker-compose up -d
   ```

2. 启动后端服务：
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python run.py
   ```

3. 在微信开发者工具中打开项目进行开发 