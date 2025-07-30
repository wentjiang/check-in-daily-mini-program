#!/bin/bash

# 数据库恢复脚本
# 使用方法: ./restore.sh [备份文件路径]

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "请指定备份文件路径"
    echo "使用方法: ./restore.sh <备份文件路径>"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "备份文件不存在: $BACKUP_FILE"
    exit 1
fi

echo "开始恢复数据库..."
echo "备份文件: $BACKUP_FILE"

# 恢复数据库
docker exec -i checkin_mysql mysql -u root -proot123456 checkin_app < $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "数据库恢复成功!"
else
    echo "数据库恢复失败!"
    exit 1
fi 