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

export const VMAX_KERNEL_VERSION = "v60.8-DNA-Purity-Universal";

// 🌟 [2026 核心升級] 切換至最新支援型號
export const GEMINI_MODEL = "gemini-3-flash-preview";

// ============================================================
// 🎭 視覺基因鎖定系統 (Visual DNA Anchoring System)
// ============================================================

export const CHARACTER_VISUAL_REF_PLACEHOLDER = "{CHARACTER_VISUAL_REF}"; 

// 模式 A：內建文字描述模式 (原本設定)
export const CHARACTER_ORIGINAL_PROMPT_TEMPLATE = `
[CHARACTER_DNA_INTERNAL]
- Subject Identity: {PERSONA_DESC} (Character Name: {GUIDE_NAME})
- Style: {STYLE_PROMPT}
- Consistency: Maintain 100% visual consistency of this character's features across all slides.
`;

// 模式 B：外部基準圖模式 (專門給 NotebookLM 讀取外部圖片使用)
export const CHARACTER_EXTERNAL_ANCHOR_PROMPT_TEMPLATE = `
[CHARACTER_DNA_EXTERNAL_ANCHOR]
- **Visual Truth Source**: PLEASE REFER TO THE SEPARATE UPLOADED CHARACTER IMAGE FILE AS THE PRIMARY SOURCE.
- **Instruction**: Ignore textual character details. Use the visual DNA (shape, color, proportions) from the external image file as the SOLE TRUTH for the guide character {GUIDE_NAME}.
- **Consistency**: Ensure {GUIDE_NAME} looks identical to the image file in every generated scene.
`;

// [NANOBANANA 專用發電機]：產出給使用者去生基準圖的 Master Prompt
export const PROMPT_GENERATE_CHARACTER_DNA_FOR_EXTERNAL = `
[INSTRUCTION]
# ROLE: 視覺藝術總監 (Art Director)
# MISSION: 根據本課視覺風格「{STYLE}」與導師人設「{PERSONA}」，產出一組專門給 NANOBANANA (DALL-E 3) 使用的「基準人設提示詞 (Master DNA Prompt)」。
# REQUIREMENTS:
- Subject: Must be a single, full-body character (Named: {GUIDE_NAME}).
- Format: Friendly, three-quarter view, standing on a neutral background.
- Details: Describe materials, lighting, and exact color palette based on the persona.
- 🚨 NO TEXT: Absolutely no letters, words, or labels in the image.
- Language: Prompt must be in ENGLISH for maximum AI accuracy.
- Output: Return ONLY the English prompt string without any markdown formatting.
`;

// ============================================================
// 🛡️ 核心防護裝甲與基礎指令
// ============================================================

export const SYSTEM_PROMPT = `
# ROLE: V-MAX v60.8 (Omni-Architect Engine)
# CORE PROTOCOL: [FAITHFULNESS_GROUNDING]
1. 嚴禁幻覺：絕對禁止加入課文中不存在的事實或人物。
2. 文本錨點：所有對白必須 100% 基於原文。
3. 語言規範：100% 繁體中文，禁止夾雜英文或注音。
`;

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

export const STEP_1_BASIC_PROMPT_SUFFIX = `
⚠️ 【寫法注意 絕對萃取準則】(CRITICAL)
請仔細掃描原始資料中的「[語文活動｜我會認字]：寫法注意」區塊。
在建立 coreVocabulary 陣列時，writingTips 欄位務必「100% 一字不漏」地複製原始資料中的描述！
例如：如果資料寫「『微』中間有短橫」，你就必須原封不動照抄。
絕對禁止：AI 擅自發揮、修改、或套用自己的國語辭典知識。若無提及請填寫 "無"。

{
  "basicInfo": { "grade": "...", "unitName": "...", "author": "...", "genre": "...", "subject": "...", "writingTechnique": "...", "mainIdea": "..." },
  "languageActivities": [ { "title": "...", "content": "..." } ],
  "coreVocabulary": [ { "word": "漢字", "radical": "部首", "type": "分類", "writingTips": "寫法提醒", "shapeSimilar": [], "polyphonic": [] } ],
  "textbookDifficultWords": ["詞語"],
  "idioms": ["成語"]
}
(⚠️ 注意：此階段不要生成形近字與多音字細節，請將 shapeSimilar 和 polyphonic 保持空陣列)
`;

