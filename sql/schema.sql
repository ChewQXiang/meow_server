-- LSA Platform 資料庫架構
-- 建立資料庫
CREATE DATABASE IF NOT EXISTS lsa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lsa;

-- users 表
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  role ENUM('teacher', 'student') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- classes 表
CREATE TABLE IF NOT EXISTS classes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  teacher_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_teacher (teacher_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- enrollments 表（學生與班級的關聯）
CREATE TABLE IF NOT EXISTS enrollments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  class_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  UNIQUE KEY unique_enrollment (student_id, class_id),
  INDEX idx_student (student_id),
  INDEX idx_class (class_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- questions 表
CREATE TABLE IF NOT EXISTS questions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  difficulty ENUM('easy', 'medium', 'hard') NOT NULL,
  type VARCHAR(100) NOT NULL,
  fault_id VARCHAR(100) NOT NULL,
  fault_path VARCHAR(255) NOT NULL,
  check_id VARCHAR(100) NOT NULL,
  check_path VARCHAR(255) NOT NULL,
  enabled BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_enabled (enabled),
  INDEX idx_difficulty (difficulty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- progress 表（每位學生做到第幾題）
CREATE TABLE IF NOT EXISTS progress (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL UNIQUE,
  current_qid INT,
  started BOOLEAN DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (current_qid) REFERENCES questions(id) ON DELETE SET NULL,
  INDEX idx_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- attempts 表（每次驗證結果）
CREATE TABLE IF NOT EXISTS attempts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  question_id INT NOT NULL,
  passed BOOLEAN NOT NULL,
  stdout TEXT,
  stderr TEXT,
  check_output TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  INDEX idx_student_question (student_id, question_id),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- vm_assignments 表（學生綁定哪台 VM）
CREATE TABLE IF NOT EXISTS vm_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL UNIQUE,
  vmid INT NOT NULL,
  vm_name VARCHAR(255) NOT NULL,
  vm_ip VARCHAR(45),
  snapshot_name VARCHAR(255) DEFAULT 'clean_start',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_student (student_id),
  INDEX idx_vmid (vmid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
