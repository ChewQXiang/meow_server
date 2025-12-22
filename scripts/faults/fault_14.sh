#!/bin/bash
# Fault 14: 網路介面配置問題
# 建立錯誤的網路配置檔

mkdir -p /tmp/network_test
echo "BROKEN_CONFIG=yes" > /tmp/network_test/broken_network.conf
echo "Fault injected: Broken network config created"
