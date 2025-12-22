#!/bin/bash
# Fault 05: 防火牆阻擋 HTTP 連線
# 使用 iptables 阻擋 80 port

iptables -I INPUT -p tcp --dport 80 -j DROP 2>/dev/null || true
echo "Fault injected: Firewall blocking port 80"
