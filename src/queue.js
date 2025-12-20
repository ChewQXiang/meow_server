// src/queue.js
// 簡單的任務佇列系統，避免多個學生同時操作 PVE
class TaskQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  // 添加任務到佇列
  async add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        task,
        resolve,
        reject,
      });
      this.process();
    });
  }

  // 處理佇列
  async process() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const { task, resolve, reject } = this.queue.shift();
      
      try {
        const result = await task();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }

    this.processing = false;
  }

  // 獲取佇列長度
  getLength() {
    return this.queue.length;
  }

  // 檢查是否正在處理
  isProcessing() {
    return this.processing;
  }
}

// 全局佇列實例
const pveQueue = new TaskQueue();

module.exports = { pveQueue };

