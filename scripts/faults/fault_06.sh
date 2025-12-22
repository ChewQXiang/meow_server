#!/bin/bash
# Fault 06: Cron 服務故障
# 停止 cron 服務

systemctl stop cron 2>/dev/null || systemctl stop crond 2>/dev/null || true
echo "Fault injected: Cron service stopped"
