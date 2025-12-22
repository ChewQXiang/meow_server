# MEOW Server  
111213076 郭哲瑋　111213078 陳逸憲　111213019 李玨叡　111213052 鄒啟翔  

---

## Concept Development

我們在學習 Linux 與網路管理的過程中，最常遇到的一個問題是：  
**看懂教材，並不代表真的會修系統。**

在課堂中，老師或助教示範完指令後，學生往往在實作時遇到困難，例如不知道從哪裡開始排錯、修了某個問題卻導致其他服務異常，甚至使整個系統無法回復。此外，由於每位學生的環境不同，問題也難以重現與比對。

然而，真實世界中的系統問題通常不是「一個指令就能解決」，而是需要反覆嘗試、修復、驗證與回復。但課堂時間有限，也難以為每位學生準備可不斷重置的實驗環境。

因此，我們設計並實作 **MEOW Server** ——  
一個 **可回復的 Linux 系統故障訓練平台**，讓學生能在安全、可重置的環境中反覆練習系統管理與故障排除。

整體學習流程如下：

> 老師上傳教材 → 系統產生題目 →  
> 每位學生取得獨立的練習環境（VM / Container） →  
> 系統注入故障 → 學生修復 → 系統驗證 →  
> 環境 rollback → 進入下一題

---

## Implementation Resources

- **作業系統**：Ubuntu / Linux  
- **虛擬化 / 容器**
  - Docker（基礎練習環境）
  - Proxmox VE（進階版本，支援 VM Clone / Snapshot / Rollback）
- **後端**
  - Node.js + Express（核心後端服務，API 與系統流程控制）
- **前端**
  - 純 HTML / CSS / JavaScript
- **資料庫**
  - MySQL（使用者、題目、進度、教材、提示記錄）
- **AI 功能**
  - OpenAI API
  - RAG（Retrieval-Augmented Generation）

---

## Existing Library / Software

- Node.js / Express.js  
- Docker CLI  
- Proxmox VE API  
- MySQL 8.0  
- OpenAI API（文字生成與 Embedding）  
- SSH  
- PDF-Parse  

---

## Implementation Process

本專案的核心設計原則為：  
**每一題都在全新、可回復的系統狀態下進行。**

### 1. 題目與故障設計

每一題以 template 形式定義，內容包含：

- `id`：題目編號  
- `desc`：題目簡述  
- `explain`：背景說明  
- `chaos_cmd`：故障注入指令  
- `check_cmd`：驗證指令（輸出包含 OK 即視為通過）  
- `hints`：分級提示內容  

出題時系統會執行 `chaos_cmd`，刻意破壞系統狀態，讓學生進行修復。

---

### 2. 環境重置機制

#### Docker 版本

每次出題前，系統會自動執行：

```bash
docker rm -f trainee 2>/dev/null
docker run -d --name trainee meow-lab-image
```

確保每一題皆從乾淨環境開始。

#### Proxmox VM 版本

* 由 Template VM Clone 出學生專屬 VM
* 每題開始前 Rollback 至 `clean_start` Snapshot
* 題目完成後再次 Rollback，進入下一題

---

### 3. 出題方式

系統支援以下三種出題模式：

* **手動出題**：學生點擊「開始訓練」
* **自動出題**：背景服務在無進行中任務時自動出題
* **AI 出題（RAG）**：

  * 教師上傳教材（PDF / Markdown / HackMD）
  * 系統進行文字抽取、切分與向量化
  * AI 根據教材內容生成題目描述
  * 自動匹配對應的故障腳本

---

### 4. 智能提示系統（SRL）

為避免學生直接取得答案，系統設計 **SRL（Self-Regulated Learning）分級提示機制**：

* 第 1 次請求：模糊提示（引導思考方向）
* 第 2 次請求：提供診斷步驟與指令建議
* 第 3 次以上：提供完整修復流程

提示內容由 AI 結合教材與題目自動生成。

---

## Installation

### 環境需求

```bash
sudo apt update
sudo apt install -y docker.io
```

安裝 Node.js（18.x 以上）與 MySQL 8.0。

---

### Node.js 後端啟動

```bash
npm install
node src/app.js
```

---

## Usage

1. 開啟系統首頁，點擊 **開始挑戰**
2. 系統分配練習環境並注入第一題故障
3. 學生透過 SSH 連線至環境進行修復
4. 點擊 **驗證** 檢查修復結果
5. 通過後自動 rollback，進入下一題

### 進入練習環境（Docker）

```bash
sudo docker exec -it trainee bash
```

---

## Knowledge from Lecture

* Linux 系統管理
* 網路設定與服務管理
* Docker 與虛擬化概念
* Nginx、SSH、Firewall
* 系統故障排除流程

---

## Job Assignment

* **111213076 郭哲瑋**：簡報製作、主題構想、Readme 撰寫、資料整理
* **111213078 陳逸憲**：主題構想、資料整理
* **111213019 李玨叡**：主題構想、初始系統架構建立
* **111213052 鄒啟翔**：GitHub 維護、腳本設計、Readme 撰寫

---

## References

[https://github.com/NCNU-OpenSource/student-labs](https://github.com/NCNU-OpenSource/student-labs)
[https://github.com/labex-labs/linux-practice-challenges](https://github.com/labex-labs/linux-practice-challenges)

