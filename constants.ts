// 檔案路徑: src/constants.ts

export enum AppStep {
  IDLE = 0,
  STEP_1_INPUT = 1,
  STEP_2_BASIC = 2,
  STEP_3_DEEP_VOCAB = 3,
  STEP_3_DEEP_SEGMENTS = 4,
  STEP_4_VISUALS = 5,
  STEP_5_CASTING = 6,
  STEP_6_OUTPUT = 7
}

export const VMAX_KERNEL_VERSION = "v59.0-DNA-Purity-Kernel";

// 🌟 [2026 核心升級] 切換至最新支援型號
export const GEMINI_MODEL = "gemini-3-flash-preview";

// 🛡️ [核心防護裝甲]：強化 FAITHFULNESS_GROUNDING
export const SYSTEM_PROMPT = `
# ROLE: V-MAX v37-Omega (Omni-Architect Engine)
# Core: Master Kernel v59.0-DNA-Purity
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
# ROLE: V-MAX 視覺邏輯導演 (Casting Director v8.8)
# MISSION: 根據文本性質執行「視覺邏輯矩陣」，並定義本課的選角。

### 🎭 視覺邏輯矩陣 (Visual Logic Matrix) 準則
【Mode A: 戲劇模式 (Drama Mode)】
- 適用：記敘文、故事、傳記、童話（本課《工匠之祖》適用此模式）。
- 概念：沈浸體驗。故事主角「演出」情節，引導者「點評」觀察。
- 鏡頭：電影感、中景、特寫。

【Mode B: 導覽模式 (Guide Mode)】
- 適用：說明文、議論文、科普文章。
- 概念：知識解構。無主角 (None)，引導者為唯一講者（如主播或教授）。
- 鏡頭：資訊圖表感、微距、分割畫面。

🚨 視覺 DNA 絕對指令：在生成 visualDNA 時，【必須】把明確的「年齡 (Age)」寫在最前面 (例如: Age: 10-year-old, Age: 30s, Age: Elderly)，以防 AI 繪圖時角色忽年輕忽老！

### 📤 輸出規範 (Strict JSON)
{
  "mode": "Drama Mode" | "Guide Mode",
  "protagonist": {
    "name": "從文本中提取的核心人物名稱 (如: 魯班)",
    "description": "性格描述 (如: 聰明且善於觀察的工匠)",
    "visualDNA": "Age: 30s | Hair: Black topknot | Eyes: Sharp and focused | Clothing: Traditional linen robe",
    "isNone": false
  },
  "candidates": [
    {
      "id": "C1",
      "name": "導師候選人名",
      "persona": "語氣晶片 (G1-G6)",
      "description": "他在本課的角色定位 (如: 穿越時空的說書人)",
      "visualDNA": "Age: 40s | 配戴獨特的齒輪項鍊與放大鏡"
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

// 🌟 [史詩級升級版] NotebookLM 工作室驅動指南 (動態數據注入模板)
export const PROMPT_GENERATE_NOTEBOOKLM_GUIDE = `
================================================================
V-MAX {KERNEL_VERSION} NotebookLM 操作指南
課次：{GRADE} {UNIT_NAME}
引導者：{GUIDE_NAME} ({GUIDE_PERSONA})
視覺風格：{VISUAL_STYLE}
隱喻結構：{VISUAL_METAPHOR}
產出日期：{DATE}
================================================================

