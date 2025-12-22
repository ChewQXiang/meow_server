#!/bin/bash
# Check 13: 驗證日誌檔案權限是否已修復

if [ -r /var/log/syslog ] || [ -r /var/log/messages ] || [ -r /tmp/test_log.txt ]; then
    echo "✅ PASS: Log file permissions are fixed"
    exit 0
else
    echo "❌ FAIL: Log file is still not readable"
    echo "Hint: Use 'chmod' to fix permissions (e.g., chmod 644)"
    exit 1
fi
