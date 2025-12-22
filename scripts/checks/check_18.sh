#!/bin/bash
# Check 18: 驗證錯誤的安全策略是否已移除

if [ ! -f /tmp/security_test/broken_policy ]; then
    echo "✅ PASS: Broken security policy has been removed"
    exit 0
else
    echo "❌ FAIL: Broken security policy still exists"
    echo "Hint: Remove the file with 'rm /tmp/security_test/broken_policy'"
    exit 1
fi
