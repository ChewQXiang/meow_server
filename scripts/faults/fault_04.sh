#!/bin/bash
# Fault 04: Apache/httpd 服務未啟動
# 停止 Apache 服務

systemctl stop apache2 2>/dev/null || systemctl stop httpd 2>/dev/null || true
echo "Fault injected: Apache/httpd service stopped"
