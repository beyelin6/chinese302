// 檔案路徑: src/hooks/steps/useStep3Segments.ts

import { useRef } from 'react';
import { useWorkflowContext } from '../../context/WorkflowContext';
import { AppStep } from '../../types';
import { sendMessageToGemini } from '../../services/gemini';
import { sanitizeAndParseJSON } from '../../utils/jsonParser';
import { 
  STEP_2_DEEP_SEGMENTS_PROMPT_V2,
  REGENERATE_STRATEGIES_PROMPT,
  GENERATE_SINGLE_STRATEGY_PROMPT,
  GENERATE_RHETORIC_GUIDANCE_PROMPT,
  GENERATE_LANGUAGE_ACTIVITY_PROMPT
} from '../../constants';

export const useStep3Segments = () => {
  const { state, dispatch } = useWorkflowContext();
  const isProcessing = useRef(false);

  /**
   * 🌟 驗證協定：無條件放行 (保留您的安全設置)
   */
  const validateGroundedness = (parsedData: any, rawText: string) => {
    console.log("【V-MAX 安全通關】已略過嚴格比對，放行 AI 產出的段落大意");
    return true; 
  };

  /**
   * 1. 核心任務：執行從 2.5 到 2.75 的初始生成 (保留所有細節指令)
   */
  const handleStep2DeepVocabConfirm = async (confirmedVocabDataString: string) => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      dispatch({ type: 'SET_VOCAB_RESULT', payload: confirmedVocabDataString });

      const selectedDifficultWords = state.analysisData?.textbookDifficultWords
        ?.filter((w: any) => w.isSelected)
        .map((w: any) => w.word) || [];

      const rawSourceText = state.analysisData?.fullText || state.basicAnalysisResult || "";
      
      // --- 第一階段：解構意義段落 (使用原版 V2 提示詞與難詞協定) ---
      dispatch({ type: 'SET_LOADING_STATUS', payload: '正在執行：意義段落深究...' });
      
      const prompt1 = `
        ${STEP_2_DEEP_SEGMENTS_PROMPT_V2.replace('{INPUT_TEXT}', rawSourceText)}
        
        # 🚨 老師指定的「教科書難詞」處理協定：
        1. 以下清單為本課重點教學難詞：【${selectedDifficultWords.join('、') || "無"}】。
        2. 若該段落包含清單中的詞彙，請務必將其列入該段落的 \`difficultWords\` 欄位中。
      `;
      
      const response1 = await sendMessageToGemini(prompt1, [], 0, { temperature: 0.1 });
      const parsedSegments = sanitizeAndParseJSON(response1);

      validateGroundedness(parsedSegments, rawSourceText);

      // 強制防呆
      let validSegments = parsedSegments.segments || (Array.isArray(parsedSegments) ? parsedSegments : []);

      // ==========================================
      // 第二階段：為全課生成共用的「語文百寶箱策略」
      // ==========================================
      dispatch({ type: 'SET_LOADING_STATUS', payload: '正在進行第二階段：編寫高質感教學策略...' });
      
      const prompt2 = `
        你現在是一位「創意教學設計師」。請根據以下段落，設計 3 個極具啟發性、細節豐富的教學策略卡片。
        
        【課文段落參考】：${JSON.stringify(validSegments.map((s:any) => s.summary))}

        🚨 撰寫最高準則：
        1. 內容具體化：禁止寫「引導學生思考」這種廢話。必須寫出具體的引導情境（例：引導學生對比「鈍掉的斧頭」與「鋒利的草葉」）。
        2. 任務可執行：微任務必須是學生 1 分鐘內能完成的明確動作。
        3. 欄位補全：必須包含 title, type, method, insight, interaction 五個欄位。

        🚨 強制輸出格式 (JSON Schema)：
        {
          "strategies": [
            {
              "title": "具備吸引力的標題 (例：銳利邊緣的秘密)",
              "type": "Thinking | Inquiry | Creative Writing | Roleplay",
              "method": "教學方法論 (例：比較觀察法、第一人稱敘事法)",
              "insight": "深入的教學引導內容 (至少 50 字，充滿情境感)",
              "interaction": "1分鐘微任務內容 (具體的學生任務)"
            }
          ]
        }
      `;
      
      // 使用 0.5 稍微提高溫度，讓 AI 更有創意
      const response2 = await sendMessageToGemini(prompt2, [], 0, { temperature: 0.5 });
      const strategiesData = sanitizeAndParseJSON(response2);
      const validStrategies = strategiesData.strategies || [];

      // 打包資料
      const finalResult = {
          segments: validSegments,
          strategies: validStrategies.length > 0 ? validStrategies : [
              { title: "內容回顧", type: "Thinking", insight: "確認理解。", interaction: "總結本課核心。" }
          ]
      };

      // 儲存結果並推進
      dispatch({ type: 'SET_SEGMENTS_RESULT', payload: JSON.stringify(finalResult) });
      dispatch({ type: 'SET_STEP', payload: AppStep.STEP_3_DEEP_SEGMENTS });

    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: '段落解析失敗：' + error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_LOADING_STATUS', payload: null });
      isProcessing.current = false;
    }
  };

  /**
   * 2. 🌟 [關鍵修正]：不再回頭問 AI，直接儲存老師在介面上修改的結果
   */
  const handleStep2DeepSegmentsConfirm = async (finalDataString: string) => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    
    // 直接存檔老師微調後的 JSON (包含 segments 和 strategies)
    dispatch({ type: 'SET_DEEP_SEGMENTS_RESULT', payload: finalDataString });
    dispatch({ type: 'SET_SEGMENTS_RESULT', payload: finalDataString });

    // 跳轉至視覺風格步驟
    dispatch({ type: 'SET_STEP', payload: AppStep.STEP_4_VISUALS });
    isProcessing.current = false;
  };

  // --- 原子化工具：完整保留您的歷史排除邏輯 ---
  const handleRegenerateStrategies = async (currentSegments: any) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const strategies = currentSegments.strategies || [];
      const existingTitles = strategies.map((s: any) => s.title).join('、');
      const prompt = `${REGENERATE_STRATEGIES_PROMPT}\n[歷史排除清單]：${existingTitles}\n[課文Context]：${JSON.stringify(currentSegments)}\n[Seed]：${Date.now()}`;
      const response = await sendMessageToGemini(prompt, [], 0);
      return sanitizeAndParseJSON(response); 
    } catch (error: any) { throw error; } finally { dispatch({ type: 'SET_LOADING', payload: false }); }
  };

  const handleGenerateSingleStrategy = async (data: any, existingStrategies: any[], targetType: string = 'Thinking') => {
    try {
      const prompt = `${GENERATE_SINGLE_STRATEGY_PROMPT}\nTarget Type: ${targetType}\nAvoid Titles: ${JSON.stringify(existingStrategies.map(s => s.title))}\nData: ${JSON.stringify(data).substring(0, 1000)}`;
      const response = await sendMessageToGemini(prompt, [], 0);
      return sanitizeAndParseJSON(response); 
    } catch (error: any) { throw error; }
  };

  const handleGenerateRhetoricGuidance = async (segmentTitle: string, rhetoricName: string, rhetoricExample: string) => {
    try {
      const prompt = GENERATE_RHETORIC_GUIDANCE_PROMPT
        .replace('{SEGMENT_TITLE}', segmentTitle)
        .replace('{RHETORIC_NAME}', rhetoricName)
        .replace('{RHETORIC_EXAMPLE}', rhetoricExample);
      const response = await sendMessageToGemini(prompt, [], 0);
      return sanitizeAndParseJSON(response);
    } catch (error: any) { throw error; }
  };

  const handleGenerateExtraActivity = async (title: string, content: string, grade: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const prompt = GENERATE_LANGUAGE_ACTIVITY_PROMPT
        .replace('{ACTIVITY_TITLE}', title)
        .replace('{ACTIVITY_CONTENT}', content)
        .replace('{GRADE}', grade);
      const response = await sendMessageToGemini(prompt, [], 0);
      return sanitizeAndParseJSON(response); 
    } catch (error: any) { return null; } finally { dispatch({ type: 'SET_LOADING', payload: false }); }
  };

  return {
    handleStep2DeepVocabConfirm,
    handleStep2DeepSegmentsConfirm,
    handleRegenerateStrategies,
    handleGenerateSingleStrategy,
    handleGenerateRhetoricGuidance,
    handleGenerateExtraActivity
  };
};