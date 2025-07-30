#!/bin/bash

# 打卡小程序后端服务本地启动脚本
# 不使用Docker，直接启动Python后端服务

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
    echo -e "${BLUE}  打卡小程序后端服务本地启动${NC}"
    echo -e "${BLUE}================================${NC}"
}

# 检查Python环境
check_python() {
    if ! command -v python3 &> /dev/null; then
        print_error "Python3未安装，请先安装Python3"
        exit 1
    fi
    
    print_message "Python3环境检查通过"
}

# 检查虚拟环境
check_venv() {
    if [ ! -d "venv" ]; then
        print_message "创建Python虚拟环境..."
        python3 -m venv venv
        print_message "虚拟环境创建完成"
    fi
    
    print_message "激活虚拟环境..."
    source venv/bin/activate
    
    print_message "安装依赖包..."
    pip install -r requirements.txt
    
    print_message "依赖包安装完成"
}

# 检查环境配置文件
setup_environment() {
    print_message "检查环境配置..."
    
    if [ ! -f .env ]; then
        print_warning "未找到.env文件，从env.example复制..."
        if [ -f env.example ]; then
            cp env.example .env
            print_message "已创建.env文件，请编辑数据库连接配置"
            print_warning "请确保.env文件中的DATABASE_URL指向你的MySQL Docker容器"
        else
            print_error "未找到env.example文件"
            exit 1
        fi
    fi
    
    print_message "环境配置检查完成"
}

# 检查MySQL连接
check_mysql_connection() {
    print_message "检查MySQL连接..."
    
    # 尝试连接MySQL
    if command -v mysql &> /dev/null; then
        # 从.env文件读取数据库URL
        if [ -f .env ]; then
            source .env
            # 提取数据库连接信息
            DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
            DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
            DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
            DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
            DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
            
            if mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" -e "SELECT 1;" &> /dev/null; then
                print_message "MySQL连接成功"
            else
                print_warning "MySQL连接失败，请检查配置"
            fi
        fi
    else
        print_warning "未安装mysql客户端，跳过连接检查"
    fi
}

# 初始化数据库
init_database() {
    print_message "初始化数据库..."
    
    # 激活虚拟环境
    source venv/bin/activate
    
    # 运行数据库迁移
    cd src
    python -c "
import os
import sys
sys.path.append('..')
from database import engine
from models import Base

# 创建所有表
Base.metadata.create_all(bind=engine)
print('数据库表创建完成')
"
    cd ..
    
    print_message "数据库初始化完成"
}

# 启动后端服务
start_backend() {
    print_message "启动后端服务..."
    
    # 激活虚拟环境
    source venv/bin/activate
    
    # 启动服务
    cd src
    python run.py
}

# 显示帮助信息
show_help() {
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  setup    初始化环境（安装依赖、配置环境）"
    echo "  start    启动后端服务"
    echo "  init     初始化数据库"
    echo "  check    检查环境"
    echo "  help     显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 setup    # 首次使用，初始化环境"
    echo "  $0 start    # 启动后端服务"
}

# 主函数
main() {
    print_header
    
    case "${1:-help}" in
        "setup")
            check_python
            check_venv
            setup_environment
            check_mysql_connection
            print_message "环境初始化完成"
            print_message "请编辑.env文件配置数据库连接信息"
            ;;
        "start")
            check_python
            check_venv
            setup_environment
            check_mysql_connection
            start_backend
            ;;
        "init")
            check_python
            check_venv
            setup_environment
            init_database
            ;;
        "check")
            check_python
            check_venv
            setup_environment
            check_mysql_connection
            print_message "环境检查完成"
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "未知命令: $1"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"