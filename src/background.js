/**
 * background.js / service-worker.js
 * V-MAX Omni-Architect 核心通訊與異步監控模組
 */

// 1. 安裝或更新時的初始化邏輯
chrome.runtime.onInstalled.addListener(() => {
  console.log('🚀 V-MAX Omni-Architect Service Worker 已啟動');
});

// 2. 核心訊息監聽器
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📩 收到訊息:', message.type);

  // --- 模式 A: 同步回應 (直接 return false) ---
  if (message.type === 'CHECK_HEALTH') {
    sendResponse({ status: 'online', version: 'v59.3' });
    return false; // 不需要異步，立即關閉通道
  }

  // --- 模式 B: 異步回應 (必須 return true) ---
  if (message.type === 'STORAGE_SAVE') {
    // 範例：處理複雜的 Chrome Storage 存取
    chrome.storage.local.set({ [message.key]: message.value }, () => {
      sendResponse({ success: true });
    });
    return true; // 🌟 關鍵：告訴 Chrome 我們會異步呼叫 sendResponse
  }

  // --- 模式 C: 預防性報錯修復 ---
  // 如果收到未定義的訊息類型，也回傳一個狀態，防止發送端卡死
  if (message.type === 'INIT_HANDSHAKE') {
    sendResponse({ authorized: true });
    return false;
  }

  // 預設關閉通道
  return false;
});

// 3. 捕捉未處理的異常，防止 Service Worker 崩潰
self.addEventListener('unhandledrejection', (event) => {
  console.error('⚠️ [V-MAX-Internal] 偵測到未處理的 Promise 拒絕:', event.reason);
});