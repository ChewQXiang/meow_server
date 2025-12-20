// src/rag.js
// RAG (Retrieval-Augmented Generation) 服務
// 負責教材處理、向量化、檢索和 AI 出題

const OpenAI = require('openai');
const fs = require('fs').promises;

let pdfParse = null;
let pdfParseError = null;

try {
  pdfParse = require('pdf-parse');
} catch (error) {
  pdfParseError = error;
  console.warn('[RAG] pdf-parse 模組初始化失敗，PDF 解析功能將停用：', error.message);
  console.warn('       若需啟用，請升級至 Node.js 20+ 或在環境中提供 DOMMatrix / ImageData / Path2D polyfill。');
}

// 初始化 OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here'
});

// 簡易向量資料庫（記憶體版本）
// 生產環境建議使用 Pinecone, Weaviate, 或 ChromaDB
const vectorStore = {
  documents: [],
  embeddings: []
};

/**
 * 從文字內容提取 chunks
 * @param {string} text - 原始文字
 * @param {number} chunkSize - 每個 chunk 的大小（字元數）
 * @returns {Array<string>} - 切分後的 chunks
 */
function chunkText(text, chunkSize = 500) {
  const chunks = [];
  const lines = text.split('\n');
  let currentChunk = '';

  for (const line of lines) {
    if ((currentChunk + line).length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = line;
    } else {
      currentChunk += '\n' + line;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * 解析 PDF 檔案
 * @param {Buffer} buffer - PDF 檔案 buffer
 * @returns {Promise<string>} - 提取的文字
 */
async function parsePDF(buffer) {
  if (!pdfParse) {
    throw new Error(`PDF parsing is disabled in this environment：${pdfParseError?.message || '缺少 DOM API polyfill'}`);
  }

  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    throw new Error(`PDF parsing failed: ${error.message}`);
  }
}

/**
 * 解析 Markdown 文字
 * @param {string} markdown - Markdown 內容
 * @returns {string} - 純文字
 */
function parseMarkdown(markdown = '') {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')     // 移除程式碼區塊
    .replace(/`([^`]+)`/g, '$1')         // 反引號
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')// 圖片
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // 連結
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1') // 粗斜體
    .replace(/^\s{0,3}>\s?/gm, '')       // 引言
    .replace(/^\s{0,3}[-*+]\s+/gm, '')   // 無序清單
    .replace(/^\s*\d+\.\s+/gm, '')       // 有序清單
    .replace(/#{1,6}\s*/g, '')           // 標題
    .replace(/<\/?[^>]+(>|$)/g, ' ')     // HTML 標籤
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 從 HackMD URL 獲取內容
 * @param {string} url - HackMD URL
 * @returns {Promise<string>} - Markdown 內容
 */
async function fetchHackMD(url) {
  try {
    // HackMD URL 格式: https://hackmd.io/@user/note
    // 轉換為 raw 格式: https://hackmd.io/@user/note/download
    const rawUrl = url.endsWith('/download') ? url : `${url}/download`;

    const axios = require('axios');
    const response = await axios.get(rawUrl);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch HackMD: ${error.message}`);
  }
}

/**
 * 生成文字的 embedding
 * @param {string} text - 文字內容
 * @returns {Promise<Array<number>>} - 向量
 */
async function createEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Embedding creation failed:', error.message);
    // 如果 API 失敗，返回假的向量（開發用）
    return Array(1536).fill(0).map(() => Math.random());
  }
}

/**
 * 計算兩個向量的餘弦相似度
 * @param {Array<number>} a - 向量 A
 * @param {Array<number>} b - 向量 B
 * @returns {number} - 相似度 (0-1)
 */
function cosineSimilarity(a, b) {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * 將教材加入向量資料庫
 * @param {string} content - 教材內容
 * @param {object} metadata - 教材元資料
 */
async function addToVectorStore(content, metadata = {}) {
  const chunks = chunkText(content);

  for (const chunk of chunks) {
    const embedding = await createEmbedding(chunk);
    vectorStore.documents.push({
      content: chunk,
      metadata,
      timestamp: new Date()
    });
    vectorStore.embeddings.push(embedding);
  }

  return {
    chunksAdded: chunks.length,
    totalChunks: vectorStore.documents.length
  };
}

/**
 * 檢索相關內容
 * @param {string} query - 查詢文字
 * @param {number} topK - 返回前 K 個結果
 * @returns {Promise<Array>} - 相關文件
 */
async function retrieve(query, topK = 3) {
  if (vectorStore.documents.length === 0) {
    return [];
  }

  const queryEmbedding = await createEmbedding(query);

  // 計算所有文件的相似度
  const similarities = vectorStore.embeddings.map((embedding, index) => ({
    index,
    similarity: cosineSimilarity(queryEmbedding, embedding),
    document: vectorStore.documents[index]
  }));

  // 排序並返回 topK
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK)
    .map(item => ({
      content: item.document.content,
      metadata: item.document.metadata,
      similarity: item.similarity
    }));
}

