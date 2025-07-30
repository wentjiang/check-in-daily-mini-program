#!/bin/bash

# 数据库连接测试脚本

echo "测试MySQL数据库连接..."

# 检查容器是否运行
if ! docker ps | grep -q checkin_mysql; then
    echo "错误: MySQL容器未运行"
    echo "请先运行: ./manage.sh start"
    exit 1
fi

# 测试连接
echo "尝试连接数据库..."
docker exec checkin_mysql mysql -u root -proot123456 -e "SELECT 1;" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✓ 数据库连接成功"
    
    # 检查数据库是否存在
    echo "检查数据库结构..."
    docker exec checkin_mysql mysql -u root -proot123456 -e "USE checkin_app; SHOW TABLES;" 2>/dev/null
    
    echo ""
    echo "数据库信息:"
    echo "- 主机: localhost"
    echo "- 端口: 3306"
    echo "- 数据库: checkin_app"
    echo "- 用户: checkin_user"
    echo "- Root密码: root123456"
    
else
    echo "✗ 数据库连接失败"
    echo "请检查MySQL容器状态: ./manage.sh status"
    exit 1
fi 