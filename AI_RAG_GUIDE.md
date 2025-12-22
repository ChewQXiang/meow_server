# AI/RAG 功能使用指南

## 🚀 快速開始

### 1. 設定 OpenAI API Key

編輯 `.env` 檔案：
```bash
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 2. 建立資料表

```bash
mysql -u lsa -plsa123 lsa < sql/add_rag_tables.sql
```

### 3. 重啟應用程式

```bash
pkill -f "node src/app.js"
node src/app.js &
```

---

## 📚 功能說明

### 功能 1：教材上傳與管理

#### 上傳 PDF/Markdown 檔案

```bash
curl -X POST http://localhost:3000/api/teacher/materials/upload \
  -H "Cookie: connect.sid=your-session-cookie" \
  -F "file=@/path/to/material.pdf" \
  -F "title=Linux 系統管理教材" \
  -F "description=基礎篇"
```

#### 從 HackMD 匯入

```bash
curl -X POST http://localhost:3000/api/teacher/materials/hackmd \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=your-session-cookie" \
  -d '{
    "url": "https://hackmd.io/@user/note",
    "title": "Linux 網路管理",
    "description": "教材說明"
  }'
```

#### 查看教材列表

```bash
curl http://localhost:3000/api/teacher/materials \
  -H "Cookie: connect.sid=your-session-cookie"
```

---

### 功能 2：AI 自動出題

#### 生成題目

```bash
curl -X POST http://localhost:3000/api/teacher/questions/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=your-session-cookie" \
  -d '{
    "topic": "Nginx 服務管理",
    "count": 3
  }'
```

**回應範例：**
```json
{
  "ok": true,
  "questions": [
    {
      "title": "Nginx 服務無法啟動",
      "body": "生產環境的 Nginx 突然無法啟動...",
      "difficulty": "medium",
      "fault_id": "fault_01",
      "fault_path": "/opt/faults/fault_01.sh",
      "check_id": "check_01",
      "check_path": "/opt/checks/check_01.sh",
      "type": "service",
      "learning_objectives": ["理解 Nginx 配置", "掌握服務除錯"]
    }
  ]
}
```

#### 儲存生成的題目

```bash
curl -X POST http://localhost:3000/api/teacher/questions/save-generated \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=your-session-cookie" \
  -d '{
    "questions": [
      {
        "title": "生成的題目標題",
        "body": "題目描述...",
        "difficulty": "medium",
        "fault_id": "fault_01",
        "fault_path": "/opt/faults/fault_01.sh",
        "check_id": "check_01",
        "check_path": "/opt/checks/check_01.sh",
        "type": "ai-generated"
      }
    ]
  }'
```

---

### 功能 3：SRL 提示卡系統

#### 獲取智能提示

```bash
curl -X POST http://localhost:3000/api/student/hint \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=your-session-cookie" \
  -d '{
    "question_id": 1
  }'
```

**提示卡等級：**
- **subtle（第 1 次）**：模糊提示，引導思考
- **detailed（第 2 次）**：具體診斷方法
- **solution（第 3+ 次）**：完整解決步驟

**回應範例：**
```json
{
  "ok": true,
  "hint": {
    "hint_level": "subtle",
    "hint_text": "想想這個服務的配置檔案可能在哪裡？是否有語法錯誤？",
    "next_steps": [
      "檢查服務狀態",
      "查看系統日誌"
    ]
  }
}
```

---

### 功能 4：RAG 統計資訊

```bash
curl http://localhost:3000/api/teacher/rag/stats \
  -H "Cookie: connect.sid=your-session-cookie"
