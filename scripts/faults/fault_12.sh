#!/bin/bash
# Fault 12: MySQL/MariaDB 服務故障
# 停止資料庫服務

systemctl stop mysql 2>/dev/null || systemctl stop mariadb 2>/dev/null || true
echo "Fault injected: Database service stopped"
