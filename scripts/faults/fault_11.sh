#!/bin/bash
# Fault 11: 主機名稱設定錯誤
# 修改主機名稱為錯誤值

hostnamectl set-hostname broken-hostname 2>/dev/null || hostname broken-hostname 2>/dev/null || true
echo "Fault injected: Hostname changed to 'broken-hostname'"
