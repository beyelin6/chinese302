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

// 🛤️ 模式 A：內建文字描述模式 (純文字 DNA 鎖定，原本設定)
export const CHARACTER_ORIGINAL_PROMPT_TEMPLATE = `
[VISUAL_STRICT_SETTING: TEXT_DNA_LOCK]
- **Identity**: {PERSONA_DESC} (Character Name: {GUIDE_NAME})
- **Visual DNA**: {VISUAL_DNA_TEXT}
- **Style**: {STYLE_PROMPT}
- **Strict Protocol**: You MUST maintain absolute character consistency. Render {GUIDE_NAME} with the exact same hair, eyes, clothing style, and age on every slide based on the Visual DNA above.
`;

// 🛤️ 模式 B：外部基準圖模式 (專門給 NotebookLM 讀取 人物.png 使用)
export const CHARACTER_EXTERNAL_ANCHOR_PROMPT_TEMPLATE = `
[VISUAL_STRICT_SETTING: IMAGE_ANCHOR_IP]
- **THE SOLE TRUTH SOURCE**: PLEASE REFER TO THE SEPARATE UPLOADED CHARACTER IMAGE FILE AS THE PRIMARY SOURCE.
- **AUTHORITY**: Ignore any textual character descriptions in the following script. The facial features, hair, clothing colors, and body proportions from the UPLOADED IMAGE are the ONLY source of truth for the guide character {GUIDE_NAME}.
- **INSTRUCTION**: Ensure {GUIDE_NAME} looks 100% identical to the image file in every generated scene. Only apply the 'guideAction' to this fixed character model.
`;

// 🎨 [NANOBANANA 專用發電機]：產出給使用者去生基準圖的 Master Prompt (已強化去背需求)
export const PROMPT_GENERATE_CHARACTER_DNA_FOR_EXTERNAL = `
[INSTRUCTION]
# ROLE: 視覺藝術總監 (Art Director)
# MISSION: 根據本課視覺風格「{STYLE}」與導師人設「{PERSONA}」，產出一組專門給 NANOBANANA (DALL-E 3) 使用的「基準人設提示詞 (Master DNA Prompt)」。
# REQUIREMENTS:
- Subject: Must be a single, full-body character (Named: {GUIDE_NAME}).
- Format: Full-body shot, standing, frontal view.
- 🚨 Background: MUST be isolated on a PURE WHITE BACKGROUND with NO SHADOWS and CLEAN EDGES. (This is strictly required for background removal cutout style).
- Style: {STYLE}
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
1. 語系鎖定：所有輸出語言鎖定為台灣繁體中文（zh-TW）與台灣國小教學慣用語。
2. 字典標準：所有注音（zhuyin）、字義、造詞必須 100% 遵守台灣《教育部國語辭典簡編本》。
3. 嚴禁混入中國大陸普通話讀音與造詞。例：「結果」台灣讀 ㄐㄧㄝˊㄍㄨㄛˇ（二聲）；「期」在「期待」中讀 ㄑㄧˊ（二聲）。
4. 🚨同詞異音精準對齊：當同一個字有不同讀音時，你的 \`usage\`（用法說明）必須與當前的 \`zhuyin\` 【完全精準對齊】，嚴禁將不同讀音的意思混在一起解釋！

🚨🚨🚨 【形近字自動補完協定】(CRITICAL)
對於 coreVocabulary 中的每一個生字，你【必須】主動找出 1-2 個形近字進行辨析。

請只輸出純 JSON，格式如下：
{
  "vocabulary": [
    {
      "word": "生字",
      "type": "形近字/多音字/成語",
      "zhuyin": "注音",
      "shapeSimilar": [ { "char": "辨析字", "zhuyin": "注音", "radical": "部首", "words": "造詞", "explanation": "說明", "mnemonic": "辨析口訣" } ],
      "polyphonic": [ { "zhuyin": "讀音", "words": "造詞", "usage": "精簡字義說明" } ]
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

### ⛔ 數據忠誠度協定 (DATA_FAITHFULNESS) - 最高強制優先級
1. 🚨【意義段精準拆解與鎖定】：請精準掃描 <SOURCE_TEXT> 中的「【意義段大意】」區塊。
   - 陣列長度：原文有幾點大意，\`segments\` 陣列就必須有幾個物件，嚴禁合併或刪減！
   - 標題 (title)：必須 100% 照抄每一點「冒號前」的文字（例如：一、事件一）。
   - 大意 (summary)：必須 100% 照抄每一點「冒號後」的完整文字。
2. 證據鏈要求：每一個生成的段落，都必須伴隨一段至少 15 字的原文原句作為 \`evidence_quote\`。
3. 🚨【修辭與句型絕對物理搬運】：請掃描 <SOURCE_TEXT> 裡面的「句型修辭與語文活動」區塊，將它們精準分配到對應的段落中。絕對禁止 AI 自己發明或通靈修辭！若該段沒有，請保持空陣列 \`[]\`。
4. 🚨【DOK 提問提取】：請掃描 <SOURCE_TEXT> 裡的「認知層次提問矩陣」，把題目分配到對應的段落中。

### 🏫 1️⃣ Teaching Strategy Logic (教學策略庫)
請根據文本特性，選擇最適合的一項作為 macroStructure（如 N1 故事山、N2 流程圖）。
⚠️ macroStructure 僅作為教學策略標籤，絕對不可以改變 \`segments\` 的數量！

- N1 故事山 / N2 流程圖 / N3 SWBST / N4 階梯圖 / N5 循環圖

★ 語文百寶箱 (Teaching Strategies) 強制生成：利用策略庫邏輯腦力激盪出 3 個全新的教學策略，放入 \`strategies\` 陣列中。

### 📥 唯一合法來源
<SOURCE_TEXT>
{INPUT_TEXT}
</SOURCE_TEXT>

請直接輸出 JSON 格式：
{
  "macroStructure": "N1-N5",
  "segments": [ 
    { 
      "segmentIndex": 0, 
      "title": "🚨必須 100% 照抄冒號前的標題", 
      "type": "意義段類型",
      "summary": "🚨必須 100% 照抄冒號後的內文", 
      "evidence_quote": "原文原句", 
      "difficultWords": ["難詞1", "難詞2"], 
      "keywords": ["關鍵字1", "關鍵字2"], 
      "rhetorics": [
        {
          "name": "修辭或句型名稱",
          "example": "原文例句",
          "analysis": "解析說明",
          "pedagogicalPoint": "教學重點",
          "application": "課堂應用"
        }
      ], 
      "dokQuestions": [ { "type": "DOK 1-4", "question": "題目內容", "intent": "測驗意圖" } ], 
      "sentencePatterns": [], 
      "deepDive": "段落深究" 
    } 
  ],
  "strategies": [ { "type": "策略類型", "title": "策略名稱", "method": "操作方法", "teachingPoint": "教學重點", "application": "任務應用" } ]
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
1. 語系與字典強制規定（最高優先級）：所有注音（zhuyin）、字義、造詞必須 100% 遵守台灣《教育部國語辭典簡編本》。
2. 嚴禁混入中國大陸普通話讀音與造詞。例：「結果」台灣讀 ㄐㄧㄝˊㄍㄨㄛˇ（二聲）；「期」在「期待」中讀 ㄑㄧˊ（二聲）。
3. 所有輸出語言鎖定為台灣繁體中文（zh-TW）與台灣國小教學慣用語。
4. 🚨 分離輸出協定：你必須把「每一個不同的讀音」獨立成一個 JSON 物件，絕對禁止把不同讀音的字義寫在同一個格子裡！

⚠️ Output format: Valid JSON Array ONLY. No Markdown.
[ 
  { 
    "zhuyin": "注音 (例如: ㄐㄧㄝ)", 
    "words": "對應造詞 (例如: 結實)", 
    "usage": "精簡字義說明 (例如: 堅固、強壯)" 
  },
  { 
    "zhuyin": "注音 (例如: ㄐㄧㄝˊ)", 
    "words": "對應造詞 (例如: 結果、打結)", 
    "usage": "精簡字義說明 (例如: 植物長出果實，或事物收束)" 
  }
]
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

### 🚨 去背與連貫性協定 (CRITICAL)
為了方便後續去背應用，AI 在生成引導者候選人的 visualDNA 描述時【必須強制包含】以下三個元素：
1. **[Full-body shot]** (全身像), **[Standing position]** (站姿), **[Frontal view]** (正面).
2. **[Isolated on a pure white background]** (在純白背景中孤立).
3. **[Clean edges, no shadows]** (邊緣整潔，無陰影).

### 📥 輸出規範 (Strict JSON)
{ 
  "mode": "Drama Mode" | "Guide Mode", 
  "protagonist": { "name": "...", "description": "...", "visualDNA": "Gender: [男/女] | Age: [明確年齡] | Full-body shot, isolated on pure white background, no shadows ...", "isNone": false, "verification": "..." }, 
  "candidates": [ { "id": "C1", "name": "...", "persona": "...", "description": "...", "visualDNA": "Gender: [男/女] | Age: [明確年齡] | Full-body shot, isolated on pure white background, no shadows ..." } ] 
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

// ============================================================
// 🚀 最終排版大腦 (The Slide Architect)
// ============================================================

export const FINAL_ATOMIC_SCRIPT_PROMPT = `
# ROLE: V-MAX System Master Kernel v60.8 (Layout & Anti-Hallucination Director)
# MISSION: 根據傳入資料生成四維對位腳本。

