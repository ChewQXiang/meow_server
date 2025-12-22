#!/bin/bash
# Fault 13: 日誌檔案權限錯誤
# 修改系統日誌權限

if [ -f /var/log/syslog ]; then
    chmod 000 /var/log/syslog
    echo "Fault injected: /var/log/syslog permissions set to 000"
elif [ -f /var/log/messages ]; then
    chmod 000 /var/log/messages
    echo "Fault injected: /var/log/messages permissions set to 000"
else
    touch /tmp/test_log.txt
    chmod 000 /tmp/test_log.txt
    echo "Fault injected: /tmp/test_log.txt created with 000 permissions"
fi
