# 🧪 AI 脚本生成功能测试指南

## 📋 前提条件检查

✅ **已完成**：
- Node.js 环境：v22.21.1 ✅
- npm 版本：10.9.4 ✅
- 项目依赖：已安装 ✅
- Git 分支：claude/review-git-branch-6tet5 ✅

⚠️ **需要配置**：
- MySQL 数据库
- OpenAI API Key（用于 AI 功能）
- .env 环境变量

---

## 🚀 快速开始（5 步完成测试）

### 步骤 1：配置环境变量

```bash
# 编辑 .env 文件
nano .env

# 或使用 vim
vim .env
```

**必须配置的变量**：

```bash
# 数据库配置（必须）
DB_HOST=127.0.0.1
DB_USER=lsa
DB_PASS=lsa123
DB_NAME=lsa

# OpenAI API（AI 功能必须）
OPENAI_API_KEY=sk-your-actual-api-key-here

# Session 密钥
SESSION_SECRET=your-secret-key-here
```

**可选配置**（如果要测试完整功能）：

```bash
# VM SSH 配置（学生训练功能需要）
VM_SSH_PORT=22
VM_SSH_USER=trainer
VM_SSH_KEY_PATH=/path/to/ssh/private/key

# Proxmox 配置（VM 管理需要）
PVE_HOST=192.168.1.100
PVE_USER=root@pam
PVE_PASSWORD=your-pve-password
PVE_NODE=pve
PVE_TEMPLATE_VMID=100
```

---

### 步骤 2：设置数据库

#### 选项 A：如果数据库已存在（推荐）

```bash
# 只添加新的 AI 脚本字段
mysql -u lsa -p lsa < sql/add_ai_script_fields.sql

# 输入密码：lsa123
```

#### 选项 B：如果是全新安装

```bash
# 创建数据库并导入所有数据
mysql -u root -p << EOF
CREATE DATABASE IF NOT EXISTS lsa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'lsa'@'localhost' IDENTIFIED BY 'lsa123';
GRANT ALL PRIVILEGES ON lsa.* TO 'lsa'@'localhost';
FLUSH PRIVILEGES;
EOF

# 导入基础架构
mysql -u lsa -p lsa < sql/schema.sql

# 导入种子数据
mysql -u lsa -p lsa < sql/seed.sql

# 导入 20 道题目
mysql -u lsa -p lsa < sql/seed_20_questions.sql

# 添加 RAG 表
mysql -u lsa -p lsa < sql/add_rag_tables.sql

# 添加 AI 脚本字段
mysql -u lsa -p lsa < sql/add_ai_script_fields.sql
```

---

### 步骤 3：验证数据库配置

```bash
# 验证新增的字段是否存在
mysql -u lsa -p lsa -e "DESCRIBE questions;" | grep -E "(fault_script|check_script)"
```

**预期输出**：

```
fault_script | text     | YES  |     | NULL    |       |
check_script | text     | YES  |     | NULL    |       |
```

---

### 步骤 4：启动开发服务器

```bash
# 启动服务器
npm run dev

# 或使用 node 直接启动
node src/app.js
```

**预期输出**：

```
Server listening on http://localhost:3000
PVE Connection: false (OK - 会在有 Proxmox 配置时连接)
```

---

### 步骤 5：测试 AI 功能

#### 🌐 在浏览器中测试

1. **访问教师端**：`http://localhost:3000/teacher`

2. **登录**：
   - 用户名：`teacher1`（或任何包含 "teacher" 的用户名）
   - 系统会自动创建用户

3. **测试教材上传**：

   **方法 1：文字输入**
   - 切换到「文字輸入」标签
   - 输入标题和内容
   - 点击「送出」

   **方法 2：上传 PDF**
   - 切换到「上傳 PDF」标签
   - 选择 PDF 文件
   - 输入标题（可选）
   - 点击「上傳」

   **方法 3：HackMD 导入**
   - 切换到「HackMD 連結」标签
   - 输入 HackMD URL
   - 点击「匯入」

4. **测试 AI 题目生成**（需要浏览器控制台）：

   ```javascript
   // 打开浏览器开发者工具（F12）
   // 在 Console 中执行：

   // 生成 AI 题目（包含脚本）
   fetch('/api/teacher/questions/generate', {
     method: 'POST',
     credentials: 'include',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       topic: 'Nginx 配置错误排查',
       count: 1,
       useAIScripts: true
     })
   })
   .then(r => r.json())
   .then(data => {
     console.log('生成的题目:', data);
     window.generatedQuestions = data.questions;
   });

   // 保存生成的题目
   fetch('/api/teacher/questions/save-generated', {
     method: 'POST',
     credentials: 'include',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       questions: window.generatedQuestions
     })
   })
   .then(r => r.json())
   .then(data => console.log('保存结果:', data));
   ```

---

## 🧪 使用终端测试 API

### 测试 1：上传 PDF 教材

