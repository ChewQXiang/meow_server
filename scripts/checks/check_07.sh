#!/bin/bash
# Check 07: 驗證檔案權限是否可讀

if [ -r /tmp/test_permissions/secret.txt ]; then
    echo "✅ PASS: File is readable"
    exit 0
else
    echo "❌ FAIL: File is not readable"
    echo "Hint: Use 'chmod' to fix file permissions (e.g., chmod 644)"
    exit 1
fi
