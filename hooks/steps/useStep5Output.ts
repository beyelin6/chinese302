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
   * 🌟 [終極武裝版] 一體化 YAML 標頭 (高精度 NotebookLM 驅動引擎 + 絕對頁碼注入)
   */
  const wrapScriptWithYAML = (slides: any[], data: any) => {
    const { analysisData, visualDNA, casting } = data;
    
    // 1. 深度萃取視覺風格與隱喻
    const styleCode = visualDNA?.style?.code || "F";
    const styleDesc = visualDNA?.style?.description || visualDNA?.style?.prompt || "Clean, high-quality educational vector art with vibrant and engaging colors.";
    const metaphorLabel = visualDNA?.metaphor?.label || "主題隱喻";
    const metaphorDesc = visualDNA?.metaphor?.description || `在畫面背景與過場中，必須巧妙融入【${metaphorLabel}】的視覺元素，藉此串連全課情境。`;

    // 2. 深度萃取角色 DNA (過濾掉無用的預設字眼)
    const protagDNA = casting?.protagonist || "符合課文情境的核心人物，保持清晰的臉部特徵與連貫的服裝設定。";
    const guideName = casting?.guide?.name || "V-MAX 導師";
    const guidePersona = casting?.guide?.persona || "專業、溫暖、具啟發性";
    
    // 若導師設定是空值或出現「預設」字眼，強制給予具體的 Prompt
    let guideDNA = casting?.guide?.visualDNA || "";
    if (!guideDNA || guideDNA.includes("預設")) {
        guideDNA = "身穿俐落的現代教學套裝，帶著親切且自信的微笑，常以手勢指示畫面的重點。";
    }

    // 3. 🌟 [新增] 絕對頁碼注入器 (Absolute Page Injector)
    // 保證無論 AI 分幾段產出，組合起來的陣列都會有完美的 1 到 N 頁碼
    const numberedSlides = slides.map((slide, index) => {
      // 確保 page_number 排在 JSON 物件的第一個屬性，方便人類閱讀
      const { page_number, ...restProps } = slide; 
      return {
        page_number: index + 1,
        ...restProps
      };
    });

    const unifiedPayload = {
      // ⚙️ NotebookLM 系統級最高權限指令
      notebooklm_driver: {
        system_role: "You are the V-MAX Slide Architect. Your absolute priority is to strictly follow the VMAX_STRUCTURE_YAML protocols and the dynamic slide blueprints.",
        artistic_consistency: styleCode,
        style_prompt: `Artistic VIS [${styleCode}]: ${styleDesc}. (CRITICAL: Maintain absolute stylistic consistency across all slides.)`,
        dna_traits: {
          protagonist: protagDNA,
          guide: `[Name: ${guideName}] | [Persona: ${guidePersona}] | [Visual Prompt: ${guideDNA}]`
        }
      },
      // 🎬 核心結構藍圖
      VMAX_STRUCTURE_YAML: {
        global_visual_protocol: {
          artistic_consistency: styleCode,
          image_ratio: "16:9",
          rendering_priority: "1. Protagonist DNA -> 2. Metaphor Integration -> 3. Action Accuracy"
        },
        scaffolding_logic: {
          macro_structure: analysisData?.visualStructureRecommendation || "鷹架導航結構",
          micro_thinking: "C1 氣泡圖 (分析) / T1 對比圖 (辨析)",
          visual_metaphor: metaphorLabel,
          visual_description: metaphorDesc
        },
        visual_dna_anchor: {
          protagonist_dna: protagDNA,
          guide_dna: guideDNA
        },
        slide_sequence_blueprint: {
          PART_A: "【導航與鷹架】建立全課心智地圖與學習任務",
          PART_B: "【詳盡課文迴圈】逐段深究、情境重現與修辭解析",
          PART_C: "【原子語文與評量】生字寫法、形近多音辨析與總結測驗",
          PART_D_E: "【策略與結尾】語文百寶箱活動與課程收尾"
        }
      },
      // 📝 動態腳本內容 (帶入已注入頁碼的陣列)
      slides: numberedSlides
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
      
      const languageActivities = analysisData?.languageActivities || [];
      const strategies = segmentsData?.strategies || [];

      // 1. 🌟 [精準對位藍圖] 建立分段藍圖，包含增量關鍵詞
      const blueprint = [
        // PART A
        { part: 'PART A', type: 'Cover', title: '封面' },
        { part: 'PART A', type: 'MissionNav', title: '任務導覽' },
        { 
          part: 'PART A', 
          type: 'FusionMap', 
          title: '結構視圖',
          // 🌟 [高密度封裝]：將關鍵詞提升至 4 個，確保掌握段落神韻
          quickGrasp: segments.map((s: any, idx: number) => ({
            label: `段落 ${idx + 1}`,
            keywords: s.keywords?.slice(0, 4).join('、') || "重點萃取中"
          })),
          macroStructure: analysisData?.visualStructureRecommendation,
          visualMetaphor: visualData?.metaphor?.label
        },
        
        // PART B (深究拆分)
        ...segments.flatMap((s: any, idx: number) => {
          const chunk = [{ part: 'PART B', type: 'ContentFocus', title: `段落 ${idx+1}: 內容對焦`, segment: s }];
          if (s.difficultWords?.length > 1 || s.questions?.length > 0 || s.rhetorics?.length > 0) {
            chunk.push({ part: 'PART B', type: 'DeepDive', title: `段落 ${idx+1}: 深究特寫`, segment: s });
          }
          return chunk;
        }),
        
        // PART C (生字勾選過濾)
        ...vocabulary.flatMap((v: any) => {
          if (!v.isSelected) return [];
          const vocabSlides = [];
          if (v.isWritingTipsSelected) {
            vocabSlides.push({ part: 'PART C', type: 'VocabLoop', title: `生字辨析：${v.word}`, word: v.word, writingTips: v.writingTips });
          }
          if (v.isShapeSimilarSelected && v.shapeSimilar && v.shapeSimilar.length > 0) {
            vocabSlides.push({ part: 'PART C', type: 'ShapeSimilar', title: `形近辨析：${v.word}`, details: v.shapeSimilar, mnemonic: v.mnemonic });
          }
          if (v.isPolyphonicSelected && v.polyphonic && v.polyphonic.length > 0) {
            vocabSlides.push({ part: 'PART C', type: 'Polyphonic', title: `多音字辨析：${v.word}`, details: v.polyphonic });
          }
          return vocabSlides;
        }),

        ...idioms.map((i: any) => ({ part: 'PART C', type: 'IdiomLoop', title: `成語解析：${i.word}`, idiom: i })),
        { part: 'PART C', type: 'Assessment', title: '全課綜合評量' },
        
        // PART D 
        ...languageActivities.map((act: any) => ({ part: 'PART D', type: 'LanguageActivity', title: `語文活動：${act.title}`, content: act.content })),
        ...strategies.map((st: any) => ({ part: 'PART D', type: 'Strategy', title: `教學策略：${st.title}`, strategy: st })),
        
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
          
          # 任務：生成第 ${i+1} 至 ${Math.min(i+chunkSize, blueprint.length)} 頁
          ${chunk.map((b, idx) => `${i + idx + 1}. [${b.type}] ${b.title}`).join('\n')}
          
          # 頁面特定邏輯說明：
          - 若遇到 [FusionMap]：
            1. 請務必利用資料中的 quickGrasp 清單。
            2. 關鍵詞標籤必須精確對應段落。
            3. 優先選擇『動詞』+『核心物件』，讓教師能一眼掌握段落意義。
          
          # 參考數據：
          ${JSON.stringify(chunk)}
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
    const mnemonic = vocab.filter(v => v.isSelected).find(v => v.mnemonic && v.mnemonic !== "無")?.mnemonic || "本課無特定口訣";
    
    let guideText = PROMPT_GENERATE_NOTEBOOKLM_GUIDE
      .replace('{Guide_Name}', guide.name || '導師')
      .replace('{TONE}', guide.persona || '專業');
      
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

  return { handleScriptPipeline, handleManualModule, handleBack: () => dispatch({ type: 'SET_STEP', payload: AppStep.STEP_5_CASTING }) };
};