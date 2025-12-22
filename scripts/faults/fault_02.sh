#!/bin/bash
# Fault 02: SSH 服務故障
# 停止 SSH 服務（注意：這會導致當前連線中斷，建議在本地測試）

systemctl stop ssh 2>/dev/null || systemctl stop sshd 2>/dev/null || true
echo "Fault injected: SSH service stopped"
