// 檔案路徑: src/types.ts

export enum AppStep {
  IDLE = 0,
  STEP_1_INPUT = 1,
  STEP_2_BASIC = 2,       // 2.0: Basic Info & Core Vocab
  STEP_3_DEEP_VOCAB = 3,  // 2.5: Vocabulary Radiation (Shape-Similar, Polyphonic, Idioms)
  STEP_3_DEEP_SEGMENTS = 4, // 2.75: Segments & Strategies
  STEP_4_VISUALS = 5,     // 3.0: Visuals
  STEP_5_CASTING = 6,     // 4.0: Casting
  STEP_6_OUTPUT = 7       // 5.0: Output
}

export interface MediaData {
  mimeType: string;
  data: string; // Base64 encoded string
  name?: string;
}

export interface ShapeSimilarItem {
  char: string;
  words: string;
  type?: string;     // 形近字 或 多音字
  mnemonic?: string; // 防呆口訣
  // Optional fields for backward compatibility or if needed
  radical?: string;
  explanation?: string;
}

export interface PolyphonicItem {
  zhuyin: string;    // 🌟 新增：多音字專屬注音
  words: string;
  type?: string;
  mnemonic?: string; // 記憶口訣
  // Optional fields for backward compatibility
  usage?: string;
}

// 🌟 新增/更新：成語深度結構
export interface IdiomDetailItem {
  word: string;
  definition: string;
  example: string;
  synonyms: string[]; // 近義詞
  antonyms: string[]; // 反義詞
}

export interface IdiomItem {
  definition: string;
  context: string;
  relatives: string;
  example: string;
}

export interface VocabularyItem {
  word: string;
  zhuyin?: string;
  type: string;
  radical?: string;
  strokeCount?: number;
  writingTips?: string; 
  isFocused?: boolean;  

  // 🌟 [旗艦版標配] 三大教學意圖決策開關
  wantsWritingTips?: boolean;   // 是否講解字形寫法
  wantsShapeSimilar?: boolean;  // 是否講解形近字
  wantsPolyphonic?: boolean;    // 是否講解多音字

  shapeSimilar?: ShapeSimilarItem[];
  mnemonic?: string; 
  polyphonic?: PolyphonicItem[];
  idiom?: IdiomItem;
  details?: string;
}

export interface BasicInfo {
  grade: string;
  genre: string;
  theme: string;
  writingTechnique: string; // 🌟 新增：寫法
  mainIdea?: string;        // 🌟 新增：主旨
  unitName?: string;        // 🌟 新增：課名
}

export interface SegmentItem {
  segmentIndex?: number;
  title: string;
  summary: string;
  keywords: string[];
  difficultWords: string[];
  dokQuestions?: {
    type: string;
    question: string;
    intent: string;
  }[];
  rhetorics: {
    name: string;
    example: string;
    analysis?: string;
    pedagogicalPoint?: string;
    application?: string;
  }[];
  sentencePatterns: {
    name: string;
    example: string;
  }[];
  readingQuestions?: {
    type: string;
    question: string;
    answer: string;
  }[];
  deepDive: string;
}

export interface StrategyItem {
  type: string;
  title: string;
  method: string;
  teachingPoint: string;
  application: string;
  segmentIndex?: number; // 🌟 新增：綁定段落
  content?: string;      // 🌟 新增：提問內容
}

export interface AnalysisData {
  fullText: string; 
  mode: string;
  basicInfo: BasicInfo; 
  visualStructureRecommendation: string; 
  
  unitName?: string;
  genre?: string;      // 🌟 儲存「記敘文」
  grade?: string;      // 🌟 儲存「三年級下學期」
  subject?: string;
  
  coreVocabulary: VocabularyItem[]; 
  textbookDifficultWords: any[]; // Changed to any[] to support SelectableItem structure if needed, or keep string[] and handle conversion
  idioms: any[]; 
  
  // 🌟 新增：語文活動
  languageActivities?: {
    title: string;
    content: string;
    extensions?: any[];
  }[];

  // 🌟 新增此行：用來儲存勾選的目標生字
  targetDeepVocab?: string[]; 

  // 🌟 承接 Step 2.5 的深度結果
  deepIdiomsDetails?: IdiomDetailItem[]; 

  // 🌟 [新增] 存放官方解析
  officialStructure?: {
    summaries: string[]; // 存放「第一段：...」、「第二段：...」
    mainIdea: string;    // 本課主旨
  };

  vocabulary: VocabularyItem[]; 
  segments: SegmentItem[]; 
  strategies: StrategyItem[]; 
}

export interface RecStyleItem {
  code: string;
  name: string;
  reason: string;
}

export interface RecMetaphorItem {
  code: string; // M1-M6, S1-S6
  name: string;
  visual: string;
  reason: string;
  category: 'Type A: 探索與順序' | 'Type B: 情感與流動' | 'Type C: 對照與觀點' | 'Special Structures (特殊文體)';
}

export interface VisualData {
  consistencyAnalysis?: string; 
  styles: RecStyleItem[];
  metaphors: RecMetaphorItem[]; 
  visualAnchor?: {
    character_traits: string[];
    environment_traits: string[];
    core_colors: string[];
  };
}

