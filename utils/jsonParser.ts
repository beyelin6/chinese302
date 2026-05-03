// 檔案路徑: src/utils/jsonParser.ts

/**
 * 🌟 [對齊關鍵]：平衡並關閉 JSON 括號 (解決 AI 斷頭問題)
 * 同時具備「早退」機制：一旦最外層 JSON 閉合即停止，避免 AI 產出冗餘垃圾文字干擾解析
 */
function balanceAndCloseJSON(text: string): { result: string; balanced: boolean } {
  const stack: string[] = [];
  let inString = false;
  let escape = false;
  let hasStarted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (escape) { escape = false; continue; }
    if (char === '\\') { escape = true; continue; }
    if (char === '"') { inString = !inString; continue; }

    if (!inString) {
      if (char === '{' || char === '[') {
        stack.push(char === '{' ? '}' : ']');
        hasStarted = true;
      }
      else if (char === '}' || char === ']') {
        if (stack.length > 0 && stack[stack.length - 1] === char) {
          stack.pop();
          // 🆕 核心優化：如果最外層括號已閉合，直接切斷並回傳，防止 AI 後面亂回話
          if (hasStarted && stack.length === 0) {
            return { result: text.slice(0, i + 1), balanced: true };
          }
        }
      }
    }
  }

  // 處理截斷 (Truncation)
  let res = text;
  if (inString) res += '"';
  while (stack.length > 0) {
    res += stack.pop();
  }
  return { result: res, balanced: false };
}

/**
 * 核心 JSON 清洗器：裝備截斷修復與冗餘剔除邏輯
 */
export function sanitizeAndParseJSON<T = any>(rawText: string, fallback?: T): T {
  try {
    if (!rawText) throw new Error("接收到空白內容");

    // 1. 移除 Markdown 代碼塊標記與不可見字元
    let cleanText = rawText
      .replace(/```(json|JSON)?/g, '')
      .replace(/```/g, '')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\u009F]/g, "") 
      .trim();
    
    // 2. 尋找 JSON 的起始位置
    const firstBrace = cleanText.indexOf('{');
    const firstBracket = cleanText.indexOf('[');
    
    let startIndex = -1;
    if (firstBrace !== -1 && firstBracket !== -1) {
      startIndex = Math.min(firstBrace, firstBracket);
    } else if (firstBrace !== -1) {
      startIndex = firstBrace;
    } else if (firstBracket !== -1) {
      startIndex = firstBracket;
    }
    
    if (startIndex === -1) {
      throw new Error("在文本中找不到 JSON 結構");
    }
    
    cleanText = cleanText.slice(startIndex);
    
    // 3. 執行平衡與截斷處理 (修補截斷 或 去除冗餘)
    const { result: repairedText } = balanceAndCloseJSON(cleanText);
    
    // 4. 解析為 JSON 物件
    return JSON.parse(repairedText) as T;
  } catch (error) {
    console.error("❌ JSON 解析失敗，原始文字:", rawText);
    if (fallback !== undefined) return fallback;
    throw new Error("AI 回傳格式異常且無法修復，請嘗試重新點擊生成。");
  }
}
