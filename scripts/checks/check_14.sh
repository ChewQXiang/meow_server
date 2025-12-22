#!/bin/bash
# Check 14: 驗證錯誤的網路配置檔是否已移除

if [ ! -f /tmp/network_test/broken_network.conf ]; then
    echo "✅ PASS: Broken network config has been removed"
    exit 0
else
    echo "❌ FAIL: Broken network config still exists"
    echo "Hint: Remove the file with 'rm /tmp/network_test/broken_network.conf'"
    exit 1
fi
