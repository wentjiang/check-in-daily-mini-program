# 每日打卡微信小程序

一个使用TypeScript开发的微信小程序，帮助用户养成每日打卡的好习惯。

## 技术栈

- **框架**: 微信小程序原生框架
- **语言**: TypeScript
- **样式**: WXSS (微信小程序样式)
- **模板**: WXML (微信小程序模板)

## 项目结构

```
wechat-mini-program/
├── app.ts                 # 应用入口文件 (TypeScript)
├── app.json              # 应用配置文件
├── app.wxss              # 应用样式文件
├── tsconfig.json         # TypeScript配置文件
├── package.json          # 项目依赖配置
├── types/
│   └── index.d.ts        # 全局类型定义
├── pages/
│   ├── index/
│   │   ├── index.ts      # 首页逻辑 (TypeScript)
│   │   ├── index.wxml    # 首页模板
│   │   └── index.wxss    # 首页样式
│   ├── checkin/
│   │   ├── checkin.ts    # 打卡页面逻辑 (TypeScript)
│   │   ├── checkin.wxml  # 打卡页面模板
│   │   └── checkin.wxss  # 打卡页面样式
│   ├── record/
│   │   ├── record.ts     # 记录页面逻辑 (TypeScript)
│   │   ├── record.wxml   # 记录页面模板
│   │   └── record.wxss   # 记录页面样式
│   └── profile/
│       ├── profile.ts    # 个人资料页面逻辑 (TypeScript)
│       ├── profile.wxml  # 个人资料页面模板
│       └── profile.wxss  # 个人资料页面样式
└── images/               # 图片资源
```

## 主要功能

1. **快速打卡**: 在首页可以快速进行打卡
2. **详细打卡**: 支持选择不同类型的打卡（工作、学习、运动等）
3. **打卡记录**: 查看历史打卡记录和统计数据
4. **个人中心**: 用户信息和应用设置

## TypeScript特性

- **类型安全**: 所有数据都有明确的类型定义
- **接口定义**: 使用接口定义数据结构
- **类型检查**: 编译时进行类型检查，减少运行时错误
- **智能提示**: IDE提供更好的代码提示和自动补全

## 开发环境设置

1. 安装依赖：
```bash
npm install
```

2. 在微信开发者工具中导入项目

3. 确保项目配置中启用了TypeScript支持

## 类型定义

项目包含以下主要类型定义：

- `CheckinRecord`: 打卡记录接口
- `UserInfo`: 用户信息接口
- `PageData`: 页面数据接口
- `AppInstance`: 应用实例接口

## 构建和部署

1. 编译TypeScript：
```bash
npm run build
```

2. 在微信开发者工具中预览和调试

3. 上传代码到微信小程序平台

## 版本历史

- v1.0.0: 初始版本，支持基本的打卡功能
- v1.1.0: 转换为TypeScript，提升代码质量和开发体验

## 开发者

AI Assistant 