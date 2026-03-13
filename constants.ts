// 檔案路徑: src/constants.ts

export enum AppStep {
  IDLE = 0,
  STEP_1_INPUT = 1,
  STEP_2_BASIC = 2, // 2.0: Basic Info & Core Vocab
  STEP_3_DEEP_VOCAB = 3,  // 2.5: Vocabulary Radiation (Shape-Similar, Polyphonic, Idioms)
  STEP_3_DEEP_SEGMENTS = 4, // 2.75: Segments & Strategies
  STEP_4_VISUALS = 5, // 3.0: Visuals
  STEP_5_CASTING = 6, // 4.0: Casting
  STEP_6_OUTPUT = 7   // 5.0: Output
}

export const VMAX_KERNEL_VERSION = "v59.0-DNA-Purity-Kernel";

// 🌟 [2026 核心升級] 切換至最新支援型號
export const GEMINI_MODEL = "gemini-3-flash-preview";

// 🛡️ [核心防護裝甲]：強化 FAITHFULNESS_GROUNDING
export const SYSTEM_PROMPT = `
# ROLE: V-MAX v37-Omega (Omni-Architect Engine)
# Core: Master Kernel v59.0-DNA-Purity (DNA & Purity Protocol)
# Protocol: [VMAX_EXECUTION_PROTOCOL]
# CORE PROTOCOL: [FAITHFULNESS_GROUNDING] ⚠️ 最高優先級
1. 嚴禁幻覺：絕對禁止加入課文中不存在的事實、情節、人物或科學數據。
2. 文本錨點：所有的「大意」、「提問」與「腳本對白」必須 100% 基於使用者上傳的原文。
3. 排除雜訊：主動過濾頁碼、標題符號等無關文字。
4. 語言規範：100% 繁體中文，禁止夾雜英文或自動加入注音。

# 💮 Language Purity Protocol (語言純淨協定)
- 投影片內容 (Slide Content) 嚴禁出現任何英文標籤。
- 必須使用以下對應表進行翻譯：
  - Lens -> 鏡頭視角
  - Subject -> 畫面焦點
  - Context -> 背景細節
  - Rhetoric -> 修辭技巧
  - Sentence -> 句型應用
  - Guide -> 引導導師
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
    "grade": "提取年級", "unitName": "提取課名", "genre": "提取文體",
    "subject": "提取核心主題", "writingTechnique": "提取寫法", "mainIdea": "提取主旨"
  },
  "languageActivities": [ { "title": "活動標題", "content": "練習內容" } ],
  "coreVocabulary": [ { "word": "字", "radical": "部首", "writingTips": "照抄原文" } ],
  "textbookDifficultWords": ["詞語"],
  "idioms": ["成語"]
}

【資料尋找終極指南】：
1. 基本資訊：掃描文章最前面的列表。若無，請看大標題。
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
你現在是 V-MAX 核心教研專家。使用者對目前的「語文百寶箱」策略不滿意，要求「全面換新」。
請根據課文深度分析，利用「三神器」邏輯，腦力激盪出 3 個全新的教學策略。

⚠️ 強制執行「創意差異化」：
1. 嚴禁重複：絕對不可生成與「已存在的策略標題」相似的內容。
2. 維度切換：若原本偏向「文字理解」，請轉向「情境模擬」或「思辨爭點」。
3. 隨機偏移：根據本次請求提供的 [Seed]，從向量空間中尋找更具原創性的教學視角。

[三神器邏輯]
1. Rhetoric: 寫作工具（如：感官調色盤）。
2. Thinking: 邏輯工具（如：情節羅盤）。
3. Task: 行動任務（如：時空採訪員）。

⚠️ 'application' 欄位必須包含：
- [連結課文]：明確指出應用於課文哪一段落或哪一句話。
- [操作步驟]：提供 Step 1 -> Step 2 的具體師生互動。

⚠️ 輸出格式：僅限有效 JSON Array。

Schema:
[
  {
    "type": "Rhetoric" | "Thinking" | "Task",
    "title": "策略名稱 (需有 V-MAX 科技感)",
    "method": "核心方法論描述",
    "teachingPoint": "本策略要解決的教學痛點",
    "application": "[課文連結] + [步驟 1] -> [步驟 2]"
  }
]
`;

