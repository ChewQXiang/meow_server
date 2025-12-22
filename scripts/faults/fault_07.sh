#!/bin/bash
# Fault 07: 檔案權限錯誤
# 建立一個權限錯誤的檔案

mkdir -p /tmp/test_permissions
echo "Test file" > /tmp/test_permissions/secret.txt
chmod 000 /tmp/test_permissions/secret.txt
echo "Fault injected: File permissions set to 000"
