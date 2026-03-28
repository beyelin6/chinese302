// 檔案路徑: src/services/gemini.ts

import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { SYSTEM_PROMPT, GEMINI_MODEL } from '../constants';
import { MediaData } from '../types';

const LOCAL_STORAGE_KEY = 'vmax_gemini_api_keys';
const COOLDOWN_MAP: Record<string, number> = {}; // 存儲 key 的解封時間戳
const BLACKLIST = new Set<string>(); // 🌟 [新增] 永久失效金鑰黑名單

// --- 內部輔助函數 ---

/**
 * 檢查金鑰是否可用
 */
const isKeyHealthy = (key: string): boolean => {
  if (BLACKLIST.has(key)) return false;
  const resumeTime = COOLDOWN_MAP[key] || 0;
  return Date.now() > resumeTime;
};

/**
 * 獲取當前所有可用金鑰中，最久沒被使用的那一把 (公平輪替)
 */
const getBestAvailableKey = (keys: string[]): string | null => {
  const healthyKeys = keys.filter(isKeyHealthy);
  if (healthyKeys.length === 0) return null;
  
  // 這裡可以進一步實作 Round-Robin，目前採簡單首位法
  return healthyKeys[0]; 
};

/**
 * 標記金鑰進入冷卻或永久失效
 */
const markKeyFailure = (key: string, statusCode: number) => {
  if (statusCode === 401) {
    BLACKLIST.add(key);
    console.error(`[Security] 🚫 金鑰 ${key.slice(0, 8)}... 驗證失敗 (401)，已永久移除。`);
    return;
  }

  let cooldownDuration = 30000; // 預設 30 秒
  if (statusCode === 429) cooldownDuration = 60000; // 頻率限制 60 秒
  if (statusCode === 400) cooldownDuration = 3600000; // 錯誤金鑰 封鎖一小時
  
  COOLDOWN_MAP[key] = Date.now() + cooldownDuration;
  console.warn(`[Circuit Breaker] 🛡️ 金鑰 ${key.slice(0, 8)}... 已熔斷，冷卻至 ${new Date(COOLDOWN_MAP[key]).toLocaleTimeString()}`);
};

/**
 * 🌟 初始化：從環境變數或本地儲存載入多組金鑰
 */
const loadInitialApiKeys = (): string[] => {
  let keys: string[] = [];

  // 1. 嘗試從環境變數讀取 (Vite 模式)
  // @ts-ignore
  const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || 
                 (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY);
  
  if (envKey) {
    keys = envKey.split(',').map((k: string) => k.trim());
  }

  // 2. 嘗試從本地儲存讀取
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) keys = [...keys, ...parsed];
        else keys.push(saved);
      } catch {
        keys.push(saved);
      }
    }
  }

  return Array.from(new Set(keys)).filter(k => k.startsWith('AIza'));
};

// --- 核心導出函數 ---

export const sendMessageToGemini = async (
  prompt: string, 
  media: MediaData[] = [], 
  retryCount = 0,
  config: { temperature?: number, responseMimeType?: string } = { temperature: 0.7, responseMimeType: "text/plain" }
): Promise<string> => {
  // 1. 取得金鑰清單
  const allKeys = loadInitialApiKeys();

  if (allKeys.length === 0) {
    throw new Error("尚未設定 API Key。請點擊右上角設定圖示進行配置。");
  }

  // 2. 篩選健康金鑰
  const activeKey = getBestAvailableKey(allKeys);
  if (!activeKey) {
    throw new Error("所有 API Key 均處於熔斷冷卻中，請稍候 30-60 秒再試。");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: activeKey });
    
    // 處理多模態資料
    const parts: any[] = [{ text: prompt }];
    if (media && media.length > 0) {
      media.forEach(m => {
        parts.push({
          inlineData: { mimeType: m.mimeType, data: m.data }
        });
      });
    }

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: config?.temperature ?? 0.7,
        responseMimeType: config?.responseMimeType ?? "text/plain",
        maxOutputTokens: 16384,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("模型未返回任何文字內容");
    }
    return responseText;

  } catch (error: any) {
    const status = error?.status || 500;
    
    // 3. 觸發熔斷邏輯
    markKeyFailure(activeKey, status);

    // 4. 自動重試機制 (僅限尚有可用金鑰且重試次數 < 3 時)
    if (retryCount < 3) {
      console.log(`[Retry] 正在嘗試使用下一把金鑰進行第 ${retryCount + 1} 次重試...`);
      await new Promise(r => setTimeout(r, 1000));
      return sendMessageToGemini(prompt, media, retryCount + 1, config);
    }

    throw new Error(`Gemini 運算失敗 (${status}): ${error.message}`);
  }
};

/**
 * 🌟 設定新的金鑰陣列
 */
export const setApiKeys = (keys: string[]) => {
  const validKeys = keys.filter(k => k.trim().startsWith('AIza'));
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(validKeys));
  }
};

export const getApiKeys = () => loadInitialApiKeys();
export const hasApiKey = () => loadInitialApiKeys().length > 0;
export const setApiKey = (key: string) => setApiKeys([key]);
