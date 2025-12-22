#!/bin/bash
# Check 08: 驗證大檔案是否已清理

if [ ! -f /tmp/disk_test/bigfile ]; then
    echo "✅ PASS: Large file has been removed"
    exit 0
else
    echo "❌ FAIL: Large file still exists"
    echo "Hint: Remove the file with 'rm /tmp/disk_test/bigfile'"
    exit 1
fi
