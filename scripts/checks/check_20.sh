#!/bin/bash
# Check 20: 驗證背景睡眠程序是否已清理

SLEEP_COUNT=$(ps aux | grep "sleep 300" | grep -v grep | wc -l)
if [ "$SLEEP_COUNT" -eq 0 ]; then
    echo "✅ PASS: All background sleep processes have been terminated"
    exit 0
else
    echo "❌ FAIL: Found $SLEEP_COUNT background sleep processes"
    echo "Hint: Kill processes with 'pkill -f \"sleep 300\"'"
    exit 1
fi
