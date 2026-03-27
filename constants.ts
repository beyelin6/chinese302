// 檔案路徑: src/constants.ts

import { AppStep } from './types';
import { getVisualLibraryPrompt } from './visual-library';

export enum AppStepEnum {
  IDLE = 0,
  STEP_1_INPUT = 1,
  STEP_2_BASIC = 2,
  STEP_3_DEEP_VOCAB = 3,
  STEP_3_DEEP_SEGMENTS = 4,
  STEP_4_VISUALS = 5,
  STEP_5_CASTING = 6,
  STEP_6_OUTPUT = 7
}

export const VMAX_KERNEL_VERSION = "v60.5-DNA-Purity-Kernel";

// 🌟 [2026 核心升級] 切換至最新支援型號
export const GEMINI_MODEL = "gemini-3-flash-preview";

// 🛡️ [核心防護裝甲]：強化 FAITHFULNESS_GROUNDING
export const PROMPT_GENERATE_ADDITIONAL_ACTIVITIES = `
# ROLE: 國語文教學設計專家
# MISSION: 根據提供的【課文內容】與【年級】，設計 3 個額外的「語文活動」。

### 🎯 設計準則
1. **適齡性**：活動難度必須符合該年級的認知發展。
2. **多樣性**：包含「詞彙擴展」、「句型仿寫」、「創意寫作」或「口說表達」等不同面向。
3. **具體性**：每個活動必須提供明確的「練習內容」或「題目範例」。

### 📤 輸出規範 (Strict JSON)
請只輸出純 JSON 陣列，格式如下：
[
  {
    "title": "活動名稱 (例如：小小觀察家 - 詞彙擴展)",
    "content": "具體的練習內容或引導文字"
  }
]
`;

export const SYSTEM_PROMPT = `
# ROLE: V-MAX v37-Omega (Omni-Architect Engine)
# Core: Master Kernel v60.5-DNA-Purity
# CORE PROTOCOL: [FAITHFULNESS_GROUNDING]
1. 嚴禁幻覺：絕對禁止加入課文中不存在的事實或人物。
2. 文本錨點：所有對白必須 100% 基於原文。
3. 語言規範：100% 繁體中文，禁止夾雜英文或注音。
`;

export const STEP_1_BASIC_PROMPT_SUFFIX = `
⚠️ 【寫法注意 (writingTips) 絕對萃取準則】(CRITICAL)
請仔細掃描原始資料中的「[語文活動｜我會認字]：寫法注意」區塊。
在建立 coreVocabulary 陣列時，writingTips 欄位務必「100% 一字不漏」地複製原始資料中的描述！
例如：如果資料寫「『微』中間有短橫」，你就必須原封不動照抄。
絕對禁止：AI 擅自發揮、修改、或套用自己的國語辭典知識。若無提及請填寫 "無"。

[V-MAX LIGHTWEIGHT PARSER: V8.8]
請提取全文資料，必須嚴格依照以下 JSON 結構輸出：

{
  "basicInfo": {
    "grade": "提取年級（如：三下）",
    "unitName": "提取「課次與課名」或大標題",
    "author": "提取作者（若無則填寫 無）",
    "genre": "提取文體（如：記敘文）",
    "subject": "提取核心主題",
    "writingTechnique": "提取寫法",
    "mainIdea": "提取主旨"
  },
  "languageActivities": [
    {
      "title": "提取活動標題",
      "content": "提取具體的練習內容"
    }
  ],
  "coreVocabulary": [
    {
      "word": "漢字",
      "radical": "部首",
      "type": "分類",
      "writingTips": "寫法提醒",
      "shapeSimilar": [],
      "polyphonic": []
    }
  ],
  "textbookDifficultWords": ["詞語"],
  "idioms": ["成語"]
}

(⚠️ 注意：此階段不要生成形近字與多音字細節，確保輸出簡潔，請將 shapeSimilar 和 polyphonic 保持空陣列)
`;

export const STEP_1_FAST_SCAN_PROMPT = `
[V-MAX FAST SCAN: V8.8]
請快速掃描文本，僅提取基本資訊與生字清單。
只輸出純 JSON：
{
  "basicInfo": { "grade": "...", "unitName": "...", "genre": "...", "subject": "...", "writingTechnique": "...", "mainIdea": "..." },
  "coreVocabulary": ["字1", "字2", "字3"],
  "textbookDifficultWords": ["..."],
  "idioms": ["..."]
}
`;

export const STEP_1_FAST_PROMPT_SUFFIX = `
[V-MAX ULTRA-PRECISION PARSER: V8.8 DATA-SYNC]
🚨🚨🚨 【寫法注意 (writingTips) 絕對萃取準則】(CRITICAL)
請仔細掃描原文。在 coreVocabulary 中，writingTips 務必「100% 一字不漏」照抄原文描述！若無提及請填 "無"。

{
  "basicInfo": {
    "grade": "提取年級", "unitName": "提取課名", "author": "提取作者", "genre": "提取文體",
    "subject": "提取核心主題", "writingTechnique": "提取寫法", "mainIdea": "提取主旨"
  },
  "languageActivities": [ { "title": "活動標題", "content": "練習內容" } ],
  "coreVocabulary": [ { "word": "字", "radical": "部首", "writingTips": "照抄原文" } ],
  "textbookDifficultWords": ["詞語"],
  "idioms": ["成語"]
}

【資料尋找終極指南】：
1. 基本資訊：掃描文章最前面的列表。若無，請看大標題與作者標示。
2. coreVocabulary：尋找第一個有「部首」欄位的表格。
3. 語文活動：尋找帶有「綜合語文活動」或「語文活動」字眼的段落，將其提取出來。
4. 難詞與成語：尋找被括號包住的詞彙，分別歸類。

請只輸出純 JSON 格式，不要有任何 Markdown 外框 (\`\`\`json)。
`;

