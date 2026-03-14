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

  const getSafeData = (data: any) => {
    try { return typeof data === 'string' ? JSON.parse(data) : data; }
    catch { return null; }
  };

  /**
   * 🌟 [核心強化] 一體化 YAML 標頭 (對齊 4 大紀錄細節)
   */
  const wrapScriptWithYAML = (slides: any[], data: any) => {
    const { analysisData, visualDNA, casting } = data;
    const guide = casting?.guide || {};

    const unifiedPayload = {
      VMAX_STRUCTURE_YAML: {
        global_visual_protocol: {
          artistic_consistency: visualDNA?.style?.code || "A",
          image_ratio: "16:9",
          style_prompt: visualDNA?.style?.description || ""
        },
        scaffolding_logic: {
          macro_structure: analysisData?.visualStructureRecommendation || "N1 故事山",
          visual_metaphor: visualDNA?.metaphor?.label || "故事絲帶",
          visual_description: `使用 ${visualDNA?.metaphor?.label} 作為背景元素貫穿全課。`
        },
        visual_dna_anchor: {
          protagonist: casting?.protagonist || "標準主角",
          guide: {
            name: guide.name || "導師",
            dna_traits: guide.visualDNA || "專業引導人設"
          }
        },
        slide_sequence_blueprint: {
          PART_A: "導航與鷹架 (P1-P3)",
          PART_B: "詳盡課文迴圈 (意義段解析)",
          PART_C: "原子語文與評量 (生字、成語、測驗)",
          PART_D_E: "策略、語文活動與結尾"
        }
      },
      slides: slides
    };
    return JSON.stringify(unifiedPayload, null, 2);
  };

  const handleScriptPipeline = async () => {
    if (isProcessing.current || !state.analysisData) return;
    isProcessing.current = true;
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const analysisData = state.analysisData;
      const vocabData = getSafeData(state.deepVocabResult);
      const segmentsData = getSafeData(state.deepSegmentsResult);
      const visualData = getSafeData(state.visualResult);
      const castingData = getSafeData(state.castingResult);

      const segments = segmentsData?.segments || [];
      const vocabulary = vocabData?.vocabulary || [];
      const idioms = vocabData?.deepIdiomsDetails || [];
      
      // 🌟 [修復] 確切抓出語文活動與教學策略
      const languageActivities = analysisData?.languageActivities || [];
      const strategies = segmentsData?.strategies || [];

      // 1. 建立分段藍圖 (完美展開 PART A to E)
      const blueprint = [
        // PART A
        { part: 'PART A', type: 'Cover', title: '封面' },
        { part: 'PART A', type: 'MissionNav', title: '任務導覽' },
        { part: 'PART A', type: 'FusionMap', title: '結構視圖' },
        
        // PART B (深究拆分)
        ...segments.flatMap((s: any, idx: number) => {
          const chunk = [{ part: 'PART B', type: 'ContentFocus', title: `段落 ${idx+1}: 內容對焦`, segment: s }];
          // 動態拆分邏輯：若有修辭或挑戰則增加分頁
          if (s.rhetorics?.length > 0 || s.dokQuestions?.length > 0 || s.difficultWords?.length > 1) {
            chunk.push({ part: 'PART B', type: 'DeepDive', title: `段落 ${idx+1}: 深究特寫`, segment: s });
          }
          return chunk;
        }),
        
        // PART C 🌟 [修復] 暴力展開形近字與多音字
        ...vocabulary.flatMap((v: any) => {
          const vocabSlides = [];
          if (v.shapeSimilar && v.shapeSimilar.length > 0) {
            vocabSlides.push({ part: 'PART C', type: 'ShapeSimilar', title: `形近字：${v.word}`, details: v.shapeSimilar, mnemonic: v.mnemonic });
          }
          if (v.polyphonic && v.polyphonic.length > 0) {
            vocabSlides.push({ part: 'PART C', type: 'Polyphonic', title: `多音字：${v.word}`, details: v.polyphonic });
          }
          // 如果沒有形近字也沒多音字，就給一頁基本版
          if (vocabSlides.length === 0) {
            vocabSlides.push({ part: 'PART C', type: 'VocabLoop', title: `生字辨析：${v.word}`, word: v.word });
          }
          return vocabSlides;
        }),
        ...idioms.map((i: any) => ({ part: 'PART C', type: 'IdiomLoop', title: `成語解析：${i.word}`, idiom: i })),
        { part: 'PART C', type: 'Assessment', title: '全課綜合評量' },
        
        // PART D 🌟 [修復] 展開語文活動與百寶箱策略
        ...languageActivities.map((act: any) => ({ part: 'PART D', type: 'LanguageActivity', title: `語文活動：${act.title}`, content: act.content })),
        ...strategies.map((st: any) => ({ part: 'PART D', type: 'Strategy', title: `教學策略：${st.title}` })),
        
        // PART E
        { part: 'PART E', type: 'Ending', title: '結尾道別' }
      ];

      const chunkSize = 5;
      let accumulatedSlides: any[] = [];

      for (let i = 0; i < blueprint.length; i += chunkSize) {
        const chunk = blueprint.slice(i, i + chunkSize);
        dispatch({ type: 'SET_LOADING_STATUS', payload: `正在產出 ${chunk[0].part} (進度: ${i}/${blueprint.length})` });

        const prompt = `
          ${SYSTEM_PROMPT}
          ${FINAL_ATOMIC_SCRIPT_PROMPT}
          # ⚙️ NOTEBOOKLM DRIVER
          - 視覺 DNA：${castingData?.protagonist}
          - 語氣校準：導師為 ${castingData?.guide?.name}，展現「${castingData?.guide?.persona}」特質。
          - 語言純淨協定：嚴格繁體中文，禁止潤飾顯示文字。
          
          # 任務：生成第 ${i+1} 至 ${Math.min(i+chunkSize, blueprint.length)} 頁
          ${chunk.map((b, idx) => `${i + idx + 1}. [${b.type}] ${b.title}`).join('\n')}
        `;

        const response = await sendMessageToGemini(prompt, [], 0);
        const scriptData = sanitizeAndParseJSON(response);
        const newSlides = Array.isArray(scriptData) ? scriptData : (scriptData.slides || []);
        
        accumulatedSlides = [...accumulatedSlides, ...newSlides];

        const updatedScript = wrapScriptWithYAML(accumulatedSlides, {
          analysisData, visualDNA: visualData, casting: castingData
        });

        dispatch({ type: 'SET_OUTPUTS', payload: { outputScript: updatedScript } });
      }

      // 🌟 生成 [MODULE] 格式指南
      const guide = generateNotebookLMGuide(castingData, vocabulary);
      dispatch({ type: 'SET_OUTPUTS', payload: { outputNotebookLMGuide: guide } });
      
      dispatch({ type: 'SET_STEP', payload: AppStep.STEP_6_OUTPUT });

    } catch (error: any) {
      console.error('Pipeline Error:', error);
      dispatch({ type: 'SET_ERROR', payload: '產出失敗：' + error.message });
    } finally {
      isProcessing.current = false;
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const generateNotebookLMGuide = (castingData: any, vocab: any[]) => {
    const guide = castingData?.guide || {};
    const mnemonic = vocab.find((v:any) => v.mnemonic && v.mnemonic !== "無")?.mnemonic || "本課無特定口訣";
    
    let guideText = PROMPT_GENERATE_NOTEBOOKLM_GUIDE
      .replace('{Guide_Name}', guide.name || '導師')
      .replace('{TONE}', guide.persona || '專業');
      
    // 🛡️ 防呆機制：確保口訣一定會印出
    if (guideText.includes('{Mnemonic}')) {
      guideText = guideText.replace('{Mnemonic}', mnemonic);
    } else {
      guideText += `\n\n📌 **V-MAX 系統附加提示**：\n對話中請自然地唸出這份辨析口訣：『${mnemonic}』`;
    }

    return guideText;
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
      const prompt = `${SYSTEM_PROMPT}\n[任務]：${config.prompt}\n原文參考：${state.analysisData.fullText.substring(0, 2000)}`;
      const response = await sendMessageToGemini(prompt, [], 0);
      dispatch({ type: 'SET_OUTPUTS', payload: { [config.stateKey]: response } });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: '生成失敗: ' + error.message });
    } finally {
      isProcessing.current = false;
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_LOADING_STATUS', payload: null });
    }
  };

  return { 
    handleScriptPipeline, 
    handleManualModule, 
    handleBack: () => dispatch({ type: 'SET_STEP', payload: AppStep.STEP_5_CASTING }) 
  };
};