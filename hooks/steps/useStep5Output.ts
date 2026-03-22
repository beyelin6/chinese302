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

    // 2. 深度萃取角色 DNA
    const protagDNA = casting?.protagonist || "符合課文情境的核心人物，保持清晰的臉部特徵與連貫的服裝設定。";
    const guideName = casting?.guide?.name || "V-MAX 導師";
    const guidePersona = casting?.guide?.persona || "專業、溫暖、具啟發性";
    
    let guideDNA = casting?.guide?.visualDNA || "";
    if (!guideDNA || guideDNA.includes("預設")) {
        guideDNA = "身穿俐落的現代教學套裝，帶著親切且自信的微笑，常以手勢指示畫面的重點。";
    }

    // 3. 🌟 [新增] 絕對頁碼注入器
    const numberedSlides = slides.map((slide, index) => {
      const { page_number, ...restProps } = slide; 
      return {
        page_number: index + 1,
        ...restProps
      };
    });

    const unifiedPayload = {
      notebooklm_driver: {
        system_role: "You are the V-MAX Slide Architect. Your absolute priority is to strictly follow the VMAX_STRUCTURE_YAML protocols and the dynamic slide blueprints.",
        artistic_consistency: styleCode,
        style_prompt: `Artistic VIS [${styleCode}]: ${styleDesc}. (CRITICAL: Maintain absolute stylistic consistency across all slides.)`,
        dna_traits: {
          protagonist: protagDNA,
          guide: `[Name: ${guideName}] | [Persona: ${guidePersona}] | [Visual Prompt: ${guideDNA}]`
        }
      },
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

      // 1. 🌟 [精準對位藍圖] 建立分段藍圖 (加入 QuizCard 新版型邏輯)
      const blueprint = [
        { part: 'PART A', type: 'Cover', title: '封面' },
        { part: 'PART A', type: 'MissionNav', title: '任務導覽' },
        { 
          part: 'PART A', 
          type: 'FusionMap', 
          title: '結構視圖',
          quickGrasp: segments.map((s: any, idx: number) => ({
            label: `段落 ${idx + 1}`,
            keywords: s.keywords?.slice(0, 4).join('、') || "重點萃取中"
          })),
          macroStructure: analysisData?.visualStructureRecommendation,
          visualMetaphor: visualData?.metaphor?.label
        },
        
        ...segments.flatMap((s: any, idx: number) => {
          const chunk = [{ part: 'PART B', type: 'ContentFocus', title: `段落 ${idx+1}: 內容對焦`, segment: s }];
          
          const hasDeepDive = s.difficultWords?.length > 0 || s.rhetorics?.length > 0 || s.sentencePatterns?.length > 0;
          const hasQuiz = s.readingQuestions?.length > 0 || s.dokQuestions?.length > 0 || s.questions?.length > 0;

          if (hasDeepDive) {
            chunk.push({ part: 'PART B', type: 'DeepDive', title: `段落 ${idx+1}: 深究特寫`, segment: { difficultWords: s.difficultWords, rhetorics: s.rhetorics, sentencePatterns: s.sentencePatterns } });
          }
          
          if (hasQuiz) {
            chunk.push({ part: 'PART B', type: 'QuizCard', title: `段落 ${idx+1}: 閱讀小挑戰`, segment: { readingQuestions: s.readingQuestions, dokQuestions: s.dokQuestions, questions: s.questions } });
          }
          return chunk;
        }),
        
        ...vocabulary.flatMap((v: any) => {
          const coreVocabList = analysisData?.coreVocabulary || [];
          const uiFlags = coreVocabList.find((cv: any) => cv.word === v.word) || {};

          if (uiFlags.isSelected === false) return [];
          
          const vocabSlides = [];
          const wantWriting = uiFlags.wantsWritingTips || uiFlags.isWritingTipsSelected;
          const wantShape = uiFlags.wantsShapeSimilar || uiFlags.isShapeSimilarSelected;
          const wantPoly = uiFlags.wantsPolyphonic || uiFlags.isPolyphonicSelected;

          if (wantWriting) {
            vocabSlides.push({ 
              part: 'PART C', type: 'VocabLoop', title: `生字辨析：${v.word}`, 
              word: String(v.word), writingTips: uiFlags.writingTips || "請注意字形比例與重心。" 
            });
          }
          if (wantShape && v.shapeSimilar && v.shapeSimilar.length > 0) {
            vocabSlides.push({ 
              part: 'PART C', type: 'ShapeSimilar', title: `形近辨析：${v.word}`, 
              details: JSON.stringify(v.shapeSimilar), mnemonic: v.mnemonic || uiFlags.mnemonic 
            });
          }
          if (wantPoly && v.polyphonic && v.polyphonic.length > 0) {
            vocabSlides.push({ 
              part: 'PART C', type: 'Polyphonic', title: `多音字辨析：${v.word}`, 
              details: JSON.stringify(v.polyphonic) 
            });
          }
          
          return vocabSlides;
        }),
        
        ...idioms.map((i: any) => ({ part: 'PART C', type: 'IdiomLoop', title: `成語解析：${i.word}`, idiom: i })),
        { part: 'PART C', type: 'Assessment', title: '全課綜合評量' },
        
        ...languageActivities.map((act: any) => ({ part: 'PART D', type: 'LanguageActivity', title: `語文活動：${act.title}`, content: act.content })),
        ...strategies.map((st: any) => ({ part: 'PART D', type: 'Strategy', title: `教學策略：${st.title}`, strategy: st })),
        
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
          
          # 🚨 [CRITICAL] 視覺版面與鏡頭分配法則 (Layout & Lens Protocol)
          你必須嚴格根據投影片的 \`type\`，在 JSON 中強制輸出對應的 \`layout\` 與 \`lens\` 屬性。請絕對遵守以下 1:1 映射表：
          - [ContentFocus] => layout: "wide-scene", lens: "廣角 (Exhale)"
          - [DeepDive] => layout: "close-tool", lens: "特寫 (Inhale)"
          - [QuizCard] => layout: "quiz-card", lens: "單圖資訊板 (Single Info Board)"
          - [ShapeSimilar] => lens: "左右分割對比大字排版 (Split Screen, Large Text)"。layout請判斷: 若為2字組用 "split-2", 3字組用 "grid-3", 4字組用 "grid-4"。
          - [Polyphonic] => lens: "天平對比大字排版 (Balance Screen, Large Text)"。layout請判斷: 若為2讀音用 "compare-scale", 3讀音用 "triptych"。
          - [IdiomLoop] => layout: "story-panel", lens: "單一滿版大圖配大字 (Single Full Image, Huge Text Overlay)"
          - [LanguageActivity] => layout: "pattern-drill" 或 "punctuation-chart" 或 "phrase-demo", lens: "單圖大字互動舞台 (Single Image, Large Text)"
          - [Strategy] => layout: "info-flow" 或 "step-flow", lens: "單圖大字百寶箱 (Single Box Focus, Large Text)"
          - 其他 (Cover/Ending/MissionNav/Assessment) => 請自行判斷最適合的單圖或廣角版型。

          # 頁面特定邏輯說明：
          - 若遇到 [FusionMap]：必須利用 quickGrasp 清單，關鍵詞標籤精確對應段落。
          - 若遇到 [QuizCard]：請將題目分裝為【提取】(藍色標籤) 與【推論】(琥珀色標籤) 格式。
          
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
    const CHUNK_SIZE = 15; // 🌟 決定每一批要塞幾頁 (目前設定 15 頁)

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

    return PROMPT_GENERATE_NOTEBOOKLM_GUIDE
      .replace(/{KERNEL_VERSION}/g, "v59.3-DNA-Purity")
      .replace(/{GRADE}/g, grade)
      .replace(/{UNIT_NAME}/g, unitName)
      .replace(/{GUIDE_NAME}/g, guide.name || '導師')
      .replace(/{GUIDE_PERSONA}/g, guide.persona || '專業')
      .replace(/{VISUAL_STYLE}/g, visualData?.style?.name || '預設')
      .replace(/{DATE}/g, today)
      .replace(/{GUIDE_DNA}/g, guide.visualDNA || "")
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
