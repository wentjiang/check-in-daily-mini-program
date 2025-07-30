#!/bin/bash

# 打卡小程序MySQL数据库启动脚本
# 仅启动MySQL服务，用于本地调试

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  打卡小程序MySQL启动脚本${NC}"
    echo -e "${BLUE}================================${NC}"
}

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker未安装，请先安装Docker"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose未安装，请先安装Docker Compose"
        exit 1
    fi

    print_message "Docker环境检查通过"
}

# 检查端口是否被占用
check_ports() {
    if lsof -Pi :3306 -sTCP:LISTEN -t >/dev/null ; then
        print_warning "端口 3306 已被占用，可能会影响MySQL启动"
    fi
}

# 切换到database目录
change_to_database_dir() {
    print_message "切换到database目录..."
    
    # 获取脚本所在目录的上级目录的database目录
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    DATABASE_DIR="$(dirname "$SCRIPT_DIR")/../database"
    
    if [ ! -d "$DATABASE_DIR" ]; then
        print_error "未找到database目录: $DATABASE_DIR"
        exit 1
    fi
    
    cd "$DATABASE_DIR"
    print_message "当前目录: $(pwd)"
}

# 启动MySQL服务
start_mysql() {
    print_message "启动MySQL服务..."
    
    # 构建并启动MySQL服务
    docker-compose up -d mysql
    
    print_message "MySQL服务启动完成"
}

# 等待MySQL就绪
wait_for_mysql() {
    print_message "等待MySQL数据库就绪..."
    timeout=60
    counter=0
    
    while ! docker-compose exec mysql mysqladmin ping -h"localhost" --silent; do
        sleep 1
        counter=$((counter + 1))
        if [ $counter -ge $timeout ]; then
            print_error "MySQL启动超时"
            exit 1
        fi
    done
    
    print_message "MySQL数据库就绪"
}

# 显示MySQL状态
show_status() {
    print_message "MySQL服务状态："
    docker-compose ps mysql
    
    echo ""
    print_message "MySQL连接信息："
    echo -e "${BLUE}主机:${NC} localhost"
    echo -e "${BLUE}端口:${NC} 3306"
    echo -e "${BLUE}数据库:${NC} checkin_app"
    echo -e "${BLUE}用户名:${NC} checkin_user"
    echo -e "${BLUE}密码:${NC} checkin123456"
    echo -e "${BLUE}Root密码:${NC} root123456"
    echo ""
    print_message "连接示例："
    echo -e "${BLUE}mysql -h localhost -P 3306 -u checkin_user -p${NC}"
    echo -e "${BLUE}或使用root: mysql -h localhost -P 3306 -u root -p${NC}"
}

# 显示MySQL日志
show_logs() {
    print_message "显示MySQL日志（按Ctrl+C退出）..."
    docker-compose logs -f mysql
}

# 停止MySQL服务
stop_mysql() {
    print_message "停止MySQL服务..."
    docker-compose stop mysql
    print_message "MySQL服务已停止"
}

# 清理MySQL服务
clean_mysql() {
    print_message "清理MySQL服务（包括数据）..."
    docker-compose down mysql
    print_message "MySQL服务已清理"
}

# 连接到MySQL
connect_mysql() {
    print_message "连接到MySQL数据库..."
    docker-compose exec mysql mysql -u checkin_user -pcheckin123456 checkin_app
}

# 连接到MySQL root
connect_mysql_root() {
    print_message "以root身份连接到MySQL数据库..."
    docker-compose exec mysql mysql -u root -proot123456
}

# 主函数
main() {
    print_header
    
    case "${1:-start}" in
        "start")
            check_docker
            check_ports
            change_to_database_dir
            start_mysql
            wait_for_mysql
            show_status
            ;;
        "stop")
            change_to_database_dir
            stop_mysql
            ;;
        "restart")
            change_to_database_dir
            stop_mysql
            start_mysql
            wait_for_mysql
            show_status
            ;;
        "clean")
            change_to_database_dir
            clean_mysql
            ;;
        "logs")
            change_to_database_dir
            show_logs
            ;;
        "status")
            change_to_database_dir
            docker-compose ps mysql
            ;;
        "connect")
            change_to_database_dir
            connect_mysql
            ;;
        "connect_root")
            change_to_database_dir
            connect_mysql_root
            ;;
        "help"|"-h"|"--help")
            echo "用法: $0 [命令]"
            echo ""
            echo "命令:"
            echo "  start        启动MySQL服务（默认）"
            echo "  stop         停止MySQL服务"
            echo "  restart      重启MySQL服务"
            echo "  clean        清理MySQL服务（包括数据）"
            echo "  logs         显示MySQL日志"
            echo "  status       显示MySQL状态"
            echo "  connect      连接到MySQL数据库"
            echo "  connect_root 以root身份连接到MySQL"
            echo "  help         显示帮助信息"
            ;;
        *)
            print_error "未知命令: $1"
            echo "使用 '$0 help' 查看帮助信息"
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@" 