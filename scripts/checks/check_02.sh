#!/bin/bash
# Check 02: 驗證 SSH 服務是否正常運行

if systemctl is-active --quiet ssh || systemctl is-active --quiet sshd; then
    echo "✅ PASS: SSH service is running"
    exit 0
else
    echo "❌ FAIL: SSH service is not running"
    echo "Hint: Use 'systemctl start ssh' or 'systemctl start sshd'"
    exit 1
fi