/**
 * 使用 RAG 生成題目
 * @param {string} topic - 題目主題
 * @param {Array} availableFaults - 可用的 fault 腳本列表
 * @returns {Promise<object>} - 生成的題目
 */
async function generateQuestion(topic, availableFaults) {
  // 檢索相關教材
  const relevantDocs = await retrieve(topic, 3);
  const context = relevantDocs.map(doc => doc.content).join('\n\n');

  // 準備 fault 列表
  const faultList = availableFaults.map(f =>
    `- ${f.fault_id}: ${f.description || f.type}`
  ).join('\n');

  const prompt = `你是一個 Linux 系統管理教學專家。根據以下教材內容，生成一個實作題目。

教材內容：
${context || '（無相關教材，請根據主題生成）'}

主題：${topic}

可用的故障腳本：
${faultList}

請生成一個題目，包含：
1. 題目標題（簡短有力）
2. 題目描述（清楚說明學生要修復什麼問題）
3. 難度（easy/medium/hard）
4. 選擇最適合的 fault_id
5. 學習目標

回傳 JSON 格式：
{
  "title": "題目標題",
  "body": "題目描述（包含情境和提示）",
  "difficulty": "easy",
  "fault_id": "fault_XX",
  "learning_objectives": ["目標1", "目標2"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "你是一個專業的 Linux 系統管理教學助理，擅長設計實作題目。" },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (error) {
    console.error('Question generation failed:', error.message);
    // 如果 API 失敗，返回預設題目
    return {
      title: `${topic} 故障排除`,
      body: `系統發生 ${topic} 相關問題，請診斷並修復。\n\n提示：檢查相關服務和配置檔案。`,
      difficulty: 'medium',
      fault_id: availableFaults[0]?.fault_id || 'fault_01',
      learning_objectives: [`理解 ${topic} 的運作原理`, '掌握故障排除技巧']
    };
  }
}

/**
 * 生成 SRL 提示卡（Self-Regulated Learning）
 * @param {object} question - 題目資訊
 * @param {number} attemptCount - 學生嘗試次數
 * @returns {Promise<object>} - 提示卡內容
 */
async function generateHint(question, attemptCount = 0) {
  const hintLevels = ['subtle', 'detailed', 'solution'];
  const level = hintLevels[Math.min(attemptCount, 2)];

  const prompt = `你是一個教學助理，使用 SRL (Self-Regulated Learning) 方法協助學生。

題目：${question.title}
描述：${question.body}

學生已嘗試 ${attemptCount + 1} 次。

請根據 SRL 原則，提供${level === 'subtle' ? '模糊' : level === 'detailed' ? '詳細' : '解答步驟'}提示：

- subtle (第一次)：引導思考方向，不直接給答案
- detailed (第二次)：提供更具體的診斷方法
- solution (第三次)：提供完整的解決步驟

回傳 JSON 格式：
{
  "hint_level": "${level}",
  "hint_text": "提示內容",
  "next_steps": ["建議步驟1", "建議步驟2"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "你是一個擅長 SRL 教學法的助教，會循序漸進地引導學生。" },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Hint generation failed:', error.message);
    // 返回預設提示
    const defaultHints = {
      subtle: {
        hint_level: 'subtle',
        hint_text: '想想這個問題可能與哪個系統服務或配置檔案有關？',
        next_steps: ['檢查系統日誌', '確認服務狀態']
      },
      detailed: {
        hint_level: 'detailed',
        hint_text: '使用 systemctl 或相關命令檢查服務狀態，查看配置檔案是否正確。',
        next_steps: ['執行診斷命令', '檢查配置檔案語法']
      },
      solution: {
        hint_level: 'solution',
        hint_text: '完整解決步驟請參考 check 腳本的提示訊息。',
        next_steps: ['按照步驟執行', '驗證修復結果']
      }
    };
    return defaultHints[level];
  }
}

/**
 * 批量生成題目
 * @param {Array} topics - 主題列表
 * @param {Array} availableFaults - 可用的 fault 腳本
 * @param {number} count - 生成數量
 * @returns {Promise<Array>} - 生成的題目列表
 */
async function batchGenerateQuestions(topics, availableFaults, count = 10) {
  const questions = [];

  for (let i = 0; i < count && i < topics.length; i++) {
    const question = await generateQuestion(topics[i], availableFaults);
    questions.push(question);
    // 避免 API rate limit
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return questions;
}

module.exports = {
  parsePDF,
  parseMarkdown,
  fetchHackMD,
  addToVectorStore,
  retrieve,
  generateQuestion,
  generateHint,
  batchGenerateQuestions,
  vectorStore // 用於測試
};