export const STEP_2_DEEP_PROMPT_PREFIX = `
[INSTRUCTION]
The user has confirmed the Basic Analysis (Mode & Vocabulary).
Please Execute STEP 2.5: 語文輻射 (Deep Vocabulary Radiation).

[CONTEXT: CONFIRMED BASIC DATA]
`;

export const STEP_2_DEEP_VOCAB_PROMPT_SUFFIX = `
[V-MAX DEEP VOCABULARY ENGINE: ANCHOR-LOCK V8.8]
🚨🚨🚨 【多音字教育部字典鐵律】(CRITICAL)
所有的多音字讀音 (zhuyin) 與造詞，【必須 100% 遵守】台灣教育部標準字典！嚴禁口語音！
例如：「結果」是二聲ㄐㄧㄝˊ，「結實(強壯)」才是一聲ㄐㄧㄝ。

🚨🚨🚨 【形近字自動補完協定】(CRITICAL)
對於 coreVocabulary 中的每一個生字，你【必須】主動找出 1-2 個形近字進行辨析。
即使原始資料中沒有提供形近字，你也必須根據你的知識庫自動補完！

請只輸出純 JSON，格式如下：
{
  "vocabulary": [
    {
      "word": "生字",
      "type": "形近字/多音字/成語",
      "zhuyin": "注音",
      "shapeSimilar": [
        {
          "char": "辨析字",
          "zhuyin": "注音",
          "radical": "部首",
          "words": "造詞",
          "explanation": "部首辨析說明",
          "mnemonic": "辨析口訣"
        }
      ],
      "polyphonic": [
        {
          "zhuyin": "讀音",
          "words": "造詞",
          "usage": "用法說明"
        }
      ]
    }
  ],
  "deepIdiomsDetails": [
    {
      "word": "成語",
      "definition": "釋義",
      "example": "例句",
      "synonyms": ["近義詞"],
      "antonyms": ["反義詞"],
      "context": "生活應用情境"
    }
  ]
}
`;

export const DEEP_VOCABULARY_PROMPT = `
[V-MAX VOCABULARY ENGINE V8.8]
請針對以下生字進行深度辨析。
⚠️ 嚴格規範：
1. 僅輸出純 JSON 格式，不要有任何開場白或結尾。
2. 形近字辨析 (shapeSimilar) 必須包含老師要求的口訣 (mnemonic)。
3. 每個生字的說明請簡潔有力，避免贅字，以防字串過長截斷。

目標生字：{VOCAB_LIST}

請嚴格依照以下 JSON 結構輸出：
` + STEP_2_DEEP_VOCAB_PROMPT_SUFFIX;