export const STEP_2_DEEP_PROMPT_PREFIX = `
[INSTRUCTION]
The user has confirmed the Basic Analysis (Mode & Vocabulary).
Please Execute STEP 2.5: 語文輻射 (Deep Vocabulary Radiation).
[CONTEXT: CONFIRMED BASIC DATA]
`;

export const STEP_2_DEEP_VOCAB_PROMPT_SUFFIX = `
[V-MAX DEEP VOCABULARY ENGINE: TAIWAN MOE ANCHOR]

🚨🚨🚨 【台灣教育部最高防禦鐵律】(CRITICAL)
1. 語系鎖定：強制切換至「台灣繁體中文 (zh-TW)」與「台灣國小教學慣用語」。
2. 字典標準：所有的注音 (zhuyin)、字義與造詞，【必須 100% 嚴格遵守】台灣《教育部國語辭典簡編本》與《重編國語辭典修訂本》！
3. 封殺大陸讀音：【絕對禁止】混入中國大陸普通話的讀音與造詞！(例如：「結果」在台灣絕對是二聲 ㄐㄧㄝˊ)。
4. 🚨同詞異音防錯亂協定 (CRITICAL)：當同一個造詞（如「結實」）有不同讀音與意義時，你的 \`usage\`（用法說明）必須與當前的 \`zhuyin\` 【完全精準對齊】！絕對禁止張冠李戴！（例如：讀 ㄐㄧㄝ 時，結實是強壯的意思，\`usage\` 絕對不能寫成植物結果；讀 ㄐㄧㄝˊ 時，才是植物結果）。必要時，請在 \`words\` 造詞後加上括號備註，例如："結實(強壯)"。

🚨🚨🚨 【形近字自動補完協定】(CRITICAL)
對於 coreVocabulary 中的每一個生字，你【必須】主動找出 1-2 個形近字進行辨析。
即使原始資料中沒有提供形近字，你也必須根據台灣教育部字典的知識庫自動補完！

請只輸出純 JSON，格式如下：
{
  "vocabulary": [
    {
      "word": "生字",
      "type": "形近字/多音字/成語",
      "zhuyin": "注音",
      "shapeSimilar": [ { "char": "辨析字", "zhuyin": "注音", "radical": "部首", "words": "造詞", "explanation": "說明", "mnemonic": "辨析口訣" } ],
      "polyphonic": [ { "zhuyin": "讀音", "words": "造詞", "usage": "用法說明" } ]
    }
  ],
  "deepIdiomsDetails": [ { "word": "成語", "definition": "釋義", "example": "例句", "synonyms": ["近義詞"], "antonyms": ["反義詞"], "context": "情境" } ]
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
- D1 冰山圖 (Iceberg): 顯性-隱性 (深層含義).
- D4 曼陀羅 (Mandala): 九宮格思考 (全面擴散).

### ⛔ 數據忠誠度協定 (DATA_FAITHFULNESS)
1. 嚴禁任何形式的創作：禁止加入原文不存在的背景故事、人物、物件。
2. 🚨【意義段大意：精準尋標與絕對搬運】(CRITICAL)：請直接掃描 <SOURCE_TEXT> 中的 **「【意義段大意】」** 區塊（例如：一、事件一...，二、事件二...）。你必須將這些條列好的大意【100% 一字不漏地逐字照抄】！第一點的大意填入 segmentIndex 0 的 summary，第二點填入 segmentIndex 1，依此類推。【絕對禁止】AI 自己重新讀課文寫摘要！
3. 證據鏈要求：每一個生成的段落大意，都必須伴隨一段至少 15 字的原文原句作為證據。
4. 語言：100% 繁體中文，禁止夾雜英文或注音。

🚨🚨🚨 【修辭與句型：絕對物理搬運鐵律】(CRITICAL) 🚨🚨🚨
1. 只能從原文中「明確標示」為修辭、句型、寫作手法的區塊提取資料！
2. 絕對禁止 AI 擅自閱讀課文並自行通靈修辭！
3. 若無明確標示，陣列必須保持空白 \`[]\`。

⚠️ 【段落大意精準分配準則】(CRITICAL)
你必須將大意「拆解」並「精準對應」到正確的 segment 中。每個段落只能有屬於自己的那一小句話，絕對禁止將全文摘要塞進同一個 segment。

* Execution Logic:
    1.  意義段分析 (Logical Segments): 嚴格跟隨 <SOURCE_TEXT> 裡標示的「【意義段大意】」數量來建立 Segments 陣列；若原文無提供大意，才允許自行切分為 3-5 個邏輯段落。
    2.  🧠 語文百寶箱 (Teaching Strategies) 強制生成: 利用「三神器」邏輯腦力激盪出 3 個全新的教學策略。'application' 欄位必須包含：[連結課文] + [操作步驟 1] -> [操作步驟 2]。

### 🧠 教學策略邏輯 (Teaching Strategy Logic)
請根據文本特性，從以下「宏觀架構 (Macro-Structure)」中選擇最適合的一項作為 macroStructure：
- **N1 故事山 (Story Mountain)**: 適用於記敘文、小說。包含：起因-經過-衝突-轉折-解決-結果。
- **N2 流程圖 (Flow Map)**: 適用於說明文、遊記。強調順序與步驟。
- **N3 SWBST (Somebody-Wanted-But-So-Then)**: 適用於故事摘要與角色動機分析。
- **N4 階梯圖 (Staircase Map)**: 適用於論說文、層層遞進的抒情文。
- **N5 循環圖 (Cycle Map)**: 適用於自然現象、生命週期、循環往復的結構。

### 📥 唯一合法來源
<SOURCE_TEXT>
{INPUT_TEXT}
</SOURCE_TEXT>

請直接輸出 JSON 格式 (包含 macroStructure, segments 與 strategies)：
{
  "macroStructure": "N1-N5 (例如: N1 故事山)",
  "segments": [ 
    { 
      "segmentIndex": 0, 
      "title": "段落標題", 
      "type": "意義段類型 (例如: 背景、衝突、轉折、解決、結論)",
      "summary": "🚨必須 100% 照抄資料中的【意義段大意】對應項目", 
      "evidence_quote": "原文原句", 
      "difficultWords": ["..."], 
      "keywords": ["..."], 
      "rhetorics": [
        {
          "name": "修辭名稱",
          "example": "原文例句",
          "analysis": "修辭分析",
          "pedagogicalPoint": "教學重點 (給老師的建議)",
          "application": "課堂應用 (給學生的任務)"
        }
      ], 
      "dokQuestions": [ { "type": "DOK 3-4", "question": "...", "intent": "..." } ], 
      "sentencePatterns": [], 
      "deepDive": "..." 
    } 
  ],
  "strategies": [ { "type": "...", "title": "...", "method": "...", "teachingPoint": "...", "application": "..." } ]
}
`;

