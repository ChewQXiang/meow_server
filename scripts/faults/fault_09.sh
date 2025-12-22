#!/bin/bash
# Fault 09: 使用者權限問題
# 移除使用者的 sudo 權限（模擬）

if id testuser > /dev/null 2>&1; then
    gpasswd -d testuser sudo 2>/dev/null || true
    echo "Fault injected: User testuser removed from sudo group"
else
    useradd -m testuser 2>/dev/null || true
    echo "Fault injected: User testuser created without sudo"
fi
