// src/db.js
// 使用 MySQL 作為資料庫
require('dotenv').config();
const mysql = require('mysql2/promise');

// 建立連線池
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'lsa',
  password: process.env.DB_PASS || 'lsa123',
  database: process.env.DB_NAME || 'lsa',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 初始化數據庫表結構
async function initDB() {
  const connection = await pool.getConnection();
  try {
    // users 表
    await connection.query(`CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255),
      role ENUM('teacher', 'student') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // classes 表
    await connection.query(`CREATE TABLE IF NOT EXISTS classes (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      teacher_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacher_id) REFERENCES users(id)
    )`);

    // enrollments 表（學生與班級的關聯）
    await connection.query(`CREATE TABLE IF NOT EXISTS enrollments (
      id INT PRIMARY KEY AUTO_INCREMENT,
      student_id INT NOT NULL,
      class_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users(id),
      FOREIGN KEY (class_id) REFERENCES classes(id),
      UNIQUE KEY unique_enrollment (student_id, class_id)
    )`);

    // questions 表
    await connection.query(`CREATE TABLE IF NOT EXISTS questions (
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
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

    // progress 表（每位學生做到第幾題）
    await connection.query(`CREATE TABLE IF NOT EXISTS progress (
      id INT PRIMARY KEY AUTO_INCREMENT,
      student_id INT NOT NULL UNIQUE,
      current_qid INT,
      started BOOLEAN DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users(id),
      FOREIGN KEY (current_qid) REFERENCES questions(id)
    )`);

    // attempts 表（每次驗證結果）
    await connection.query(`CREATE TABLE IF NOT EXISTS attempts (
      id INT PRIMARY KEY AUTO_INCREMENT,
      student_id INT NOT NULL,
      question_id INT NOT NULL,
      passed BOOLEAN NOT NULL,
      stdout TEXT,
      stderr TEXT,
      check_output TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users(id),
      FOREIGN KEY (question_id) REFERENCES questions(id)
    )`);

    // vm_assignments 表（學生綁定哪台 VM）
    await connection.query(`CREATE TABLE IF NOT EXISTS vm_assignments (
      id INT PRIMARY KEY AUTO_INCREMENT,
      student_id INT NOT NULL UNIQUE,
      vmid INT NOT NULL,
      vm_name VARCHAR(255) NOT NULL,
      vm_ip VARCHAR(45),
      snapshot_name VARCHAR(255) DEFAULT 'clean_start',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users(id)
    )`);

    // 建立索引（MySQL 不支援 IF NOT EXISTS，索引已在 schema 中定義）
    // 這些索引已經在表創建時定義，不需要額外創建

    // 初始化默認數據（如果表是空的）
    const [rows] = await connection.query(`SELECT COUNT(*) as count FROM questions`);
    if (rows[0].count === 0) {
      const defaultQuestions = [
        {
          title: "Nginx 服務故障",
          body: "網站打不開了，請修復讓 nginx 恢復運作。\n提示：systemctl",
          difficulty: "easy",
          type: "service",
          fault_id: "fault_01",
          fault_path: "/opt/faults/fault_01.sh",
          check_id: "check_01",
          check_path: "/opt/checks/check_01.sh"
        },
        {
          title: "SSH 服務故障",
          body: "SSH 連線異常，請修復 ssh 服務。\n提示：systemctl status ssh",
          difficulty: "easy",
          type: "service",
          fault_id: "fault_02",
          fault_path: "/opt/faults/fault_02.sh",
          check_id: "check_02",
          check_path: "/opt/checks/check_02.sh"
        },
        {
          title: "DNS 解析錯誤",
          body: "DNS 解析失敗，請修復讓解析恢復。\n提示：/etc/resolv.conf",
          difficulty: "medium",
          type: "dns",
          fault_id: "fault_03",
          fault_path: "/opt/faults/fault_03.sh",
          check_id: "check_03",
          check_path: "/opt/checks/check_03.sh"
        }
      ];

      for (const q of defaultQuestions) {
        await connection.query(
          `INSERT INTO questions (title, body, difficulty, type, fault_id, fault_path, check_id, check_path)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [q.title, q.body, q.difficulty, q.type, q.fault_id, q.fault_path, q.check_id, q.check_path]
        );
      }
    }

    console.log('MySQL 資料庫初始化成功');
  } catch (error) {
    console.error('資料庫初始化失敗:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// 封裝常用的數據庫操作
const dbHelpers = {
  // 獲取用戶
  getUser: async (username) => {
    const [rows] = await pool.query(`SELECT * FROM users WHERE username = ?`, [username]);
    return rows[0];
  },

  // 獲取或創建用戶
  getOrCreateUser: async (username, role) => {
    const [rows] = await pool.query(`SELECT * FROM users WHERE username = ?`, [username]);
    if (rows[0]) return rows[0];

    const [result] = await pool.query(`INSERT INTO users (username, role) VALUES (?, ?)`, [username, role]);
    const [newRows] = await pool.query(`SELECT * FROM users WHERE id = ?`, [result.insertId]);
    return newRows[0];
  },

  // 獲取所有題目
  getQuestions: async (enabledOnly = true) => {
    const sql = enabledOnly
      ? `SELECT * FROM questions WHERE enabled = 1 ORDER BY id`
      : `SELECT * FROM questions ORDER BY id`;
    const [rows] = await pool.query(sql);
    return rows;
  },

  // 獲取單個題目
  getQuestion: async (qid) => {
    const [rows] = await pool.query(`SELECT * FROM questions WHERE id = ?`, [qid]);
    return rows[0];
  },

  // 獲取學生進度
  getProgress: async (studentId) => {
    const [rows] = await pool.query(`SELECT * FROM progress WHERE student_id = ?`, [studentId]);
    return rows[0] || { student_id: studentId, current_qid: null, started: 0 };
  },

  // 更新學生進度
  updateProgress: async (studentId, currentQid, started) => {
    const [result] = await pool.query(
      `INSERT INTO progress (student_id, current_qid, started)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE current_qid = ?, started = ?`,
      [studentId, currentQid, started ? 1 : 0, currentQid, started ? 1 : 0]
    );
    return { id: result.insertId };
  },

  // 獲取學生的題目狀態
  getQuestionStatus: async (studentId, questionId) => {
    const [rows] = await pool.query(
      `SELECT passed FROM attempts
       WHERE student_id = ? AND question_id = ?
       ORDER BY created_at DESC LIMIT 1`,
      [studentId, questionId]
    );
    if (!rows[0]) return 'todo';
    return rows[0].passed ? 'passed' : 'failed';
  },

  // 記錄驗證嘗試
  recordAttempt: async (studentId, questionId, passed, stdout, stderr, checkOutput) => {
    const [result] = await pool.query(
      `INSERT INTO attempts (student_id, question_id, passed, stdout, stderr, check_output)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [studentId, questionId, passed ? 1 : 0, stdout || '', stderr || '', checkOutput || '']
    );
    return { id: result.insertId };
  },

  // 獲取 VM 分配
  getVmAssignment: async (studentId) => {
    const [rows] = await pool.query(`SELECT * FROM vm_assignments WHERE student_id = ?`, [studentId]);
    return rows[0];
  },

  // 創建 VM 分配
  createVmAssignment: async (studentId, vmid, vmName, vmIp, snapshotName = 'clean_start') => {
    const [result] = await pool.query(
      `INSERT INTO vm_assignments (student_id, vmid, vm_name, vm_ip, snapshot_name)
       VALUES (?, ?, ?, ?, ?)`,
      [studentId, vmid, vmName, vmIp, snapshotName]
    );
    return { id: result.insertId };
  },

  // 更新 VM 分配
  updateVmAssignment: async (studentId, updates) => {
    const fields = Object.keys(updates).map(key => `${key} = ?`);
    const values = Object.values(updates);
    values.push(studentId);

    const [result] = await pool.query(
      `UPDATE vm_assignments SET ${fields.join(', ')} WHERE student_id = ?`,
      values
    );
    return { changes: result.affectedRows };
  },
};

// 初始化數據庫
initDB().catch(err => {
  console.error('數據庫初始化失敗:', err);
});

module.exports = { pool, dbHelpers };
