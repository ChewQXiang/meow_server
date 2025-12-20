#!/bin/bash
# Fault 19: 套件管理問題
# 建立破損的套件鎖定檔案

mkdir -p /tmp/package_test
touch /tmp/package_test/dpkg.lock
touch /tmp/package_test/apt.lock
echo "Fault injected: Package lock files created"
