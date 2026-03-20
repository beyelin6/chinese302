// 檔案路徑: src/hooks/steps/useStep4VisualsAndCasting.ts

import { useWorkflowContext } from '../../context/WorkflowContext';
import { AppStep, MediaData } from '../../types';
import { sendMessageToGemini } from '../../services/gemini';
import { sanitizeAndParseJSON } from '../../utils/jsonParser';

// 確保這些 Prompt 已在 constants.ts 中定義
import { 
  SYSTEM_PROMPT,
  STEP_3_CASTING_PROMPT_PREFIX as STEP_4_CASTING_PROMPT_PREFIX,
  EXTRACT_IMAGE_TRAITS_PROMPT,
  GUIDE_TEACHING_STYLE_SUGGESTION_PROMPT,
  STEP_3_VISUAL_GENERIC_PROMPT,
  STEP_4_DYNAMIC_CASTING_PROMPT,
  // 🌟 建議在 constants.ts 將此 Prompt 改名或確保其包含 {AGE} 標籤
  PROTAGONIST_TRAITS_SUGGESTION_PROMPT 
} from '../../constants';

export const useStep4VisualsAndCasting = () => {
  const { state, dispatch } = useWorkflowContext();
  
  /**
   * 0. [新增] 動態視覺錨定 (Dynamic Visual Anchoring)
   * 從原始文本中掃描視覺 DNA
   */
  const handleGenerateVisualOptions = async () => {
    console.log("Generating Visual Options...", { currentStep: state.currentStep, visualResult: state.visualResult });
    // 核心：抓取最初上傳的 rawText (最精準的資料來源)
    const sourceText = state.analysisData?.fullText || state.basicAnalysisResult; 

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_LOADING_STATUS', payload: '正在掃描本課專屬視覺 DNA...' });

    try {
      // 這裡的 prompt 是通用的，它會根據 sourceText 的不同，產出不同的視覺結果
      const prompt = STEP_3_VISUAL_GENERIC_PROMPT.replace('{INPUT_TEXT}', sourceText);
      
      const response = await sendMessageToGemini(prompt, [], 0, { temperature: 0.1 });
      const parsed = sanitizeAndParseJSON(response);

      dispatch({ type: 'SET_VISUAL_RESULT', payload: JSON.stringify(parsed) });
    } catch (error: any) {
      console.error("視覺掃描失敗", error);
      dispatch({ type: 'SET_ERROR', payload: '視覺掃描失敗：' + error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_LOADING_STATUS', payload: null });
    }
  };

  /**
   * 1. 確認視覺風格設定，準備進入選角
   */
  const handleStep3Confirm = async (style: any, metaphor: any) => {
    if (!state.deepSegmentsResult) {
      dispatch({ type: 'SET_ERROR', payload: '系統錯誤：遺失段落資料。' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_LOADING_STATUS', payload: '正在為您尋找適合的引導角色...' });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const visualCombination = { style, metaphor };
      dispatch({ type: 'SET_VISUAL_RESULT', payload: JSON.stringify(visualCombination) });

      // 🌟 [重構] 執行「靈魂選角」動態生成
      await handleGenerateCastingOptions();
      
      dispatch({ type: 'SET_STEP', payload: AppStep.STEP_5_CASTING });

    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: '視覺設定儲存失敗: ' + error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_LOADING_STATUS', payload: null });
    }
  };

  /**
   * 🌟 [新增] 執行「靈魂選角」動態生成
   */
  const handleGenerateCastingOptions = async () => {
    // 🌟 優化：多重備援抓取課文原文
    const sourceText = state.analysisData?.fullText || state.basicAnalysisResult || "";

    if (!sourceText || sourceText.length < 10) {
      console.error("找不到課文原文，無法執行選角分析");
      dispatch({ type: 'SET_ERROR', payload: '系統遺失課文原文，請嘗試返回第一步重新上傳。' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_LOADING_STATUS', payload: '正在根據課文靈魂，尋找最適合的引導者...' });

    try {
      const prompt = `
        ${SYSTEM_PROMPT}
        [任務目標]：執行 v9.0 視覺邏輯矩陣判定。
        [課文原文]：${sourceText}
        
        ${STEP_4_DYNAMIC_CASTING_PROMPT}
      `;

      const response = await sendMessageToGemini(prompt, [], 0);
      const castingOptions = sanitizeAndParseJSON(response);
      
      // 檢查回傳結構是否完整
      if (!castingOptions || !castingOptions.candidates) {
        throw new Error("AI 回傳的資料結構不完整");
      }

      dispatch({ type: 'SET_CASTING_RESULT', payload: JSON.stringify(castingOptions) });
    } catch (error: any) {
      console.error("Casting Analysis Error:", error);
      dispatch({ type: 'SET_ERROR', payload: '選角分析失敗：' + error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_LOADING_STATUS', payload: null });
    }
  };

  /**
   * 2. 🌟 [核心修改] 根據 性別、年齡 與 語氣 重新構思角色特徵
   */
  const handleSuggestTraits = async (gender: string, age: string, toneLabel: string): Promise<string> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_LOADING_STATUS', payload: `AI 正在構思一位 ${age} 的引導者...` });
    
    try {
      // 🛡️ 在 Prompt 中注入年齡與性別參數
      const prompt = PROTAGONIST_TRAITS_SUGGESTION_PROMPT
        .replace('{GENDER}', gender)
        .replace('{AGE}', age) // 🌟 新增年齡替換邏輯
        .replace('{TONE_LABEL}', toneLabel);
      
      const response = await sendMessageToGemini(prompt, [], 0);
      return response.trim();
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: '生成角色特徵建議失敗: ' + error.message });
      return "";
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_LOADING_STATUS', payload: null });
    }
  };

  /**
   * 3. 🌟 [新增] 根據 性別、年齡 與 語氣 重新構思教學風格與對白
   */
  const handleSuggestTeachingStyle = async (gender: string, age: string, toneLabel: string): Promise<string> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_LOADING_STATUS', payload: `AI 正在為 ${toneLabel} 風格構思對白...` });
    
    try {
      const prompt = GUIDE_TEACHING_STYLE_SUGGESTION_PROMPT
        .replace('{GENDER}', gender)
        .replace('{AGE}', age)
        .replace('{TONE_LABEL}', toneLabel);
      
      const response = await sendMessageToGemini(prompt, [], 0);
      return response.trim();
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: '生成教學風格建議失敗: ' + error.message });
      return "";
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_LOADING_STATUS', payload: null });
    }
  };

  /**
   * 4. 多模態視覺萃取：從圖片抓取角色視覺 DNA
   */
  // 🌟 [新增] 圖片視覺特徵反推引擎
  const handleExtractImageTraits = async (media: MediaData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_LOADING_STATUS', payload: '👁️ 正在啟動視覺神經網路，解析角色特徵...' });
    
    try {
      // 這是發送給 Gemini 的咒語，確保你的 constants.ts 裡有 EXTRACT_IMAGE_TRAITS_PROMPT
      const prompt = EXTRACT_IMAGE_TRAITS_PROMPT || `
        請以「外觀描述專家」的角度，仔細觀察這張圖片中的角色/物件。
        請用一句話（約 30-50 字）精準描述其「外型、穿著、神態、代表性配件」。
        例如：「一位穿著白色實驗袍、戴著圓框眼鏡、手持發光試管的銀髮學者，眼神銳利且充滿自信。」
        只需回傳描述文字，不要有任何多餘的開頭或結尾。
      `;
      
      const response = await sendMessageToGemini(prompt, [media], 0);
      return response.trim();
    } catch (error: any) {
      console.error("圖片解析失敗", error);
      dispatch({ type: 'SET_ERROR', payload: '圖片解析失敗：' + error.message });
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_LOADING_STATUS', payload: null });
    }
  };

  /**
   * 5. 🌟 [強化邏輯] 最終確認選角
   * 將性別與年齡完整打包進 guide 物件，確保 Step 6 的腳本能讀取到
   */
  const handleStep4Confirm = (protagonistTraits: string, guide: any, customGuideVisuals?: string) => {
    // 封裝引導者的完整人設資料
    const finalGuide = {
      ...guide,
      // 這裡確保 gender 和 age 已經在 UI 層級被更新到 guide 物件中
      visualDNA: customGuideVisuals || '使用預設視覺設定'
    };
    
    const castingData = { 
        protagonist: protagonistTraits, 
        guide: finalGuide 
    };

    // 存入 Context 並推進至產出階段 (STEP_6_OUTPUT)
    dispatch({ type: 'SET_CASTING_RESULT', payload: JSON.stringify(castingData) });
    dispatch({ type: 'SET_STEP', payload: AppStep.STEP_6_OUTPUT });
    
    console.log("[Casting System] ✅ 人設封裝完成：", {
      gender: finalGuide.gender,
      age: finalGuide.age,
      tone: finalGuide.toneLabel
    });
  };

  return {
    handleGenerateVisualOptions,
    handleGenerateCastingOptions,
    handleStep3Confirm,
    handleStep4Confirm,
    handleSuggestTraits,
    handleSuggestTeachingStyle,
    handleExtractImageTraits
  };
};