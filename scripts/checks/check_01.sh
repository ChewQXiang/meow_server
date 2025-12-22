#!/bin/bash
# Check 01: 驗證 Nginx 服務是否正常運行

if systemctl is-active --quiet nginx; then
    echo "✅ PASS: Nginx service is running"
    exit 0
else
    echo "❌ FAIL: Nginx service is not running"
    echo "Hint: Use 'systemctl start nginx' to start the service"
    exit 1
fi
