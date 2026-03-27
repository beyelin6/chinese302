// 檔案路徑: src/visual-library.ts

import { RecStyleItem } from './types';

export interface StyleOption {
  code: string;
  name: string;
  desc: string;
  category: string;
}

export interface MetaphorOption {
  code: string;
  name: string;
  visual: string;
  category: string;
}

export const VISUAL_STYLES: StyleOption[] = [
  { code: 'A', name: '溫暖吉卜力', category: '復古與奇幻', desc: 'Studio Ghibli style, hand-painted anime art, lush greenery, warm golden lighting, detailed background art, Hayao Miyazaki aesthetic.' },
  { code: 'B', name: '現代扁平', category: '現代設計', desc: 'Modern Flat Design, vector art, clean geometric shapes, bold solid colors, minimalist composition, corporate memphis style.' },
  { code: 'C', name: '清新水彩', category: '經典藝術', desc: 'Soft watercolor painting, wet-on-wet technique, paper texture, pastel colors, dreamy atmosphere, gentle brushstrokes.' },
  { code: 'D', name: '精緻剪紙', category: '經典藝術', desc: 'Layered paper cut art, depth of field, subtle drop shadows, vibrant colors, craft aesthetic, diorama look.' },
  { code: 'E', name: '新海誠光影', category: '復古與奇幻', desc: 'Makoto Shinkai style, hyper-realistic sky, lens flares, high contrast, emotional lighting, cinematic anime background.' },
  { code: 'F', name: '新國風水墨', category: '經典藝術', desc: 'Traditional Chinese Ink wash, brush strokes, negative space, Zen minimalism, elegant calligraphy vibes, black and white with red accents.' },
  { code: 'G', name: '3D 軟陶', category: '現代設計', desc: '3D Claymorphism, rounded edges, soft matte finish, stop-motion look, cute and tactile, plasticine texture.' },
  { code: 'H', name: '像素積木', category: '現代設計', desc: 'Voxel art, 3D pixel blocks, isometric view, LEGO-like aesthetic, digital construction, minecraft style.' },
  { code: 'I', name: '塗鴉手帳', category: '現代設計', desc: 'Hand-drawn doodle, ballpoint pen lines, grid notebook background, casual and sketchy, bullet journal aesthetic.' },
  { code: 'J', name: '奇幻繪本', category: '復古與奇幻', desc: 'Vintage storybook collage, mixed media textures, whimsical fantasy, magical realism, warm saturated colors.' },
  { code: 'K', name: '療癒色鉛筆', category: '經典藝術', desc: 'Colored pencil, waxy texture, visible hatching, soft warm tones, childlike innocence, rough paper grain.' },
  { code: 'L', name: '幾何資訊圖', category: '技術與資訊', desc: 'Isometric infographic, clean blocks, technical lines, logical structure, data visualization style, blueprint aesthetic.' },
  { code: 'M', name: '復古浮世繪', category: '經典藝術', desc: 'Ukiyo-e woodblock print, mineral pigments, bold outlines, decorative waves, traditional Japanese art, flat perspective.' },
  { code: 'N', name: '熱血少年戰鬥', category: '高互動沈浸', desc: 'Shonen manga style, dynamic fish-eye lens, speed lines, impact sparks, red/black high contrast.' },
  { code: 'O', name: 'Vtuber 學院', category: '高互動沈浸', desc: 'Vtuber stream overlay design, anime academy theme, chat box UI, digital vibrant colors.' },
  { code: 'P', name: '賽博龐克', category: '復古與奇幻', desc: 'Cyberpunk aesthetic, neon lights, rainy night city, high-tech low-life, purple and teal palette.' },
  { code: 'Q', name: '極簡包浩斯', category: '現代設計', desc: 'Bauhaus style, primary colors (red/blue/yellow), geometric abstraction, functionalist design.' },
  { code: 'R', name: '蒸氣龐克', category: '復古與奇幻', desc: 'Steampunk, Victorian industrial, brass gears, clockwork, sepia tones, intricate machinery.' },
  { code: 'S', name: '黑白漫畫', category: '高互動沈浸', desc: 'Classic B&W Manga, screentones, dramatic ink hatching, high contrast storytelling.' },
  { code: 'T', name: '波普藝術', category: '經典藝術', desc: 'Pop Art, Andy Warhol style, Ben-Day dots, vibrant repetitive patterns, comic book aesthetic.' },
  { code: 'U', name: '可愛像素', category: '現代設計', desc: 'Kawaii Pixel Art, 8-bit/16-bit retro game style, pastel colors, simple and charming.' },
  { code: 'V', name: '超現實主義', category: '經典藝術', desc: 'Surrealism, Salvador Dali vibes, melting objects, dream-like logic, unexpected juxtapositions.' },
  { code: 'W', name: '暗黑哥德', category: '復古與奇幻', desc: 'Dark Gothic, Victorian mystery, ornate lace, candle lighting, moody atmosphere.' },
  { code: 'X', name: '科幻藍圖', category: '技術與資訊', desc: 'Sci-fi blueprint, holographic lines, technical schematics, glowing blue UI elements.' },
  { code: 'Y', name: '低多邊形', category: '技術與資訊', desc: 'Low Poly art, faceted surfaces, sharp edges, stylized 3D look, vibrant lighting.' },
  { 
    code: '06', 
    name: '學習漫畫風', 
    category: 'A 高互動沈浸', 
    desc: 'Educational manga style, black and white ink, screentones, speed lines, chibi scientist, distinct speech bubbles, manga panels. Philosophy: Turn dry principles into hot-blooded plots, emphasizing conflict. Visual: Panels, screentones, huge onomatopoeia (explosion font). Motion: Panels appear one by one. Text: Script format (Panel description, Sound FX, Dialogue), dramatic and exaggerated tone.' 
  },
];