```bash
# 创建测试 PDF（如果有 pandoc）
echo "# Nginx 教程

## 安装 Nginx
sudo apt install nginx

## 配置文件
配置文件位于 /etc/nginx/nginx.conf
" | pandoc -o /tmp/test.pdf

# 上传 PDF
curl -X POST http://localhost:3000/api/teacher/materials/upload \
  -H "Cookie: connect.sid=YOUR_SESSION_ID" \
  -F "file=@/tmp/test.pdf" \
  -F "title=Nginx 基础教程"
```

### 测试 2：HackMD 导入

```bash
curl -X POST http://localhost:3000/api/teacher/materials/hackmd \
  -H "Cookie: connect.sid=YOUR_SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://hackmd.io/@example/doc",
    "title": "测试教材"
  }'
```

### 测试 3：生成 AI 题目

```bash
curl -X POST http://localhost:3000/api/teacher/questions/generate \
  -H "Cookie: connect.sid=YOUR_SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Nginx 配置错误",
    "count": 1,
    "useAIScripts": true
  }' | jq '.'
```

### 测试 4：查看生成的题目

```bash
# 查看数据库中的题目
mysql -u lsa -p lsa -e "
SELECT id, title, type, fault_id, check_id,
       SUBSTRING(fault_script, 1, 50) as fault_preview,
       SUBSTRING(check_script, 1, 50) as check_preview
FROM questions
WHERE type = 'ai-generated'
ORDER BY id DESC
LIMIT 5;
"
```

---

## 📊 验证功能清单

### ✅ 教材上传功能

- [ ] 文字输入 - 成功保存
- [ ] PDF 上传 - 成功解析并保存
- [ ] HackMD 导入 - 成功获取并保存
- [ ] 教材列表 - 显示所有上传的教材

### ✅ AI 脚本生成功能

- [ ] 生成题目 - 返回包含脚本的题目
- [ ] fault_script - 包含有效的 bash 脚本
- [ ] check_script - 包含有效的 bash 脚本
- [ ] 保存题目 - 成功保存到数据库

### ✅ 数据库验证

- [ ] questions 表有 fault_script 字段
- [ ] questions 表有 check_script 字段
- [ ] AI 生成的题目正确保存

---

## 🐛 常见问题排除

### 问题 1：OpenAI API 错误

**症状**：`Question generation failed: API key invalid`

**解决方案**：
```bash
# 检查 API key 是否正确
grep OPENAI_API_KEY .env

# 确保格式正确（sk-开头）
# OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

### 问题 2：PDF 解析失败

**症状**：`PDF parsing is disabled`

**解决方案**：
- Node.js 18 可能不支持
- 升级到 Node.js 20+ 或使用 Markdown

### 问题 3：数据库连接失败

**症状**：`connect ECONNREFUSED 127.0.0.1:3306`

**解决方案**：
```bash
# 检查 MySQL 是否运行
sudo systemctl status mysql

# 启动 MySQL
sudo systemctl start mysql

# 测试连接
mysql -u lsa -p
```

### 问题 4：Session 无效

**症状**：API 返回 `401 未登入`

**解决方案**：
- 先访问 `/teacher` 页面登录
- 或在 curl 中使用正确的 session cookie

---

## 📝 测试脚本示例

创建一个完整的测试脚本：

```bash
#!/bin/bash

echo "=== 完整功能测试 ==="

# 1. 启动服务器（后台）
echo "[1/5] 启动服务器..."
npm run dev &
SERVER_PID=$!
sleep 5

# 2. 登录获取 session
echo "[2/5] 登录..."
SESSION=$(curl -s -c - -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"teacher1"}' | grep connect.sid | awk '{print $7}')

# 3. 上传教材
echo "[3/5] 上传教材..."
curl -s -X POST http://localhost:3000/api/teacher/materials \
  -H "Cookie: connect.sid=$SESSION" \
  -H "Content-Type: application/json" \
  -d '{"title":"测试","content":"Nginx 测试内容"}' | jq '.'

# 4. 生成 AI 题目
echo "[4/5] 生成 AI 题目..."
curl -s -X POST http://localhost:3000/api/teacher/questions/generate \
  -H "Cookie: connect.sid=$SESSION" \
  -H "Content-Type: application/json" \
  -d '{"topic":"Nginx","count":1,"useAIScripts":true}' | jq '.'

# 5. 停止服务器
echo "[5/5] 停止服务器..."
kill $SERVER_PID

echo "=== 测试完成 ==="
```

---

## 🎯 下一步

测试成功后，您可以：

1. **继续开发**：在此分支上添加更多功能
2. **创建 Pull Request**：合并到 master 分支
3. **部署到生产环境**：配置真实的 Proxmox 和数据库

---

## 📞 需要帮助？

- 查看详细文档：`AI_SCRIPT_GENERATION_GUIDE.md`
- 查看 RAG 功能：`AI_RAG_GUIDE.md`
- 查看进度：`PROGRESS.md`

---

**祝测试顺利！** 🎉
