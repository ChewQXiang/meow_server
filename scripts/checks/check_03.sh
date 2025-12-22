#!/bin/bash
# Check 03: 驗證 DNS 解析是否正常

# 檢查 resolv.conf 是否有有效的 nameserver
if grep -E "^nameserver\s+(8\.8\.8\.8|1\.1\.1\.1|[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)" /etc/resolv.conf | grep -v "0.0.0.0" > /dev/null 2>&1; then
    echo "✅ PASS: DNS configuration looks valid"
    exit 0
else
    echo "❌ FAIL: DNS configuration is invalid"
    echo "Hint: Check /etc/resolv.conf and add a valid nameserver (e.g., 8.8.8.8)"
    exit 1
fi
