#!/bin/bash
# Check 19: 驗證套件鎖定檔案是否已清理

if [ ! -f /tmp/package_test/dpkg.lock ] && [ ! -f /tmp/package_test/apt.lock ]; then
    echo "✅ PASS: Package lock files have been removed"
    exit 0
else
    echo "❌ FAIL: Package lock files still exist"
    echo "Hint: Remove lock files with 'rm /tmp/package_test/*.lock'"
    exit 1
fi
