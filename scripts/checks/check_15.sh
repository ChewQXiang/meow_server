#!/bin/bash
# Check 15: 驗證時區是否設定為 Asia/Taipei

CURRENT_TZ=$(timedatectl 2>/dev/null | grep "Time zone" | awk '{print $3}' || readlink /etc/localtime | sed 's/.*zoneinfo\///')
if echo "$CURRENT_TZ" | grep -q "Asia/Taipei"; then
    echo "✅ PASS: Timezone is set to Asia/Taipei"
    exit 0
else
    echo "❌ FAIL: Timezone is not set to Asia/Taipei (current: $CURRENT_TZ)"
    echo "Hint: Use 'timedatectl set-timezone Asia/Taipei'"
    exit 1
fi
