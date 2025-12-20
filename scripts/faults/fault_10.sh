#!/bin/bash
# Fault 10: 環境變數錯誤
# 建立錯誤的環境變數設定

echo 'export PATH=/broken/path' > /tmp/broken_env.sh
echo "Fault injected: Broken PATH variable config created"
