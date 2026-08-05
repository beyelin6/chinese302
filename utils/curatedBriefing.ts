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

  // 1. 優先檢查物件內部是否有已經解析好的數據陣列
  const shapeSimilarArr = Array.isArray(v?.shapeSimilar) ? v.shapeSimilar : null;
  const polyphonicArr = Array.isArray(v?.polyphonic) ? v.polyphonic : null;

  let hasShape = shapeSimilarArr ? shapeSimilarArr.length > 0 : false;
  let hasPoly = polyphonicArr ? polyphonicArr.length > 0 : false;

  // 如果物件有明確的 boolean 標記
  if (v?.hasShapeSimilar !== undefined) hasShape = Boolean(v.hasShapeSimilar);
  if (v?.hasPolyphonic !== undefined) hasPoly = Boolean(v.hasPolyphonic);

  // 2. 若物件無明確陣列資料或尚未填入，從 sourceText 精確（以「單行 Line 對齊」方式）尋找專屬辨析紀錄
  if (sourceText && typeof sourceText === 'string') {
    const lines = sourceText.split('\n');
    let lineFoundHasShape = false;
    let lineFoundHasPoly = false;
    let foundLineForWord = false;

    for (const line of lines) {
      // 只處理包含目標字的行，且排除表格標頭列（避免標題「目標字|類型|辨析對象」誤導）
      if (line.includes(word) && !line.includes('目標字') && !line.includes('辨析對象') && !line.includes('分類')) {
        foundLineForWord = true;
        if (/形近/i.test(line)) {
          lineFoundHasShape = true;
        }
        if (/多音|破音|一字多音/i.test(line)) {
          lineFoundHasPoly = true;
        }
      }
    }

    if (foundLineForWord) {
      // 只有當物件本身沒有非空陣列數據時，採納單行對齊結果
      if (!shapeSimilarArr || shapeSimilarArr.length === 0) {
        hasShape = lineFoundHasShape;
      }
      if (!polyphonicArr || polyphonicArr.length === 0) {
        hasPoly = lineFoundHasPoly;
      }
    }
  }

  // 3. 計算 wants 勾選值：若物件本身已有屬性則使用該屬性，否則根據實際特徵
  const wantsShapeSimilar = v?.wantsShapeSimilar !== undefined ? Boolean(v.wantsShapeSimilar) : hasShape;
  const wantsPolyphonic = v?.wantsPolyphonic !== undefined ? Boolean(v.wantsPolyphonic) : hasPoly;
  
  // 當字詞具備形近或多音特徵時，自動預設 isFocused（焦點生字）
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
- 字形字音辨析 → 映射至對應的 coreVocabulary/recognitionVocabulary 項目的 shapeSimilar、polyphonic 陣列。若該字只有多音字（如「彈」），則 shapeSimilar 設為空陣列 []，wantsShapeSimilar 設為 false，wantsPolyphonic 設為 true；若只有形近字（如「社」），則 polyphonic 設為空陣列 []，wantsShapeSimilar 設為 true，wantsPolyphonic 設為 false。
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
