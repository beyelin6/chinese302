// 檔案路徑: src/hooks/steps/useStep5Output.ts

import { useRef, useCallback } from 'react';
import { useWorkflowContext } from '../../context/WorkflowContext';
import { sendMessageToGemini } from '../../services/gemini';
import { AppStep } from '../../types';
import { 
  SYSTEM_PROMPT, 
  FINAL_ATOMIC_SCRIPT_PROMPT, 
  PROMPT_GENERATE_WORKSHEET,
  PROMPT_GENERATE_ASSESSMENT,
  PROMPT_GENERATE_KB,
  PROMPT_GENERATE_GAMIFIED_QUIZ
} from '../../constants';
import { sanitizeAndParseJSON } from '../../utils/jsonParser';

export const useStep5Output = () => {
  const { state, dispatch } = useWorkflowContext();
  const isProcessing = useRef(false);

  const getFullContextData = useCallback(() => {
    const analysisData = state.analysisData;
    const safeParse = (data: any) => {
      if (!data) return null;
      return typeof data === 'string' ? JSON.parse(data) : data;
    };

    const segmentsData = safeParse(state.deepSegmentsResult);
    const vocabData = safeParse(state.deepVocabResult);
    const visualData = safeParse(state.visualResult);
    const castingData = safeParse(state.castingResult);

    return {
      unitName: analysisData?.unitName || "課程",
      fullText: analysisData?.fullText || "",
      grade: analysisData?.basicInfo?.grade || "國小",
      segments: segmentsData?.segments || [],
      vocabulary: vocabData?.vocabulary || [],
      idioms: vocabData?.deepIdiomsDetails || [],
      visualDNA: visualData,
      casting: castingData
    };
  }, [state]);

  /**
   * 🌟 [核心重構]：原子級分段產出邏輯
   */
  const handleScriptPipeline = async () => {
    if (isProcessing.current || !state.analysisData) return;
    isProcessing.current = true;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const data = getFullContextData();
      
      // 1. 建立完整藍圖 (包含所有可能出現的頁面)
      const fullBlueprint = [
        { type: 'Cover', title: '封面' },
        { type: 'MissionNav', title: '任務導覽' },
        { type: 'FusionMap', title: '結構圖' },
        ...data.segments.map((s: any, idx: number) => ({ type: 'StorySlide', title: `意義段 ${idx + 1}`, content: s.summary })),
        ...data.vocabulary.map((v: any) => ({ type: 'AtomicSlide', title: `生字辨析：${v.word}`, word: v.word })),
        ...data.idioms.map((i: any) => ({ type: 'AtomicSlide', title: `成語解析：${i.word}`, idiom: i.word }))
      ];

      const styleCode = data.visualDNA?.recommendations?.[0]?.style?.code || 'A';
      const chunkSize = 5; // 🌟 每次僅產出 5 頁，徹底解決 Token 限制
      let accumulatedSlides: any[] = [];

      // 2. 分段迭代生成
      for (let i = 0; i < fullBlueprint.length; i += chunkSize) {
        const chunk = fullBlueprint.slice(i, i + chunkSize);
        const progress = Math.round((i / fullBlueprint.length) * 100);
        
        dispatch({ 
          type: 'SET_LOADING_STATUS', 
          payload: `🚀 正在生成第 ${i + 1} ~ ${Math.min(i + chunkSize, fullBlueprint.length)} 頁 (進度: ${progress}%)` 
        });

        const prompt = `
          ${SYSTEM_PROMPT}
          ${FINAL_ATOMIC_SCRIPT_PROMPT}
          
          # 🚨 分段產出任務 (CHUNK ${Math.floor(i/chunkSize) + 1})
          請「僅針對」以下內容生成投影片腳本，保持 JSON 格式：
          ${chunk.map((b, idx) => `${i + idx + 1}. [${b.type}] ${b.title}`).join('\n')}

          # 視覺風格參考：${styleCode}
          # 選角設定參考：${state.castingResult}
        `;

        const response = await sendMessageToGemini(prompt, [], 0, { temperature: 0.7 });
        const scriptData = sanitizeAndParseJSON(response);
        const newSlides = Array.isArray(scriptData) ? scriptData : (scriptData.slides || []);
        
        // 累積結果
        accumulatedSlides = [...accumulatedSlides, ...newSlides];

        // 🌟 [關鍵更新]：每跑完一段，就立刻把部分成果寫入 State，讓前端顯示
        dispatch({ 
          type: 'SET_OUTPUTS', 
          payload: { outputScript: JSON.stringify({ slides: accumulatedSlides }) } 
        });
      }

      // 3. 全部完成後，產出 NotebookLM 指南
      const finalGuide = generateNotebookLMGuide(state, { slides: accumulatedSlides });
      dispatch({ 
        type: 'SET_OUTPUTS', 
        payload: { outputNotebookLMGuide: finalGuide } 
      });

      dispatch({ type: 'SET_STEP', payload: AppStep.STEP_6_OUTPUT });

    } catch (error: any) {
      console.error('Pipeline Error:', error);
      dispatch({ type: 'SET_ERROR', payload: '產出中斷：' + error.message });
    } finally {
      isProcessing.current = false;
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_LOADING_STATUS', payload: null });
    }
  };

  const generateNotebookLMGuide = (state: any, scriptData: any) => {
    const { analysisData, vocabData } = state;
    const vocab = vocabData?.vocabulary || [];
    const mnemonics = vocab
      .filter((v: any) => v.mnemonic && v.mnemonic !== "無")
      .map((v: any) => `* **${v.word}**：${v.mnemonic}`)
      .join('\n');

    return `
# 📘 V-MAX 智慧教學指南 (NotebookLM 專用)
- **課名**：${analysisData?.unitName || "課程"}
- **主旨**：${analysisData?.basicInfo?.mainIdea || "無"}
${mnemonics}
    `.trim();
  };

  const handleManualModule = async (moduleKey: string) => {
    if (isProcessing.current || !state.analysisData) return;
    isProcessing.current = true;
    const moduleMap: Record<string, { prompt: string, status: string, stateKey: string }> = {
      worksheet: { prompt: PROMPT_GENERATE_WORKSHEET, status: '正在生成素養學習單...', stateKey: 'outputWorksheet' },
      assessment: { prompt: PROMPT_GENERATE_ASSESSMENT, status: '正在生成複習講義...', stateKey: 'outputAssessment' },
      kb: { prompt: PROMPT_GENERATE_KB, status: '正在生成知識庫資料...', stateKey: 'outputKb' },
      gamified: { prompt: PROMPT_GENERATE_GAMIFIED_QUIZ, status: '正在生成遊戲化測驗...', stateKey: 'outputGamifiedQuiz' }
    };
    
    const config = moduleMap[moduleKey];
    if (!config) { isProcessing.current = false; return; }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_LOADING_STATUS', payload: config.status });

    try {
      const data = getFullContextData();
      const prompt = `${SYSTEM_PROMPT}\n[任務]：${config.prompt}\n原文：${data.fullText.substring(0, 1500)}`;
      const response = await sendMessageToGemini(prompt, [], 0);
      dispatch({ type: 'SET_OUTPUTS', payload: { [config.stateKey]: response } });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: `${config.status}失敗` });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_LOADING_STATUS', payload: null });
      isProcessing.current = false;
    }
  };

  return { handleScriptPipeline, handleManualModule, handleBack: () => dispatch({ type: 'SET_STEP', payload: AppStep.STEP_5_CASTING }) };
};