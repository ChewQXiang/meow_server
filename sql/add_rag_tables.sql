-- 新增 RAG 相關的資料表
USE lsa;

-- materials 表：儲存教材
CREATE TABLE IF NOT EXISTS materials (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  file_path VARCHAR(500),
  source_url VARCHAR(500),
  uploaded_by INT,
  type ENUM('file', 'hackmd', 'text') DEFAULT 'file',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id),
  INDEX idx_uploaded_by (uploaded_by),
  INDEX idx_created_at (created_at)
);

-- hints 表：儲存提示卡記錄
CREATE TABLE IF NOT EXISTS hints (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  question_id INT NOT NULL,
  hint_level ENUM('subtle', 'detailed', 'solution') NOT NULL,
  hint_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (question_id) REFERENCES questions(id),
  INDEX idx_student_question (student_id, question_id),
  INDEX idx_created_at (created_at)
);

-- 確認表已建立
SHOW TABLES;
