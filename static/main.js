let currentHintStep = 0;
let maxHintSteps = 0;
let pollingTimer = null;

const catFaceEl = document.getElementById('cat-face');
const shortDescEl = document.getElementById('short-desc');
const statusTextEl = document.getElementById('status-text');
const timerTextEl = document.getElementById('timer-text');
const explainBoxEl = document.getElementById('explain-box');
const hintDialogEl = document.getElementById('hint-dialog');
const btnNextHintEl = document.getElementById('btn-next-hint');
const loginHintEl = document.getElementById('login-hint');
const btnStartEl = document.getElementById('btn-start');

function setCatMood(mood) {
  // mood: idle | thinking | happy | angry
  if (mood === 'happy') catFaceEl.textContent = '😺';
  else if (mood === 'thinking') catFaceEl.textContent = '😼';
  else if (mood === 'angry') catFaceEl.textContent = '😾';
  else catFaceEl.textContent = '😺';
}

function setStatus(status, message) {
  // status: idle | pending | success | timeout
  let pillClass = '';
  let pillText = '';

  if (status === 'pending') {
    pillClass = 'status-pill status-pending';
    pillText = '進行中';
    setCatMood('thinking');
  } else if (status === 'success') {
    pillClass = 'status-pill status-success';
    pillText = '已完成';
    setCatMood('happy');
  } else if (status === 'timeout') {
    pillClass = 'status-pill status-timeout';
    pillText = '超時';
    setCatMood('angry');
  } else {
    setCatMood('idle');
  }

  if (pillText) {
    statusTextEl.innerHTML = `${message || ''} <span class="${pillClass}">${pillText}</span>`;
  } else {
    statusTextEl.textContent = message || '';
  }
}

async function startChallenge() {
  try {
    const res = await fetch('/api/start', { method: 'POST' });
    const data = await res.json();

    if (!data.ok) {
      alert('出題失敗：' + (data.error || 'unknown'));
      return;
    }

    // 左邊文字
    shortDescEl.textContent = data.message || '';
    loginHintEl.textContent = data.login_hint || '';

    // 題目說明
    explainBoxEl.textContent = data.explain || '這一題沒有額外說明。';

    // 提示初始化
    currentHintStep = 0;
    maxHintSteps = data.hints_count || 0;
    hintDialogEl.textContent = '如果卡住了，可以按下面的「給我下一步提示」。';
    btnNextHintEl.disabled = (maxHintSteps === 0);

    // 狀態顯示
    setStatus('pending', '貓咪正在觀察你修機器…');

  } catch (err) {
    console.error(err);
    alert('無法連線到後端 /api/start');
  }
}

async function loadNextHint() {
  if (currentHintStep >= maxHintSteps) {
    hintDialogEl.textContent = '提示已經用完囉 QQ';
    btnNextHintEl.disabled = true;
    return;
  }

  try {
    const res = await fetch('/api/hint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: currentHintStep })
    });
    const data = await res.json();

    if (!data.ok) return;

    hintDialogEl.textContent = data.text;
    currentHintStep++;

    if (!data.has_more) {
      btnNextHintEl.disabled = true;
    }
  } catch (err) {
    console.error(err);
  }
}

async function pollStatus() {
  try {
    const res = await fetch('/api/status');
    const data = await res.json();

    if (!data.active && data.status === 'idle') {
      setStatus('idle', '目前沒有進行中的任務。');
      timerTextEl.textContent = '';
      return;
    }

    if (data.status === 'pending') {
      setStatus('pending', data.message || '任務進行中…');
      timerTextEl.textContent = `已過 ${data.elapsed} 秒，剩餘 ${data.remaining} 秒`;
    } else if (data.status === 'success') {
      setStatus('success', data.message || '任務完成！');
      timerTextEl.textContent = `總耗時：${data.elapsed} 秒`;
    } else if (data.status === 'timeout') {
      setStatus('timeout', data.message || '超過時間了，貓咪暴走！');
      timerTextEl.textContent = `經過：${data.elapsed} 秒`;
    }

  } catch (err) {
    console.error(err);
  }
}

function init() {
  btnStartEl.addEventListener('click', startChallenge);
  btnNextHintEl.addEventListener('click', loadNextHint);

  // 每秒輪詢一次 /api/status
  pollingTimer = setInterval(pollStatus, 1000);
  // 一開始先拉一次
  pollStatus();
}

document.addEventListener('DOMContentLoaded', init);