export const ALL_STYLE_OPTIONS = VISUAL_STYLES.map(s => ({
  code: s.code,
  name: s.name,
  reason: s.desc,
  category: s.category
}));

export const VISUAL_METAPHORS: MetaphorOption[] = [
  { code: 'M1', name: '冒險地圖', visual: '羊皮紙、虛線、羅盤', category: 'Type A: 探索與順序' },
  { code: 'M2', name: '生態解構圖', visual: '放大鏡、標籤、中心放射', category: 'Type A: 探索與順序' },
  { code: 'M7', name: '漫步小徑', visual: '蜿蜒的小路、時間軸、沿途散布著代表故事發展的小場景節點', category: 'Type A: 探索與順序' },
  { code: 'M3', name: '故事絲帶', visual: '緞帶、節點、柔和路徑', category: 'Type B: 情感與流動' },
  { code: 'M4', name: '情緒溫度計', visual: '刻度、天氣圖示、起伏', category: 'Type B: 情感與流動' },
  { code: 'M5', name: '雙軌對照圖', visual: '分割畫面、左右對比', category: 'Type C: 對照與觀點' },
  { code: 'M6', name: '運鏡膠捲', visual: '膠捲、分鏡、視角切換', category: 'Type C: 對照與觀點' },
  { code: 'S1', name: '五感雷達圖', visual: '雷達圖、感官標籤', category: 'Special Structures (特殊文體)' },
  { code: 'S2', name: '想像力氣球', visual: '氣球、漂浮、連結', category: 'Special Structures (特殊文體)' },
  { code: 'S3', name: '時光列車', visual: '車廂、橫向連結', category: 'Special Structures (特殊文體)' },
  { code: 'S4', name: '觀點天平', visual: '天平、平衡、對比', category: 'Special Structures (特殊文體)' },
  { code: 'S5', name: '奧利奧圖', visual: '夾心餅乾、層次', category: 'Special Structures (特殊文體)' },
  { code: 'S6', name: '漢堡圖', visual: '漢堡、層次', category: 'Special Structures (特殊文體)' },
  { code: 'S7', name: 'Q版博士腳本', visual: '分鏡格、狀聲詞、Q版博士、畫面/音效/台詞三維度', category: 'Special Structures (特殊文體)' },
];

export const getVisualLibraryPrompt = () => {
  const styleCategories = [...new Set(VISUAL_STYLES.map(s => s.category))];
  const stylesStr = styleCategories.map(cat => {
    const items = VISUAL_STYLES.filter(s => s.category === cat);
    return `${cat}\n${items.map(s => `${s.code}. ${s.name}: "${s.desc}"`).join('\n')}`;
  }).join('\n\n');
  
  const metaphorCategories = [...new Set(VISUAL_METAPHORS.map(m => m.category))];
  const metaphorsStr = metaphorCategories.map(cat => {
    const items = VISUAL_METAPHORS.filter(m => m.category === cat);
    return `${cat}\n${items.map(m => `- [${m.code}] ${m.name}: ${m.visual}`).join('\n')}`;
  }).join('\n\n');

  return `
### 🎨 1️⃣ Style SSOT (視覺風格 A-Z)
⚠️ 你必須從以下清單中挑選風格，並在 reason 中說明為何適合：
${stylesStr}

### 🗺️ 2️⃣ Visual Metaphor Mapping (視覺隱喻庫)
⚠️ 邏輯：根據文體與內容選擇最契合的隱喻。
${metaphorsStr}
  `;
};
