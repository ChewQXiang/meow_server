-- LSA Platform 初始資料
USE lsa;

-- 插入預設題目
INSERT INTO questions (title, body, difficulty, type, fault_id, fault_path, check_id, check_path) VALUES
('Nginx 服務故障', '網站打不開了，請修復讓 nginx 恢復運作。\n提示：systemctl', 'easy', 'service', 'fault_01', '/opt/faults/fault_01.sh', 'check_01', '/opt/checks/check_01.sh'),
('SSH 服務故障', 'SSH 連線異常，請修復 ssh 服務。\n提示：systemctl status ssh', 'easy', 'service', 'fault_02', '/opt/faults/fault_02.sh', 'check_02', '/opt/checks/check_02.sh'),
('DNS 解析錯誤', 'DNS 解析失敗，請修復讓解析恢復。\n提示：/etc/resolv.conf', 'medium', 'dns', 'fault_03', '/opt/faults/fault_03.sh', 'check_03', '/opt/checks/check_03.sh'),
('防火牆設定錯誤', '某些連接埠無法訪問，請檢查防火牆設定。\n提示：ufw 或 iptables', 'medium', 'network', 'fault_04', '/opt/faults/fault_04.sh', 'check_04', '/opt/checks/check_04.sh'),
('磁碟空間滿了', '系統回報磁碟空間不足，請清理空間。\n提示：df -h, du -sh', 'easy', 'storage', 'fault_05', '/opt/faults/fault_05.sh', 'check_05', '/opt/checks/check_05.sh')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- 加入測試用戶
-- 密碼：test123
INSERT INTO users (username, password_hash, role) VALUES
('teacher1', NULL, 'teacher'),
('student1', NULL, 'student'),
('student2', NULL, 'student')
ON DUPLICATE KEY UPDATE username = username;

-- 加入測試班級
INSERT INTO classes (name, teacher_id)
SELECT 'Linux 系統管理初級班', id FROM users WHERE username = 'teacher1' LIMIT 1
ON DUPLICATE KEY UPDATE name = name;

-- 將學生加入班級
INSERT INTO enrollments (student_id, class_id)
SELECT s.id, c.id
FROM users s, classes c
WHERE s.username IN ('student1', 'student2')
  AND s.role = 'student'
  AND c.name = 'Linux 系統管理初級班'
ON DUPLICATE KEY UPDATE student_id = student_id;
