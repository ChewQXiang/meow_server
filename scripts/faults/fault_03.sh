#!/bin/bash
# Fault 03: DNS 解析錯誤
# 破壞 /etc/resolv.conf

if [ -f /etc/resolv.conf ]; then
    cp /etc/resolv.conf /etc/resolv.conf.backup
    echo "# DNS configuration broken" > /etc/resolv.conf
    echo "nameserver 0.0.0.0" >> /etc/resolv.conf
    echo "Fault injected: DNS configuration broken"
else
    echo "Warning: /etc/resolv.conf not found"
fi