export const STEP_2_DEEP_SEGMENTS_PROMPT_V2 = `
# ROLE: V-MAX Master Kernel [STRICT_GROUNDING_MODE]
# MISSION: 執行精準座標搬運與高階策略腦力激盪。將 <SOURCE_TEXT> 內容轉化為 JSON 結構。

### 🏫 1️⃣ Teaching Strategy Logic (教學策略庫)
2.1 Teaching Modes (教學模式)
- Mode 1 扎實導學: Avatar = Expert Teacher. Verbs: 觀察、分析、歸納. (適合知識密度高的說明文)
- Mode 2 情境遊戲: Avatar = NPC/Leader. Verbs: 挑戰、尋找、破解. (適合任務導向學習)
- Mode 3 專題實作: Avatar = PM/Coach. Verbs: 設計、訪談、製作. (適合綜合活動)

2.2 Macro-Structure (宏觀架構)
- N1 故事山 (Story Mountain): 起因-經過-結果 (記敘文)
- N2 流程圖 (Flow Map): 順序步驟 (說明文/實驗)
- N3 SWBST: Somebody-Wanted-But-So-Then (故事摘要)
- N4 階梯圖 (Staircase): 層層遞進 (情節升溫)
- N5 循環圖 (Cycle): 自然循環 (生態/規律)

2.3 Micro-Structure (微觀思考嵌入)
- L1 括號圖 (Brace): 整體-部分 (構造分析).
- L2 樹狀圖 (Tree Map): 總-分-總 (分類說明).
- L3 魚骨圖 (Fishbone): 因果分析 (問題探討).
- L4 多重流程圖 (Multi-Flow): 多因多果 (事件影響).
- L5 問題解決圖 (P-S Map): 問題-解決方案.
- L6 金字塔圖 (Pyramid): 論點-論據 (議論文).
- C1 氣泡圖 (Bubble): 特質描寫 (人物/物品).
- C2 太陽圖 (Sun): 發散思考 (聯想).
- C3 維恩圖 (Venn): 比較異同 (雙物件).
- C4 雙氣泡圖 (Double Bubble): 比較特質 (進階對比).
- C5 T型圖 (T-Chart): 正方-反方 (辯證).
- C6 橋梁圖 (Bridge): 類比關係.
- D1 冰山圖 (Iceberg): 顯性-隱性 (深層含義).
- D2 觀點圖 (Perspectives): 多角度思考.
- D3 漏斗圖 (Funnel): 篩選資訊.
- D4 曼陀羅 (Mandala): 九宮格思考 (全面擴散).

### ⛔ 數據忠誠度協定 (DATA_FAITHFULNESS)
1. 嚴禁任何形式的創作：禁止加入原文不存在的背景故事、人物、物件 or 科學實驗。
2. 術語鎖定：必須使用原文出現的詞彙描述事物，禁止使用上位詞（如將「紫色的鋼筆」概括為「筆」）。
3. 證據鏈要求：每一個生成的段落大意，都必須伴隨一段至少 15 字的原文原句作為證據。
4. 語言：100% 繁體中文，禁止夾雜英文或注音。

🚨🚨🚨 【修辭與句型：絕對物理搬運鐵律】(CRITICAL) 🚨🚨🚨
1. 只能從原文中「明確標示」為修辭、句型、寫作手法的區塊提取資料！
2. 絕對禁止 AI 擅自閱讀課文並「發揮想像力」自行分析或通靈修辭！
3. 如果原文資料中「沒有」明確提供該段落的修辭或句型，對應的 rhetorics 或 sentencePatterns 陣列必須保持空白 \`[]\`，絕對不准無中生有！

⚠️ 【段落大意精準分配準則】(CRITICAL)
你必須將大意「拆解」並「精準對應」到正確的 segment 中。
- 當 segmentIndex 為 0 時，summary 欄位「只能」填寫第一段的大意。
- 絕對禁止：將整篇文章的各段大意全部塞進同一個 segment 的 summary 裡！每個段落只能有屬於自己的那一小句話。

* Execution Logic:
    1.  意義段分析 (Logical Segments):
        * Break text into 3-5 Logical Segments.
        * ⚠️ 文體動態邏輯 (Genre Logic): 
            * IF Genre is 記敘文/說明文 (Prose): Extract chronological or logical keywords.
            * IF Genre is 童詩/新詩 (Poetry): Treat each Stanza (詩節) as a segment. You MUST identify the repeating structural pattern.
        * keywords: Extract 3-4 specific keywords.
    
    2.  🧠 語文百寶箱 (Teaching Strategies) 強制生成:
        * 請主動利用「三神器」邏輯（Rhetoric 寫作工具、Thinking 邏輯工具、Task 行動任務）與上述「2.3 Micro-Structure」圖表，腦力激盪出 3 個全新的教學策略。
        * 'application' 欄位必須包含：[連結課文具體段落] + [操作步驟 1] -> [操作步驟 2]。

### 📥 唯一合法來源
<SOURCE_TEXT>
{INPUT_TEXT}
</SOURCE_TEXT>

### 📤 輸出規範 (Strict JSON)
請直接輸出 JSON 格式，不需前言。必須嚴格遵循以下結構 (請務必保留 "segments" 作為外層 Key)：
{
  "segments": [
    {
      "segmentIndex": 0,
      "title": "具備文學感的段落標題",
      "summary": "段落大意 (必須包含原文中的具體細節)",
      "evidence_quote": "🌟 [重要] 從原文中「原封不動」複製的對應語句",
      "difficultWords": ["難詞1", "難詞2"],
      "keywords": ["關鍵字1", "關鍵字2"],
      "rhetorics": [
        { "name": "修辭名", "example": "原文原句", "analysis": "深度解析：說明作者為何這樣寫", "pedagogicalPoint": "教學重點", "application": "應用" }
      ],
      "dokQuestions": [
        { "type": "DOK 3-4 等級高階提問", "question": "針對原文細節的提問", "intent": "提問意圖" }
      ],
      "sentencePatterns": [
         { "name": "Pattern Structure", "example": "Exact Sentence from text." }
      ],
      "deepDive": "Deep meaning or author's emotion"
    }
  ],
  "strategies": [
    {
      "type": "Rhetoric 或 Thinking 或 Task",
      "title": "策略名稱 (需有 V-MAX 科技感，如：感官調色盤)",
      "method": "核心方法論描述",
      "teachingPoint": "本策略要解決的教學痛點或目標",
      "application": "[連結課文] + [步驟 1] -> [步驟 2]"
    }
  ]
}
`;

export const REGENERATE_STRATEGIES_PROMPT = `
[INSTRUCTION]
# ROLE: V-MAX 核心教研專家
使用者對目前的「語文百寶箱」策略不滿意，要求「全面換新」。
請根據課文深度分析，利用「三神器」邏輯，腦力激盪出 3 個全新的教學策略。

⚠️ 核心要求：
1. 創意性：避開老掉牙的教學法，必須具備 V-MAX 科技感或遊戲化元素。
2. 深度性：策略必須能觸及課文的深層意義或修辭美感。
3. 結構性：包含策略名稱、核心方法、教學痛點與具體應用步驟。

⚠️ 輸出格式：Valid JSON Array ONLY.

Schema:
[
  {
    "type": "Thinking",
    "title": "[具備科技感與遊戲感的名稱]",
    "method": "[核心方法論描述]",
    "teachingPoint": "[本策略要解決的深層教學痛點]",
    "application": "[課文連結] + [步驟 1] -> [步驟 2]"
  }
]
`;

export const GENERATE_SINGLE_STRATEGY_PROMPT = `
[INSTRUCTION]
# ROLE: V-MAX 破壞式創新教研專家
使用者需要針對特定的教學維度（{TYPE}），【新增一個】極具創意與深度的教學策略。
請根據課文內容，並避開現有的策略，腦力激盪出 1 個全新的點子。

### 🚨 創意突變強制協定 (CRITICAL MUTATION)
1. **【動詞封殺】**：絕對禁止使用「畫線、圈出、找一找、朗讀、討論」等傳統低階動詞！請改用「辯論、偵查、解謎、改寫、盲測、法庭攻防」等高階互動動詞。
2. **【指定視角強制啟動】**：
   - 若要求的類型是 Task (任務)：請強制設計成「遊戲化/角色扮演」任務（如：密室逃脫、嫌疑犯審問、時空採訪員）。
   - 若要求的類型是 Thinking (思考)：請強制設計成「哲學思辨/極端情境」探討（如：辯論天平、道德兩難、如果歷史改變）。
   - 若要求的類型是 Rhetoric (修辭)：請強制設計成「跨界改編/感官重塑」任務（如：將記敘文改成新聞快報、推銷廣告、感官調色盤）。

⚠️ 'application' 欄位必須嚴格包含：
- [連結課文]：明確指出應用於課文哪一段落或哪一句話。
- [操作步驟]：提供 Step 1 -> Step 2 的具體師生互動（必須具有遊戲感或張力）。

⚠️ Output format: Valid JSON Object ONLY.

Schema:
{
  "type": "{TYPE}",
  "title": "[具備科技感與遊戲感的名稱]",
  "method": "[核心方法論描述]",
  "teachingPoint": "[本策略要解決的深層教學痛點]",
  "application": "[課文連結] + [步驟 1] -> [步驟 2]"
}
`;

