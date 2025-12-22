#!/bin/bash
# Fault 18: SELinux/AppArmor 配置問題
# 建立測試用的錯誤配置

mkdir -p /tmp/security_test
echo "BROKEN_SECURITY=yes" > /tmp/security_test/broken_policy
echo "Fault injected: Broken security policy created"
