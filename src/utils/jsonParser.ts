// 檔案路徑: src/utils/jsonParser.ts

/**
 * 🌟 [對齊關鍵]：平衡並關閉 JSON 括號 (解決 AI 斷頭問題)
 */
function balanceAndCloseJSON(text: string): string {
  const stack: string[] = [];
  let inString = false;
  let escape = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (escape) { escape = false; continue; }
    if (char === '\\') { escape = true; continue; }
    if (char === '"') { inString = !inString; continue; }

    if (!inString) {
      if (char === '{' || char === '[') stack.push(char);
      else if (char === '}') {
        if (stack.length > 0 && stack[stack.length - 1] === '{') stack.pop();
      }
      else if (char === ']') {
        if (stack.length > 0 && stack[stack.length - 1] === '[') stack.pop();
      }
    }
  }

  let res = text;
  if (inString) res += '"';
  while (stack.length > 0) {
    const open = stack.pop();
    res += (open === '{') ? '}' : ']';
  }
  return res;
}

/**
 * 核心 JSON 清洗器：裝備截肢手術邏輯，解決 AI 忘記加引號或 Token 截斷的錯誤
 */
export function sanitizeAndParseJSON<T = any>(rawText: string, fallback?: T): T {
  try {
    if (!rawText) throw new Error("接收到空白內容");

    // 1. 移除 Markdown 代碼塊標記
    let cleanText = rawText
      .replace(/```(json|JSON)?/g, '')
      .replace(/```/g, '')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\u009F]/g, "") // 移除隱形控制字元
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
    
    // 3. 執行平衡與關閉 (截肢手術邏輯)
    const repairedText = balanceAndCloseJSON(cleanText);
    
    // 4. 解析為 JSON 物件
    return JSON.parse(repairedText) as T;
  } catch (error) {
    console.error("❌ JSON 解析失敗，原始文字:", rawText);
    if (fallback) return fallback;
    throw new Error("AI 回傳格式異常且無法修復，請嘗試重新點擊生成。");
  }
}