export const GENERATE_RHETORIC_GUIDANCE_PROMPT = `
[INSTRUCTION]
The user wants to refine the "Teaching Guidance" and "Interactive Micro-task" for a specific rhetoric technique in a specific meaning segment.

Target Segment: "{SEGMENT_TITLE}"
Target Rhetoric: "{RHETORIC_NAME}"
Original Example: "{RHETORIC_EXAMPLE}"

Objective:
Generate a more refined and actionable "Teaching Guidance" (教學引導) and "Interactive Micro-task" (互動微任務) for this specific rhetoric.

⚠️ Output format: Valid JSON Object ONLY.

Schema:
{
  "teachingPoint": "Refined Insight (e.g. 引導學生觀察...)",
  "application": "Refined Micro-task (e.g. 1. 請學生圈出... 2. 仿作...)"
}
`;

export const GENERATE_SHAPE_SIMILAR_PROMPT = `
[INSTRUCTION]
你現在是 V-MAX 系統的「漢字辨析專家」。請針對目標字 "{CHAR}" 進行深度形近字挖掘。

目標：找出 2 個學生最容易混淆的形近字，並建立「解構式」辨析。

⚠️ 核心邏輯：
1. 結構對照：精確標註「字體部件」的微小差異。
2. 意象關聯：部首解釋必須與「字義」強烈掛鉤（例如：目部與眼睛看有關）。
3. 辨析口訣：產出對比口訣。若為兩字對比可精簡（如：用手搥打，追槌趕跑），若為三到四字，請適度放寬字數寫成兩三句順口溜，以【通順、合理】為最高原則。

⚠️ 輸出格式：Valid JSON Array ONLY. No Markdown.

Schema:
[
  {
    "char": "辨析字",
    "zhuyin": "注音 (例如：ㄅㄧㄢˋ)",
    "radical": "部首名稱 (例如：言部)",
    "words": "高頻教學詞彙 (例如：辨別)",
    "explanation": "【精準部件辨析】：精簡說明該部首在字義上的決定性作用。",
    "mnemonic": "辨析口訣 (例如：有言來爭辯，有刀要辨別)"
  }
]
`;

export const GENERATE_SHAPE_SIMILAR_DETAILS_PROMPT = `
[INSTRUCTION]
The user wants to generate detailed information for a specific Shape-Similar Character (形近字).
Input Character: "{CHAR}"

Objective:
Provide the Zhuyin (注音), Radical (部首), Common Words (造詞), and a brief Explanation (解釋) of the radical's meaning for this character.

⚠️ Output format: Valid JSON Object ONLY. No Markdown.

Schema:
{
  "char": "{CHAR}",
  "zhuyin": "Zhuyin (e.g. ㄅㄧㄢˋ)",
  "radical": "Radical (e.g. 言部)",
  "words": "Common Word (e.g. 辯論)",
  "explanation": "Brief explanation of radical difference (e.g. 中間是言，表示用語言爭論)"
}
`;

export const GENERATE_MNEMONIC_PROMPT = `
[INSTRUCTION]
# ROLE: 國小語文教師與口訣大師
使用者剛剛新增或修改了形近字組合，請為以下這組字重新生成一個「高品質、好記憶的辨析口訣」。

輸入資料：
{CHARACTERS_LIST}

⚠️ 核心邏輯與要求：
1. 結構：請用「順口溜」或「對稱句」的方式，將每個字的【部首】與【字義/造詞】巧妙結合。（例如：「用手『搥』打，追『槌』趕跑」）。
2. 擴充彈性：如果輸入的字有 3 個或 4 個，請不要硬塞成一句短話，可以寫成兩句 or 三句的押韻短詩，字數不限，以通順、合乎邏輯為最高原則。
3. 語氣：適合國小學生的生動語氣，不要咬文嚼字，不要使用艱澀文言文。
4. 輸出限制：只能輸出「口訣本身」的純文字，絕對不要加上「口訣：」等前綴，也不要有任何 Markdown 符號或多餘的對話解釋。
`;

export const GENERATE_POLYPHONIC_PROMPT = `
[INSTRUCTION]
The user wants to generate details for a Polyphonic Character (多音字).
Input Character: "{CHAR}"

Objective:
List all standard Traditional Chinese pronunciations (Zhuyin) for this character, along with common words and usage context.

🚨 字典絕對防禦協定 (STRICT MOE DICTIONARY RULE):
你必須【100% 嚴格遵守】台灣「教育部重編國語辭典修訂本」或「國語辭典簡編本」的標準讀音！絕對禁止使用網路口語音或俗讀！
【防呆範例】：植物「結(ㄐㄧㄝˊ)果」、「結(ㄐㄧㄝˊ)實纍纍」必須是二聲！強壯「結(ㄐㄧㄝ)實」、「結(ㄐㄧㄝ)巴」才是一聲！

⚠️ Output format: Valid JSON Array ONLY. No Markdown.

Schema:
[
  { 
    "zhuyin": "Zhuyin (e.g. ㄅㄟ)", 
    "words": "Common Word (e.g. 背包)", 
    "usage": "Brief Usage Context (e.g. 名詞，指背負的東西)" 
  },
  { 
    "zhuyin": "Zhuyin (e.g. ㄅㄟˋ)", 
    "words": "Common Word (e.g. 背景)", 
    "usage": "Brief Usage Context (e.g. 名詞，指物體後面的景象)" 
  }
]
`;