export const REGENERATE_STRATEGIES_PROMPT = `
[INSTRUCTION]
# ROLE: V-MAX 核心教研專家
# MISSION: 根據本課文本與當前選擇的宏觀架構「{MACRO_STRUCTURE}」，重新生成 3 個「語文百寶箱」教學策略。
# REQUIREMENTS:
- 必須包含三種不同類型：[修辭引導]、[思考支架]、[任務挑戰]。
- 策略必須與「{MACRO_STRUCTURE}」的邏輯骨架緊密結合。
- 輸出格式：Valid JSON Array ONLY.
- [ { "type": "...", "title": "...", "method": "...", "teachingPoint": "...", "application": "..." } ]
- 嚴禁幻覺，100% 遵守格式。
`;

export const GENERATE_SINGLE_STRATEGY_PROMPT = `
[INSTRUCTION]
# ROLE: V-MAX 破壞式創新教研專家
使用者需要針對特定的教學維度（{TYPE}），【新增一個】極具創意與深度的教學策略。
請根據課文內容，並避開現有的策略，腦力激盪出 1 個全新的點子。

### 🚨 創意突變強制協定 (CRITICAL MUTATION)
1. **【動詞封殺】**：絕對禁止使用「畫線、圈出、找一找、朗讀、討論」等傳統低階動詞！請改用「辯論、偵查、解謎、改寫、法庭攻防」等高階互動動詞。
2. **【指定視角強制啟動】**：
   - Task (任務)：強制設計成「遊戲化/角色扮演」任務。
   - Thinking (思考)：強制設計成「哲學思辨/極端情境」探討。
   - Rhetoric (修辭)：強制設計成「跨界改編/感官重塑」任務。

⚠️ Output format: Valid JSON Object ONLY.
{ "type": "{TYPE}", "title": "...", "method": "...", "teachingPoint": "...", "application": "..." }
`;

