FROM mysql:8.0

# 设置环境变量
ENV MYSQL_ROOT_PASSWORD=root123456
ENV MYSQL_DATABASE=checkin_app
ENV MYSQL_USER=checkin_user
ENV MYSQL_PASSWORD=checkin123456

# 复制配置文件
COPY conf/my.cnf /etc/mysql/conf.d/custom.cnf

# 复制初始化脚本
COPY init/ /docker-entrypoint-initdb.d/

# 创建日志目录
RUN mkdir -p /var/log/mysql && \
    chown -R mysql:mysql /var/log/mysql

# 设置权限
RUN chmod 644 /etc/mysql/conf.d/custom.cnf

# 暴露端口
EXPOSE 3306

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD mysqladmin ping -h localhost -u root -p$MYSQL_ROOT_PASSWORD || exit 1 