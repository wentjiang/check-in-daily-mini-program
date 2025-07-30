# 图片资源目录

这个目录用于存放小程序的图标和图片资源。

## 需要的图片文件

请将以下图片文件放入此目录：

- `home.png` - 首页图标（未选中状态）
- `home-active.png` - 首页图标（选中状态）
- `checkin.png` - 打卡图标（未选中状态）
- `checkin-active.png` - 打卡图标（选中状态）
- `record.png` - 记录图标（未选中状态）
- `record-active.png` - 记录图标（选中状态）
- `profile.png` - 我的图标（未选中状态）
- `profile-active.png` - 我的图标（选中状态）
- `default-avatar.png` - 默认头像

## 图标规格

- 建议尺寸：81px × 81px
- 格式：PNG
- 背景：透明

## 临时解决方案

如果暂时没有图标，可以在 `app.json` 中注释掉 `iconPath` 和 `selectedIconPath` 字段，小程序会使用默认图标。 