export const GENERATE_SINGLE_STRATEGY_PROMPT = `
[INSTRUCTION]
The user requires ONE NEW "Teaching Strategy" (百寶箱) idea.
Based on the analysis context and existing strategies, please BRAINSTORM 1 distinct strategy.
Try to vary the Type (Rhetoric/Thinking/Task).

⚠️ STRICT REQUIREMENT for 'application':
1. Context Link: Explicitly state WHICH part of the text this strategy applies to.
2. Operational Steps: Provide numbered steps for the teacher/student interaction.

⚠️ Output format: Valid JSON Object ONLY.

Schema:
{
  "type": "Thinking",
  "title": "[Gamified Name]",
  "method": "[Methodology description]",
  "teachingPoint": "[Insight]",
  "application": "[Context Link] + [Step 1] -> [Step 2]"
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

// 🌟 完整保留所有獨立功能 Prompt
export const GENERATE_SHAPE_SIMILAR_PROMPT = `
[INSTRUCTION]
你現在是 V-MAX 系統的「漢字辨析專家」。請針對目標字 "{CHAR}" 進行深度形近字挖掘。

目標：找出 2 個學生最容易混淆的形近字，並建立「解構式」辨析。

⚠️ 核心邏輯：
1. 結構對照：精確標註「字體部件」的微小差異。
2. 意象關聯：部首解釋必須與「字義」強烈掛鉤（例如：目部與眼睛看有關）。
3. 辨析口訣：產出 12 字以內的對比口訣（例如：用手「搥」打，追「槌」趕跑）。

⚠️ 輸出格式：Valid JSON Array ONLY. No Markdown.

Schema:
[
  {
    "char": "辨析字",
    "radical": "部首名稱 (例如：言部)",
    "words": "高頻教學詞彙 (例如：辨別)",
    "explanation": "【精準部件辨析】：精簡說明該部首在字義上的決定性作用。",
    "mnemonic": "辨析口訣 (例如：有言來爭辯，有心要辨別)"
  }
]
`;

export const GENERATE_SHAPE_SIMILAR_DETAILS_PROMPT = `
[INSTRUCTION]
The user wants to generate detailed information for a specific Shape-Similar Character (形近字).
Input Character: "{CHAR}"

Objective:
Provide the Radical (部首), Common Words (造詞), and a brief Explanation (解釋) of the radical's meaning for this character.

⚠️ Output format: Valid JSON Object ONLY. No Markdown.

Schema:
{
  "char": "{CHAR}",
  "radical": "Radical (e.g. 言部)",
  "words": "Common Word (e.g. 辯論)",
  "explanation": "Brief explanation of radical difference (e.g. 中間是言，表示用語言爭論)"
}
`;

export const GENERATE_MNEMONIC_PROMPT = `
[INSTRUCTION]
Generate a high-quality Chinese mnemonic (辨析筆記/口訣) for the provided shape-similar characters.

Input Data:
{CHARACTERS_LIST}

Objective:
Create a memory aid that helps students distinguish these characters based on their components (Radicals) and meanings.

Requirements:
1. Structure: 
   - Primary: A catchy rhyme or sentence linking Radical to Meaning (e.g. "辨別要用刀，辯論要用言").
   - Secondary (Optional): If the characters have complex usage differences, add a brief 1-sentence clarification.
2. Logic: Explicitly explain *why* that radical is used (e.g. "目部與眼睛有關").
3. Tone: Educational, encouraging, suitable for K-12 students.
4. Completeness: If the input provides specific words/definitions, incorporate them to make the note comprehensive.
5. Output: ONLY the mnemonic content. No conversational filler.
`;

export const GENERATE_POLYPHONIC_PROMPT = `
[INSTRUCTION]
The user wants to generate details for a Polyphonic Character (多音字).
Input Character: "{CHAR}"

