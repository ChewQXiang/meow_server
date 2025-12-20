-- 为 questions 表添加 AI 生成脚本的字段
USE lsa;

-- 添加 fault_script 字段（存储 AI 生成的故障注入脚本内容）
ALTER TABLE questions
ADD COLUMN fault_script TEXT NULL COMMENT 'AI 生成的 fault 脚本内容' AFTER fault_path;

-- 添加 check_script 字段（存储 AI 生成的验证脚本内容）
ALTER TABLE questions
ADD COLUMN check_script TEXT NULL COMMENT 'AI 生成的 check 脚本内容' AFTER check_path;

-- 添加索引以标识 AI 生成的题目
ALTER TABLE questions
ADD INDEX idx_type (type);
