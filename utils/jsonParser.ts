// 檔案路徑: src/utils/jsonParser.ts

/**
 * 智慧型 JSON 修復器：處理截斷的 JSON 字串
 */
function repairTruncatedJson(json: string): string {
  let text = json.trim();
  
  // 1. 偵測是否斷在屬性名稱或字串值中間 (例如 "writingTips": " )
  // 檢查最後一個引號是否成對
  const quoteCount = (text.match(/"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    text += '"'; // 強行閉合最後一個引號
  }

  // 2. 移除結尾可能殘留的逗號或冒號
  text = text.replace(/[:,\s]*$/, "");

  // 3. 殘肢清理：若結尾停在引號、冒號、或逗號，代表 Key/Value 不完整，直接切除
  // 這能解決 "word": 這種截斷情況
  text = text.replace(/,?\s*\"[a-zA-Z0-9_-]*\"\s*:\s*$/, ""); 
  text = text.replace(/,?\s*\"[a-zA-Z0-9_-]*$/ , "");
  text = text.replace(/,\s*$/, "");

  const stack: string[] = [];
  let inString = false;
  let escaped = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (char === '{' || char === '[') {
      stack.push(char === '{' ? '}' : ']');
    } else if (char === '}' || char === ']') {
      if (stack.length > 0 && stack[stack.length - 1] === char) {
        stack.pop();
      }
    }
  }

  if (inString) text += '"';
  while (stack.length > 0) {
    text += stack.pop();
  }

  return text;
}

/**
 * 核心 JSON 清洗器：使用 ASCII 碼組合出反引號，徹底避免解析器截斷檔案
 */
export function sanitizeAndParseJSON<T = any>(rawText: string, fallback?: T): T {
  try {
    if (!rawText) throw new Error("接收到空白內容");

    // 🌟 終極破解法：使用 ASCII 碼 (96) 組合出反引號
    const q = String.fromCharCode(96);
    const marker = q + q + q; 
    const regex1 = new RegExp(marker + '(?:json|JSON)?', 'gi');
    const regex2 = new RegExp(marker, 'g');

    // 1. 移除 Markdown 標記與破壞性控制字元 (保留換行 \n)
    let cleanText = rawText
      .replace(regex1, '')
      .replace(regex2, '')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "") 
      .trim();
    
    // 2. 尋找 JSON 區塊
    const firstBrace = cleanText.indexOf('{');
    const firstBracket = cleanText.indexOf('[');
    
    let startIndex = -1;
    if (firstBrace !== -1 && firstBracket !== -1) {
      startIndex = Math.min(firstBrace, firstBracket);
    } else {
      startIndex = Math.max(firstBrace, firstBracket);
    }
    
    if (startIndex === -1) throw new Error("No JSON structure found in text.");
    cleanText = cleanText.slice(startIndex);

    // 3. 處理結尾贅詞
    const lastBrace = cleanText.lastIndexOf('}');
    const lastBracket = cleanText.lastIndexOf(']');
    const endIndex = Math.max(lastBrace, lastBracket);
    
    if (endIndex !== -1) {
      const potentialJson = cleanText.slice(0, endIndex + 1);
      try {
        return JSON.parse(potentialJson) as T;
      } catch (e) {
        // 交給修復邏輯
      }
    }
    
    // 4. 智慧修復與解析
    const repairedText = repairTruncatedJson(cleanText);
    return JSON.parse(repairedText) as T;

  } catch (error) {
    console.error("❌ JSON 解析失敗，原始文字:", rawText);
    if (fallback !== undefined) return fallback;
    throw new Error("AI 回傳格式異常且無法修復，請嘗試重新點擊生成。");
  }
}