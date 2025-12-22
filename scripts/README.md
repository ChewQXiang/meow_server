# LSA Platform - Fault & Check Scripts

本目錄包含 20 個 Linux 系統管理題目的故障注入腳本和驗證腳本。

## 📁 目錄結構

```
scripts/
├── faults/          # 故障注入腳本 (fault_01.sh ~ fault_20.sh)
├── checks/          # 驗證腳本 (check_01.sh ~ check_20.sh)
└── README.md        # 本文件
```

## 📋 題目清單

### 服務管理類 (6題)
1. **Nginx 服務故障** (easy) - fault_01
2. **SSH 服務異常** (easy) - fault_02
3. **Apache 網頁伺服器停止** (easy) - fault_04
4. **Cron 排程服務故障** (medium) - fault_06
5. **資料庫服務停止** (medium) - fault_12
6. **時間同步服務異常** (medium) - fault_17

### 網路設定類 (5題)
7. **DNS 解析錯誤** (medium) - fault_03
8. **防火牆阻擋 HTTP** (medium) - fault_05
9. **主機名稱設定錯誤** (easy) - fault_11
10. **網路配置檔案錯誤** (easy) - fault_14
11. **時區設定錯誤** (easy) - fault_15

### 檔案權限類 (4題)
12. **檔案權限錯誤** (easy) - fault_07
13. **使用者權限問題** (medium) - fault_09
14. **日誌檔案權限錯誤** (medium) - fault_13
15. **安全策略配置錯誤** (medium) - fault_18

### 系統管理類 (3題)
16. **磁碟空間警告** (easy) - fault_08
17. **Swap 空間未啟用** (medium) - fault_16
18. **系統負載異常** (hard) - fault_20

### 其他類 (2題)
19. **環境變數配置錯誤** (easy) - fault_10
20. **套件管理鎖定問題** (medium) - fault_19

## 🚀 部署到 Template VM

### 方法 1：使用 SCP 複製

```bash
# 從 Platform VM 複製到 Template VM
scp -r /home/ubuntu/lsa-platform/scripts/faults/* root@<template-vm-ip>:/opt/faults/
scp -r /home/ubuntu/lsa-platform/scripts/checks/* root@<template-vm-ip>:/opt/checks/

# 在 Template VM 上設定權限
ssh root@<template-vm-ip> "chmod +x /opt/faults/*.sh /opt/checks/*.sh"
```

### 方法 2：直接在 Template VM 上建立

```bash
# 在 Template VM 上執行
mkdir -p /opt/faults /opt/checks

# 然後將 faults/ 和 checks/ 目錄的腳本複製過去
```

### 方法 3：使用 Git（推薦）

```bash
# 在 Template VM 上
cd /opt
git clone <your-repo-url> lsa-scripts
ln -s /opt/lsa-scripts/scripts/faults /opt/faults
ln -s /opt/lsa-scripts/scripts/checks /opt/checks
chmod +x /opt/faults/*.sh /opt/checks/*.sh
```

## ✅ 驗證部署

在 Template VM 上執行以下命令驗證：

```bash
# 檢查腳本數量
ls -l /opt/faults/*.sh | wc -l    # 應該顯示 20
ls -l /opt/checks/*.sh | wc -l    # 應該顯示 20

# 測試執行權限
/opt/faults/fault_01.sh
/opt/checks/check_01.sh
```

## 🔧 腳本使用說明

### Fault 腳本（故障注入）
- 作用：在系統中創建特定的故障狀態
- 執行時機：學生開始某題時由平台自動執行
- 執行方式：平台透過 SSH 執行 `sudo /opt/faults/fault_XX.sh`

### Check 腳本（驗證）
- 作用：驗證學生是否已修復故障
- 執行時機：學生點擊「驗證」按鈕時
- 執行方式：平台透過 SSH 執行 `sudo /opt/checks/check_XX.sh`
- 返回值：
  - `exit 0` - 驗證通過
  - `exit 1` - 驗證失敗

## 📊 難度分布

- **Easy (簡單)**：12 題 - 適合初學者
- **Medium (中等)**：12 題 - 需要一定經驗
- **Hard (困難)**：1 題 - 進階挑戰

## 🛡️ 安全注意事項

1. **sudo 權限**：平台需要有 sudo 權限才能執行腳本
2. **SSH Key**：建議使用 SSH key 認證而非密碼
3. **沙盒環境**：這些腳本應該只在隔離的學生 VM 中執行
4. **備份重要**：建立 clean_start snapshot 以便回復

## 🔄 VM 流程

```
1. Clone Template VM → 2. Create Snapshot (clean_start)
                    ↓
3. 注入 fault_01 → 4. 學生修復 → 5. 驗證 (check_01)
                    ↓
6. Rollback to clean_start → 7. 注入 fault_02 → ...重複
```

## 📝 擴充題目

要新增題目時：

1. 建立 `fault_XX.sh` 和 `check_XX.sh`
2. 設定執行權限 `chmod +x`
3. 更新資料庫的 questions 表
4. 測試腳本是否正常運作

## 🐛 除錯

如果腳本執行失敗：

```bash
# 檢查腳本語法
bash -n /opt/faults/fault_01.sh

# 手動執行看錯誤訊息
bash -x /opt/faults/fault_01.sh

# 檢查權限
ls -l /opt/faults/fault_01.sh
```

## 📞 聯絡資訊

如有問題請聯絡系統管理員。