export const GENERATE_RHETORIC_GUIDANCE_PROMPT = `
[INSTRUCTION]
Target Segment: "{SEGMENT_TITLE}"
Target Rhetoric: "{RHETORIC_NAME}"
Original Example: "{RHETORIC_EXAMPLE}"

Objective:
Generate a more refined and actionable "Teaching Guidance" (教學引導) and "Interactive Micro-task" (互動微任務) for this specific rhetoric.

⚠️ Output format: Valid JSON Object ONLY.
{ "teachingPoint": "Refined Insight (e.g. 說明作者為何這樣寫)", "interactiveTask": "Interactive Micro-task (e.g. 讓學生試著替換詞語)" }
`;

export const GENERATE_SHAPE_SIMILAR_PROMPT = `
[INSTRUCTION]
# ROLE: 國小語文專家
請針對目標生字「{CHAR}」，主動找出 1-2 個形近字進行辨析。

⚠️ 輸出格式：Valid JSON Array ONLY.
[ { "char": "辨析字", "zhuyin": "注音", "radical": "部首名稱", "words": "造詞", "explanation": "【精準部件辨析】：精簡說明該部首在字義上的決定性作用", "mnemonic": "辨析口訣" } ]
`;

export const GENERATE_SHAPE_SIMILAR_DETAILS_PROMPT = `
[INSTRUCTION]
Input Character: "{CHAR}"
Objective: Provide the Zhuyin, Radical, Common Words, and a brief Explanation.
⚠️ Output format: Valid JSON Object ONLY. No Markdown.
{ "char": "{CHAR}", "zhuyin": "...", "radical": "...", "words": "...", "explanation": "..." }
`;

export const GENERATE_MNEMONIC_PROMPT = `
[INSTRUCTION]
# ROLE: 國小語文教師與口訣大師
請為以下這組字重新生成一個「高品質、好記憶的辨析口訣」。

輸入資料：{CHARACTERS_LIST}

⚠️ 核心邏輯與要求：
1. 結構：請用「順口溜」或「對稱句」的方式，將每個字的【部首】與【字義/造詞】巧妙結合。
2. 擴充彈性：字數不限，以通順、合乎邏輯為最高原則。
3. 語氣：適合國小學生的生動語氣，不要使用艱澀文言文。
4. 輸出限制：只能輸出「口訣本身」的純文字，絕對不要加上「口訣：」等前綴。
`;

export const GENERATE_POLYPHONIC_PROMPT = `
[INSTRUCTION]
List all standard Traditional Chinese pronunciations for the input character.
🚨 **【台灣教育部絕對防禦協定】(zh-TW Strict)**：
1. 語系與地區：強制切換為「台灣繁體中文 (zh-TW)」與「台灣慣用語」。
2. 字典標準：你必須【100% 嚴格遵守】台灣「教育部國語辭典簡編本」的標準讀音。
3. 封殺大陸讀音：【絕對禁止】混入中國大陸普通話讀音與造詞！(例如：「結果」的「結」在台灣絕對是二聲 ㄐㄧㄝˊ)。
4. 🚨同詞異音防錯亂：若造詞會因讀音不同而改變意義（如結實），\`usage\` 必須精準對應當前注音，嚴禁解釋錯亂！請在造詞後方加上括號備註意義，例如："結實(強壯)"。

⚠️ Output format: Valid JSON Array ONLY. No Markdown.
[ { "zhuyin": "Zhuyin (e.g. ㄅㄟ)", "words": "Common Word", "usage": "Brief Usage Context" } ]
`;

