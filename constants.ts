// 檔案路徑: src/constants.ts

import { AppStep } from './types';

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
    "zhuyin": "注音 (例如：ㄅㄧㄢˋ)",
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

### 🎨 1️⃣ Style SSOT (視覺風格 A-Y)
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
N. 熱血少年戰鬥: "Shonen manga style, dynamic fish-eye lens, speed lines, impact sparks, red/black high contrast."
O. Vtuber 學院: "Vtuber stream overlay design, anime academy theme, chat box UI, digital vibrant colors."
P. 賽博龐克: "Cyberpunk aesthetic, neon lights, rainy night city, high-tech low-life, purple and teal palette."
Q. 極簡包浩斯: "Bauhaus style, primary colors (red/blue/yellow), geometric abstraction, functionalist design."
R. 蒸氣龐克: "Steampunk, Victorian industrial, brass gears, clockwork, sepia tones, intricate machinery."
S. 黑白漫畫: "Classic B&W Manga, screentones, dramatic ink hatching, high contrast storytelling."
T. 波普藝術: "Pop Art, Andy Warhol style, Ben-Day dots, vibrant repetitive patterns, comic book aesthetic."
U. 可愛像素: "Kawaii Pixel Art, 8-bit/16-bit retro game style, pastel colors, simple and charming."
V. 超現實主義: "Surrealism, Salvador Dali vibes, melting objects, dream-like logic, unexpected juxtapositions."
W. 暗黑哥德: "Dark Gothic, Victorian mystery, ornate lace, candle lighting, moody atmosphere."
X. 科幻藍圖: "Sci-fi blueprint, holographic lines, technical schematics, glowing blue UI elements."
Y. 低多邊形: "Low Poly art, faceted surfaces, sharp edges, stylized 3D look, vibrant lighting."

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
      "style": { "code": "A-Y", "name": "風格名稱", "description": "對應的英文提示詞" },
      "metaphor": { "code": "M1-S6", "name": "隱喻名稱", "description": "視覺隱喻的具體描述" },
      "reason": "為什麼這個風格與隱喻的組合最適合本課？(連結文體與主題)"
    }
  ]
}
`;

export const STEP_3_CASTING_PROMPT_PREFIX = `[V-MAX CASTING ENGINE] 請根據來源文本的靈魂，為本課推薦 3 位最契合的引導者候選人。`;


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
    "visualDNA": "Age: [明確年齡] | Hair: [髮型] | Clothing: [符合時代背景的服裝]",
    "isNone": boolean,
    "verification": "請簡述你在原文哪裡找到這個人，以及他做了什麼行動來推動劇情"
  },
  "candidates": [
    {
      "id": "C1",
      "name": "契合文本情境的專屬名字",
      "persona": "G1-G6 語氣晶片",
      "description": "他在本課的專屬定位",
      "visualDNA": "Age: [明確年齡] | [髮型] | [🌟 必須融合【選定視覺風格】的服裝與配件細節描述]"
    },
    { "id": "C2", "name": "...", "persona": "...", "description": "...", "visualDNA": "..." },
    { "id": "C3", "name": "...", "persona": "...", "description": "...", "visualDNA": "..." }
  ]
}
`;

