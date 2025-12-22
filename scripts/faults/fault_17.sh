#!/bin/bash
# Fault 17: 系統時間不同步
# 停止時間同步服務

systemctl stop systemd-timesyncd 2>/dev/null || systemctl stop ntpd 2>/dev/null || true
echo "Fault injected: Time sync service stopped"