Objective:
List all standard Traditional Chinese pronunciations (Zhuyin) for this character, along with common words and usage context.

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

### 🎨 1️⃣ Style SSOT (視覺風格 A-M)
⚠️ 你必須從以下清單中挑選風格，並在 reason 中說明為何適合：
A. 溫暖吉卜力: "Studio Ghibli style, hand-painted anime art, lush greenery, warm golden lighting, detailed background art, Hayao Miyazaki aesthetic."
B. 現代扁平: "Modern Flat Design, vector art, clean geometric shapes, bold solid colors, minimalist composition, corporate memphis style."
C. 清新水彩: "Soft watercolor painting, wet-on-wet technique, paper texture, pastel colors, dreamy atmosphere, gentle brushstrokes."
D. 精緻剪紙: "Layered paper cut art, depth of field, subtle drop shadows, vibrant colors, craft aesthetic, diorama look."
E. 新海誠光影: "Makoto Shinkai style, hyper-realistic sky, lens flares, high contrast, emotional lighting, cinematic anime background."
F. 新國風水墨: "Traditional Chinese Ink wash, brush strokes, negative space, Zen minimalism, elegant calligraphy vibes, black and white with red accents."
G. 3D 軟陶: "3D Claymorphism, rounded edges, soft matte finish, stop-motion look, cute and tactile, plasticine texture."
H. 像素積木: "Voxel art, 3D pixel blocks, isometric view, LEGO-like aesthetic, digital construction, minecraft style."
I. 塗鴉手帳: "Hand-drawn doodle, ballpoint pen lines, grid notebook background, casual and sketchy, bullet journal aesthetic."
J. 奇幻繪本: "Vintage storybook collage, mixed media textures, whimsical fantasy, magical realism, warm saturated colors."
K. 療癒色鉛筆: "Colored pencil, waxy texture, visible hatching, soft warm tones, childlike innocence, rough paper grain."
L. 幾何資訊圖: "Isometric infographic, clean blocks, technical lines, logical structure, data visualization style, blueprint aesthetic."
M. 復古浮世繪: "Ukiyo-e woodblock print, mineral pigments, bold outlines, decorative waves, traditional Japanese art, flat perspective."

### 🗺️ 2️⃣ Visual Metaphor Mapping (視覺隱喻庫)
⚠️ 邏輯：根據文體與內容選擇最契合的隱喻。
Type A: 探索與順序 (適用：說明文/遊記)
- [M1] 冒險地圖 (Adventure Map): 羊皮紙、虛線、羅盤。
- [M2] 生態解構圖 (Anatomy/Ecosystem): 放大鏡、標籤、中心放射。
Type B: 情感與流動 (適用：記敘文/抒情文)
- [M3] 故事絲帶 (Story Ribbon): 緞帶、節點、柔和路徑。
- [M4] 情緒溫度計 (Emotion Thermometer): 刻度、天氣圖示、起伏。
Type C: 對照與觀點 (適用：議論文/古文)
- [M5] 雙軌對照圖 (Double-Track Split): 分割畫面、左右對比。
- [M6] 運鏡膠捲 (Cinematic Lens): 膠捲、分鏡、視角切換。
Special Structures (特殊文體)
- [S1] 五感雷達圖: 雷達圖、感官標籤。
- [S2] 想像力氣球: 氣球、漂浮、連結。
- [S3] 時光列車: 車廂、橫向連結。
- [S4] 觀點天平: 天平、平衡、對比。
- [S5] 奧利奧圖: 夾心餅乾、層次。
- [S6] 漢堡圖: 漢堡、層次。