───────────────────────────────────────────────────────────────
🚀 模組一：自動簡報生成指令 (Slide Generation)
位置：NotebookLM → 點擊【Slide Guide（簡報）】→ ✏️ 自訂指令框
───────────────────────────────────────────────────────────────
請讀取我上傳的 \`VMAX_SCRIPT_UNIFIED.txt\`。
這份檔案是完整的「簡報分鏡腳本」，請嚴格按照腳本中每一頁的資料，依序生成完整投影片。

⚠️ 製作投影片，請依照頁碼順序依序產出，不得跳頁或合併。
💡 建議分段產出（NotebookLM 有字數限制）：
每次請它產出 5 頁。例如：「請幫我產出第 1 頁到第 5 頁」，完成後再輸入「請接續產出第 6 頁到第 10 頁」。

⚠️ 投影片生成最高準則：
1. 【畫面生成｜視覺 DNA 鎖定】
   請嚴格依照每頁的「visual_prompt」欄位生成畫面。
   ★ 引導者 DNA 鎖定全程不得改變：
   {GUIDE_DNA}
   禁止出現與設定不符的年齡或性別。

2. 【投影片文字｜逐字鎖定】
   投影片畫面上的文字，必須 100% 一字不漏地複製 displayText 欄位。
   禁止自行刪減、潤飾或翻譯。禁止加入英文標籤。

3. 🚨排版與字體 (Layout Layout)：特別是【成語】與【形近字】頁面，請強制使用「單一張大圖」搭配「巨大清晰字體」的排版。絕對禁止使用多圖拼貼 (Collage) 或網格導致字體縮小。

4. 【講者備忘錄｜僅放台詞】
   請將 guideTalk 完整放入講者備忘錄，guideAction (動作提示) 僅供畫面生成參考，絕對不可印成文字。

───────────────────────────────────────────────────────────────
🟩 模組二：語音摘要煉成指令 (Audio Overview)
位置：右側 Audio Overview → Customize（自訂）
───────────────────────────────────────────────────────────────
啟動 V-MAX 教學對話模式：
- 主講人 A：{GUIDE_NAME}（{GUIDE_PERSONA} 的引導導師）
- 主講人 B：好奇的小學生
- 核心對話素材：嚴格根據來源文件之【guideTalk】區塊進行內容對話化。

🎯 本課重點討論項目（請務必在對話中深入解析）：
{AUDIO_FOCUS}

───────────────────────────────────────────────────────────────
🟨 模組三：單頁精準修復指令 (Precision Revise)
位置：投影片產出後 → 特定頁面右上角的 ✏️ Revise
───────────────────────────────────────────────────────────────
【情況 A：角色年齡或長相跑掉】
請維持本頁文字和備忘錄完全不動。重新讀取來源文件本頁的視覺提示詞。強制修正角色外觀為：
{GUIDE_DNA}
禁止出現與上述設定不符的形象。

【情況 B：投影片文字漏印或被亂改】
請維持本頁圖片完全不動。重新讀取本頁的 displayText 欄位，100% 逐字補回繁體中文，禁止縮減任何標題與內文。

───────────────────────────────────────────────────────────────
⚠️ 常見問題排除與進階技巧
───────────────────────────────────────────────────────────────
- 形近字口訣消失？ ➡️ 使用【情況 B】修復指令，強制它把字補回來。
- 確保分批產出一致性？ ➡️ 每一批開頭請對 AI 說：「請繼續生成下一批，並維持與前批完全相同的角色外觀與畫風設定。」
================================================================
`;

