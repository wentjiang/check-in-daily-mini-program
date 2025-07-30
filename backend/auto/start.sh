#!/bin/bash

# 打卡小程序后端服务启动脚本
# 使用Docker Compose一键启动所有服务

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
    echo -e "${BLUE}  打卡小程序后端服务启动脚本${NC}"
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
    local ports=("3306" "8000")
    
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
            print_warning "端口 $port 已被占用，可能会影响服务启动"
        fi
    done
}

# 创建必要的目录
create_directories() {
    print_message "创建必要的目录..."
    
    mkdir -p logs
    
    print_message "目录创建完成"
}

# 设置环境变量
setup_environment() {
    print_message "设置环境变量..."
    
    # 检查是否存在.env文件
    if [ ! -f .env ]; then
        print_warning "未找到.env文件，创建默认配置..."
        cat > .env << EOF
# 微信小程序配置
WECHAT_APPID=your-wechat-appid
WECHAT_SECRET=your-wechat-secret

# 其他配置
SECRET_KEY=$(openssl rand -hex 32)
EOF
        print_message "已创建.env文件，请编辑配置"
    fi
    
    # 加载环境变量
    if [ -f .env ]; then
        export $(cat .env | grep -v '^#' | xargs)
    fi
}

# 启动服务
start_services() {
    print_message "启动Docker Compose服务..."
    
    # 构建并启动服务
    docker-compose up -d --build
    
    print_message "服务启动完成"
}

# 等待服务就绪
wait_for_services() {
    print_message "等待服务就绪..."
    
    # 等待MySQL就绪
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
    
    # 等待后端服务就绪
    print_message "等待后端服务就绪..."
    timeout=60
    counter=0
    
    while ! curl -f http://localhost:8000/health &> /dev/null; do
        sleep 2
        counter=$((counter + 2))
        if [ $counter -ge $timeout ]; then
            print_error "后端服务启动超时"
            exit 1
        fi
    done
    
    print_message "后端服务就绪"
}

# 显示服务状态
show_status() {
    print_message "服务状态："
    docker-compose ps
    
    echo ""
    print_message "服务访问地址："
    echo -e "${BLUE}API文档:${NC} http://localhost:8000/docs"
    echo -e "${BLUE}ReDoc文档:${NC} http://localhost:8000/redoc"
    echo -e "${BLUE}健康检查:${NC} http://localhost:8000/health"
    echo -e "${BLUE}API接口:${NC} http://localhost:8000/api/"
    echo -e "${BLUE}MySQL:${NC} localhost:3306"
}

# 显示日志
show_logs() {
    print_message "显示服务日志（按Ctrl+C退出）..."
    docker-compose logs -f
}

# 停止服务
stop_services() {
    print_message "停止所有服务..."
    docker-compose down
    print_message "服务已停止"
}

# 清理服务
clean_services() {
    print_message "清理所有服务（包括数据）..."
    docker-compose down -v --remove-orphans
    print_message "服务已清理"
}

# 主函数
main() {
    print_header
    
    case "${1:-start}" in
        "start")
            check_docker
            check_ports
            create_directories
            setup_environment
            start_services
            wait_for_services
            show_status
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            stop_services
            start_services
            wait_for_services
            show_status
            ;;
        "clean")
            clean_services
            ;;
        "logs")
            show_logs
            ;;
        "status")
            docker-compose ps
            ;;
        "help"|"-h"|"--help")
            echo "用法: $0 [命令]"
            echo ""
            echo "命令:"
            echo "  start   启动所有服务（默认）"
            echo "  stop    停止所有服务"
            echo "  restart 重启所有服务"
            echo "  clean   清理所有服务（包括数据）"
            echo "  logs    显示服务日志"
            echo "  status  显示服务状态"
            echo "  help    显示帮助信息"
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