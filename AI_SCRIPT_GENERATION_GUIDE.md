# AI 脚本生成功能使用指南

## 📋 概述

本指南说明如何使用新增的 AI 脚本生成功能。此功能允许教师使用 AI 自动生成题目及对应的故障注入脚本和验证脚本，无需手动编写脚本文件。

---

## 🎯 新增功能

### 1. **教材上传增强**
   - ✅ **PDF 上传**：支持上传 PDF 教材文件
   - ✅ **HackMD 导入**：支持从 HackMD URL 导入教材
   - ✅ **文字输入**：原有的文字输入功能保留

### 2. **AI 脚本生成**
   - ✅ **自动生成 fault 脚本**：基于教材和题目自动生成故障注入脚本
   - ✅ **自动生成 check 脚本**：基于题目自动生成验证脚本
   - ✅ **脚本存储在数据库**：生成的脚本直接存储在数据库中
   - ✅ **动态执行**：学生训练时动态从数据库读取并执行脚本

---

## 🗄️ 数据库变更

### 新增字段

需要执行以下 SQL 脚本更新数据库：

```bash
mysql -u lsa -p lsa < sql/add_ai_script_fields.sql
```

这会为 `questions` 表添加两个新字段：
- `fault_script` (TEXT)：存储 AI 生成的故障注入脚本内容
- `check_script` (TEXT)：存储 AI 生成的验证脚本内容

---

## 📚 使用流程

### 步骤 1：上传教材

教师可以通过三种方式上传教材：

#### 方式 1：上传 PDF 文件

1. 登录教师端
2. 点击「上传 PDF」标签
3. 填写标题（选填）和描述（选填）
4. 选择 PDF 文件（也支持 .md 和 .txt 文件）
5. 点击「上传」

**API 端点**：`POST /api/teacher/materials/upload`

**示例代码**：
```javascript
const formData = new FormData();
formData.append('file', pdfFile);
formData.append('title', '标题');
formData.append('description', '描述');

fetch('/api/teacher/materials/upload', {
  method: 'POST',
  credentials: 'include',
  body: formData
});
```

#### 方式 2：从 HackMD 导入

1. 登录教师端
2. 点击「HackMD 连结」标签
3. 输入 HackMD URL（如：`https://hackmd.io/@username/document`）
4. 填写标题和描述（选填）
5. 点击「匯入」

**API 端点**：`POST /api/teacher/materials/hackmd`

**示例代码**：
```javascript
fetch('/api/teacher/materials/hackmd', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://hackmd.io/@username/document',
    title: '标题',
    description: '描述'
  })
});
```

#### 方式 3：文字输入

使用原有的文字输入方式（保持不变）。

---

### 步骤 2：使用 AI 生成题目和脚本

**API 端点**：`POST /api/teacher/questions/generate`

**参数**：
- `topic` (string, 必需)：题目主题
- `count` (number, 可选)：生成数量，默认 1
- `useAIScripts` (boolean, 可选)：是否生成 AI 脚本，默认 true

**示例代码**：
```javascript
// 生成 AI 脚本版本（新功能）
fetch('/api/teacher/questions/generate', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: 'Nginx 配置错误排查',
    count: 1,
    useAIScripts: true  // 使用 AI 生成脚本
  })
});

// 使用已有脚本（旧方式）
fetch('/api/teacher/questions/generate', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    topic: 'Nginx 配置错误排查',
    count: 1,
    useAIScripts: false  // 使用已有的 fault/check 脚本
  })
});
```

**返回数据**：
```json
{
  "ok": true,
  "questions": [
    {
      "title": "Nginx 配置错误排查",
      "body": "题目描述...",
      "difficulty": "medium",
      "type": "ai-generated",
      "fault_id": "ai_fault_1703123456789",
      "fault_script": "#!/bin/bash\n...",
      "check_id": "ai_check_1703123456789",
      "check_script": "#!/bin/bash\n...",
      "learning_objectives": ["目标1", "目标2"]
    }
  ],
  "message": "成功生成 1 个题目（含 AI 脚本）"
}
```

---

### 步骤 3：保存题目

**API 端点**：`POST /api/teacher/questions/save-generated`

**示例代码**：
```javascript
fetch('/api/teacher/questions/save-generated', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    questions: generatedQuestions
  })
});
```

