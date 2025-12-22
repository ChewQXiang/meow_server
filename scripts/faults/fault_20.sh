#!/bin/bash
# Fault 20: 系統負載測試問題
# 建立多個測試程序

for i in {1..3}; do
    ( sleep 300 & )
done
echo "Fault injected: Background processes started"
