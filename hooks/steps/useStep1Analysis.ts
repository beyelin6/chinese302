// 檔案路徑: src/hooks/steps/useStep1Analysis.ts

import { useRef } from 'react';
import { useWorkflowContext } from '../../context/WorkflowContext';
import { AppStep, MediaData, AnalysisData } from '../../types';
import { sendMessageToGemini } from '../../services/gemini';
// 🌟 引用 Canvas 中最新的 Prompt 常數
import { 
  SYSTEM_PROMPT, 
  STEP_1_BASIC_PROMPT_SUFFIX, 
  STEP_1_FAST_PROMPT_SUFFIX,
  STEP_1_FAST_SCAN_PROMPT,
  PROMPT_GENERATE_ADDITIONAL_ACTIVITIES
} from '../../constants';
import { extractTextFromPDFBase64 } from '../../utils.ts';
import { sanitizeAndParseJSON } from '../../utils/jsonParser';

export const useStep1Analysis = () => {
  const { dispatch } = useWorkflowContext();
  
  // 🛡️ 使用 Ref 建立「執行鎖」，防止使用者在分析中重複點擊
  const isProcessing = useRef(false);

  /**
   * 🌟 核心任務：初步文本萃取與結構分析
   * 同時處理「文字」與「多模態檔案 (PDF/圖片)」，並執行精準數據對齊
   */
  const handleStep1Analyze = async (inputText: string, mediaFiles: MediaData[] = []) => {
    // 1. 立即檢查鎖定狀態
    if (isProcessing.current) {
      console.warn("[Guard] 分析正在進行中，攔截重複請求");
      return;
    }

    // 2. 多模態檢查：只要有文字或檔案其中之一即可
    const hasText = inputText && inputText.trim() !== '';
    const hasFiles = mediaFiles && mediaFiles.length > 0;

    if (!hasText && !hasFiles) {
      dispatch({ type: 'SET_ERROR', payload: '請輸入課文內容或上傳檔案。' });
      return;
    }

    // 3. 上鎖並更新 UI 載入狀態
    isProcessing.current = true;
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_LOADING_STATUS', payload: '正在解析內容並偵測結構標籤...' });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // 🌟 [PDF 預處理] 攔截 PDF 並在本地萃取文字，減輕 AI 負擔
      let finalInputText = inputText;
      const filteredMediaFiles: MediaData[] = []; // 只保留圖片給 AI 視覺分析

      for (const file of mediaFiles) {
        if (file.mimeType === 'application/pdf') {
          dispatch({ type: 'SET_LOADING_STATUS', payload: '正在從 PDF 提取文字核心...' });
          const pdfText = await extractTextFromPDFBase64(file.data);
          finalInputText += `\n\n[PDF]:\n${pdfText}`;
        } else {
          filteredMediaFiles.push(file);
        }
      }

      // 🌟 [對齊 1] 強化雷達：擴大正則表達式的命中範圍，包含階層符號與意義段標語
      const isStructured = /基本資訊|各段大意|意義段大意|字形字音|結構大意|內容大意|[一二三四五六七八九十]、|㈠|㈡|㈢|㈣|㈤/.test(finalInputText);
      
      // 選用對應的 Prompt (FAST 模式會優先抓取辨析資料)
      const promptSuffix = isStructured 
        ? STEP_1_FAST_PROMPT_SUFFIX 
        : STEP_1_BASIC_PROMPT_SUFFIX;

      if (isStructured) {
        dispatch({ type: 'SET_LOADING_STATUS', payload: '偵測到結構化資料，啟動資料庫映射模式...' });
      } else {
        dispatch({ type: 'SET_LOADING_STATUS', payload: '正在掃描文本並提取核心特徵...' });
      }

      // 4. 組合完整 Prompt
      const fullPrompt = `${SYSTEM_PROMPT}\n${promptSuffix}\n${finalInputText}`;

      // 5. 呼叫 Gemini API
      let responseText = "";
      let basicAnalysisObj: any = null;

      try {
        responseText = await sendMessageToGemini(fullPrompt, filteredMediaFiles, 0, { responseMimeType: "application/json" }); 
        basicAnalysisObj = sanitizeAndParseJSON(responseText);
      } catch (parseError) {
        console.warn("Standard analysis failed, attempting Fast Scan fallback...");
        
        // 🌟 [新增] 極速掃描回退：如果標準分析失敗，嘗試只抓取清單
        try {
          const fastPrompt = `
            ${SYSTEM_PROMPT}
            [USER_SOURCE_DATA]${finalInputText}[/USER_SOURCE_DATA]
            ${STEP_1_FAST_SCAN_PROMPT}
          `;
          const fastResponse = await sendMessageToGemini(fastPrompt, filteredMediaFiles, 0, { responseMimeType: "application/json" });
          basicAnalysisObj = sanitizeAndParseJSON(fastResponse);
          console.warn("極速掃描回退成功");
        } catch (fastError) {
          console.error("Fast Scan also failed, attempting emergency recovery...");
          // 🌟 [新增] 緊急救援邏輯：嘗試手動搜尋 basicInfo 區塊
          const basicInfoMatch = responseText.match(/"basicInfo"\s*:\s*(\{[^}]+\})/);
          const unitNameMatch = responseText.match(/"unitName"\s*:\s*"([^"]+)"/);
          
          if (basicInfoMatch || unitNameMatch) {
            try {
              const recoveredBasicInfo = basicInfoMatch ? JSON.parse(basicInfoMatch[1] + "}") : {};
              basicAnalysisObj = {
                basicInfo: recoveredBasicInfo,
                unitName: unitNameMatch ? unitNameMatch[1] : (recoveredBasicInfo.unitName || "救援成功(部分)"),
                coreVocabulary: [],
                textbookDifficultWords: [],
                idioms: []
              };
              console.warn("系統啟動緊急救援：僅恢復部分基本資訊");
            } catch (recoveryError) {
              throw new Error("AI 回傳格式嚴重損毀，無法執行救援。");
            }
          } else {
            throw parseError;
          }
        }
      }
      
      // 7. 將 AI 回傳結果對應至 AnalysisData 結構化物件
      // 🌟 [對齊 2] 完整映射：確保 languageActivities 進入狀態
      const initialAnalysisData: AnalysisData = {
        fullText: finalInputText || basicAnalysisObj.fullText || "",
        mode: basicAnalysisObj.mode || "Mode A",
        unitName: basicAnalysisObj.basicInfo?.unitName || basicAnalysisObj.unitName || "未知課目",
        genre: basicAnalysisObj.basicInfo?.genre || basicAnalysisObj.genre || "未分類",
        visualStructureRecommendation: basicAnalysisObj.visualStructureRecommendation || "N1 故事山",

        basicInfo: {
          grade: basicAnalysisObj.basicInfo?.grade || basicAnalysisObj.grade || "未知",
          genre: basicAnalysisObj.basicInfo?.genre || basicAnalysisObj.genre || "未分類",
          theme: basicAnalysisObj.basicInfo?.subject || basicAnalysisObj.subject || "人物描寫",
          writingTechnique: basicAnalysisObj.basicInfo?.writingTechnique || "分析中",
          mainIdea: basicAnalysisObj.basicInfo?.mainIdea || "分析中"
        },

        languageActivities: basicAnalysisObj.languageActivities || [], // 確保不遺漏

        // 🌟 核心修正：正確映射生字與其辨析資料 (相容字串陣列與物件陣列)
        coreVocabulary: (basicAnalysisObj.coreVocabulary || []).map((v: any) => {
          const isString = typeof v === 'string';
          const word = isString ? v : (v.word || v);
          const shapeSimilar = isString ? [] : (v.shapeSimilar || []);
          const polyphonic = isString ? [] : (v.polyphonic || []);
          const hasDeepData = (Array.isArray(shapeSimilar) && shapeSimilar.length > 0) || 
                             (Array.isArray(polyphonic) && polyphonic.length > 0);

          return {
            word: word,
            radical: isString ? "部" : (v.radical || "部"),
            type: isString ? "生字" : (v.type || "生字"),
            writingTips: isString ? "無" : (v.writingTips || "無"),
            shapeSimilar: shapeSimilar, 
            polyphonic: polyphonic,
            isFocused: hasDeepData 
          };
        }),

        // 難詞與成語勾選狀態初始化
        textbookDifficultWords: (basicAnalysisObj.textbookDifficultWords || []).map((w: any) => ({
          word: typeof w === 'string' ? w : w.word, isSelected: true
        })),
        idioms: (basicAnalysisObj.idioms || []).map((i: any) => ({
          word: typeof i === 'string' ? i : i.word, isSelected: true
        })),
        
        vocabulary: [],
        segments: [],
        strategies: []
      };

      // 8. 儲存結果並將步驟推向 Step 2 (Basic)
      dispatch({ 
        type: 'SET_BASIC_RESULT', 
        payload: { 
          basicAnalysisResult: JSON.stringify(basicAnalysisObj), 
          analysisData: initialAnalysisData 
        } 
      });
      
      dispatch({ type: 'SET_STEP', payload: AppStep.STEP_2_BASIC });

    } catch (error: any) {
      console.error('STEP 1 Analysis Error:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: '分析過程發生錯誤：' + (error.message || '請確認網路連接或 API 設定。') 
      });
    } finally {
      // 9. 解鎖：無論成功失敗都釋放執行鎖
      isProcessing.current = false;
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_LOADING_STATUS', payload: null });
    }
  };

  /**
   * 🌟 [新增] AI 語文活動擴充引擎
   * 根據課文內容與年級，生成 3 個額外的語文活動建議
   */
  const handleGenerateAdditionalActivities = async (fullText: string, grade: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_LOADING_STATUS', payload: 'AI 正在為您構思額外的語文活動建議...' });

    try {
      const prompt = `
        ${PROMPT_GENERATE_ADDITIONAL_ACTIVITIES}
        
        【課文內容】
        ${fullText}
        
        【年級】
        ${grade}
      `;

      const response = await sendMessageToGemini(prompt, [], 0, { temperature: 0.7, responseMimeType: "application/json" });
      const additionalActivities = sanitizeAndParseJSON(response);

      if (Array.isArray(additionalActivities)) {
        dispatch({ type: 'ADD_LANGUAGE_ACTIVITIES', payload: additionalActivities });
      }
    } catch (error: any) {
      console.error("生成語文活動失敗", error);
      dispatch({ type: 'SET_ERROR', payload: '生成語文活動失敗：' + error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_LOADING_STATUS', payload: null });
    }
  };

  return { handleStep1Analyze, handleGenerateAdditionalActivities };
};