export const STEP_3_VISUAL_GENERIC_PROMPT = `
# ROLE: V-MAX 視覺策略師 (Visual Strategist)
# MISSION: 為本課推薦 6 種「視覺隱喻 (Metaphor)」與「視覺風格 (Style)」組合。

${getVisualLibraryPrompt()}

### 📤 輸出規範 (Strict JSON)
{
  "recommendations": [
    {
      "style": { "code": "A-Y", "name": "風格名稱", "description": "對應的英文提示詞" },
      "metaphor": { "code": "M1-S6", "name": "隱喻名稱", "description": "視覺隱喻的具體描述" },
      "reason": "為什麼這個風格與隱喻的組合最適合本課？(連結文體與主題)"
    }
  ]
}
`;

export const STEP_3_CASTING_PROMPT_PREFIX = `[V-MAX CASTING ENGINE] 請根據來源文本的靈魂，為本課推薦 3 位最契合的引導者候選人。`;

// 🌟 [性別補完計畫] 強制要求提取性別 (Gender)
export const STEP_4_DYNAMIC_CASTING_PROMPT = `
# ROLE: V-MAX 視覺邏輯導演 (Casting Director v13.0)
# MISSION: 根據【傳入的課文原文】提取真實主角，並結合【全域視覺風格】量身打造專業的引導者。

### 🚨 終極禁令 (CRITICAL FORBIDDEN RULES)
1. **禁止虛構主角**：絕對禁止創造【原文中未提及】的人物。
   - ❌ 錯誤：原文沒寫，卻自行加入「小創、小明、老師、學生」等角色。
   - ✅ 正確：若原文中「確實出現」了具名的人物（如：皮爾森律師）或特定身份的人物（如：一位老農夫），則可依邏輯判定為主角。
2. **禁止預設角色**：不要因為是教育 App 就慣性地預設一個「學習夥伴」或「虛擬老師」作為故事主角。
3. **禁止動植物主角**：除非該動植物具備人類語言與社交行為（如寓言），否則禁止列為主角。
4. **禁止觀察者當主角**：如果人物只是在觀察（如：我看著天空），而沒有「解決問題」或「推動情節」，請判定為 Mode B。

### 🎭 視覺邏輯矩陣判定 (Casting Logic Matrix)
請依序執行以下三段式判定來尋找「故事主角」：

**第一步：真實性驗證 (Existence Check)**
- 該人物的名字或具體身份是否在【原文】中出現？
- ❌ 否 -> 立即進入 Mode B。
- ✅ 是 -> 進入第二步。

**第二步：行動力驗證 (Agency Check)**
- 該人物是否發起了關鍵行動？是否面臨並解決了衝突？
- ❌ 否（僅是旁白或被提及的人物） -> 進入 Mode B。
- ✅ 是 -> 進入第三步。

**第三步：Mode A 判定 (Drama Mode Confirmation)**
- 該人物是否為全文的核心？
- ✅ 是 -> 輸出 Mode A，並提取該人物。
- ❌ 否 -> 輸出 Mode B。

### 🌟 萬用引導者生成法則 (Universal Guide Design Logic)
請為本課推演出 3 位不同風格的「引導者 (candidates)」：
1. 【情境動態適配】：依據課文是科普、童話、歷史或抒情文，賦予引導者合乎情理的職業身分（如：生態觀察員、時空旅人、魔法說書人）。
2. 🎨【美學 100% 連動 (CRITICAL)】：
   - 系統已傳入【老師已選定的全域視覺風格】（例如：吉卜力、3D軟陶、賽博龐克）。
   - 你設計的引導者，其「服裝材質、配件細節、整體氛圍」必須【完美融入該視覺風格】！
3. 【高階質感要求】：無論適配哪種情境，角色都必須具備「精緻、專業、電影感」。嚴禁使用隨便的名字與無聊的服裝。

### 📥 輸出規範 (Strict JSON)
{
  "mode": "Drama Mode" | "Guide Mode",
  "protagonist": {
    "name": "必須是文本中真實出現的名字。若無則填 None",
    "description": "根據文本描述其身份與核心行動",
    "visualDNA": "Gender: [男/女] | Age: [明確年齡] | Hair: [髮型] | Clothing: [符合時代背景的服裝]",
    "isNone": boolean,
    "verification": "請簡述你在原文哪裡找到這個人，以及他做了什麼行動來推動劇情"
  },
  "candidates": [
    {
      "id": "C1",
      "name": "契合文本情境的專屬名字",
      "persona": "G1-G6 語氣晶片",
      "description": "他在本課的專屬定位",
      "visualDNA": "Gender: [男/女] | Age: [明確年齡] | [髮型] | [🌟 必須融合【選定視覺風格】的服裝與配件細節描述]"
    },
    { "id": "C2", "name": "...", "persona": "...", "description": "...", "visualDNA": "..." },
    { "id": "C3", "name": "...", "persona": "...", "description": "...", "visualDNA": "..." }
  ]
}
`;

export const GUIDE_TRAITS_SUGGESTION_PROMPT = `[INSTRUCTION] Refine Visual DNA. Must include Gender (e.g., Gender: Male or Female), {AGE}, {TONE}`;
export const GUIDE_TEACHING_STYLE_SUGGESTION_PROMPT = `[INSTRUCTION] Create teaching style for Guide: Gender: [M/F], {AGE}, {TONE_LABEL}.`;

// 🌟 [性別補完計畫] 嚴格要求 Protagonist 包含 Gender
export const PROTAGONIST_TRAITS_SUGGESTION_PROMPT = `[INSTRUCTION] Generate Pipe Format Visual DNA for Protagonist. (CRITICAL: Must include exact Gender and Age, e.g., Gender: Male | Age: 12, or Gender: Female | Age: 40s at the beginning).`;

