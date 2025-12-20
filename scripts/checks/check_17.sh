#!/bin/bash
# Check 17: 驗證時間同步服務是否運行

if systemctl is-active --quiet systemd-timesyncd || systemctl is-active --quiet ntpd; then
    echo "✅ PASS: Time sync service is running"
    exit 0
else
    echo "❌ FAIL: Time sync service is not running"
    echo "Hint: Use 'systemctl start systemd-timesyncd' or 'systemctl start ntpd'"
    exit 1
fi