export const STEP_3_VISUAL_GENERIC_PROMPT = `
# ROLE: V-MAX 視覺策略師 (Visual Strategist)
# MISSION: 為本課推薦 6 種「視覺隱喻 (Metaphor)」與「視覺風格 (Style)」組合。

${getVisualLibraryPrompt()}

### 📤 輸出規範 (Strict JSON)
{ "recommendations": [ { "style": { "code": "A-Y", "name": "...", "description": "..." }, "metaphor": { "code": "M1-S6", "name": "...", "description": "..." }, "reason": "..." } ] }
`;

export const STEP_3_CASTING_PROMPT_PREFIX = `[V-MAX CASTING ENGINE] 請根據來源文本的靈魂，為本課推薦 3 位最契合的引導者候選人。`;

export const STEP_4_DYNAMIC_CASTING_PROMPT = `
# ROLE: V-MAX 視覺邏輯導演 (Casting Director v13.0)
# MISSION: 根據原文提取主角，並結合全域視覺風格量身打造專業的引導者。

### 🚨 終極禁令：禁止虛構主角、禁止預設角色。
請依據真實性與行動力驗證來尋找故事主角。並為本課推演出 3 位不同風格的「引導者」。

### 📥 輸出規範 (Strict JSON)
{ 
  "mode": "Drama Mode" | "Guide Mode", 
  "protagonist": { "name": "...", "description": "...", "visualDNA": "Gender: [男/女] | Age: [明確年齡] | ...", "isNone": false, "verification": "..." }, 
  "candidates": [ { "id": "C1", "name": "...", "persona": "...", "description": "...", "visualDNA": "Gender: [男/女] | Age: [明確年齡] | ..." } ] 
}
`;

export const GUIDE_TRAITS_SUGGESTION_PROMPT = `[INSTRUCTION] Refine Visual DNA. Must include Gender (e.g., Gender: Male or Female), {AGE}, {TONE}`;
export const GUIDE_TEACHING_STYLE_SUGGESTION_PROMPT = `[INSTRUCTION] Create teaching style for Guide: Gender: [M/F], {AGE}, {TONE_LABEL}.`;
export const PROTAGONIST_TRAITS_SUGGESTION_PROMPT = `[INSTRUCTION] Generate Pipe Format Visual DNA for Protagonist. (CRITICAL: Must include exact Gender and Age, e.g., Gender: Male | Age: 12).`;

export const EXTRACT_IMAGE_TRAITS_PROMPT = `
[INSTRUCTION]
請以專業角色設計師的角度，精準分析隨附的圖片，並將該人物的視覺特徵萃取為嚴格的 YAML 格式 (Visual DNA)。

⚠️ 核心要求：
1. **性別與年齡**：務必明確標示出該角色的性別 (Gender) 與推測年齡 (Age)。
2. **視覺特徵**：包含髮型、服裝、配件、表情等。

⚠️ 輸出格式：Strict YAML ONLY. No Markdown.
`;

export const STEP_5_MATERIALS_PROMPT = `[INSTRUCTION] Execute STEP 6: 輔助產出 (Material Linkage).`;

// ============================================================
// 🚀 最終排版大腦 (The Slide Architect)
// ============================================================

