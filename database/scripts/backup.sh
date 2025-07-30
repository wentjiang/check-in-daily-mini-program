#!/bin/bash

# 数据库备份脚本
# 使用方法: ./backup.sh [数据库名] [备份文件名]

DB_NAME=${1:-checkin_app}
BACKUP_FILE=${2:-backup_$(date +%Y%m%d_%H%M%S).sql}
BACKUP_DIR="./backups"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
echo "开始备份数据库: $DB_NAME"
docker exec checkin_mysql mysqldump -u root -proot123456 $DB_NAME > $BACKUP_DIR/$BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "备份成功: $BACKUP_DIR/$BACKUP_FILE"
    echo "备份文件大小: $(du -h $BACKUP_DIR/$BACKUP_FILE | cut -f1)"
else
    echo "备份失败!"
    exit 1
fi 