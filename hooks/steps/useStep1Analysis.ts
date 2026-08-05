// 檔案路徑: src/hooks/steps/useStep1Analysis.ts

import { useRef } from 'react';
import { useWorkflowContext } from '../../context/WorkflowContext';
import { AppStep, MediaData, AnalysisData } from '../../types';
import { sendMessageToGemini } from '../../services/gemini';
import { 
  SYSTEM_PROMPT, 
  STEP_1_BASIC_PROMPT_SUFFIX, 
  STEP_1_FAST_PROMPT_SUFFIX,
  STEP_1_FAST_SCAN_PROMPT,
  PROMPT_GENERATE_ADDITIONAL_ACTIVITIES
} from '../../constants';
import { extractTextFromPDFBase64 } from '../../utils.ts';
import { sanitizeAndParseJSON } from '../../utils/jsonParser';
import { buildCuratedBriefingMappingPrompt, isCuratedBriefing, checkVocabSourceFeatures } from '../../utils/curatedBriefing';

export const useStep1Analysis = () => {
  const { dispatch } = useWorkflowContext();
  
  // 🛡️ 使用 Ref 建立「執行鎖」，防止使用者在分析中重複點擊
  const isProcessing = useRef(false);

  /**
   * 🌟 核心任務：初步文本萃取與結構分析
   * 同時處理「文字」與「多模態檔案 (PDF/圖片/MD)」
   */
  const handleStep1Analyze = async (inputText: string, mediaFiles: MediaData[] = []) => {
    // 1. 立即檢查鎖定狀態
    if (isProcessing.current) {
      console.warn("[Guard] 分析正在進行中，攔截重複請求");
      return;
    }

    // 2. 多模態檢查
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
      // 🌟 [檔案預處理] 攔截 PDF 與純文字檔，在本地萃取文字
      let finalInputText = inputText;
      const filteredMediaFiles: MediaData[] = []; // 只保留圖片給 AI 視覺分析

      for (const file of mediaFiles) {
        if (file.mimeType === 'application/pdf') {
          dispatch({ type: 'SET_LOADING_STATUS', payload: '正在從 PDF 提取文字核心...' });
          const pdfText = await extractTextFromPDFBase64(file.data);
          finalInputText += `\n\n[PDF]:\n${pdfText}`;
        } 
        // 🌟 [新增] 支援直接讀取 .md 或 .txt 檔案的文字內容 (TextDecoder 安全版)
        else if (file.mimeType.includes('text') || file.mimeType === 'text/markdown' || file.name?.endsWith('.md')) {
          dispatch({ type: 'SET_LOADING_STATUS', payload: '正在讀取 Markdown 檔案...' });
          try {
            // 使用最安全的 TextDecoder 處理 UTF-8 中文
            const binaryString = window.atob(file.data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const textContent = new TextDecoder('utf-8').decode(bytes);
            finalInputText += `\n\n[Markdown 檔案內容]:\n${textContent}`;
            console.log("✅ 檔案文字萃取成功，長度：", textContent.length); // 可以在 F12 檢查是否有抓到
          } catch (e) {
            console.error("❌ 文字檔解碼失敗", e);
          }
        } 
        else {
          // 其他圖片格式留給 Gemini Vision
          filteredMediaFiles.push(file);
        }
      }

      // 🌟 [對齊 1] 強化雷達：擴大正則表達式的命中範圍
      const isCurated = isCuratedBriefing(finalInputText);
      const isStructured = isCurated || /基本資訊|各段大意|意義段大意|字形字音|結構大意|內容大意|[一二三四五六七八九十]、|㈠|㈡|㈢|㈣|㈤/.test(finalInputText);
      
      const promptSuffix = isStructured 
        ? STEP_1_FAST_PROMPT_SUFFIX 
        : STEP_1_BASIC_PROMPT_SUFFIX;

      if (isStructured) {
        dispatch({ type: 'SET_LOADING_STATUS', payload: '偵測到結構化資料，啟動資料庫映射模式...' });
      } else {
        dispatch({ type: 'SET_LOADING_STATUS', payload: '正在掃描文本並提取核心特徵...' });
      }

      const fullPrompt = isCurated
        ? `${SYSTEM_PROMPT}\n${buildCuratedBriefingMappingPrompt(finalInputText)}`
        : `${SYSTEM_PROMPT}\n${promptSuffix}\n${finalInputText}`;

      let responseText = "";
      let basicAnalysisObj: any = null;

      try {
        responseText = await sendMessageToGemini(fullPrompt, filteredMediaFiles, 0, { responseMimeType: "application/json" }); 
        basicAnalysisObj = sanitizeAndParseJSON(responseText);
      } catch (parseError) {
        console.warn("Standard analysis failed, attempting Fast Scan fallback...");
        
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
            } catch (recoveryError) {
              throw new Error("AI 回傳格式嚴重損毀，無法執行救援。");
            }
          } else {
            throw parseError;
          }
        }
      }
      
      const initialAnalysisData: AnalysisData = {
        fullText: finalInputText || basicAnalysisObj.fullText || "",
        mode: basicAnalysisObj.mode || "Mode A",
        unitName: basicAnalysisObj.basicInfo?.unitName || basicAnalysisObj.unitName || "未知課目",
        genre: basicAnalysisObj.basicInfo?.genre || basicAnalysisObj.genre || "未分類",
        visualStructureRecommendation: basicAnalysisObj.visualStructureRecommendation || "N1 故事山",

        basicInfo: {
          unitName: basicAnalysisObj.basicInfo?.unitName || basicAnalysisObj.unitName || "未知課目",
          grade: basicAnalysisObj.basicInfo?.grade || basicAnalysisObj.grade || "未知",
          genre: basicAnalysisObj.basicInfo?.genre || basicAnalysisObj.genre || "未分類",
          theme: basicAnalysisObj.basicInfo?.subject || basicAnalysisObj.subject || "人物描寫",
          writingTechnique: basicAnalysisObj.basicInfo?.writingTechnique || "分析中",
          mainIdea: basicAnalysisObj.basicInfo?.mainIdea || "分析中"
        },

        languageActivities: basicAnalysisObj.languageActivities || [],
        
        coreVocabulary: (basicAnalysisObj.coreVocabulary || []).map((v: any) => {
          const isString = typeof v === 'string';
          const word = isString ? v : (v.word || v);
          const shapeSimilar = isString ? [] : (v.shapeSimilar || []);
          const polyphonic = isString ? [] : (v.polyphonic || []);
          const feat = checkVocabSourceFeatures(v, finalInputText);

          return {
            word: word,
            radical: isString ? "部" : (v.radical || "部"),
            type: isString ? "生字" : (v.type || "生字"),
            writingTips: isString ? "無" : (v.writingTips || "無"),
            shapeSimilar: shapeSimilar, 
            polyphonic: polyphonic,
            isFocused: feat.isFocused,
            wantsWritingTips: v.wantsWritingTips ?? false,
            wantsShapeSimilar: feat.wantsShapeSimilar,
            wantsPolyphonic: feat.wantsPolyphonic
          };
        }),

        recognitionVocabulary: (basicAnalysisObj.recognitionVocabulary || []).map((v: any) => {
          const isString = typeof v === 'string';
          const word = isString ? v : (v.word || v);
          const shapeSimilar = isString ? [] : (v.shapeSimilar || []);
          const polyphonic = isString ? [] : (v.polyphonic || []);
          const feat = checkVocabSourceFeatures(v, finalInputText);

          return {
            word: word,
            radical: isString ? "部" : (v.radical || "部"),
            type: isString ? "認讀字" : (v.type || "認讀字"),
            writingTips: "認讀字，重點在於認字而非寫法。",
            shapeSimilar: shapeSimilar,
            polyphonic: polyphonic,
            isFocused: feat.isFocused,
            wantsWritingTips: v.wantsWritingTips ?? false,
            wantsShapeSimilar: feat.wantsShapeSimilar,
            wantsPolyphonic: feat.wantsPolyphonic
          };
        }),

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
// 🌟 [架構師終極備份] 防止 React 狀態在切換頁面時流失，硬存進瀏覽器本機記憶體！
      try {
        const safeText = finalInputText || basicAnalysisObj.fullText || "";
        localStorage.setItem('VMAX_SAFE_FULLTEXT', safeText);
        console.log("💾 已將文本備份至 localStorage，長度：", safeText.length);
      } catch(e) {
        console.warn("localStorage 備份失敗", e);
      }

      // 8. 儲存結果並將步驟推向 Step 2 (Basic)
      dispatch({ 
        type: 'SET_BASIC_RESULT', 
        payload: { 
          rawInputText: finalInputText,
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
      isProcessing.current = false;
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_LOADING_STATUS', payload: null });
    }
  };

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