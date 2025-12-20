#!/bin/bash
# Fault 01: Nginx 服務故障
# 停止 nginx 服務

systemctl stop nginx 2>/dev/null || true
systemctl disable nginx 2>/dev/null || true
echo "Fault injected: Nginx service stopped"
