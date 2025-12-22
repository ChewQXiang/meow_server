#!/bin/bash
# Check 04: 驗證 Apache/httpd 服務是否運行

if systemctl is-active --quiet apache2 || systemctl is-active --quiet httpd; then
    echo "✅ PASS: Apache/httpd service is running"
    exit 0
else
    echo "❌ FAIL: Apache/httpd service is not running"
    echo "Hint: Use 'systemctl start apache2' or 'systemctl start httpd'"
    exit 1
fi