// 🌟 [性別補完計畫] 萃取自訂圖片特徵時，也要判斷性別
export const EXTRACT_IMAGE_TRAITS_PROMPT = `
請以專業角色設計師的角度，精準分析隨附的圖片，並將該人物的視覺特徵萃取為嚴格的 YAML 格式 (Visual DNA)。務必明確標示出該角色的性別 (Gender) 與推測年齡 (Age)。
若角色具備「Q版博士 (Chibi Scientist)」特徵，請務必在 DNA 中註明其誇張的表情、白袍、眼鏡或實驗器材等細節。
`;

export const STEP_5_MATERIALS_PROMPT = `[INSTRUCTION] Execute STEP 6: 輔助產出 (Material Linkage).`;

export const PROMPT_GENERATE_WORKSHEET = `
[INSTRUCTION]
Please Execute STEP 6-A: 素養學習單 (Worksheet).
Requirements:
1. 擷取訊息 (DOK 1-2): 針對意義段的事實提問.
2. 推論分析 (DOK 2-3): 針對主角動機或作者用意提問.
3. 🚀 深度素養與遷移 (DOK 3-4): 【強制提取】請務必從傳入的分析資料中，嚴格提取「策略思考 (DOK 3-4)」的題目（特別是：手法模擬、生活遷移、價值評鑑等），原封不動地列入學習單的「進階挑戰」區塊！

[VMAX_EXECUTION_PROTOCOL]
- 100% 純繁體中文，禁止英文翻譯。
- 禁止全文注音，僅多音字可標示。
`;

export const PROMPT_GENERATE_ASSESSMENT = `
[INSTRUCTION]
Please Execute STEP 6-B: 學生複習講義 (Review Handout).
Requirements:
1. 全課結構圖 (Text Structure).
2. 字詞大本營 (Shape-Similar + Idioms).
3. 修辭與句型 (Rhetoric & Patterns).

[VMAX_EXECUTION_PROTOCOL]
- 100% 純繁體中文，禁止英文翻譯。
`;

export const PROMPT_GENERATE_KB = `
[INSTRUCTION]
Please Execute STEP 6-C: NotebookLM 知識庫 (Knowledge Base).
Requirements:
1. Format as structured Plain Text.
2. Include Full Text, Vocabulary Radiation, Deep Segment Analysis, and Visual Design Summary.
`;

export const PROMPT_GENERATE_GAMIFIED_QUIZ = `
[INSTRUCTION]
請根據前面的課文文本與深度分析結果，為我生成一份「遊戲化互動測驗題庫 (相容於 Kahoot / Blooket)」。

[VMAX_EXECUTION_PROTOCOL]
1. 題目字數：不可超過 120 個字元。
2. 選項數量：必須剛好 4 個選項（1 個正確，3 個誘答）。
3. 選項字數：每個選項不可超過 75 個字元。
4. 誘答設計：誘答選項 (Distractors) 必須具備合理性，能測驗出學生易混淆的盲點（如形近字、多音字、相似修辭）。
5. 100% 純繁體中文，禁止英文翻譯。禁止全文注音，僅多音字可標示。

🎯 題型配置 (共 10 題)：
- 詞彙與形音義 (3 題)
- 課文內容理解 (3 題)
- 修辭與寫作手法 (2 題)
- 延伸思考/情境題 (2 題)

📋 輸出格式 (嚴格遵守 CSV 結構)：
請直接輸出純文字，不要包含任何 Markdown \`\`\`csv 標籤，格式如下：
題目,選項1,選項2,選項3,選項4,正確答案(填寫數字1-4),時間限制(秒)
`;

export const GENERATE_LANGUAGE_ACTIVITY_PROMPT = `
[V-MAX PEDAGOGY EXTENSION ENGINE]
請根據提供的【原始語文活動】邏輯，額外產生 5 組適合該年級（{GRADE}）的練習題。
輸出格式必須為 JSON 陣列。

【原始語文活動】：{ACTIVITY_TITLE} - {ACTIVITY_CONTENT}

【輸出格式】：
{
  "extension": [
    { "q": "題目/詞語", "a": "答案/補充說明" }
  ]
}
請只輸出純 JSON。
`;