export const FINAL_ATOMIC_SCRIPT_PROMPT = `
# ROLE: V-MAX System Master Kernel v60.8 (Layout & Anti-Hallucination Director)
# MISSION: 嚴格根據傳入的資料，生成精準的四維對位腳本，並確保視覺提示詞的絕對安全。

### 🎨 視覺 DNA 鎖定協定 (Character Consistency)
${CHARACTER_VISUAL_REF_PLACEHOLDER}

### 📐 模組一：Layout 與 Lens 版面代碼庫 (SSOT)
AI 必須為每一頁投影片嚴格指定最適合的 \`layout\` 與 \`lens\` 代碼：
- [ContentFocus] 課文內容對焦 -> layout: "wide-scene" | lens: "廣角 (Exhale)"
- [DeepDive] 修辭與句型深究 -> layout: "close-tool" | lens: "特寫 (Inhale)"
- [QuizCard] 閱讀小挑戰 -> layout: "quiz-card" | lens: "單圖資訊板 (Single Info Board)"
- [ShapeSimilar] 形近字辨析 -> lens: "左右分割對比大字排版 (Split Screen, Large Text)"。layout 依字組數決定："split-2"(2字), "grid-3"(3字), "grid-4"(4字)。
- [Polyphonic] 多音字辨析 -> lens: "天平對比大字排版 (Balance Screen, Large Text)"。layout 依讀音數決定："compare-scale"(2讀音), "triptych"(3讀音)。
- [IdiomLoop] 成語解析 -> layout: "story-panel" | lens: "上下分割故事版 (Split Story Board)"
- [LanguageActivity] 語文活動 -> layout: "pattern-drill" 或 "speech-stage" | lens: "單圖大字互動舞台"
- [Strategy/FusionMap] 教學策略 -> layout: "info-flow" 或 "step-flow" | lens: "單圖大字百寶箱"
- [Assessment] 綜合評量 -> layout: "single-board" | lens: "單圖資訊板 (Single Info Board)"
- **[Cover]**: 🌟這是課程封面！displayText 必須明確列出【課名】、【文體】與【作者】。

### 📥 模組二：輸出規範 (Strict JSON Array)
請輸出純 JSON 陣列。每個物件必須包含：
[
  {
    "page_number": 數字,
    "part_label": "PART A",
    "type": "ContentFocus 等",
    "title": "投影片標題",
    "layout": "Layout 代碼",
    "lens": "Lens 標準值",
    "visual_prompt": "【英文】... 🚨加上 --no text",
    "displayText": "顯示文字...",
    "guideAction": "肢體動作",
    "guideTalk": "台詞"
  }
]

### 📜 模組三：版型內容填充萬用通則

【全域排版鐵律】
- **角色演繹**：guideTalk 必須使用導師 Persona 專屬口頭禪，展現劇場感互動。
- **無文字生圖**：visual_prompt 禁止出現文字指令，結尾強制加上「Safety: ABSOLUTELY NO TEXT, NO LETTERS, NO WORDS IN THE IMAGE.」
- **字數防爆破**：所有投影片的 \`displayText\` 總字數【絕對禁止】超過 130 字！請善用精簡敘述！

【版型專屬通則】
- **[FusionMap] (萬用結構圖)**: 🌟無論何種文體，你必須提取「邏輯骨架」。🚨【文字鐵律】：必須以「📍 節點名稱 (關鍵詞) - 簡短摘要」的格式排版，禁止寫空泛摘要！
- **[ContentFocus] (情境鎖定)**: 🌟🚨【欄位綁定鐵律】：投影片的 \`displayText\` 必須【100% 絕對照抄】參考數據中的 \`segment.summary\` 欄位資料！【絕對禁止】AI 看到關鍵字就自行腦補、發明新劇情或偏離原文！
- **[ShapeSimilar] (形近字)**: 🌟視覺化部首。visual_prompt 需為部首畫出輔助小圖示。禁止使用 # 標題符號。
- **[IdiomLoop] (成語解析)**: 🌟🚨【意境生圖鐵律】：visual_prompt 必須根據成語的「引申意義」或「生活應用例句」來構築真實生活情境！【絕對禁止】照字面直譯作畫（例如「七嘴八舌」絕對不能畫出嘴巴和舌頭，必須畫眾人熱絡討論的畫面），確保學生能一秒看懂成語的實際應用！
- **[Assessment] (高階提問)**: 🌟必須優先從分析資料中提取 2-3 題「DOK 3-4 策略思考題」(生活遷移、價值評鑑) 作為壓軸。
`;

