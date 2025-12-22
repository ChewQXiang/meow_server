#!/bin/bash
# Check 11: 驗證主機名稱是否已修復

CURRENT_HOSTNAME=$(hostname)
if [ "$CURRENT_HOSTNAME" != "broken-hostname" ]; then
    echo "✅ PASS: Hostname has been changed from 'broken-hostname'"
    exit 0
else
    echo "❌ FAIL: Hostname is still 'broken-hostname'"
    echo "Hint: Use 'hostnamectl set-hostname <newname>' to change hostname"
    exit 1
fi