export const PROMPT_GENERATE_NOTEBOOKLM_GUIDE = `
================================================================
V-MAX {KERNEL_VERSION} NotebookLM 操作指南
課次：{GRADE} {UNIT_NAME}
引導者：{GUIDE_NAME} ({GUIDE_PERSONA})
視覺風格：{VISUAL_STYLE}
產出日期：{DATE}
================================================================

───────────────────────────────────────────────────────────────
🚀 模組一：自動簡報生成指令 (Slide Generation)
位置：NotebookLM → 點擊【Slide Guide（簡報）】→ ✏️ 自訂指令框
───────────────────────────────────────────────────────────────
請讀取我剛剛匯出並上傳的「YAML 結構腳本檔案」（檔名如：{UNIT_NAME}_Script_月日時分.txt）。
這份檔案包含了完整的「簡報分鏡與排版指令」，請嚴格解析 YAML 節點，依序生成完整投影片。不得跳頁或合併。

🗂️ 【智能分段產出建議】 (NotebookLM 單次有字數限制，請務必分批貼上指令)：
{BATCHING_DIRECTORY}

⚠️ 投影片生成最高準則：
1. 【畫面生成｜視覺 DNA 鎖定】
   請嚴格依照每頁 YAML 節點中的 \`visual_prompt\` 生成畫面。
   ★ 引導者 DNA【全程不得改變】：
   {GUIDE_DNA}
   禁止出現與設定不符的年齡或性別。

2. 【投影片文字｜逐字鎖定】
   投影片畫面上的文字，必須 100% 一字不漏地複製 YAML 中的 \`displayText\` 內容。
   禁止自行刪減、潤飾 or 翻譯。禁止加入英文標籤。

3. 【排版強制防呆】
   請嚴格遵守檔案頂部 \`ui_layout_protocol\` 定義的多視窗排版法則。
   成語頁、形近字頁、活動頁，強制使用大圖大字，【絕對禁止】使用多圖拼貼 (Collage) 或導致字體縮小的網格排版。

4. 【導師台詞強制入鏡】(CRITICAL)
   請將 YAML 裡的 \`guideTalk\` 內容，以「對話框 (Speech Bubble)」或「導師提示框」的視覺形式，直接排版顯示在每一頁投影片的畫面上！
   (\`guideAction\` 僅供畫面生成參考，絕對不可印成文字。)

───────────────────────────────────────────────────────────────
🟩 模組二：語音摘要煉成指令 (Audio Overview)
位置：右側 Audio Overview → Customize（自訂）
───────────────────────────────────────────────────────────────
啟動 V-MAX 教學對話模式：
- 主講人 A：{GUIDE_NAME}（{GUIDE_PERSONA} 的引導導師，說話充滿智慧，善用生活化的【譬喻】來解釋概念。）
- 主講人 B：一位愛發問、喜歡舉一反三的機靈國小學生。
- 核心對話素材：嚴格根據來源文件之 \`guideTalk\` 區塊進行內容對話化。

🎯 對話最高準則：
1. 必須充滿戲劇張力與互動感，主講人 A 要適時稱讚 B 的提問。
2. 本課重點討論項目（請務必在對話中深入辯證）：
{AUDIO_FOCUS}

───────────────────────────────────────────────────────────────
🟨 模組三：單頁精準修復指令 (Precision Revise)
位置：投影片產出後 → 特定頁面右上角的 ✏️ Revise
───────────────────────────────────────────────────────────────
【情況 A：角色年齡或長相跑掉】
請維持本頁文字完全不動。重新讀取來源文件本頁的視覺提示詞。強制修正角色外觀為：
{GUIDE_DNA}

【情況 B：投影片文字漏印或被亂改】
請維持本頁圖片完全不動。重新讀取本頁的 \`displayText\` 欄位，100% 逐字補回繁體中文。
================================================================
`;