export interface GuideCandidate {
  id: string;
  name: string;
  title: string;
  teachingStyle: string;
  visualDNA: string;
  whyFit: string;
  // Optional fields for backward compatibility or UI state
  gender?: string; 
  age?: string;    
  type?: 'Real' | 'Virtual';
  style?: string;
  tone?: string;
  description?: string; 
  toneLabel?: string; 
}

export interface CastingData {
  contextTone: string;
  candidates: GuideCandidate[];
  // Optional fields for backward compatibility
  protagonist?: {
    name?: string; 
    gender: string;
    age: string;
    traits: string;
  };
  fusionTable?: string; 
}

export interface WorkflowState {
  currentStep: AppStep;
  isLoading: boolean;
  loadingStatus: string | null; 
  error: string | null;
  basicAnalysisResult: any | null;
  analysisData: any | null;
  deepVocabResult: any | null;
  deepSegmentsResult: any | null;
  visualResult: any | null;
  castingResult: any | null;
  outputScript: string | null;
  outputWorksheet: string | null;
  outputAssessment: string | null;
  outputKb: string | null;
  outputNotebookLMGuide: string | null;
  outputGamifiedQuiz: string | null;
  apiKeys: string[];
  showApiKeyModal: boolean;
}

export type WorkflowAction = 
  | { type: 'RESTORE_STATE', payload: WorkflowState }
  | { type: 'IMPORT_SNAPSHOT', payload: Partial<WorkflowState> }
  | { type: 'SET_STEP', payload: AppStep }
  | { type: 'SET_LOADING', payload: boolean }
  | { type: 'SET_LOADING_STATUS', payload: string | null }
  | { type: 'SET_ERROR', payload: string | null }
  | { type: 'SET_BASIC_RESULT', payload: { basicAnalysisResult: any, analysisData: any } }
  | { type: 'SET_VOCAB_RESULT', payload: any }
  | { type: 'SET_SEGMENTS_RESULT', payload: any }
  | { type: 'SET_DEEP_SEGMENTS_RESULT', payload: any }
  | { type: 'SET_VISUAL_RESULT', payload: any }
  | { type: 'SET_CASTING_RESULT', payload: any }
  | { type: 'SET_OUTPUTS', payload: Partial<WorkflowState> }
  | { type: 'RESET_WORKFLOW' }
  | { type: 'SET_API_KEYS', payload: string[] }
  | { type: 'SET_SHOW_API_KEY_MODAL', payload: boolean };

export interface StyleOption {
  code: string;
  name: string;
  desc: string;
}

export const VISUAL_STYLES: StyleOption[] = [
  { code: 'A', name: '溫暖吉卜力', desc: 'Studio Ghibli style, hand-painted anime art, lush greenery, warm golden lighting, detailed background art, Hayao Miyazaki aesthetic.' },
  { code: 'B', name: '現代扁平', desc: 'Modern Flat Design, vector art, clean geometric shapes, bold solid colors, minimalist composition, corporate memphis style.' },
  { code: 'C', name: '清新水彩', desc: 'Soft watercolor painting, wet-on-wet technique, paper texture, pastel colors, dreamy atmosphere, gentle brushstrokes.' },
  { code: 'D', name: '精緻剪紙', desc: 'Layered paper cut art, depth of field, subtle drop shadows, vibrant colors, craft aesthetic, diorama look.' },
  { code: 'E', name: '新海誠光影', desc: 'Makoto Shinkai style, hyper-realistic sky, lens flares, high contrast, emotional lighting, cinematic anime background.' },
  { code: 'F', name: '新國風水墨', desc: 'Traditional Chinese Ink wash, brush strokes, negative space, Zen minimalism, elegant calligraphy vibes, black and white with red accents.' },
  { code: 'G', name: '3D 軟陶', desc: '3D Claymorphism, rounded edges, soft matte finish, stop-motion look, cute and tactile, plasticine texture.' },
  { code: 'H', name: '像素積木', desc: 'Voxel art, 3D pixel blocks, isometric view, LEGO-like aesthetic, digital construction, minecraft style.' },
  { code: 'I', name: '塗鴉手帳', desc: 'Hand-drawn doodle, ballpoint pen lines, grid notebook background, casual and sketchy, bullet journal aesthetic.' },
  { code: 'J', name: '奇幻繪本', desc: 'Vintage storybook collage, mixed media textures, whimsical fantasy, magical realism, warm saturated colors.' },
  { code: 'K', name: '療癒色鉛筆', desc: 'Colored pencil, waxy texture, visible hatching, soft warm tones, childlike innocence, rough paper grain.' },
  { code: 'L', name: '幾何資訊圖', desc: 'Isometric infographic, clean blocks, technical lines, logical structure, data visualization style, blueprint aesthetic.' },
  { code: 'M', name: '復古浮世繪', desc: 'Ukiyo-e woodblock print, mineral pigments, bold outlines, decorative waves, traditional Japanese art, flat perspective.' },
];
