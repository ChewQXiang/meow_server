-- LSA Platform - 20 題完整資料
USE lsa;

-- 清空現有題目（可選）
-- DELETE FROM questions;

-- 插入 20 題完整題目
INSERT INTO questions (title, body, difficulty, type, fault_id, fault_path, check_id, check_path) VALUES
-- 服務管理類 (6題)
('Nginx 服務故障', '網站無法訪問，Nginx 服務已停止。\n請修復讓 nginx 恢復運作。\n\n提示：使用 systemctl 指令檢查和啟動服務', 'easy', 'service', 'fault_01', '/opt/faults/fault_01.sh', 'check_01', '/opt/checks/check_01.sh'),
('SSH 服務異常', 'SSH 連線無法建立，服務未運行。\n請修復 SSH 服務。\n\n提示：systemctl status ssh', 'easy', 'service', 'fault_02', '/opt/faults/fault_02.sh', 'check_02', '/opt/checks/check_02.sh'),
('Apache 網頁伺服器停止', 'Apache/httpd 服務未啟動，網站無法訪問。\n請啟動 Apache 服務。\n\n提示：systemctl start apache2', 'easy', 'service', 'fault_04', '/opt/faults/fault_04.sh', 'check_04', '/opt/checks/check_04.sh'),
('Cron 排程服務故障', '定時任務無法執行，cron 服務已停止。\n請修復 cron 服務。\n\n提示：檢查 cron/crond 服務狀態', 'medium', 'service', 'fault_06', '/opt/faults/fault_06.sh', 'check_06', '/opt/checks/check_06.sh'),
('資料庫服務停止', 'MySQL/MariaDB 資料庫無法連線。\n請啟動資料庫服務。\n\n提示：systemctl start mysql', 'medium', 'service', 'fault_12', '/opt/faults/fault_12.sh', 'check_12', '/opt/checks/check_12.sh'),
('時間同步服務異常', '系統時間未同步，NTP 服務已停止。\n請啟動時間同步服務。\n\n提示：systemd-timesyncd 或 ntpd', 'medium', 'service', 'fault_17', '/opt/faults/fault_17.sh', 'check_17', '/opt/checks/check_17.sh'),

-- 網路設定類 (5題)
('DNS 解析錯誤', 'DNS 解析失敗，無法解析網域名稱。\n請修復 DNS 配置。\n\n提示：檢查 /etc/resolv.conf', 'medium', 'network', 'fault_03', '/opt/faults/fault_03.sh', 'check_03', '/opt/checks/check_03.sh'),
('防火牆阻擋 HTTP', 'Port 80 被防火牆阻擋，網站無法訪問。\n請修改防火牆規則。\n\n提示：iptables -L', 'medium', 'network', 'fault_05', '/opt/faults/fault_05.sh', 'check_05', '/opt/checks/check_05.sh'),
('主機名稱設定錯誤', '主機名稱被改為 broken-hostname。\n請修改為正確的主機名稱。\n\n提示：hostnamectl set-hostname', 'easy', 'network', 'fault_11', '/opt/faults/fault_11.sh', 'check_11', '/opt/checks/check_11.sh'),
('網路配置檔案錯誤', '發現錯誤的網路配置檔案。\n請移除錯誤配置。\n\n提示：檢查 /tmp/network_test/', 'easy', 'network', 'fault_14', '/opt/faults/fault_14.sh', 'check_14', '/opt/checks/check_14.sh'),
('時區設定錯誤', '系統時區設定不正確（應為 Asia/Taipei）。\n請修正時區設定。\n\n提示：timedatectl list-timezones', 'easy', 'system', 'fault_15', '/opt/faults/fault_15.sh', 'check_15', '/opt/checks/check_15.sh'),

-- 檔案權限類 (4題)
('檔案權限錯誤', '重要檔案權限被設為 000，無法讀取。\n請修復檔案權限。\n\n提示：chmod 644', 'easy', 'permission', 'fault_07', '/opt/faults/fault_07.sh', 'check_07', '/opt/checks/check_07.sh'),
('使用者權限問題', '使用者 testuser 缺少 sudo 權限。\n請將使用者加入 sudo 群組。\n\n提示：usermod -aG sudo', 'medium', 'permission', 'fault_09', '/opt/faults/fault_09.sh', 'check_09', '/opt/checks/check_09.sh'),
('日誌檔案權限錯誤', '系統日誌檔案無法讀取。\n請修復日誌檔案權限。\n\n提示：chmod 644 /var/log/syslog', 'medium', 'permission', 'fault_13', '/opt/faults/fault_13.sh', 'check_13', '/opt/checks/check_13.sh'),
('安全策略配置錯誤', '發現錯誤的安全策略檔案。\n請移除錯誤配置。\n\n提示：檢查 /tmp/security_test/', 'medium', 'security', 'fault_18', '/opt/faults/fault_18.sh', 'check_18', '/opt/checks/check_18.sh'),

-- 系統管理類 (3題)
('磁碟空間警告', '發現大型檔案佔用磁碟空間 (100MB)。\n請清理該檔案。\n\n提示：du -sh /tmp/disk_test/', 'easy', 'storage', 'fault_08', '/opt/faults/fault_08.sh', 'check_08', '/opt/checks/check_08.sh'),
('Swap 空間未啟用', 'Swap 交換空間已停用。\n請啟用 swap。\n\n提示：swapon -a', 'medium', 'system', 'fault_16', '/opt/faults/fault_16.sh', 'check_16', '/opt/checks/check_16.sh'),
('系統負載異常', '發現多個異常的背景程序。\n請終止這些程序。\n\n提示：ps aux | grep sleep', 'hard', 'process', 'fault_20', '/opt/faults/fault_20.sh', 'check_20', '/opt/checks/check_20.sh'),

-- 其他類 (2題)
('環境變數配置錯誤', '發現錯誤的環境變數配置檔。\n請移除該檔案。\n\n提示：檢查 /tmp/broken_env.sh', 'easy', 'config', 'fault_10', '/opt/faults/fault_10.sh', 'check_10', '/opt/checks/check_10.sh'),
('套件管理鎖定問題', 'APT/dpkg 鎖定檔案阻擋套件安裝。\n請清理鎖定檔案。\n\n提示：檢查 /tmp/package_test/*.lock', 'medium', 'package', 'fault_19', '/opt/faults/fault_19.sh', 'check_19', '/opt/checks/check_19.sh')

ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- 確認資料
SELECT COUNT(*) as total_questions FROM questions;
SELECT difficulty, COUNT(*) as count FROM questions GROUP BY difficulty;
SELECT type, COUNT(*) as count FROM questions GROUP BY type;