```

**回應範例：**
```json
{
  "ok": true,
  "stats": {
    "totalMaterials": 5,
    "totalChunks": 123,
    "aiGeneratedQuestions": 10,
    "vectorStoreSize": 123
  }
}
```

---

## 🎯 完整工作流程

### 教師端流程

1. **上傳教材**
   ```
   教師 → 上傳 PDF/HackMD → 系統自動切分並向量化
   ```

2. **AI 生成題目**
   ```
   教師輸入主題 → AI 檢索相關教材 → 生成題目描述 → 選擇合適的 fault 腳本
   ```

3. **審核並儲存題目**
   ```
   教師審核 AI 生成的題目 → 修改（可選）→ 儲存到題庫
   ```

4. **查看統計**
   ```
   教師查看教材數量、生成題目數、向量庫狀態
   ```

### 學生端流程

1. **開始訓練**
   ```
   學生 → 點擊「開始訓練」→ 分配 VM → 注入第 1 題故障
   ```

2. **解題過程**
   ```
   看題目描述 → 嘗試修復 → 失敗
   ```

3. **請求提示**
   ```
   點擊「提示」→ AI 根據題目和嘗試次數生成 SRL 提示
   ```

4. **繼續嘗試**
   ```
   根據提示修復 → 驗證 → 通過 → 下一題
   ```

---

## 🔧 進階設定

### 自訂 AI 模型

編輯 `src/rag.js`：

```javascript
// 修改模型
const response = await openai.chat.completions.create({
  model: "gpt-4",  // 可改為 gpt-3.5-turbo 節省成本
  // ...
});
```

### 調整 Chunk 大小

```javascript
const chunks = chunkText(content, 500); // 預設 500 字元
```

### 調整提示層級

編輯 `src/rag.js` 的 `generateHint` 函數：

```javascript
const hintLevels = ['subtle', 'detailed', 'solution'];
const level = hintLevels[Math.min(attemptCount, 2)];
// 可修改為更多層級
```

---

## 📊 資料庫 Schema

### materials 表

```sql
CREATE TABLE materials (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  file_path VARCHAR(500),
  source_url VARCHAR(500),
  uploaded_by INT,
  type ENUM('file', 'hackmd', 'text'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### hints 表

```sql
CREATE TABLE hints (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  question_id INT NOT NULL,
  hint_level ENUM('subtle', 'detailed', 'solution'),
  hint_text TEXT,
  created_at TIMESTAMP
);
```

---

## 🐛 故障排除

### API Key 錯誤

```
Error: OpenAI API key not set
```

**解決：**檢查 `.env` 檔案中的 `OPENAI_API_KEY`

### 向量庫為空

```
Warning: No documents in vector store
```

**解決：**先上傳教材建立向量庫

### 檔案上傳失敗

```
Error: File too large
```

**解決：**檢查 `src/app_rag_apis.js` 中的 `fileSize` 限制（預設 10MB）

---

## 💡 最佳實踐

1. **教材品質**：上傳高品質、結構化的教材效果更好
2. **題目審核**：AI 生成的題目建議人工審核後再使用
3. **提示漸進**：SRL 提示應循序漸進，避免直接給答案
4. **成本控制**：使用 gpt-3.5-turbo 可大幅降低成本
5. **快取機制**：考慮快取常用的 embedding 結果

---

## 📈 效能優化建議

### 1. 使用專業向量資料庫

目前使用記憶體存儲，生產環境建議：
- **Pinecone**：雲端向量資料庫
- **Weaviate**：開源向量資料庫
- **ChromaDB**：輕量級向量資料庫

### 2. Embedding 快取

```javascript
// 快取已生成的 embedding
const embeddingCache = new Map();
```

### 3. 批次處理

```javascript
// 批次生成 embedding
const embeddings = await Promise.all(
  chunks.map(chunk => createEmbedding(chunk))
);
```

---

## 🎓 Demo 展示腳本

### 完整 Demo 流程（15 分鐘）

**1. 教材上傳** (2 分鐘)
```bash
# 展示上傳 PDF
curl -X POST http://localhost:3000/api/teacher/materials/upload \
  -F "file=@demo.pdf" \
  -F "title=Demo 教材"
```

**2. AI 生成題目** (3 分鐘)
```bash
# 根據教材生成 3 個題目
curl -X POST http://localhost:3000/api/teacher/questions/generate \
  -d '{"topic": "系統服務管理", "count": 3}'
```

**3. 學生解題** (5 分鐘)
- 學生登入
- 開始訓練（顯示 VM 分配過程）
- 嘗試修復失敗

**4. 智能提示** (3 分鐘)
- 點擊「提示」按鈕
- 展示 SRL 分級提示
- 根據提示成功修復

**5. 統計展示** (2 分鐘)
```bash
# 展示 RAG 統計
curl http://localhost:3000/api/teacher/rag/stats
```

---

## 📞 技術支援

如有問題，請檢查：
1. OpenAI API Key 是否正確
2. 資料表是否已建立
3. Node.js 版本（建議 >= 18）
4. 相關套件是否已安裝

**重啟服務：**
```bash
pkill -f "node src/app.js"
node src/app.js &
```
