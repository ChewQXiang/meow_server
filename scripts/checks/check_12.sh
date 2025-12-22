#!/bin/bash
# Check 12: 驗證資料庫服務是否運行

if systemctl is-active --quiet mysql || systemctl is-active --quiet mariadb; then
    echo "✅ PASS: Database service is running"
    exit 0
else
    echo "❌ FAIL: Database service is not running"
    echo "Hint: Use 'systemctl start mysql' or 'systemctl start mariadb'"
    exit 1
fi
