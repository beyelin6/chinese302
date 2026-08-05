export interface CuratedBriefingSection {
  number: number;
  title: string;
  content: string;
}

const SECTION_PATTERN = /^\s*(\d+)\\?\.\s+(.+?)\s*$/gm;

export const isCuratedBriefing = (text: string): boolean => {
  if (!text?.trim()) return false;
  const normalized = text.replace(/\\\./g, '.');
  const signals = [
    /Curated Briefing/i,
    /^\s*0\.\s*(基本資訊|Metadata)/m,
    /^\s*1\.\s*(課文原文|Standard Text)/m,
    /^\s*2\.\s*(字詞|字詞基礎工程)/m,
    /^\s*6\.\s*(本課主旨|主旨與結構)/m,
    /^\s*7\.\s*(意義段|教學增值)/m
  ];
  return signals.filter((pattern) => pattern.test(normalized)).length >= 3;
};

export const parseCuratedBriefingSections = (text: string): CuratedBriefingSection[] => {
  const normalized = text.replace(/\\\./g, '.');
  const matches = [...normalized.matchAll(SECTION_PATTERN)];
  return matches.map((match, index) => {
    const start = (match.index || 0) + match[0].length;
    const end = index + 1 < matches.length ? (matches[index + 1].index || normalized.length) : normalized.length;
    return {
      number: Number(match[1]),
      title: match[2].trim(),
      content: normalized.slice(start, end).trim()
    };
  });
};

export interface VocabFeatures {
  hasShapeSimilar: boolean;
  hasPolyphonic: boolean;
  wantsShapeSimilar: boolean;
  wantsPolyphonic: boolean;
  isFocused: boolean;
}

export const checkVocabSourceFeatures = (v: any, sourceText: string = ''): VocabFeatures => {
  const word = typeof v === 'string' ? v : v?.word || '';
  if (!word) {
    return {
      hasShapeSimilar: false,
      hasPolyphonic: false,
      wantsShapeSimilar: false,
      wantsPolyphonic: false,
      isFocused: false
    };
  }

  // 1. 檢查物件內部已有屬性
  const shapeSimilarArr = Array.isArray(v?.shapeSimilar) ? v.shapeSimilar : [];
  const polyphonicArr = Array.isArray(v?.polyphonic) ? v.polyphonic : [];

  const hasShapeArr = shapeSimilarArr.length > 0;
  const hasShapeStr = typeof v?.shapeSimilar === 'string' && v.shapeSimilar.trim() !== '';
  const hasPolyArr = polyphonicArr.length > 0;
  const hasPolyStr = typeof v?.polyphonic === 'string' && v.polyphonic.trim() !== '';

  let hasShape = hasShapeArr || hasShapeStr || v?.hasShapeSimilar === true;
  let hasPoly = hasPolyArr || hasPolyStr || v?.hasPolyphonic === true;

  // 2. 檢視來源文本（第 4 區字形字音辨析或全文中提及形近字/多音字）
  if (sourceText && typeof sourceText === 'string') {
    const lines = sourceText.split('\n');
    for (const line of lines) {
      if (line.includes(word)) {
        if (/形近/i.test(line)) {
          hasShape = true;
        }
        if (/多音|破音|一字多音/i.test(line)) {
          hasPoly = true;
        }
      }
    }

    // 檢查包含該字的近距離片段
    let pos = sourceText.indexOf(word);
    let count = 0;
    while (pos !== -1 && count < 10) {
      const start = Math.max(0, pos - 60);
      const end = Math.min(sourceText.length, pos + 60);
      const snippet = sourceText.slice(start, end);

      if (/形近/i.test(snippet)) {
        hasShape = true;
      }
      if (/多音|破音|一字多音/i.test(snippet)) {
        hasPoly = true;
      }

      pos = sourceText.indexOf(word, pos + 1);
      count++;
    }
  }

  const wantsShapeSimilar = v?.wantsShapeSimilar !== undefined ? Boolean(v.wantsShapeSimilar) : hasShape;
  const wantsPolyphonic = v?.wantsPolyphonic !== undefined ? Boolean(v.wantsPolyphonic) : hasPoly;
  const isFocused = v?.isFocused ?? (hasShape || hasPoly);

  return {
    hasShapeSimilar: hasShape,
    hasPolyphonic: hasPoly,
    wantsShapeSimilar,
    wantsPolyphonic,
    isFocused
  };
};

export const buildCuratedBriefingMappingPrompt = (text: string): string => {
  const sections = parseCuratedBriefingSections(text);
  const compactSource = sections
    .filter((section) => section.number >= 0 && section.number <= 7)
    .map((section) => `## ${section.number}. ${section.title}\n${section.content}`)
    .join('\n\n');

  return `
[CURATED_BRIEFING_MAPPING_MODE]
這是已完成整理的 Curated Briefing，不得重新創作或改寫教材內容。
請直接將既有第 0–7 區映射到系統 JSON 欄位：
- 基本資訊 → basicInfo
- 課文原文 → fullText
- 生字與認讀字 → coreVocabulary、recognitionVocabulary
- 詞語與成語 → textbookDifficultWords、idioms
- 字形字音辨析 → 映射至對應的 coreVocabulary/recognitionVocabulary 項目的 shapeSimilar、polyphonic 陣列，並將對應的 wantsShapeSimilar、wantsPolyphonic 標記為 true
- 綜合語文活動 → languageActivities
- 主旨與結構 → basicInfo.mainIdea、officialStructure、visualStructureRecommendation
- 意義段解析 → segments、strategies

規則：
1. 優先保留原文與既有來源標記，不重新進行全文分析。
2. 無法確定的欄位使用空陣列或空字串，不得補寫教材未載內容。
3. 僅輸出符合現有 AnalysisData 結構的 JSON。

[CURATED_BRIEFING_SOURCE]
${compactSource || text}
[/CURATED_BRIEFING_SOURCE]
`;
};
