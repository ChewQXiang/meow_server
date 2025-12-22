#!/bin/bash
# Check 06: 驗證 Cron 服務是否運行

if systemctl is-active --quiet cron || systemctl is-active --quiet crond; then
    echo "✅ PASS: Cron service is running"
    exit 0
else
    echo "❌ FAIL: Cron service is not running"
    echo "Hint: Use 'systemctl start cron' or 'systemctl start crond'"
    exit 1
fi
