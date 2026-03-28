// 檔案路徑: src/hooks/steps/useStep2Vocabulary.ts

import { useRef } from 'react';
import { useWorkflowContext } from '../../context/WorkflowContext';
import { AppStep, ShapeSimilarItem, PolyphonicItem, VocabularyItem } from '../../types';
import { 
  STEP_2_DEEP_PROMPT_PREFIX, 
  STEP_2_DEEP_VOCAB_PROMPT_SUFFIX,
  GENERATE_SHAPE_SIMILAR_PROMPT,
  GENERATE_SHAPE_SIMILAR_DETAILS_PROMPT,
  GENERATE_MNEMONIC_PROMPT,
  GENERATE_POLYPHONIC_PROMPT
} from '../../constants';
import { sendMessageToGemini } from '../../services/gemini';
import { sanitizeAndParseJSON } from '../../utils/jsonParser';

export const useStep2Vocabulary = () => {
  const { state, dispatch } = useWorkflowContext();
  const isProcessing = useRef(false);

  const handleStep2BasicConfirm = async (confirmedBasicData: any) => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      dispatch({ 
        type: 'SET_BASIC_RESULT', 
        payload: { 
          basicAnalysisResult: JSON.stringify(confirmedBasicData), 
          analysisData: confirmedBasicData 
        } 
      });

      const focusedVocabs = (confirmedBasicData.coreVocabulary || []).filter((v: VocabularyItem) => v.isFocused);
      const selectedIdioms = (confirmedBasicData.idioms || [])
        .filter((i: any) => i.isSelected)
        .map((i: any) => i.word);
      
      if (focusedVocabs.length === 0 && selectedIdioms.length === 0) {
        throw new Error("請至少勾選一個生字或成語進行辨析。");
      }

      const BATCH_SIZE = 3; 
      let allResults: any = { vocabulary: [], deepIdiomsDetails: [] };

      const chunks: VocabularyItem[][] = [];
      for (let i = 0; i < focusedVocabs.length; i += BATCH_SIZE) {
        chunks.push(focusedVocabs.slice(i, i + BATCH_SIZE));
      }

      // 🌟 [核心修復] 提取老師上傳的完整 Markdown，做為強制對齊的聖旨
      const rawContext = state.analysisData?.fullText || "";

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        dispatch({ 
          type: 'SET_LOADING_STATUS', 
          payload: `正在啟動 V-MAX 自動補完引擎，精準分析第 ${i + 1}/${chunks.length} 組生字...` 
        });

        // 🌟 [核心修復] 注入極度嚴格的提取指令
        const batchInstructions = chunk.map(v => {
            const tasks = [];
            if (v.wantsWritingTips) tasks.push("字形寫法重點");
            if (v.wantsShapeSimilar) {
                tasks.push("形近字辨析 (🚨【嚴格指令】：必須從「原始參考資料」中提取老師寫好的形近字、部首與造詞！填入 JSON 的 radical 與 words 欄位中，絕對不可留空！若老師沒寫才允許你自行補充)");
            }
            if (v.wantsPolyphonic) {
                tasks.push("多音字探討 (🚨【嚴格指令】：優先從「原始參考資料」中提取注音與造詞填入，不可留空！)");
            }
            const finalTaskDesc = tasks.length > 0 ? tasks.join('、') : '提供基本字義';
            return `【${v.word}】(${v.type}): 任務需求為 -> ${finalTaskDesc}`;
        }).join('\n');

        const currentChunkContext = {
            ...confirmedBasicData,
            coreVocabulary: chunk,
            selectedIdioms: i === 0 ? selectedIdioms : [] 
        };

        const prompt = `
          ${STEP_2_DEEP_PROMPT_PREFIX}
          
          # 🚨 老師指定的精準教學任務 (100% 遵守，不得遺漏細節)：
          ${batchInstructions}

          # 🌟 成語名單：
          ${i === 0 ? selectedIdioms.join('、') : "略過成語"}

          # 基礎數據屬性：
          ${JSON.stringify(currentChunkContext)}
          
          # 🌟 原始參考資料 (請務必從這裡「撈取」部首與造詞)：
          ${rawContext}
          ==============================

          ${STEP_2_DEEP_VOCAB_PROMPT_SUFFIX}
        `;
        
        // 🌟 [核心修復] 將 temperature 調低至 0.2，防止 AI 亂發明「轄」這種字
        const response = await sendMessageToGemini(prompt, [], 0, { temperature: 0.2, responseMimeType: "application/json" });
        const chunkResult = sanitizeAndParseJSON(response);

        // 相容多種欄位命名
        if (chunkResult && (chunkResult.vocabulary || chunkResult.vocabularyRadiation || chunkResult.vocabulary_radiation)) {
          const vocabData = chunkResult.vocabulary || chunkResult.vocabularyRadiation || chunkResult.vocabulary_radiation;
          allResults.vocabulary = [...allResults.vocabulary, ...vocabData];
        }
        
        if (chunkResult && chunkResult.deepIdiomsDetails) {
          const existing = new Set(allResults.deepIdiomsDetails.map((id: any) => id.word));
          chunkResult.deepIdiomsDetails.forEach((newId: any) => {
              if (!existing.has(newId.word)) {
                  allResults.deepIdiomsDetails.push(newId);
                  existing.add(newId.word);
              }
          });
        }
      }

      dispatch({ type: 'SET_VOCAB_RESULT', payload: JSON.stringify(allResults) });
      dispatch({ type: 'SET_STEP', payload: AppStep.STEP_3_DEEP_VOCAB });

    } catch (error: any) {
      console.error('STEP 2.5 Logic Error:', error);
      dispatch({ type: 'SET_ERROR', payload: '抓取失敗：' + error.message });
    } finally {
      isProcessing.current = false;
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_LOADING_STATUS', payload: null });
    }
  };

  /**
   * 🌟 [新增] 魔法棒專用：針對單一成語進行自動補完
   */
  const handleGenerateIdiomDetails = async (idiom: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const prompt = `請針對成語「${idiom}」提供深度教學解析 JSON：{"definition": "...", "example": "...", "synonyms": ["..."], "antonyms": ["..."]}`;
      const response = await sendMessageToGemini(prompt, [], 0, { temperature: 0.5, responseMimeType: "application/json" });
      return sanitizeAndParseJSON(response);
    } catch (e) {
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleGenerateShapeSimilar = async (char: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const prompt = `${GENERATE_SHAPE_SIMILAR_PROMPT.replace('{CHAR}', char)}`;
      const response = await sendMessageToGemini(prompt, [], 0, { responseMimeType: "application/json" });
      return sanitizeAndParseJSON(response);
    } finally { dispatch({ type: 'SET_LOADING', payload: false }); }
  };

  const handleGenerateShapeSimilarDetails = async (char: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // 🌟 [核心修復] 手動單字補充時，也強制 AI 看老師的資料
      const rawContext = state.analysisData?.fullText || "";
      const prompt = `
        ${GENERATE_SHAPE_SIMILAR_DETAILS_PROMPT.replace('{CHAR}', char)}
        
        🚨 嚴格指令：請先掃描以下的【參考資料】，如果資料中有針對「${char}」這個字的部首、造詞 or 解釋，請 **100% 照抄** 資料裡的內容填入 JSON 中。
        
        【參考資料】：
        ${rawContext}
      `;
      const response = await sendMessageToGemini(prompt, [], 0, { temperature: 0.2, responseMimeType: "application/json" });
      return sanitizeAndParseJSON(response);
    } catch (error) {
      throw error;
    } finally { dispatch({ type: 'SET_LOADING', payload: false }); }
  };

  const handleGenerateMnemonic = async (chars: ShapeSimilarItem[]) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const charsList = chars.map(c => `${c.char} (${c.radical}): ${c.words}`).join(' vs ');
      const prompt = `${GENERATE_MNEMONIC_PROMPT.replace('{CHARACTERS_LIST}', charsList)}`;
      const response = await sendMessageToGemini(prompt, [], 0);
      return response.replace(/```/g, '').trim(); 
    } finally { dispatch({ type: 'SET_LOADING', payload: false }); }
  };

  const handleGeneratePolyphonic = async (char: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const rawContext = state.analysisData?.fullText || "";
      const prompt = `
        ${GENERATE_POLYPHONIC_PROMPT.replace('{CHAR}', char)}
        
        🚨 嚴格指令：請優先從以下【參考資料】中提取老師準備的多音字注音與造詞。
        【參考資料】：
        ${rawContext}
      `;
      const response = await sendMessageToGemini(prompt, [], 0, { temperature: 0.2, responseMimeType: "application/json" });
      return sanitizeAndParseJSON(response);
    } finally { dispatch({ type: 'SET_LOADING', payload: false }); }
  };

  return {
    handleStep2BasicConfirm,
    handleGenerateShapeSimilar,
    handleGenerateShapeSimilarDetails,
    handleGenerateMnemonic,
    handleGeneratePolyphonic,
    handleGenerateIdiomDetails
  };
};
