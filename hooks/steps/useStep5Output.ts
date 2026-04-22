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
   * 🌟 [究極武裝版] 融合 Strict Transcription Mode 的 YAML 標頭
   */
  const wrapScriptWithYAML = (slides: any[], data: any) => {
    const { analysisData, visualDNA, casting } = data;
    
    // 1. 深度萃取視覺風格
    const styleCode = visualDNA?.style?.code || "F";
    const styleDesc = visualDNA?.style?.description || visualDNA?.style?.prompt || "Clean, high-quality educational vector art.";

    // 2. 萃取角色 DNA 與判斷外部圖片模式
    const guideName = casting?.guide?.name || "V-MAX 導師";
    const unitName = analysisData?.basicInfo?.unitName || "未命名課程";
    const hasExternalImage = casting?.useRefMode === true;
    
    // 🌟 這裡就是魔法：把引導角色變成指定的 IP，並精準分離「長相」與「動作」
    const ipInstruction = hasExternalImage
      ? `1. 專屬人物 IP 植入與動態演繹 (CRITICAL)：
   - 【外貌鎖定】：必須在每張簡報適當的畫面處，加上引導者【${guideName}】。其長相、服裝與特徵請【絕對參考】一併上傳的「外部角色設計圖檔案」。
   - 【動作解鎖】：參考圖【僅限於鎖定長相】！你必須嚴格讀取腳本中每一頁的 'guideAction' (動作) 與 'guideTalk' (情緒)，讓角色做出對應的「生動表情與肢體動作」（例如：驚訝、思考、指著黑板、大笑）。絕對禁止每一頁都畫出跟參考圖一模一樣的死板姿勢！`
      : `1. 專屬人物 IP 植入：必須在每張簡報適當的畫面處，加上引導者【${guideName}】。視覺設定：${casting?.guide?.visualDNA || '使用預設視覺設定'}`;

    // 3. 組合高階 System Instructions (融合高級防禦指令)
    const systemInstructions = `[⚠️ SYSTEM META - STRICT TRANSCRIPTION MODE & DESIGN SYSTEM]
【NotebookLM 簡報生成絕對守則】
${ipInstruction}
2. 頁數與結構鐵律：必須嚴格依照 'slides' 陣列的長度製作，嚴禁自行增減頁數、合併頁面或省略任何內容。
3. 內容忠實性 (CRITICAL)：'displayText' 內的文字為核心文案，您必須「100% 逐字照抄」。絕對禁止縮寫、改寫、潤飾或發揮創意。
4. 視覺美學絕對禁令 (Negative Prompts)：為確保現代高級感，生成設計時絕對禁止使用「漸層(Gradient)」、「發光(Glow)」、「立體浮雕(Bevel)」。禁止高飽和度純色與純黑(#000000)。所有文字方塊邊緣必須保持至少 20% 的呼吸留白。
5. 佈局與邏輯視覺化：請嚴格遵守各頁的 'layout' (版面) 與 'lens' (鏡頭) 指示。若遇到形近字或多音字辨析，強制使用「多欄卡片式網格 (Multi-column Card Grid)」或高對比色塊進行水平分割排版。
6. 導師對白強制顯影：'guideTalk' 的內容必須以「對話框 (Speech Bubble)」或「引述框」的形式，直接視覺化渲染在投影片畫面上！
7. 絕對無字化生圖：'visual_prompt' 生成的畫面背景中，絕對不可出現任何亂碼、英文或中文字元。`;

    // 4. 絕對頁碼注入器
    const numberedSlides = slides.map((slide, index) => {
      const { page_number, ...restProps } = slide; 
      return { page_number: index + 1, ...restProps };
    });

    // 5. 輸出符合高級規範的 Payload (捨棄舊的 notebooklm_driver)
    const unifiedPayload = {
      presentation_data: {
        suggested_filename: `${unitName}_VMAX_教案腳本`,
        system_instructions: systemInstructions,
        artistic_consistency: `Artistic VIS [${styleCode}]: ${styleDesc}`,
        slides: numberedSlides
      }
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
        ...languageActivities.map((act: any) => ({ part: 'PART D', type: 'LanguageActivity', title: `語文活動：${act.title}`, content: act.content, example: act.example })),
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

        const response = await sendMessageToGemini(prompt, [], 0, { responseMimeType: "application/json" });
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

    const response = await sendMessageToGemini(prompt, [], 0, { responseMimeType: "application/json" });
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
      if (!state.analysisData) {
        throw new Error('分析資料尚未準備就緒');
      }

      const context = {
        basicInfo: state.analysisData.basicInfo,
        coreVocabulary: state.analysisData.coreVocabulary,
        segments: state.analysisData.segments,
        strategies: state.analysisData.strategies,
        languageActivities: state.analysisData.languageActivities || [],
        macroStructure: state.analysisData.macroStructure || "N1 故事山",
        fullText: (state.analysisData.fullText || "").substring(0, 3000)
      };

      const prompt = `
        ${SYSTEM_PROMPT}
        
        # 任務：${config.prompt}
        
        # 參考數據 (JSON)：
        ${JSON.stringify(context, null, 2)}
      `;

      const isJson = moduleKey === 'interactive';
      const response = await sendMessageToGemini(prompt, [], 0, isJson ? { responseMimeType: "application/json" } : {});
      
      let finalResponse = response;
      if (isJson) {
        // 確保 JSON 格式正確
        try {
          const parsed = sanitizeAndParseJSON(response);
          finalResponse = JSON.stringify(parsed);
        } catch (e) {
          console.error("JSON 格式化失敗", e);
        }
      }
      
      dispatch({ type: 'SET_OUTPUTS', payload: { [config.stateKey]: finalResponse } });
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