export const GUIDE_TRAITS_SUGGESTION_PROMPT = `[INSTRUCTION] Refine Visual DNA. {GENDER}, {AGE}, {TONE}`;
export const GUIDE_TEACHING_STYLE_SUGGESTION_PROMPT = `[INSTRUCTION] Create teaching style for Guide: {GENDER}, {AGE}, {TONE_LABEL}.`;
export const PROTAGONIST_TRAITS_SUGGESTION_PROMPT = `[INSTRUCTION] Generate Pipe Format Visual DNA for Protagonist. (CRITICAL: Must include exact Age, e.g., Age: 12, Age: 40s at the beginning).`;
export const EXTRACT_IMAGE_TRAITS_PROMPT = `
請以專業角色設計師的角度，精準分析隨附的圖片，並將該人物的視覺特徵萃取為嚴格的 YAML 格式 (Visual DNA)。務必明確標示出該角色的推測年齡 (Age)。
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

// 🌟 [YAML 專屬進化版] NotebookLM 工作室驅動指南
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
- 主講人 A：{GUIDE_NAME}（{GUIDE_PERSONA} 的引導導師）
- 主講人 B：好奇的小學生
- 核心對話素材：嚴格根據來源文件之 \`guideTalk\` 區塊進行內容對話化。

🎯 本課重點討論項目（請務必在對話中深入解析）：
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
# ROLE: V-MAX System Master Kernel v60.5 (Layout & Anti-Hallucination Director)
# MISSION: 嚴格根據傳入的資料，生成精準的四維對位腳本，並確保視覺提示詞的絕對安全。

### 📐 模組一：Layout 與 Lens 版面代碼庫 (SSOT)
AI 必須為每一頁投影片嚴格指定最適合的 \`layout\` 與 \`lens\` 代碼：
- [ContentFocus] 課文內容對焦 -> layout: "wide-scene" | lens: "廣角 (Exhale)"
- [DeepDive] 修辭與句型深究 -> layout: "close-tool" | lens: "特寫 (Inhale)"
- [QuizCard] 閱讀小挑戰 -> layout: "quiz-card" | lens: "單圖資訊板 (Single Info Board)"
- [ShapeSimilar] 形近字辨析 -> lens: "左右分割對比大字排版 (Split Screen, Large Text)"。layout 依字組數決定："split-2"(2字), "grid-3"(3字), "grid-4"(4字)。
- [Polyphonic] 多音字辨析 -> lens: "天平對比大字排版 (Balance Screen, Large Text)"。layout 依讀音數決定："compare-scale"(2讀音), "triptych"(3讀音)。
- [IdiomLoop] 成語解析 -> layout: "story-panel" | lens: "單一滿版大圖配大字 (Single Full Image, Huge Text Overlay)"
- [LanguageActivity] 語文活動 -> layout: "pattern-drill", "punctuation-chart", "phrase-demo" 或 "speech-stage" | lens: "單圖大字互動舞台 (Single Image, Large Text)"
- [Strategy/FusionMap] 教學策略 -> layout: "info-flow" 或 "step-flow" | lens: "單圖大字百寶箱 (Single Box Focus, Large Text)"
- [Assessment] 綜合評量 -> layout: "single-board" | lens: "單圖資訊板 (Single Info Board)"
- [Cover/MissionNav/Ending] 封面與結尾 -> 請自行判斷，推薦使用 "wide-scene" 或 "close-tool"。

### 🎨 模組二：生圖防呆與導師顯影絕對禁令 (CRITICAL)
1. **導師強制顯影 (Guide Presence)**：只要該頁有 \`guideAction\` 或 \`guideTalk\`，或者版型為 close-tool / quiz-card，你【必須】在 \`visual_prompt\` 的 Subject 中，明確寫出導師的完整外觀特徵 (Guide DNA)！如果沒寫，生圖軟體就不會畫出導師！
2. **強制無字化 (Anti-Text Hallucination)**：生圖軟體極易產生亂碼外星文。
   - 若場景包含「藍圖、黑板、書本、筆記」，請註明「abstract lines, blank pages」。
   - \`visual_prompt\` 的結尾必須強制加上：「Safety: ABSOLUTELY NO TEXT, NO LETTERS, NO TYPOGRAPHY, NO WORDS IN THE IMAGE.」
3. **禁止拼貼**：絕對禁止多圖拼貼 (Collage)，強制使用清晰單圖。

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
    "visual_prompt": "【英文】生圖提示詞。Subject: [場景描述 + 務必包含導師外貌]. Context: ... Composition: [layout]. Artistic VIS: {風格碼}. Safety: ABSOLUTELY NO TEXT, NO LETTERS, NO TYPOGRAPHY IN THE IMAGE.",
    "displayText": "顯示文字 (嚴格繁體中文，包含【提取】與【推論】等標題，禁止自行刪減原文)",
    "guideAction": "導師的肢體動作或表情提示 (若無則填 null)",
    "guideTalk": "引導語/腳本 (純台詞)"
  }
]

### 📜 模組四：版型內容填充指南
- **[FusionMap]**: 🌟這是全課結構視圖！請務必結合傳入的 \`visualMetaphor\` (如故事絲帶/冒險地圖)，在 \`visual_prompt\` 中要求繪製出精美且具有設計感的「資訊圖表 (Infographic)」或「心智圖 (Mindmap)」，展現全課的宏觀結構！
- **[ContentFocus]**: 根據段落大意繪製場景。
- **[DeepDive]**: 視覺對焦教學情境。
- **[QuizCard]**: 提問表情特寫。displayText 必須分列【提取】與【推論】。
- **[ShapeSimilar]**: 必須使用大標題嚴格分格！格式如下：
  ### 字A (注音 / 部首)
  造詞：...
  ### 字B (注音 / 部首)
  造詞：...
  ### 💡 辨析口訣
  (口訣內容)
- **[Polyphonic]**: 必須使用大標題嚴格分格！格式如下：
  ### 讀音A (注音)
  造詞：...
  ### 讀音B (注音)
  造詞：...
- **[IdiomLoop]**: 根據例句畫出故事場景(無引導者)。
`;