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
  PROTAGONIST_TRAITS_SUGGESTION_PROMPT,
  PROMPT_GENERATE_CHARACTER_DNA_FOR_EXTERNAL 
} from '../../constants';

export const useStep4VisualsAndCasting = () => {
  const { state, dispatch } = useWorkflowContext();
  
  /**
   * 0. [核心修正] 動態視覺錨定 (Dynamic Visual Anchoring)
   * 確保結構視圖推薦 100% 產出並對位
   */
  const handleGenerateVisualOptions = async () => {
    // 1. 確保 sourceText 是字串
    const rawSource = state.analysisData?.fullText || state.basicAnalysisResult; 
    const sourceText = typeof rawSource === 'string' ? rawSource : JSON.stringify(rawSource);

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_LOADING_STATUS', payload: '正在掃描本課專屬視覺 DNA，生成結構隱喻推薦...' });

    try {
      // 2. 注入格式指令，鎖死 JSON Schema
      const prompt = `
        ${STEP_3_VISUAL_GENERIC_PROMPT.replace('{INPUT_TEXT}', sourceText)}
        
        🚨 [強制輸出規範]
        請務必回傳包含 "recommendations" 陣列的 JSON 物件。
        每個 recommendations 項目必須包含 "metaphor" 物件，物件內須有 code, name, description。
      `;
      
      const response = await sendMessageToGemini(prompt, [], 0, { 
        temperature: 0.3, 
        responseMimeType: "application/json" 
      });
      
      let parsed = sanitizeAndParseJSON(response);

      // 🌟 [核彈級防呆] 自動格式對位器
      // 無論 AI 吐出什麼 Key，我們都強行轉回 UI 需要的 "recommendations"
      let normalizedData = { recommendations: [] as any[] };

      if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
        normalizedData.recommendations = parsed.recommendations;
      } else if (parsed.metaphors && Array.isArray(parsed.metaphors)) {
        // AI 常犯錯誤：把 recommendations 寫成 metaphors
        normalizedData.recommendations = parsed.metaphors.map((m: any) => ({ metaphor: m }));
      } else if (Array.isArray(parsed)) {
        // AI 常犯錯誤：直接回傳一個陣列
        normalizedData.recommendations = parsed.map((item: any) => item.metaphor ? item : { metaphor: item });
      }

      // 🛡️ [保底機制] 如果 AI 徹底漏掉，給予一組萬用隱喻，防止 UI 卡死
      if (normalizedData.recommendations.length === 0) {
        normalizedData.recommendations = [
          { metaphor: { code: "S1", name: "故事山", description: "適合分析本文情節發展。" } },
          { metaphor: { code: "S2", name: "五感雷達", description: "適合歸納本文感官描寫。" } }
        ];
      }

      // 🌟 [修正 Action Type]：將 SET_visual_result 改為全大寫的 SET_VISUAL_RESULT
      dispatch({ type: 'SET_VISUAL_RESULT', payload: JSON.stringify(normalizedData) });

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
  const handleVisualsConfirm = async (style: any, metaphor: any) => {
    // 優先讀取既有的 visualResult，確保合併而非覆蓋
    let currentVisual = {};
    try {
      currentVisual = typeof state.visualResult === 'string' ? JSON.parse(state.visualResult) : (state.visualResult || {});
    } catch (e) {
      currentVisual = {};
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_LOADING_STATUS', payload: '正在為您尋找適合的引導角色...' });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const visualCombination = { ...currentVisual, style, metaphor };
      // 🌟 [修正 Action Type]
      dispatch({ type: 'SET_VISUAL_RESULT', payload: JSON.stringify(visualCombination) });

      await handleGenerateCastingOptions(visualCombination);
      dispatch({ type: 'SET_STEP', payload: AppStep.STEP_5_CASTING });

    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: '視覺設定儲存失敗: ' + error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_LOADING_STATUS', payload: null });
    }
  };

  /**
   * 🌟 執行「靈魂選角」動態生成
   */
  const handleGenerateCastingOptions = async (passedVisualData?: any) => {
    const rawSource = state.analysisData?.fullText || state.basicAnalysisResult || "";
    const sourceText = typeof rawSource === 'string' ? rawSource : JSON.stringify(rawSource);

    const visualData = passedVisualData || (typeof state.visualResult === 'string' ? JSON.parse(state.visualResult) : state.visualResult);
    const styleName = visualData?.style?.name || '未指定風格';
    const styleDesc = visualData?.style?.description || '';

    if (!sourceText || sourceText.length < 10) {
      dispatch({ type: 'SET_ERROR', payload: '系統遺失課文原文，請嘗試返回第一步重新上傳。' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_LOADING_STATUS', payload: '正在根據課文靈魂與視覺風格，量身打造專屬引導者...' });

    try {
      const prompt = `
        ${SYSTEM_PROMPT}
        [任務目標]：執行 V-MAX v59.0 萬用選角矩陣 (DNA & Purity Kernel)。
        【老師已選定的全域視覺風格】：${styleName} (${styleDesc})
        【課文原文參考】：${sourceText.substring(0, 2500)}
        
        ${STEP_4_DYNAMIC_CASTING_PROMPT}
      `;

      const response = await sendMessageToGemini(prompt, [], 0, { 
        temperature: 0.5, // 稍微降低溫度以增加穩定性
        responseMimeType: "application/json" 
      });
      
      const parsed = sanitizeAndParseJSON(response);
      
      // 🌟 [DNA 結構對位] 智慧搜尋候選人清單
      const rawCandidates = parsed?.candidates || parsed?.options || parsed?.choices || parsed?.guides || [];
      const normalizedCandidates = Array.isArray(rawCandidates) ? rawCandidates.map((c: any, index: number) => ({
        id: c.id || `C${index + 1}`,
        name: c.name || (c.persona === 'G1' ? "溫柔老師" : c.persona === 'G2' ? "偵探導師" : "引導者"),
        persona: c.persona || `G${(index % 6) + 1}`,
        description: c.description || "具備領航精神的專業導師。",
        visualDNA: c.visualDNA || "Full-body shot, isolated on pure white background, no shadows"
      })) : [];

      // 🎭 [模式自動校正] 根據主角是否存在自動轉換
      let detectedMode = parsed?.mode || "Field Trip Mode";
      let protagonist = parsed?.protagonist || { name: "None", description: "無明確主角", visualDNA: "", isNone: true };
      
      if (protagonist.isNone === false && !protagonist.name) {
         // 有時候 AI 忘了寫名字但覺得有主角
         protagonist.name = "故事主角";
      }

      if (protagonist.isNone) {
        detectedMode = "Field Trip Mode";
      } else if (detectedMode === "Field Trip Mode" && !protagonist.isNone) {
        detectedMode = "Drama Mode";
      }

      let castingOptions = {
        mode: detectedMode,
        protagonist: protagonist,
        candidates: normalizedCandidates
      };
      
      // 🛡️ [核彈級保底] 如果候選人數量不足，給予預設角色避免卡死
      if (castingOptions.candidates.length === 0) {
        console.warn("AI didn't produce candidates, using emergency fallbacks.");
        castingOptions.candidates = [
          { id: "C1", name: "智慧博士", persona: "G3", description: "以科學視角解析課文。", visualDNA: "Gender: Male | Age: 50 | Hair: Grey | Full-body shot, isolated on pure white background, no shadows" },
          { id: "C2", name: "靈感精靈", persona: "G4", description: "激發創意想像力。", visualDNA: "Gender: Female | Age: 20 | Hair: Blue | Full-body shot, isolated on pure white background, no shadows" },
          { id: "C3", name: "熱血教練", persona: "G6", description: "帶領高強度學習挑戰。", visualDNA: "Gender: Male | Age: 30 | Hair: Black | Full-body shot, isolated on pure white background, no shadows" }
        ];
      }

      dispatch({ type: 'SET_CASTING_RESULT', payload: JSON.stringify(castingOptions) });
    } catch (error: any) {
      console.error("Casting Analysis Error:", error);
      dispatch({ type: 'SET_ERROR', payload: error.message || '選角分析失敗' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_LOADING_STATUS', payload: null });
    }
  };

  /**
   * 2. 生成角色特徵建議
   */
  const handleSuggestTraits = async (gender: string, age: string, toneLabel: string): Promise<string> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_LOADING_STATUS', payload: `AI 正在構思一位 ${age} 的引導者...` });
    
    try {
      const prompt = PROTAGONIST_TRAITS_SUGGESTION_PROMPT
        .replace('{GENDER}', gender)
        .replace('{AGE}', age) 
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
   * 3. 生成教學風格建議
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
   * 4. 圖片視覺特徵反推
   */
  const handleExtractImageTraits = async (media: MediaData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_LOADING_STATUS', payload: '👁️ 正在解析圖片角色特徵...' });
    
    try {
      const prompt = EXTRACT_IMAGE_TRAITS_PROMPT || `請精準描述圖片中角色的外型、穿著與神態。`;
      const response = await sendMessageToGemini(prompt, [media], 0);
      return response.trim();
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: '圖片解析失敗：' + error.message });
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_LOADING_STATUS', payload: null });
    }
  };

  /**
   * 5. 最終確認選角
   */
  const handleCastingConfirm = (protagonistTraits: string, guide: any, customGuideVisuals?: string) => {
    const finalGuide = {
      ...guide,
      visualDNA: customGuideVisuals || '使用預設視覺設定'
    };
    
    const castingData = { 
        protagonist: protagonistTraits, 
        guide: finalGuide 
    };

    dispatch({ type: 'SET_CASTING_RESULT', payload: JSON.stringify(castingData) });
    dispatch({ type: 'SET_STEP', payload: AppStep.STEP_6_OUTPUT });
  };

  /**
   * 6. 生成給外部 AI 的英文提示詞
   */
  const handleGenerateExternalDnaPrompt = async (guideName: string, persona: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_LOADING_STATUS', payload: '正在撰寫專屬英文提示詞...' });
    
    try {
      const visualData = typeof state.visualResult === 'string' ? JSON.parse(state.visualResult) : state.visualResult;
      const styleName = visualData?.style?.name || 'Clean vector art';

      const prompt = PROMPT_GENERATE_CHARACTER_DNA_FOR_EXTERNAL
        .replace('{STYLE}', styleName)
        .replace('{PERSONA}', persona)
        .replace('{GUIDE_NAME}', guideName);
        
      const response = await sendMessageToGemini(prompt, [], 0);
      return response.replace(/```/g, '').trim();
    } catch (error: any) {
      return "生成失敗，請確認網路連線。";
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_LOADING_STATUS', payload: null });
    }
  };

  return {
    handleGenerateVisualOptions,
    handleGenerateCastingOptions,
    handleVisualsConfirm,
    handleCastingConfirm,
    handleSuggestTraits,
    handleSuggestTeachingStyle,
    handleExtractImageTraits,
    handleGenerateExternalDnaPrompt
  };
};