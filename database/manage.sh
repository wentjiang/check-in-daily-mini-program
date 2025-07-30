#!/bin/bash

# 数据库管理脚本
# 使用方法: ./manage.sh [命令]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

case "$1" in
    "start")
        echo "启动MySQL数据库..."
        cd $SCRIPT_DIR
        docker-compose up -d
        echo "MySQL数据库已启动"
        ;;
    "stop")
        echo "停止MySQL数据库..."
        cd $SCRIPT_DIR
        docker-compose down
        echo "MySQL数据库已停止"
        ;;
    "restart")
        echo "重启MySQL数据库..."
        cd $SCRIPT_DIR
        docker-compose restart
        echo "MySQL数据库已重启"
        ;;
    "status")
        echo "检查MySQL数据库状态..."
        cd $SCRIPT_DIR
        docker-compose ps
        ;;
    "logs")
        echo "查看MySQL数据库日志..."
        cd $SCRIPT_DIR
        docker-compose logs -f mysql
        ;;
    "backup")
        echo "备份数据库..."
        cd $SCRIPT_DIR
        ./scripts/backup.sh $2 $3
        ;;
    "restore")
        echo "恢复数据库..."
        cd $SCRIPT_DIR
        ./scripts/restore.sh $2
        ;;
    "shell")
        echo "进入MySQL容器..."
        docker exec -it checkin_mysql mysql -u root -proot123456
        ;;
    "build")
        echo "构建MySQL镜像..."
        cd $SCRIPT_DIR
        docker-compose build
        ;;
    "clean")
        echo "清理数据库数据..."
        cd $SCRIPT_DIR
        docker-compose down -v
        echo "数据库数据已清理"
        ;;
    *)
        echo "使用方法: $0 [命令]"
        echo ""
        echo "可用命令:"
        echo "  start    - 启动MySQL数据库"
        echo "  stop     - 停止MySQL数据库"
        echo "  restart  - 重启MySQL数据库"
        echo "  status   - 查看数据库状态"
        echo "  logs     - 查看数据库日志"
        echo "  backup   - 备份数据库"
        echo "  restore  - 恢复数据库"
        echo "  shell    - 进入MySQL命令行"
        echo "  build    - 构建MySQL镜像"
        echo "  clean    - 清理数据库数据"
        echo ""
        echo "示例:"
        echo "  $0 start"
        echo "  $0 backup"
        echo "  $0 restore backups/backup_20231201_120000.sql"
        ;;
esac 