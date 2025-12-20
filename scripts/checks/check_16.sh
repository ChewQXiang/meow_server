#!/bin/bash
# Check 16: 驗證 Swap 是否已啟用

if swapon --show | grep -q "/"; then
    echo "✅ PASS: Swap is enabled"
    exit 0
else
    echo "❌ FAIL: Swap is not enabled"
    echo "Hint: Use 'swapon -a' to enable swap"
    exit 1
fi
