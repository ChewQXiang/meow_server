#!/bin/bash
# Fault 08: 磁碟空間警告（模擬）
# 建立一個大檔案佔用空間

mkdir -p /tmp/disk_test
dd if=/dev/zero of=/tmp/disk_test/bigfile bs=1M count=100 2>/dev/null || true
echo "Fault injected: Large file created (100MB)"