// ============================================================
// 📄 Step 6 輸出階段：六大輔助教材產出模板 (The Big 6 Outputs)
// ============================================================

export const PROMPT_GENERATE_ASSESSMENT = `
[INSTRUCTION]
# ROLE: V-MAX 總複習講義編輯
# MISSION: 請根據傳入的全課分析資料，產出一份結構清晰、重點條列，適合學生考前快速閱讀的「Markdown 格式總複習秘笈」。

### 📜 複習講義必須嚴格遵循以下 Markdown 排版結構與骨架：

# 📖 《(請填入課名)》考前總複習秘笈

## 🗺️ 一、 全課結構與主旨
- **核心主旨**：(精煉提取本課主旨)
- **課文結構脈絡**：
  (請以條列式清晰列出各意義段的大意與發展邏輯，例如：起因➔經過➔結果)

## 🔠 二、 字詞大本營
### 1. 易混淆形近字
(列出本課形近字，必須包含：辨析字、注音、造詞，以及 💡【辨析口訣】)
### 2. 多音字家族
(列出本課多音字，必須包含：讀音、注音、字義、造詞，以及 💡【辨析口訣】)
### 3.必考成語
(列出本課成語，必須包含：釋義與精簡例句)

## ✍️ 三、 寫作魔法陣 (修辭與句型)
### 1. 關鍵修辭
(列出本課重要修辭，必須包含：修辭名稱、課文原句、效果解析)
### 2. 必學句型
(列出本課重要句型，必須包含：句型結構、課文原句)

[VMAX_EXECUTION_PROTOCOL]
1. 100% 純繁體中文，禁止英文翻譯。
2. 🚨【純淨輸出鐵律】：請直接輸出完整的 Markdown 純文字內容！絕對禁止任何開場白或結尾廢話！
`;

export const PROMPT_GENERATE_KB = `
[INSTRUCTION]
# ROLE: V-MAX 知識庫總編輯
# MISSION: 請根據傳入的全課文本與深度分析結果，為我生成一份「結構化 Markdown 知識庫 (Knowledge Base)」。

[VMAX_EXECUTION_PROTOCOL]
1. 🚨【視覺鎖定】：請在知識庫開頭明確標註：「本課程視覺設計請 NotebookLM 參考來源中的【人物設計圖/角色設定檔】，確保生成的對話風格與視覺描述一致。」
2. 100% 純繁體中文，禁止夾雜英文。
3. 🚨【純淨輸出鐵律】：直接輸出 Markdown 內容，禁止任何開場白或結尾廢話！

### 📜 知識庫必須包含以下結構：
# 🧠 《(請填入課名)》全課知識精華庫

## 📍 一、 基本資訊
- **年級**：
- **文體**：
- **核心主題**：

## 🗺️ 二、 全課結構邏輯 (Logical Skeleton)
(請以條列式呈現本課的起因、經過、結果或邏輯層次)

## 💡 三、 字詞口訣與深度辨析 (Vocab & Idioms)
(請整理本課所有的形近字口訣、多音字辨析與成語應用)

## 🚀 四、 高階思辨提問 (DOK 3-4 Questions)
(請列出本課最值得討論的 3 個深度問題及其引導方向)
`;