系统会自动检测题目是否包含 AI 生成的脚本：
- 如果有 `fault_script` 和 `check_script`：保存脚本内容到数据库
- 如果没有：使用原有方式保存（只保存脚本路径）

---

## 🔄 学生训练流程（自动支持 AI 脚本）

学生使用流程**无需改变**，系统会自动处理：

1. **开始训练** (`POST /api/student/start`)
   - 系统检查题目是否有 `fault_script`
   - 如果有：动态将脚本写入 VM 临时文件并执行
   - 如果没有：使用 `fault_path` 执行文件系统中的脚本

2. **验证修复** (`POST /api/student/verify`)
   - 系统检查题目是否有 `check_script`
   - 如果有：动态将脚本写入 VM 临时文件并执行
   - 如果没有：使用 `check_path` 执行文件系统中的脚本

3. **下一题** (`POST /api/student/next`)
   - 回滚 VM 快照
   - 同步骤 1，注入下一题的故障

---

## 🛠️ 技术实现

### 核心函数

#### 1. `generateFaultScript(topic, questionData)`
生成故障注入脚本。

**参数**：
- `topic`：题目主题
- `questionData`：题目资讯

**返回**：bash 脚本内容（字符串）

#### 2. `generateCheckScript(topic, questionData, faultScript)`
生成验证脚本。

**参数**：
- `topic`：题目主题
- `questionData`：题目资讯
- `faultScript`：对应的 fault 脚本

**返回**：bash 脚本内容（字符串）

#### 3. `generateQuestionWithScripts(topic)`
完整生成题目（包含题目内容和脚本）。

**参数**：
- `topic`：题目主题

**返回**：
```javascript
{
  title: "题目标题",
  body: "题目描述",
  difficulty: "medium",
  type: "ai-generated",
  fault_id: "ai_fault_1703123456789",
  fault_script: "#!/bin/bash\n...",
  check_id: "ai_check_1703123456789",
  check_script: "#!/bin/bash\n...",
  learning_objectives: ["目标1", "目标2"]
}
```

#### 4. `executeScript(conn, scriptContent, scriptPath, scriptType)`
执行脚本（支持 AI 脚本和文件脚本）。

**参数**：
- `conn`：SSH 连线资讯
- `scriptContent`：脚本内容（AI 生成的脚本）
- `scriptPath`：脚本路径（文件系统中的脚本）
- `scriptType`：脚本类型（'fault' 或 'check'）

**执行逻辑**：
1. 如果有 `scriptContent`：
   - 将脚本写入 VM 的 `/tmp/` 目录
   - 添加执行权限
   - 执行脚本
   - 清理临时文件
2. 如果有 `scriptPath`：
   - 直接执行文件系统中的脚本

---

## 🔒 安全性

AI 生成脚本时会遵循以下安全原则：

1. **不删除关键系统文件**（/etc/passwd, /etc/shadow, /boot 等）
2. **不破坏整个系统**
3. **只修改与题目相关的配置**
4. **故障必须可逆**
5. **避免永久性损害**

---

## ⚙️ 配置要求

### 环境变量

确保 `.env` 文件包含以下配置：

```bash
# OpenAI API（用于 AI 脚本生成）
OPENAI_API_KEY=your-openai-api-key

# 数据库配置
DB_HOST=127.0.0.1
DB_USER=lsa
DB_PASS=lsa123
DB_NAME=lsa

# VM SSH 配置（用于执行脚本）
VM_SSH_PORT=22
VM_SSH_USER=trainer
VM_SSH_KEY_PATH=/path/to/private/key
```

---

## 📊 对比：旧方式 vs 新方式

### 旧方式（静态脚本）

1. 教师手动编写 `fault_XX.sh` 和 `check_XX.sh`
2. 将脚本文件放入 `/scripts/faults/` 和 `/scripts/checks/`
3. 在数据库中保存脚本路径
4. 学生训练时执行文件系统中的脚本

**优点**：脚本可版本控制
**缺点**：需要手动编写，无法基于教材动态生成

### 新方式（AI 动态脚本）

1. 教师上传教材（PDF / HackMD / 文字）
2. 系统自动生成题目和脚本
3. 脚本内容存储在数据库中
4. 学生训练时动态执行数据库中的脚本

