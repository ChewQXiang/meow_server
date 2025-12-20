#!/bin/bash
# Check 10: 驗證環境變數配置檔是否已移除

if [ ! -f /tmp/broken_env.sh ]; then
    echo "✅ PASS: Broken environment config removed"
    exit 0
else
    echo "❌ FAIL: Broken environment config still exists"
    echo "Hint: Remove the file with 'rm /tmp/broken_env.sh'"
    exit 1
fi