### 📤 輸出規範 (Strict JSON)
{
  "recommendations": [
    {
      "style": { "code": "A-M", "name": "風格名稱", "description": "對應的英文提示詞" },
      "metaphor": { "code": "M1-S6", "name": "隱喻名稱", "description": "視覺隱喻的具體描述" },
      "reason": "為什麼這個風格與隱喻的組合最適合本課？(連結文體與主題)"
    }
  ]
}
`;

export const STEP_3_CASTING_PROMPT_PREFIX = `[V-MAX CASTING ENGINE] 請根據來源文本的靈魂，為本課推薦 3 位最契合的引導者候選人。`;

export const STEP_4_DYNAMIC_CASTING_PROMPT = `
# ROLE: V-MAX 角色選角導演 (Casting Director)
# MISSION: 為本課定義「故事主角 (Story Protagonist)」與「引導導師 (Guide Avatar)」的視覺 DNA。

### 🧬 1️⃣ Visual DNA Anchor (視覺 DNA 錨點)
⚠️ 你必須為每個角色定義「不可撼動的特徵」，這將作為後續所有圖片生成的基礎。
格式：'Hair: [Style+Color] | Eyes: [Color] | Accessory: [Item] | Clothing: [Style]'

### 🎭 2️⃣ Visual Logic Matrix (視覺邏輯矩陣)
- 【Mode A: Drama Mode (戲劇模式)】：適用於記敘文、小說。主角是故事人物，導師是觀察者。
- 【Mode B: Field Trip Mode (導覽模式)】：適用於說明文、議論文。無特定主角，導師是畫面中心。

### 📥 來源資訊
文體: {GENRE}
主題: {SUBJECT}

### 📤 輸出規範 (Strict JSON)
{
  "mode": "Drama Mode" | "Field Trip Mode",
  "protagonist": {
    "name": "主角名稱",
    "description": "性格與背景描述",
    "visualDNA": "Hair: ... | Eyes: ... | Accessory: ... | Clothing: ...",
    "isNone": boolean (若為 Mode B 則為 true)
  },
  "guide": {
    "name": "導師名稱",
    "persona": "G1-G6 語氣晶片名稱",
    "visualDNA": "Hair: ... | Eyes: ... | Accessory: ... | Clothing: ..."
  }
}
`;

export const GUIDE_TRAITS_SUGGESTION_PROMPT = `[INSTRUCTION] Refine Visual DNA. {GENDER}, {AGE}, {TONE}`;
export const GUIDE_TEACHING_STYLE_SUGGESTION_PROMPT = `[INSTRUCTION] Create teaching style for Guide: {GENDER}, {AGE}, {TONE_LABEL}.`;
export const PROTAGONIST_TRAITS_SUGGESTION_PROMPT = `[INSTRUCTION] Generate Pipe Format Visual DNA for Protagonist.`;
export const EXTRACT_IMAGE_TRAITS_PROMPT = `
請以專業角色設計師的角度，精準分析隨附的圖片，並將該人物的視覺特徵萃取為嚴格的 YAML 格式 (Visual DNA)。
`;

export const STEP_5_MATERIALS_PROMPT = `[INSTRUCTION] Execute STEP 6: 輔助產出 (Material Linkage).`;

export const PROMPT_GENERATE_WORKSHEET = `
[INSTRUCTION]
Please Execute STEP 6-A: 素養學習單 (Worksheet).
Requirements:
1. 擷取訊息: 針對意義段的事實提問.
2. 推論分析: 針對主角動機或作者用意提問.
3. 比較評估: 連結生活經驗的開放式問題.

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
[INSTRUCTION]
你現在是 V-MAX 系統架構師。請撰寫一份「NotebookLM 教師工作室驅動指南」。
⚠️ 絕對禁令：禁止在指南中印出具體的腳本 P1-P30 內容。

[MODULE_1_START]
TITLE: 模組一：簡報分段驅動 (Slide Master)
LOCATION: 點擊【簡報】按鈕 -> 展開旁邊的自訂指令 (鉛筆圖示)
PROMPT:
請扮演嚴格的「視覺執行導演」。
# 邏輯校準
1. 視 [VMAX_EXECUTION_PROTOCOL] 為最高排版規範。
2. 視 [VMAX_STRUCTURE_YAML] 為視覺基石，每一頁必須嚴格執行 selected_scaffold 中定義的圖表公式。
3. 將來源文件中的「【視覺提示詞】」映射為 Internal_Image_Prompt 邏輯。
4. 角色一致性：每一頁的角色必須 100% 繼承 visual_dna_anchor，禁止任何特徵跳變。