**优点**：自动化、基于教材、快速生成
**缺点**：依赖 OpenAI API，脚本不在文件系统中

---

## 🧪 测试流程

### 1. 测试教材上传

```bash
# 测试 PDF 上传
curl -X POST http://localhost:3000/api/teacher/materials/upload \
  -H "Cookie: connect.sid=..." \
  -F "file=@test.pdf" \
  -F "title=测试教材"

# 测试 HackMD 导入
curl -X POST http://localhost:3000/api/teacher/materials/hackmd \
  -H "Cookie: connect.sid=..." \
  -H "Content-Type: application/json" \
  -d '{"url":"https://hackmd.io/@user/doc","title":"测试"}'
```

### 2. 测试 AI 题目生成

```bash
# 生成包含 AI 脚本的题目
curl -X POST http://localhost:3000/api/teacher/questions/generate \
  -H "Cookie: connect.sid=..." \
  -H "Content-Type: application/json" \
  -d '{"topic":"Nginx 配置错误","count":1,"useAIScripts":true}'
```

### 3. 测试保存题目

```bash
curl -X POST http://localhost:3000/api/teacher/questions/save-generated \
  -H "Cookie: connect.sid=..." \
  -H "Content-Type: application/json" \
  -d '{"questions":[...]}'
```

### 4. 测试学生训练

```bash
# 开始训练（会自动注入 AI 生成的故障）
curl -X POST http://localhost:3000/api/student/start \
  -H "Cookie: connect.sid=..."

# 验证修复（会自动运行 AI 生成的检查脚本）
curl -X POST http://localhost:3000/api/student/verify \
  -H "Cookie: connect.sid=..." \
  -H "Content-Type: application/json" \
  -d '{"question_id":1}'
```

---

## 🐛 故障排除

### 问题 1：上传 PDF 失败

**原因**：`pdf-parse` 模块需要 DOM API polyfill

**解决方案**：
- 升级到 Node.js 20+
- 或在环境中提供 DOMMatrix / ImageData / Path2D polyfill

### 问题 2：AI 脚本生成失败

**原因**：OpenAI API 配置错误或额度不足

**解决方案**：
- 检查 `OPENAI_API_KEY` 是否正确
- 检查 OpenAI 账户额度
- 查看 console 日志获取详细错误信息

### 问题 3：脚本执行失败

**原因**：VM SSH 连线配置错误

**解决方案**：
- 检查 `VM_SSH_KEY_PATH` 是否正确
- 检查 VM IP 是否可达
- 检查 SSH 用户权限

---

## 📝 更新日志

### 2025-12-20

#### 新增功能
- ✅ 前端增加 PDF 上传和 HackMD 导入界面
- ✅ 实现 `generateFaultScript()` 函数
- ✅ 实现 `generateCheckScript()` 函数
- ✅ 实现 `generateQuestionWithScripts()` 函数
- ✅ 实现 `executeScript()` 辅助函数

#### 数据库变更
- ✅ 添加 `fault_script` 字段到 questions 表
- ✅ 添加 `check_script` 字段到 questions 表

#### API 更新
- ✅ 更新 `POST /api/teacher/questions/generate` 支持 AI 脚本
- ✅ 更新 `POST /api/teacher/questions/save-generated` 支持保存脚本内容
- ✅ 更新 `POST /api/student/start` 支持执行 AI 脚本
- ✅ 更新 `POST /api/student/verify` 支持执行 AI 脚本
- ✅ 更新 `POST /api/student/next` 支持执行 AI 脚本

---

## 🚀 下一步

建议的改进方向：

1. **脚本预览功能**：允许教师在保存前预览 AI 生成的脚本
2. **脚本编辑功能**：允许教师编辑 AI 生成的脚本
3. **脚本版本控制**：保存脚本的历史版本
4. **批量生成**：一次生成多个相关题目
5. **脚本验证**：在保存前验证脚本语法
6. **安全检查**：对 AI 生成的脚本进行安全性检查

---

## 📞 支持

如有问题，请查看：
- 主要文档：`README.md`
- RAG 功能文档：`AI_RAG_GUIDE.md`
- 开发进度：`PROGRESS.md`