// 🌟 [劇本原子化升級] 四維對位原子化腳本指令 (新增注音與動作分離)
export const FINAL_ATOMIC_SCRIPT_PROMPT = `
# ROLE: V-MAX System Master Kernel v59.0 (The DNA & Purity Kernel)
# MISSION: 扮演嚴格的「視覺執行導演」，根據藍圖生成四維對位腳本。

### 🛡️ 0️⃣ System Core Protocol (最高指導原則)
1. 視覺 DNA 鎖定：每一頁的 Image Prompt 必須以角色 DNA 為核心。DNA 特徵權重為 1.5x。
2. 語言純淨：投影片顯示文字 (displayText) 嚴禁出現任何英文標籤。
3. 劇本分離：導師的「動作」與「純台詞」必須分開存放，方便未來自定語音生成。
4. 引導語規範 (Functional Guide Talk)：
   - 必須具備「教學功能」，化為符合【導師人設】的台詞。
   - 形近字必須唸出「辨析口訣」；深究特寫必須提出「啟發式問題」。

### 📥 1️⃣ JSON 輸出格式 (Strict Format Lock)
你必須輸出「純 JSON 陣列 (JSON Array)」。陣列中的每一個物件代表一頁投影片，必須嚴格包含以下 8 個欄位：
[
  {
    "part_label": "對應的 PART 標籤 (如 PART A)",
    "type": "對應的投影片類型 (如 Cover)",
    "title": "投影片標題",
    "lens": "鏡頭視角 (參考下方模板)",
    "visual_prompt": "視覺提示詞 (Internal_Image_Prompt，必須是英文描述)",
    "displayText": "顯示文字 (嚴格繁體中文，支援 Markdown 換行排版)",
    "guideAction": "導師的肢體動作或表情提示 (如: 溫暖地微笑並作揖，純描述，不可加括號)",
    "guideTalk": "引導語/腳本 (導師純台詞，絕對不可包含任何動作括號)"
  }
]

### 📐 2️⃣ 原子化動態腳本模板 (Format Templates)
請根據傳入任務的 \`type\`，嚴格對照以下內容規範填寫 JSON 欄位：

== PART A: 導航 (Navigation) ==
[type: Cover] (封面)
- lens: "中景"
- visual_prompt: "Subject: {主角或導師 DNA} welcoming. Context: Title Screen. Composition: Center Focus. Artistic VIS: {風格碼}. Safety: No text."
- guideAction: "符合設定語氣的開場動作"
- guideTalk: "[純台詞，符合設定語氣的開場白]"

[type: MissionNav] (任務導航)
- lens: "網格系統"
- visual_prompt: "Subject: {導師 DNA} presenting Mission Map. Context: 4 Icons floating. Composition: Flat Lay Grid. Artistic VIS: {風格碼}. Safety: No blurry text."
- displayText: "本課任務：結構探索 | 修辭解析 | 詞彙寶庫 | 素養挑戰"
- guideAction: "引導任務時的動作"

[type: FusionMap] (結構視圖)
- lens: "資訊圖表 (Infographic Map)"
- visual_prompt: "Subject: A thematic map using {Visual Metaphor}. Context: Dynamic nodes connected by a path. Composition: Overview. Artistic VIS: {Style Code}."
- displayText: 
  "1. 📌 主標題: [填入標題]
   2. 👤 核心人設: [人物名 + DNA]
   3. 🗺️ 情節路徑: [起點 -> 節點1 -> 節點2 -> 終點]
   4. 🔑 快速掌握 (關鍵詞): [根據輸入資料的 quickGrasp 清單，精準列出各段落的 4 個關鍵詞]
   5. 💡 知識小學堂: [本課核心策略亮點]"
- guideAction: "指向路徑的動作"
   
== PART B: 詳盡課文迴圈 (Detailed Text Loop) ==
[type: ContentFocus] (內容對焦)
- lens: "廣角 (Exhale)"
- visual_prompt: "Subject: {故事角色}. Context: {該段落大意場景}. Composition: Wide shot. Artistic VIS: {風格碼}. Safety: No text."
- displayText: "【段落大意】: {摘要}\\n【難詞顯影】: {難詞與解釋}"
- guideAction: "生動的講故事動作"

[type: DeepDive] (寫作與理解深究)
- lens: "特寫 (Inhale)"
- visual_prompt: "Subject: {導師 DNA}. Context: 視覺對焦修辭隱喻效果或教學情境道具. Composition: Close-up. Artistic VIS: {風格碼}. Safety: No text."
- displayText: "包含【文意深究/修辭】或【🌟 閱讀小挑戰】"
- guideAction: "拋出問題引導思考的動作"
- guideTalk: "[提出啟發式問題的台詞]"

== PART C: 原子語文迴圈 (Atomic Language Loop) ==
[type: ShapeSimilar] (形近字)
- lens: "[Layout: Split-Screen] (動態切分：依據辨析字數量自動分割為 2格/3格/4格)"
- visual_prompt: "Subject: None (🚨禁止引導者出現). Context: 【視覺語意化】必須為每個字格畫出對應『部首』的真實情境（例如：手部畫動作、水部畫水流）。要求：學生不看文字，光看插圖就能猜出部首含意。 Composition: Split screen. Artistic VIS: {風格碼}. Safety: No text."
- displayText: "必須列出各個辨析字的字、注音、部首、造詞，並清楚標示【💡 辨析口訣】與【解析】"
- guideAction: "引導學生觀察各個字體差異的語氣動作 (不印出)"
- guideTalk: "[注音與部首差異的詳細說明，與口訣唸法]"

[type: Polyphonic] (多音字)
- lens: "[Layout: Balance-Screen] (動態對稱：依據讀音數量分割)"
- visual_prompt: "Subject: None (🚨禁止引導者出現). Context: 【視覺語意化】必須分別畫出該字『不同讀音所對應的真實造詞情境』。要求：對比強烈，一目了然。 Composition: Split screen matching pronunciations. Artistic VIS: {風格碼}. Safety: No text."
- displayText: "讀音A (造詞) vs 讀音B (造詞)...依此類推"
- guideAction: "展示不同情境變化的語氣動作 (不印出)"
- guideTalk: "[說明同一個字在不同語境下的讀音與意義變化]"

[type: IdiomLoop] (成語)
- lens: "[Layout: Scene-Overlay] (單一張滿版大圖，搭配巨大清晰文字浮層)"
- visual_prompt: "Subject: None (🚨禁止引導者出現，讓插圖自己說話). Context: 【視覺語意化】必須完美演繹該成語的『完整故事情境（包含人物、動作、情緒）』。要求：學生不看文字，只看圖就能感受成語的意義. Composition: Wide cinematic single shot. Artistic VIS: {風格碼}. Safety: No text."
- displayText: "[成語]\\n釋義 | 近反義 | 例句"
- guideAction: "生動演繹該成語情境的語氣動作 (不印出)"
- guideTalk: "[用生活化的例子解釋成語的意思]"

[type: Assessment] (綜合評量)
- lens: "[Layout: Info-Board] (單圖資訊板)"
- visual_prompt: "Subject: {導師 DNA}. Context: 站在巨大的全息投影黑板或羊皮紙旁，準備揭曉答案。 Composition: Medium shot. Artistic VIS: {風格碼}. Safety: No text."
- displayText: "【測驗題型】：{題型}\\n❓ 題目：{題目}\\n🔘 (A) {選項}\\n🔘 (B) {選項}\\n🔘 (C) {選項}\\n🔘 (D) {選項}"
- guideAction: "鼓勵學生作答的動作 (不印出)"
- guideTalk: "孩子們，準備好要公佈答案了嗎？..."

== PART D: 策略與活動 (Strategy & Activity) ==
[type: LanguageActivity] (語文活動)
- lens: "[Layout: Dynamic-Stage] (依活動性質變換：若為對話請用 Speech-Stage，若為流程請用 Step-Flow，若為描述請用 Phrase-Demo)"
- visual_prompt: "Subject: {導師 DNA} leading the activity. Context: 視覺化該活動的核心學習動作（例如：拿著麥克風、搬動積木、指著連結線）。要求：插圖必須傳達出該活動的互動感。 Composition: Wide shot. Artistic VIS: {風格碼}. Safety: No text."
- displayText: "【活動名稱】：{活動標題}\\n{活動內容}"
- guideAction: "主持活動的互動手勢 (不印出)"
- guideTalk: "[帶領學生進行活動的台詞]"

[type: Strategy] (教學策略)
- lens: "[Layout: Treasure-Box] (單圖大字百寶箱)"
- visual_prompt: "Subject: {導師 DNA} opening a magical treasure box. Context: 發出智慧的光芒，展示策略核心。 Composition: Close-up. Artistic VIS: {風格碼}. Safety: No text."
- displayText: "【教學策略】：{策略標題}"
- guideAction: "展示魔法寶物的動作 (不印出)"
- guideTalk: "[引導學生使用該策略的台詞]"

== PART E: 結尾 (Ending) ==
[type: Ending] (結尾道別)
- lens: "遠景"
- visual_prompt: "Subject: {導師 DNA} waving goodbye. Context: Sunset or peaceful background. Composition: Wide shot. Artistic VIS: {風格碼}. Safety: No text."
- guideAction: "溫暖揮手道別的動作"
- guideTalk: "[溫暖的結尾語與鼓勵]"
`;