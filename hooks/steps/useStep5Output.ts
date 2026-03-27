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
  PROMPT_GENERATE_GAMIFIED_QUIZ,
  PROMPT_GENERATE_INTERACTIVE_QUIZ,
  // 🌟 新增：匯入 DNA 鎖定的變數與模板
  CHARACTER_VISUAL_REF_PLACEHOLDER,
  CHARACTER_ORIGINAL_PROMPT_TEMPLATE,
  CHARACTER_EXTERNAL_ANCHOR_PROMPT_TEMPLATE
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
   * 🌟 [核心新增] 智能切換引擎：動態組裝最終的 System Prompt
   * 根據使用者是否開啟「外部圖片模式」來決定要注入哪一種 DNA 鎖定指令
   */
  const getCompiledSystemPrompt = (castingData: any, visualData: any) => {
    const useRefMode = castingData?.useRefMode === true;
    const refUrl = castingData?.characterRefUrl || '';
    const guideName = castingData?.guide?.name || 'V-MAX 導師';
    const guidePersona = castingData?.guide?.persona || '專業、溫暖、具啟發性';
    const stylePrompt = visualData?.style?.description || visualData?.style?.prompt || 'Clean, high-quality educational vector art.';

    let finalCharacterRefPrompt = '';

    if (useRefMode && refUrl) {
      // 模式 B：寫入外部圖片鎖定指令，叫 NotebookLM 去看圖
      finalCharacterRefPrompt = CHARACTER_EXTERNAL_ANCHOR_PROMPT_TEMPLATE
        .replace(/{GUIDE_NAME}/g, guideName);
    } else {
      // 模式 A：使用文字詳細描述
      finalCharacterRefPrompt = CHARACTER_ORIGINAL_PROMPT_TEMPLATE
        .replace(/{PERSONA_DESC}/g, guidePersona)
        .replace(/{GUIDE_NAME}/g, guideName)
        .replace(/{STYLE_PROMPT}/g, stylePrompt);
    }

    // 將組裝好的 DNA 指令替換進萬用通則中
    return FINAL_ATOMIC_SCRIPT_PROMPT.replace(CHARACTER_VISUAL_REF_PLACEHOLDER, finalCharacterRefPrompt);
  };

  /**
   * 🌟 [終極武裝版] 一體化 JSON 標頭 (供 UI 層轉為 YAML)
   */
  const wrapScriptWithYAML = (slides: any[], data: any) => {
    const { analysisData, visualDNA, casting } = data;
    
    // 1. 深度萃取視覺風格
    const styleCode = visualDNA?.style?.code || "F";
    const styleDesc = visualDNA?.style?.description || visualDNA?.style?.prompt || "Clean, high-quality educational vector art.";

    // 2. 深度萃取角色 DNA (判斷是否開啟外部模式)
    const protagDNA = casting?.protagonist || "符合課文情境的核心人物";
    const guideName = casting?.guide?.name || "V-MAX 導師";
    const guidePersona = casting?.guide?.persona || "專業、溫暖、具啟發性";
    
    let guideDNA = casting?.guide?.visualDNA || "身穿俐落的現代教學套裝，帶著親切且自信的微笑。";
    if (casting?.useRefMode && casting?.characterRefUrl) {
       guideDNA = `[EXTERNAL_IMAGE_MODE] 🚨 絕對視覺鎖定：請強制讀取隨附的外部圖片檔案作為此角色的唯一長相標準。`;
    }

    // 3. 絕對頁碼注入器
    const numberedSlides = slides.map((slide, index) => {
      const { page_number, ...restProps } = slide; 
      return { page_number: index + 1, ...restProps };
    });

    const unifiedPayload = {
      notebooklm_driver: {
        system_role: "You are the V-MAX Slide Architect. Your absolute priority is to strictly follow the VMAX_STRUCTURE_YAML protocols and the dynamic slide blueprints.",
        artistic_consistency: styleCode,
        style_prompt: `Artistic VIS [${styleCode}]: ${styleDesc}.`,
        dna_traits: {
          protagonist: protagDNA,
          guide: `[Name: ${guideName}] | [Persona: ${guidePersona}] | [Visual Prompt: ${guideDNA}]`
        }
      },
      VMAX_STRUCTURE_YAML: {
        global_visual_protocol: {
          artistic_consistency: styleCode,
          image_ratio: "16:9",
          rendering_priority: "1. Protagonist DNA -> 2. Action Accuracy"
        },
        scaffolding_logic: {
          macro_structure: analysisData?.visualStructureRecommendation || "鷹架導航結構",
          micro_thinking: "C1 氣泡圖 (分析) / T1 對比圖 (辨析)",
          visual_description: "請專注於畫面主體與場景，嚴禁在背景隨意加上不相關的隱喻裝飾物。"
        },
        visual_dna_anchor: {
          protagonist_dna: protagDNA,
          guide_dna: guideDNA
        }
      },
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

      // 🌟 獲取注入好 DNA 的最終 System Prompt
      const compiledSystemPrompt = getCompiledSystemPrompt(castingData, visualData);

      const segments = segmentsData?.segments || [];
      const vocabulary = vocabData?.vocabulary || [];
      const idioms = vocabData?.deepIdiomsDetails || [];
      const languageActivities = analysisData?.languageActivities || [];
      const strategies = segmentsData?.strategies || [];

      // 1. 🌟 [精準對位藍圖] 建立分段藍圖
      const blueprint = [
        { part: 'PART A', type: 'Cover', title: '封面', basicInfo: analysisData?.basicInfo },
        { part: 'PART A', type: 'MissionNav', title: '任務導覽' },
        { 
          part: 'PART A', type: 'FusionMap', title: '結構視圖',
          quickGrasp: segments.map((s: any, idx: number) => ({ label: `段落 ${idx + 1}`, keywords: s.keywords?.slice(0, 4).join('、') })),
          visualMetaphor: visualData?.metaphor?.label
        },
        
        ...segments.flatMap((s: any, idx: number) => {
          const slimSegment = { summary: s.summary, keywords: s.keywords };
          const chunk: any[] = [{ part: 'PART B', type: 'ContentFocus', title: `段落 ${idx+1}: 內容對焦`, segment: slimSegment }];
          
          if (s.difficultWords?.length > 0 || s.rhetorics?.length > 0 || s.sentencePatterns?.length > 0) {
            chunk.push({ part: 'PART B', type: 'DeepDive', title: `段落 ${idx+1}: 深究特寫`, segment: { difficultWords: s.difficultWords, rhetorics: s.rhetorics, sentencePatterns: s.sentencePatterns } });
          }
          if (s.readingQuestions?.length > 0 || s.dokQuestions?.length > 0 || s.questions?.length > 0) {
            chunk.push({ part: 'PART B', type: 'QuizCard', title: `段落 ${idx+1}: 閱讀小挑戰`, segment: { readingQuestions: s.readingQuestions, dokQuestions: s.dokQuestions } });
          }
          return chunk;
        }),
        
        ...vocabulary.flatMap((v: any) => {
          const uiFlags = (analysisData?.coreVocabulary || []).find((cv: any) => cv.word === v.word) || {};
          if (uiFlags.isSelected === false) return [];
          const vocabSlides = [];
          if (uiFlags.wantsWritingTips || uiFlags.isWritingTipsSelected) vocabSlides.push({ part: 'PART C', type: 'VocabLoop', title: `生字辨析：${v.word}`, word: v.word, writingTips: uiFlags.writingTips });
          if ((uiFlags.wantsShapeSimilar || uiFlags.isShapeSimilarSelected) && v.shapeSimilar) vocabSlides.push({ part: 'PART C', type: 'ShapeSimilar', title: `形近辨析：${v.word}`, details: v.shapeSimilar, mnemonic: v.mnemonic });
          if ((uiFlags.wantsPolyphonic || uiFlags.isPolyphonicSelected) && v.polyphonic) vocabSlides.push({ part: 'PART C', type: 'Polyphonic', title: `多音字辨析：${v.word}`, details: v.polyphonic });
          return vocabSlides;
        }),
        
        ...idioms.map((i: any) => ({ part: 'PART C', type: 'IdiomLoop', title: `成語解析：${i.word}`, idiom: i })),
        { part: 'PART C', type: 'Assessment', title: '全課綜合評量' },
        ...languageActivities.map((act: any) => ({ part: 'PART D', type: 'LanguageActivity', title: `語文活動：${act.title}`, content: act.content })),
        ...strategies.map((st: any) => ({ part: 'PART D', type: 'Strategy', title: `教學策略：${st.title}`, strategy: { title: st.title, method: st.method, application: st.application } })),
        { part: 'PART E', type: 'Ending', title: '結尾道別' }
      ];

      const chunkSize = 5;
      let accumulatedSlides: any[] = [];

      for (let i = 0; i < blueprint.length; i += chunkSize) {
        const chunk = blueprint.slice(i, i + chunkSize);
        dispatch({ type: 'SET_LOADING_STATUS', payload: `正在產出 ${chunk[0].part} (進度: ${i}/${blueprint.length})` });

        const prompt = `
          ${SYSTEM_PROMPT}
          ${compiledSystemPrompt}
          # ⚙️ NOTEBOOKLM DRIVER
          - 視覺 DNA：${castingData?.protagonist}
          - 語氣校準：導師為 ${castingData?.guide?.name}，展現「${castingData?.guide?.persona}」特質。
          
          # 任務：生成第 ${i+1} 至 ${Math.min(i+chunkSize, blueprint.length)} 頁
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

      const guide = generateNotebookLMGuide(castingData, vocabulary, analysisData, visualData, accumulatedSlides);
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

  /**
   * 🚀 優化 2：單頁重繪引擎 (Micro-Regeneration)
   */
  const handleRegenerateSingleSlide = async (slideData: any): Promise<any> => {
    const castingData = getSafeData(state.castingResult);
    const visualData = getSafeData(state.visualResult);
    const compiledSystemPrompt = getCompiledSystemPrompt(castingData, visualData);
    
    const prompt = `
      ${SYSTEM_PROMPT}
      ${compiledSystemPrompt}
      
      # 任務：【單頁重繪】
      請幫我重新改寫以下這張投影片的內容（displayText 與 guideTalk），讓教學引導更生動、更有啟發性。
      ★ 必須維持原有的排版 (layout) 與鏡頭 (lens) 設定！
      ★ 導師設定：${castingData?.guide?.name} (${castingData?.guide?.persona})
      
      【原始投影片資料】：
      ${JSON.stringify(slideData, null, 2)}
      
      請只輸出包含這 1 張投影片的 JSON 陣列！
    `;

    const response = await sendMessageToGemini(prompt, [], 0);
    const parsed = sanitizeAndParseJSON(response);
    return Array.isArray(parsed) ? parsed[0] : (parsed.slides ? parsed.slides[0] : parsed);
  };

  /**
   * 🌟 智能等距切塊引擎：每 15 頁切成一大批！
   */
  const generateNotebookLMGuide = (castingData: any, vocab: any[], analysisData: any, visualData: any, slides: any[]) => {
    const guide = castingData?.guide || {};
    const grade = analysisData?.basicInfo?.grade || '';
    const unitName = analysisData?.basicInfo?.unitName || '未命名課文';
    const today = new Date().toISOString().split('T')[0];

    const selectedVocabs = vocab.filter((v: any) => v.isSelected || v.isFocused).map((v: any) => v.word).join('、');
    let audioFocus = selectedVocabs ? `1. 深入辨析生字的部首與形近字口訣：${selectedVocabs}\n` : '';
    audioFocus += `2. 探討本課的主旨、結構與寫作修辭手法。`;

    let batchingDirectory = '';
    const CHUNK_SIZE = 15; 

    for (let i = 0; i < slides.length; i += CHUNK_SIZE) {
      const chunk = slides.slice(i, i + CHUNK_SIZE);
      const batchNumber = Math.floor(i / CHUNK_SIZE) + 1;
      const firstPage = chunk[0].page_number || (i + 1);
      const lastPage = chunk[chunk.length - 1].page_number || (i + chunk.length);

      batchingDirectory += `\n【第 ${batchNumber} 批產出】 (建議複製指令：請接續產出 P${firstPage} 到 P${lastPage} 的投影片)\n`;
      chunk.forEach((slide: any) => {
        batchingDirectory += `  P${slide.page_number} ${slide.title}\n`;
      });
    }

    // 🌟 在指南中明確註明外部圖片的需求
    const guideDnaInstruction = castingData?.useRefMode
      ? `[最高優先級] 請務必讀取左側上傳的外部圖片檔案，以該圖片的長相作為導師生成的唯一標準！`
      : guide.visualDNA || "預設";

    return PROMPT_GENERATE_NOTEBOOKLM_GUIDE
      .replace(/{KERNEL_VERSION}/g, "v60.8-DNA-Purity")
      .replace(/{GRADE}/g, grade)
      .replace(/{UNIT_NAME}/g, unitName)
      .replace(/{GUIDE_NAME}/g, guide.name || '導師')
      .replace(/{GUIDE_PERSONA}/g, guide.persona || '專業')
      .replace(/{VISUAL_STYLE}/g, visualData?.style?.name || '預設')
      .replace(/{DATE}/g, today)
      .replace(/{GUIDE_DNA}/g, guideDnaInstruction)
      .replace(/{AUDIO_FOCUS}/g, audioFocus)
      .replace(/{BATCHING_DIRECTORY}/g, batchingDirectory);
  };

  const handleManualModule = async (moduleKey: string) => {
    if (isProcessing.current || !state.analysisData) return;

    if (moduleKey === 'notebooklm') {
       const castingData = getSafeData(state.castingResult);
       const vocabData = getSafeData(state.deepVocabResult);
       const vocab = vocabData?.vocabulary || state.analysisData.coreVocabulary || [];
       const visualData = getSafeData(state.visualResult);
       
       let slides = [];
       if (state.outputScript) {
         const parsedScript = getSafeData(state.outputScript);
         slides = Array.isArray(parsedScript) ? parsedScript : (parsedScript.slides || []);
       }

       const guideStr = generateNotebookLMGuide(castingData, vocab, state.analysisData, visualData, slides);
       dispatch({ type: 'SET_OUTPUTS', payload: { outputNotebookLMGuide: guideStr } });
       return;
    }

    isProcessing.current = true;
    const moduleMap: Record<string, { prompt: string, status: string, stateKey: string }> = {
      worksheet: { prompt: PROMPT_GENERATE_WORKSHEET, status: '正在生成素養學習單...', stateKey: 'outputWorksheet' },
      assessment: { prompt: PROMPT_GENERATE_ASSESSMENT, status: '正在生成複習講義...', stateKey: 'outputAssessment' },
      kb: { prompt: PROMPT_GENERATE_KB, status: '正在生成知識庫資料...', stateKey: 'outputKb' },
      gamified: { prompt: PROMPT_GENERATE_GAMIFIED_QUIZ, status: '正在生成遊戲化測驗...', stateKey: 'outputGamifiedQuiz' },
      interactive: { prompt: PROMPT_GENERATE_INTERACTIVE_QUIZ, status: '正在生成互動式測驗...', stateKey: 'outputInteractiveQuiz' }
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
    handleRegenerateSingleSlide,
    handleBack: () => dispatch({ type: 'SET_STEP', payload: AppStep.STEP_5_CASTING }) 
  };
};