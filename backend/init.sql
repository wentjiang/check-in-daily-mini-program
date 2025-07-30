-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS checkin_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE checkin_app;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    openid VARCHAR(100) UNIQUE NOT NULL,
    unionid VARCHAR(100) UNIQUE,
    nick_name VARCHAR(100),
    avatar_url VARCHAR(500),
    gender INT,
    country VARCHAR(50),
    province VARCHAR(50),
    city VARCHAR(50),
    language VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_openid (openid),
    INDEX idx_unionid (unionid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建打卡记录表
CREATE TABLE IF NOT EXISTS checkin_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    timestamp BIGINT NOT NULL,
    date VARCHAR(20) NOT NULL,
    time VARCHAR(20) NOT NULL,
    type VARCHAR(20) NOT NULL,
    note TEXT,
    custom_type VARCHAR(50),
    location VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入测试数据（可选）
-- INSERT INTO users (openid, nick_name, avatar_url) VALUES 
-- ('test_openid_1', '测试用户1', 'https://example.com/avatar1.jpg'),
-- ('test_openid_2', '测试用户2', 'https://example.com/avatar2.jpg');

-- INSERT INTO checkin_records (user_id, timestamp, date, time, type, note) VALUES 
-- (1, UNIX_TIMESTAMP(NOW()) * 1000, DATE_FORMAT(NOW(), '%Y-%m-%d'), TIME_FORMAT(NOW(), '%H:%M:%S'), 'quick', '测试打卡记录1'),
-- (1, UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 DAY)) * 1000, DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 DAY), '%Y-%m-%d'), TIME_FORMAT(NOW(), '%H:%M:%S'), 'detailed', '测试打卡记录2'); 