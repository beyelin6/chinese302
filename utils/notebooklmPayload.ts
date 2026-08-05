// 檔案路徑: src/utils/notebooklmPayload.ts

/**
 * 預設 NotebookLM 簡報版面範本代碼 (L01 ~ L08)
 */
export const NOTEBOOKLM_LAYOUT_PRESETS = {
  L01: '左圖右文：左側情境插圖 52%，右側以 2–3 個文字盒呈現重點。',
  L02: '上圖下文：上方無字情境插圖 60%，下方以單一重點板呈現文字。',
  L03: '多欄辨析：依資料量使用 2–4 欄卡片，每欄只放一組字詞。',
  L04: '句意情境：上方單一大圖忠實呈現例句，下方放標題、解釋與例句。',
  L05: '提問卡：上方主題圖，下方分開呈現提取、推論與思考問題。',
  L06: '流程圖：由左至右或由上至下呈現 3–5 個步驟，禁止裝飾性分支。',
  L07: '對話舞台：角色與對話框分區，主內容另置於獨立文字盒。',
  L08: '單一焦點：一張主圖搭配一個核心句，適用封面、轉場與結尾。'
} as const;

export type NotebookLMLayoutCode = keyof typeof NOTEBOOKLM_LAYOUT_PRESETS;

/**
 * 根據投影片內容智慧推導適當的 Layout Code (L01 ~ L08)
 */
export const inferLayoutCode = (slide: any): NotebookLMLayoutCode => {
  if (!slide) return 'L02';
  if (slide.layout_code && NOTEBOOKLM_LAYOUT_PRESETS[slide.layout_code as NotebookLMLayoutCode]) {
    return slide.layout_code as NotebookLMLayoutCode;
  }

  const layout = String(slide.layout || slide.layout_type || '').toLowerCase();
  const type = String(slide.type || '').toLowerCase();
  const title = String(slide.title || '').toLowerCase();

  if (type.includes('idiom') || layout.includes('story-panel') || title.includes('成語')) return 'L04';
  if (type.includes('quiz') || type.includes('assessment') || layout.includes('quiz') || title.includes('測驗') || title.includes('思考')) return 'L05';
  if (type.includes('shape') || type.includes('polyphonic') || layout.includes('grid') || layout.includes('split-2') || title.includes('形近') || title.includes('多音')) return 'L03';
  if (type.includes('mission') || type.includes('map') || layout.includes('flow') || title.includes('流程') || title.includes('步驟')) return 'L06';
  if (layout.includes('dialogue') || layout.includes('speech') || title.includes('對話')) return 'L07';
  if (type.includes('cover') || type.includes('ending') || layout.includes('hero') || title.includes('封面') || title.includes('總結')) return 'L08';
  if (layout.includes('wide') || layout.includes('split') || layout.includes('two')) return 'L01';

  return 'L02';
};

/**
 * 從多元 Payload 結構中提取 slides 陣列 (優先讀取 presentation_data.slides)
 */
export const getSlidesFromPayload = (payload: any): any[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.presentation_data?.slides)) return payload.presentation_data.slides;
  if (Array.isArray(payload?.slides)) return payload.slides;
  if (Array.isArray(payload?.script?.slides)) return payload.script.slides;
  if (Array.isArray(payload?.data?.slides)) return payload.data.slides;
  return [];
};

/**
 * 將新的 slides 陣列更新回多元 Payload 結構中
 * 統一更新至 presentation_data.slides（並自動清理舊根層 slides），確保結構一致
 */
export const updateSlidesInPayload = (payload: any, slides: any[]): any => {
  const numberedSlides = slides.map((slide, index) => ({
    ...slide,
    page_number: index + 1,
    layout_code: slide.layout_code || inferLayoutCode(slide)
  }));

  if (!payload || typeof payload !== 'object') {
    return { presentation_data: { slides: numberedSlides } };
  }

  if (Array.isArray(payload)) {
    return numberedSlides;
  }

  if (payload.presentation_data) {
    const payloadCopy = { ...payload };
    delete payloadCopy.slides; // 清除舊根層 slides
    return {
      ...payloadCopy,
      presentation_data: {
        ...payload.presentation_data,
        slides: numberedSlides
      }
    };
  }

  // 若無 presentation_data 但為物件，包含或建立 presentation_data
  const payloadCopy = { ...payload };
  delete payloadCopy.slides;
  return {
    ...payloadCopy,
    presentation_data: {
      slides: numberedSlides
    }
  };
};