export const PROMPT_GENERATE_GAMIFIED_QUIZ = `
[INSTRUCTION]
# ROLE: V-MAX 遊戲化測驗命題大師
# MISSION: 請根據傳入的全課文本與深度分析結果，為我生成一份「遊戲化互動測驗題庫 (完全相容於 Kahoot / Blooket 匯入格式)」。

[VMAX_EXECUTION_PROTOCOL]
1. 題目字數：不可超過 120 個字元。
2. 選項數量：必須剛好 4 個選項（1 個正確，3 個高難度誘答）。
3. 選項字數：每個選項不可超過 75 個字元。
4. 誘答設計：誘答選項 (Distractors) 必須具備高度合理性，能測驗出學生易混淆的盲點（如形近字的錯誤部首、多音字的錯誤讀音、相似但不同的修辭）。
5. 100% 純繁體中文，禁止夾雜英文。禁止全文注音，僅多音字可標示。
6. 🚨【純淨輸出鐵律】：直接輸出 CSV 內容，絕對禁止任何開場白、結尾廢話 or \`\`\`csv 標籤！

🎯 題型配置 (共 10 題)：
- 詞彙與形近字辨析 (3 題)
- 多音字與成語應用 (3 題)
- 課文細節與邏輯推論 (2 題)
- 修辭與句型辨識 (2 題)

格式：題目,選項1,選項2,選項3,選項4,正確答案(1-4),時間限制(秒)
`;

export const PROMPT_GENERATE_INTERACTIVE_QUIZ = `
[INSTRUCTION]
# ROLE: V-MAX 互動測驗設計師
# MISSION: 請根據傳入的全課分析資料，產出一份「JSON 格式」的互動式測驗題庫，包含選擇題與填空題。

### 🎯 題型配置 (共 8 題)：
1. **選擇題 (Multiple Choice)**：4 題 (涵蓋課文理解、修辭、成語)。
2. **填空題 (Fill-in-the-blank)**：4 題 (涵蓋形近字辨析、多音字應用、關鍵詞語)。

### 📋 輸出格式 (嚴格遵守 JSON 結構)：
請直接輸出純 JSON 字串，不要包含任何 Markdown \`\`\`json 標籤。格式如下：
{
  "quiz": [
    {
      "id": 1,
      "type": "choice",
      "question": "題目內容...",
      "options": ["選項A", "選項B", "選項C", "選項D"],
      "answer": 0,
      "explanation": "解析說明..."
    },
    {
      "id": 5,
      "type": "blank",
      "question": "題目內容，請用 ___ 代表空格...",
      "answer": "正確答案",
      "explanation": "解析說明..."
    }
  ]
}

[VMAX_EXECUTION_PROTOCOL]
1. 100% 純繁體中文，禁止英文翻譯。
2. 題目必須具備教學意義，能有效檢驗學生對本課重點的掌握度。
3. 🚨【純淨輸出鐵律】：請直接輸出完整的 JSON 內容！絕對禁止任何開場白或結尾廢話！
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

export const PROMPT_GENERATE_WORKSHEET = `
[INSTRUCTION]
# ROLE: V-MAX 學習單設計專家
# MISSION: 請根據傳入的全課分析資料，產出一份結構清晰、具備層次感且「預留學生作答空間」的 Markdown 格式素養學習單。

### 📜 學習單必須包含以下結構：
# 📝 《(請填入課名)》素養學習單

## 📍 一、 擷取訊息 (Facts)
(請針對課文中的具體事實設計 2-3 題)
💡 (請在每題下方加上 \`<br><br><br>\` 以預留作答空間)

## 🔍 二、 推論分析 (Inference)
(請針對主角動機、作者用意 or 情節發展設計 2-3 題)
💡 (請在每題下方加上 \`<br><br><br><br>\` 以預留較大作答空間)

## 🚀 三、 策略思考 (DOK 3-4)
(請設計 1-2 題高階思考題，連結學生的生活經驗 or 價值評鑑)
💡 (請在每題下方加上 \`<br><br><br><br><br>\` 以預留大片論述空間)

[VMAX_EXECUTION_PROTOCOL]
1. 100% 純繁體中文，禁止英文翻譯。
2. 🚨【純淨輸出鐵律】：請直接輸出完整的 Markdown 純文字內容！絕對禁止 any 開場白或結尾廢話！
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
【情況 A：角色年齡或長樣跑掉】
請維持本頁文字完全不動。重新讀取來源文件本頁的視覺提示詞。強制修正角色外觀為：
{GUIDE_DNA}

【情況 B：投影片文字漏印或被亂改】
請維持本頁圖片完全不動。重新讀取本頁的 \`displayText\` 欄位，100% 逐字補回繁體中文。
================================================================
`;