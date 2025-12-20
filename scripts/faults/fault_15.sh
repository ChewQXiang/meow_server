#!/bin/bash
# Fault 15: 時區設定錯誤
# 將時區設定為錯誤值

timedatectl set-timezone UTC 2>/dev/null || ln -sf /usr/share/zoneinfo/UTC /etc/localtime 2>/dev/null || true
echo "Fault injected: Timezone set to UTC"