### 🎨 視覺 DNA 鎖定協定
${CHARACTER_VISUAL_REF_PLACEHOLDER}

### 📐 模組一：Layout 與 Lens 版面代碼庫
- [ContentFocus]: 課文內容對焦 -> layout: "wide-scene" | lens: "廣角鏡頭 (去背景優化)"

### 📜 模組三：版型內容填充萬用通則
- **[ContentFocus] 標題與內文絕對對位鐵律**：🌟🚨 
  1. 【標題鎖定】：投影片的 \`title\` 欄位必須「100% 絕對照抄」參考數據中 segment.title 的內容（例如：一、事件一、四、結果）。
  2. 【文字鎖定】：\`displayText\` 欄位必須「100% 絕對照抄」參考數據中 segment.summary 的內容，嚴禁增減字數。
  3. 【生圖鎖定】：\`visual_prompt\` 必須包含該段落的 keywords 作為核心物件，確保生圖細節與課文精準對齊。
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
   {GUIDE_DNA_MODE_INSTRUCTION}
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

5. 【懸浮標籤優化 (Floating Badge)】(NEW!)
   如果投影片的 \`title\` 欄位中包含「【意義段Ｘ】」等段落標籤，請將該標籤獨立繪製成一個「懸浮標籤框 (Badge)」，優雅地貼在畫面的左上角或右上角。
   🚨 絕對禁止將標籤文字與主內文 (displayText) 混在一起顯示。

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
{GUIDE_DNA_MODE_INSTRUCTION}

【情況 B：投影片文字漏印或被亂改】
請維持本頁圖片完全不動。重新讀取本頁的 \`displayText\` 欄位，100% 逐字補回繁體中文。
================================================================
`;