// 🌟🌟🌟 終極防禦裝甲 (Anti-Hallucination & Guide Forcing) 🌟🌟🌟
export const FINAL_ATOMIC_SCRIPT_PROMPT = `
# ROLE: V-MAX System Master Kernel v60.7 (Layout & Anti-Hallucination Director)
# MISSION: 嚴格根據傳入的資料，生成精準的四維對位腳本，並確保視覺提示詞的絕對安全。

### 📐 模組一：Layout 與 Lens 版面代碼庫 (SSOT)
AI 必須為每一頁投影片嚴格指定最適合的 \`layout\` 與 \`lens\` 代碼：
- [ContentFocus] 課文內容對焦 -> layout: "wide-scene" | lens: "廣角 (Exhale)"
- [DeepDive] 修辭與句型深究 -> layout: "close-tool" | lens: "特寫 (Inhale)"
- [QuizCard] 閱讀小挑戰 -> layout: "quiz-card" | lens: "單圖資訊板 (Single Info Board)"
- [ShapeSimilar] 形近字辨析 -> lens: "左右分割對比大字排版 (Split Screen, Large Text)"。layout 依字組數決定："split-2"(2字), "grid-3"(3字), "grid-4"(4字)。
- [Polyphonic] 多音字辨析 -> lens: "天平對比大字排版 (Balance Screen, Large Text)"。layout 依讀音數決定："compare-scale"(2讀音), "triptych"(3讀音)。
- [IdiomLoop] 成語解析 -> layout: "story-panel" | lens: "上下分割故事版 (Split Story Board)"
- [LanguageActivity] 語文活動 -> layout: "pattern-drill", "punctuation-chart", "phrase-demo" 或 "speech-stage" | lens: "單圖大字互動舞台 (Single Image, Large Text)"
- [Strategy/FusionMap] 教學策略 -> layout: "info-flow" 或 "step-flow" | lens: "單圖大字百寶箱 (Single Box Focus, Large Text)"
- [Assessment] 綜合評量 -> layout: "single-board" | lens: "單圖資訊板 (Single Info Board)"
- **[Cover]**: 🌟這是課程封面！displayText 必須明確列出【課名】、【文體】與【作者】（若有），讓學生一開始就掌握基本資訊。
- **[MissionNav/Ending]** 任務導覽與結尾 -> 請自行判斷，推薦使用 "wide-scene" 或 "close-tool"。

### 🎨 模組二：生圖防呆與導師顯影絕對禁令 (CRITICAL)
1. **導師強制顯影 (Guide Presence)**：只要該頁有 \`guideAction\` 或 \`guideTalk\`，或者版型為 close-tool / quiz-card，你【必須】在 \`visual_prompt\` 的 Subject 中，明確寫出導師的完整外觀特徵 (包含【性別 Gender】與年齡的 Guide DNA)！如果沒寫，生圖軟體就不會畫出導師！
2. **強制無字化 (Anti-Text Hallucination)**：生圖軟體極易產生亂碼外星文。
   - 若場景包含「藍圖、黑板、書本、筆記」，請註明「abstract lines, blank pages」。
   - \`visual_prompt\` 的結尾必須強制加上：「Safety: ABSOLUTELY NO TEXT, NO LETTERS, NO TYPOGRAPHY, NO WORDS IN THE IMAGE.」
3. **禁止拼貼**：絕對禁止多圖拼貼 (Collage)，強制使用清晰單圖。
4. **畫風絕對鎖定 (Style Lock)**：你必須嚴格使用系統傳入的【全域視覺風格】來撰寫 visual_prompt。即使課文主題是「科技、條碼、網路」，也【絕對禁止】擅自改成 "cyberpunk", "sci-fi", "holographic" 等科幻詞彙！必須將科技元素轉化為指定風格（例如：吉卜力風格下的魔法圖騰或精緻的手繪木製機關）。

### 📥 模組三：輸出規範 (Strict JSON Array)
請輸出純 JSON 陣列。每個物件代表一頁投影片，必須嚴格包含以下欄位：
[
  {
    "page_number": 數字,
    "part_label": "對應的 PART (如 PART A)",
    "type": "對應的投影片類型",
    "title": "投影片標題",
    "layout": "填入【模組一】的 Layout 代碼",
    "lens": "填入【模組一】對應的 Lens 標準值",
    "visual_prompt": "【英文】生圖提示詞。Subject: [場景描述 + 務必包含導師外貌(Gender & Age)]。🚨【隱喻貫穿鐵律】：你必須將系統傳入的「視覺隱喻(Metaphor)」具象化在畫面上！(例如隱喻是魔法門，就必須畫出門；是時光列車，就必須畫出車廂)。Context: ... Composition: [layout]. Artistic VIS: [填入全域視覺風格]. Safety: ABSOLUTELY NO TEXT.",
    "displayText": "顯示文字 (嚴格繁體中文，包含【提取】與【推論】等標題，禁止自行刪減原文)",
    "guideAction": "導師的肢體動作或表情提示 (若無則填 null)",
    "guideTalk": "🚨【極致角色扮演鐵律】：你必須根據導師的 Persona，為他設定專屬的「發語詞/口頭禪」（例如機器人的「嗶！」、偵探的「真相只有一個」），並頻繁使用於每頁台詞的開頭或強調處！絕對禁止使用無聊的傳統教師說教口吻，請多用「想像一下...」等互動語氣！"
  }
]

### 📜 模組四：版型內容填充指南
- 🚨【字數防爆破鐵律】：為了確保簡報視覺舒適，所有投影片的 \`displayText\` 總字數【絕對禁止】超過 130字！請善用精簡的敘述或條列式重點！
- 🚨【段落導航與隱喻融合】：對於 [ContentFocus]、[DeepDive]、[QuizCard] 這三種類型，你【必須】在 \`displayText\` 的最上方第一行，用粗體印出結合了「視覺隱喻」的段落進度（例如：**【第一扇門：發現問題】** 或 **【第一站：交通糾紛】**），讓學生一眼看出目前的進度！
- **[FusionMap]**: 🌟這是全課結構視圖！在 visual_prompt 中請強制要求繪製出與本課隱喻相符的結構路徑圖。🚨【結構文字鐵律】：displayText 【絕對禁止】只寫空泛摘要！你【必須】提取完整的「全課邏輯骨架（如：起因➔經過➔結果）」，以層次分明的條列式排版在畫面上！
- **[ContentFocus]**: 根據段落大意繪製場景。🚨【動態生圖鐵律】：插圖必須「嚴格擷取該段落的具體人、事、物」並結合「視覺隱喻」來繪製！【絕對禁止】無腦套用空泛背景。displayText 必須包含【段落導航與隱喻融合】、【段落大意】與【難詞顯影】(須附簡短解釋)。
- **[DeepDive]**: 視覺對焦該段落的具體教學情境. 若內容包含修辭，visual_prompt 可嘗試將修辭概念具象化（例如「類疊」畫一個大放大鏡）。
- **[QuizCard]**: 提問表情特寫。displayText 必須包含【段落導航】，並分列【提取】與【推論】。
- **[ShapeSimilar]**: 🚨【部首意象生圖鐵律】：在 visual_prompt 中，除了大字排版，你必須明確要求 AI 畫出「各個部首對應的具體小圖示 (icon)」來輔助視覺記憶（例如：手部畫一隻手、水部畫水滴）！displayText 絕對禁止使用 # 符號，請使用安全括號：⭕ 【 字A 】 (**部首A**) 注音：... / 造詞：... 💡 辨析口訣：(口訣內容)
- **[Polyphonic]**: 🚨 絕對禁止使用 # 符號！你【必須】嚴格根據教育部字典寫出對應的「字義」，並編寫「情境辨析口訣」！格式：⭕ 【 讀音A 】 (注音) 字義：... 造詞：... 💡 辨析口訣：...
- **[IdiomLoop]**: 🚨【生圖鐵律】：插圖必須「嚴格根據例句的具體情境」繪製！displayText 必須排版成語標題、釋義、例句，**絕對禁止**在畫面上疊加巨大的成語文字。
- **[Assessment]**: 🌟全課綜合評量！你【必須】從深度分析資料中，優先挑選 2-3 題「策略思考 (DOK 3-4)」的高階提問（如：生活遷移、價值評鑑）作為壓軸討論題。絕對禁止只問事實記憶題！
- **[Ending]**: 🌟結尾道別！除了感謝參與，請【務必】在 displayText 加入一個與本課主題相關的「課後小任務 (Call to Action)」。

### 🎭 模組五：特殊風格對應指南 (Special Style Overrides)
- **當全域風格為「學習漫畫風 (Manga Science)」時**：
  - 🚨【文字格式鐵律】：你【必須】將 \`displayText\` 與 \`guideTalk\` 轉化為「漫畫腳本格式」！
  - 格式範例：
    **[畫面描述]**：(簡短描述分鏡內容)
    **[狀聲詞]**：(例如：碰！閃！咻！砰！)
    **[對話/旁白]**：(誇張且具戲劇性的台詞)
  - 🚨【生圖提示詞】：\`visual_prompt\` 必須強制包含 "Manga panel, black and white ink, screentones, speed lines, chibi scientist, distinct speech bubbles"。
  - 🚨【隱喻對應】：若隱喻為「Q版博士腳本」，請確保導師以 Q 版形象出現，並強調「畫面/音效/台詞」的三維度呈現。
`;
