// test.js - 系統測試腳本
const { dbHelpers } = require('./src/db');
const { checkPVEConnection } = require('./src/pve');

async function testDatabase() {
  console.log('\n=== 測試數據庫 ===');
  try {
    // 測試獲取題目
    const questions = await dbHelpers.getQuestions();
    console.log(`✓ 數據庫連接成功`);
    console.log(`✓ 題目數量: ${questions.length}`);
    
    if (questions.length > 0) {
      console.log(`✓ 第一題: ${questions[0].title}`);
    }
    
    // 測試創建用戶
    const user = await dbHelpers.getOrCreateUser('test_student', 'student');
    console.log(`✓ 用戶創建/獲取成功: ${user.username} (${user.role})`);
    
    // 測試進度
    const progress = await dbHelpers.getProgress(user.id);
    console.log(`✓ 進度查詢成功: started=${progress.started}, current_qid=${progress.current_qid}`);
    
    return true;
  } catch (error) {
    console.error(`✗ 數據庫測試失敗:`, error.message);
    return false;
  }
}

async function testPVE() {
  console.log('\n=== 測試 Proxmox PVE 連線 ===');
  try {
    const status = await checkPVEConnection();
    if (status.ok) {
      console.log(`✓ PVE 連線成功: ${status.message}`);
      return true;
    } else {
      console.log(`⚠ PVE 連線失敗: ${status.message}`);
      console.log(`  提示: 請檢查 .env 中的 PVE 配置`);
      return false;
    }
  } catch (error) {
    console.error(`✗ PVE 測試失敗:`, error.message);
    console.log(`  提示: 如果沒有配置 PVE，這是正常的（系統可以在 dry-run 模式下運行）`);
    return false;
  }
}

async function testAPI() {
  console.log('\n=== 測試 API 端點 ===');
  const baseURL = 'http://localhost:3000';
  
  try {
    // 測試 health check
    const healthRes = await fetch(`${baseURL}/api/health`);
    const healthData = await healthRes.json();
    console.log(`✓ Health check: ${healthData.ok ? 'OK' : 'FAIL'}`);
    if (healthData.pve) {
      console.log(`  PVE 狀態: ${healthData.pve.ok ? '✓' : '✗'} ${healthData.pve.message}`);
    }
    
    // 測試登入
    const loginRes = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'test_student' }),
    });
    const loginData = await loginRes.json();
    if (loginData.ok) {
      console.log(`✓ 登入 API: 成功 (${loginData.user.role})`);
    } else {
      console.log(`✗ 登入 API: 失敗`);
    }
    
    // 測試獲取題目（需要 cookie）
    const cookies = loginRes.headers.get('set-cookie');
    const questionsRes = await fetch(`${baseURL}/api/student/questions`, {
      headers: { 'Cookie': cookies || '' },
    });
    const questionsData = await questionsRes.json();
    if (questionsData.ok) {
      console.log(`✓ 題目列表 API: 成功 (${questionsData.rows.length} 題)`);
    } else {
      console.log(`✗ 題目列表 API: 失敗`);
    }
    
    return true;
  } catch (error) {
    console.error(`✗ API 測試失敗:`, error.message);
    console.log(`  提示: 請確保服務器正在運行 (npm run dev)`);
    return false;
  }
}

async function runTests() {
  console.log('開始系統測試...\n');
  
  const results = {
    database: await testDatabase(),
    pve: await testPVE(),
    api: false, // API 測試需要服務器運行
  };
  
  console.log('\n=== 測試結果總結 ===');
  console.log(`數據庫: ${results.database ? '✓ 通過' : '✗ 失敗'}`);
  console.log(`PVE: ${results.pve ? '✓ 通過' : '⚠ 未配置（可選）'}`);
  console.log(`API: 需要手動測試（啟動服務器後訪問 http://localhost:3000）`);
  
  console.log('\n=== 下一步 ===');
  console.log('1. 配置 .env 文件（如果需要 PVE 功能）');
  console.log('2. 啟動服務器: npm run dev');
  console.log('3. 訪問 http://localhost:3000 進行完整測試');
  console.log('4. 使用 teacher1 / Student123 登入測試');
  
  process.exit(results.database ? 0 : 1);
}

// 檢查是否在 Node.js 環境中運行
if (typeof fetch === 'undefined') {
  console.log('注意: 需要 Node.js 18+ 才能運行 API 測試');
  console.log('只運行數據庫和 PVE 測試...\n');
  
  testDatabase().then(() => {
    return testPVE();
  }).then(() => {
    console.log('\n✓ 基本測試完成');
    process.exit(0);
  }).catch(err => {
    console.error('測試失敗:', err);
    process.exit(1);
  });
} else {
  runTests();
}

