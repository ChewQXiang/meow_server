#!/bin/bash
# Fault 16: Swap 空間未啟用
# 關閉 swap

swapoff -a 2>/dev/null || true
echo "Fault injected: Swap disabled"
