// 檔案路徑: src/hooks/steps/useStep5Output.ts

import { useRef } from 'react';
import { useWorkflowContext } from '../../context/WorkflowContext';
import { sendMessageToGemini } from '../../services/gemini';
import { AppStep } from '../../types';
import { 
  SYSTEM_PROMPT, 
  FINAL_ATOMIC_SCRIPT_PROMPT, 
  PROMPT_GENERATE_NOTEBOOKLM_GUIDE,
  PROMPT_GENERATE_WORKSHEET,
  PROMPT_GENERATE_ASSESSMENT,
  PROMPT_GENERATE_KB,
  PROMPT_GENERATE_GAMIFIED_QUIZ
} from '../../constants';
import { sanitizeAndParseJSON } from '../../utils/jsonParser';

export const useStep5Output = () => {
  const { state, dispatch } = useWorkflowContext();
  const isProcessing = useRef(false);

  const getFullContextData = () => {
    const analysisData = state.analysisData;
    const segmentsData = typeof state.deepSegmentsResult === 'string' ? JSON.parse(state.deepSegmentsResult) : state.deepSegmentsResult;
    const vocabData = typeof state.deepVocabResult === 'string' ? JSON.parse(state.deepVocabResult) : state.deepVocabResult;
    const visualData = typeof state.visualResult === 'string' ? JSON.parse(state.visualResult) : state.visualResult;
    const castingData = state.castingResult ? (typeof state.castingResult === 'string' ? JSON.parse(state.castingResult) : state.castingResult) : null;

    return {
      unitName: analysisData?.unitName || "課程",
      fullText: analysisData?.fullText || "",
      grade: analysisData?.basicInfo?.grade || "國小",
      languageActivities: analysisData?.languageActivities || [], 
      segments: segmentsData?.segments || [],
      strategies: segmentsData?.strategies || [],
      vocabulary: vocabData?.vocabulary || [],
      idioms: vocabData?.deepIdiomsDetails || [],
      visualDNA: visualData,
      casting: castingData
    };
  };

  const handleScriptPipeline = async () => {
    if (isProcessing.current || !state.analysisData) return;
    isProcessing.current = true;
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const data = getFullContextData();
      
      // 🌟 [對齊 1] 強制藍圖：規定 AI 必須生成的投影片清單
      const blueprint = [
        { type: 'Cover', title: '封面' },
        { type: 'MissionNav', title: '任務導覽' },
        { type: 'FusionMap', title: '結構圖' },
        ...data.segments.map((s: any, idx: number) => ({ type: 'StorySlide', title: `意義段 ${idx + 1}`, segmentId: s.id })),
        ...data.vocabulary.map((v: any) => ({ type: 'AtomicSlide', title: `生字辨析：${v.word}`, word: v.word })),
        ...data.idioms.map((i: any) => ({ type: 'AtomicSlide', title: `成語解析：${i.word}`, idiom: i.word }))
      ];

      // 🌟 [新增] 根據風格碼注入專屬指令
      const styleCode = data.visualDNA?.recommendations?.[0]?.style?.code || 'A';
      const getStyleSpecificInstruction = (code: string) => {
        switch (code) {
          case 'N': return `\n# 🎭 熱血少年戰鬥風格 (Style N) 專屬指令：\n- 投影片內容呈現「戰鬥數據面板」感。\n- 引導語充滿熱血挑戰感。`;
          case 'U': return `\n# 👾 可愛像素風格 (Style U) 專屬指令：\n- 投影片內容呈現「RPG 對話框」感。\n- 引導語像遊戲 NPC 一樣親切。`;
          case 'S': return `\n# 📖 黑白漫畫風格 (Style S) 專屬指令：\n- 投影片內容呈現「漫畫分鏡對白」感。\n- 強調對比與張力。`;
          case 'O': return `\n# 📺 Vtuber 學院風格 (Style O) 專屬指令：\n- 呈現「直播介面」感，引導語像直播主互動。`;
          case 'P': return `\n# 🌃 賽博龐克風格 (Style P) 專屬指令：\n- 呈現「高科技顯示器」感，引導語冷酷未來感。`;
          case 'Q': return `\n# 📐 極簡包浩斯風格 (Style Q) 專屬指令：\n- 強調幾何構成，引導語邏輯嚴密。`;
          case 'R': return `\n# ⚙️ 蒸氣龐克風格 (Style R) 專屬指令：\n- 呈現「古老設計圖」感，引導語充滿工業氣息。`;
          case 'T': return `\n# 🎨 波普藝術風格 (Style T) 專屬指令：\n- 呈現「大膽配色」，引導語活潑流行感。`;
          case 'V': return `\n# 🌀 超現實主義風格 (Style V) 專屬指令：\n- 呈現「夢境」感，引導語充滿哲思聯想。`;
          case 'W': return `\n# 🕯️ 暗黑哥德風格 (Style W) 專屬指令：\n- 呈現「古堡秘辛」感，引導語神秘深沉。`;
          case 'X': return `\n# 💻 科幻藍圖風格 (Style X) 專屬指令：\n- 呈現「全息投影」感，引導語精確數據導向。`;
          case 'Y': return `\n# 💎 低多邊形風格 (Style Y) 專屬指令：\n- 呈現「數位雕塑」感，引導語現代俐落。`;
          default: return "";
        }
      };
      const styleSpecificInstruction = getStyleSpecificInstruction(styleCode);

      dispatch({ type: 'SET_LOADING_STATUS', payload: `正在根據藍圖生成 ${blueprint.length} 張投影片腳本...` });

      const prompt = `
        ${SYSTEM_PROMPT}
        ${FINAL_ATOMIC_SCRIPT_PROMPT}
        ${styleSpecificInstruction}
        
        # 🚨 執行任務：強制藍圖 (MANDATORY BLUEPRINT)
        請依照以下順序與數量生成投影片，不得遺漏：
        ${blueprint.map((b, i) => `${i + 1}. [${b.type}] ${b.title}`).join('\n')}

        # 參考數據：
        - 文本分析：${state.basicAnalysisResult}
        - 生字辨析：${state.deepVocabResult}
      `;

      const response = await sendMessageToGemini(prompt, [], 0, { temperature: 0.7 });
      const scriptData = sanitizeAndParseJSON(response);

      if (scriptData && scriptData.slides) {
        // 🌟 [對齊 2] 確定性 NotebookLM 指南：使用純函數生成，不依賴 AI 隨機發揮
        const guide = generateNotebookLMGuide(state, scriptData);
        
        dispatch({ 
          type: 'SET_OUTPUTS', 
          payload: { 
            outputScript: JSON.stringify(scriptData),
            outputNotebookLMGuide: guide
          } 
        });
        
        dispatch({ type: 'SET_STEP', payload: AppStep.STEP_6_OUTPUT });
      }
    } catch (error: any) {
      console.error('Step 5 Error:', error);
      dispatch({ type: 'SET_ERROR', payload: '腳本生成失敗：' + error.message });
    } finally {
      isProcessing.current = false;
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_LOADING_STATUS', payload: null });
    }
  };

  /**
   * 🌟 [新增] 確定性指南生成器
   */
  const generateNotebookLMGuide = (state: any, scriptData: any) => {
    const { analysisData, vocabData } = state;
    const vocab = vocabData?.vocabulary || [];
    
    // 提取助記口訣 (從生字辨析中撈取)
    const mnemonics = vocab
      .filter((v: any) => v.mnemonic && v.mnemonic !== "無")
      .map((v: any) => `* **${v.word}**：${v.mnemonic}`)
      .join('\n');

    const guideMarkdown = `
# 📘 V-MAX 智慧教學指南 (NotebookLM 專用)

## 🎯 課文核心資訊
- **課名**：${analysisData.unitName}
- **文體**：${analysisData.genre}
- **主旨**：${analysisData.basicInfo.mainIdea}

## 🧠 結構與修辭
- **視覺結構**：${analysisData.visualStructureRecommendation}
- **核心寫法**：${analysisData.basicInfo.writingTechnique}

## 💡 識字教學重點 (助記口訣)
${mnemonics || "本課無特殊口訣。"}

---

## 🛠️ 視覺 DNA 控制區 (Divine YAML)
\`\`\`yaml
V-MAX_DNA:
  Style: "${scriptData.visualStyle || 'Style A'}"
  Anchor: "${scriptData.character_dna_anchor || '無'}"
  Version: "59.0"
\`\`\`

> 請 NotebookLM 根據此指南進行深度對話與學習單生成。
    `;
    return guideMarkdown;
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
      const prompt = `${SYSTEM_PROMPT}\n課程：《${data.unitName}》\n年級：${data.grade}\n原文：${data.fullText.substring(0, 3000)}\n\n[任務]：${config.prompt}`;
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

  const handleBack = () => dispatch({ type: 'SET_STEP', payload: AppStep.STEP_5_CASTING });
  return { handleScriptPipeline, handleManualModule, handleBack };
};
