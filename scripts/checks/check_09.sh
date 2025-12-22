#!/bin/bash
# Check 09: 驗證使用者是否有 sudo 權限

if groups testuser 2>/dev/null | grep -q sudo; then
    echo "✅ PASS: User testuser has sudo privileges"
    exit 0
else
    echo "❌ FAIL: User testuser does not have sudo privileges"
    echo "Hint: Add user to sudo group with 'usermod -aG sudo testuser'"
    exit 1
fi
