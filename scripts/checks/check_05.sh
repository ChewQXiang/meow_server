#!/bin/bash
# Check 05: 驗證 port 80 是否可以通過防火牆

if ! iptables -L INPUT -n | grep -q "DROP.*tcp dpt:80"; then
    echo "✅ PASS: Port 80 is not blocked by firewall"
    exit 0
else
    echo "❌ FAIL: Port 80 is blocked by firewall"
    echo "Hint: Use 'iptables -D INPUT -p tcp --dport 80 -j DROP' to remove the rule"
    exit 1
fi