⚠️ 任務範圍：【僅產出 {START} 至 {END} 頁】。
產出後請立即停止，不要自行發揮。
[MODULE_1_END]

[MODULE_2_START]
TITLE: 模組二：單頁精準修復 (Precision Revise)
LOCATION: 點擊特定頁面右上角的 Revise (鉛筆圖示)
PROMPT:
請維持文字絕對不動。重新讀取來源文件的「【視覺提示詞】」，將畫面強制修正為 visual_dna_anchor 中定義的特徵，並確保使用的 [Scaffold 圖表結構] 正確無誤。
[MODULE_2_END]

[MODULE_3_START]
TITLE: 模組三：語音摘要煉成 (Audio Overview)
LOCATION: 右側 Audio Overview -> Customize
PROMPT:
啟動 V-MAX 教學對話模式。主講人為 {Guide_Name}。根據來源文件的「【引導語/腳本】」區塊進行知識拆解。
你的目標是將「辨析口訣」與「結構地圖」講得生動有趣，像是一位專業的說書老師。
[MODULE_3_END]
`;

export const FINAL_ATOMIC_SCRIPT_PROMPT = `
# ROLE: V-MAX System Master Kernel v59.0 (The DNA & Purity Kernel)
# MISSION: 生成 100% 繁體中文的教學投影片腳本。

### 🛡️ 0️⃣ System Core Protocol (最高指導原則)
1. 視覺 DNA 鎖定：每一頁的 Image Prompt 必須以角色 DNA 為核心。DNA 特徵權重為 1.5x。
2. 語言純淨：投影片內容 (Slide Content) 嚴禁出現任何英文標籤。
3. 註音協定：生字必須標註國字（ㄓㄨˋ ㄧㄣ）。
4. 引導語規範 (Functional Guide Talk)：
   - 目的：引導語必須具備「教學功能」，禁止純粹的可愛對話。
   - 形近字：必須解釋「部首差異」或提供「防呆口訣」。
   - 成語：必須解釋「生活應用情境」。
   - 故事：必須挖掘情節細節或角色情緒。
   - 深度探究 (Deep Dive)：必須提出一個「啟發式問題」。

### 📸 1️⃣ Image Prompt Schema (圖像指令架構)
⚠️ 你必須嚴格依照以下格式生成 [INTERNAL_IMAGE_PROMPT]：
[INTERNAL_IMAGE_PROMPT]
Subject: {{Visual_DNA_Traits}} + {Action}
(⚠️ 邏輯：若為 Mode A -> Subject 為故事主角；若為 Mode B -> Subject 為引導導師)
Context: {Scene Description} + {Lighting/Atmosphere}
Composition: {Lens/Angle} + {Layout Logic}
Artistic VIS: {Style Code} + {Material} + {Color Palette}
Safety: {Negative Prompt}

### 📐 2️⃣ Atomic Slide Templates
- [P1] Cover: [Title] + [Dynamic Opening].
- [P2] Nav: [Structure] + [Rhetoric] + [Vocab] + [Literacy].
- [P3] Fusion Map: [Visual Metaphor Map] (Skeleton N-Code + Skin M-Code).
- [Part B] Story Slide: [Segment Summary] + [Difficult Words] + [Rhetoric] + [Key Patterns].
- [Part C] Atomic Slide: (One Item Per Slide)
  - Shape (形近字): [Visual comparison] + [Radical Difference] + [造詞].
  - Polyphonic (多音字): [讀音 A] vs [讀音 B] + [Contextual Usage].
  - Idiom (成語): [釋義] + [近反義] + [Real-life Usage].

### 📥 來源數據
{DATA}

### 📤 輸出規範 (Strict JSON Array)
請直接輸出 JSON 陣列，不需前言。
[
  {
    "page": "P1",
    "type": "cover",
    "title": "...",
    "content": { ... },
    "guideTalk": "...",
    "imagePrompt": "..."
  }
]
`;
