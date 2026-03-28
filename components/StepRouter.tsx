// 檔案路徑: src/components/StepRouter.tsx

import React, { Suspense, lazy, useMemo } from 'react';
import { AppStep } from '../types';
import { useWorkflowContext } from '../context/WorkflowContext';
import { Loader2 } from 'lucide-react';
import { sanitizeAndParseJSON } from '../utils/jsonParser';

// 🌟 [優化 1] 延遲載入所有組件，解決 429 請求過載問題
// 🛡️ 升級為防呆版本：當發現抓不到 JS 檔時，自動幫使用者重新整理一次網頁
const lazyWithRetry = (componentImport: () => Promise<any>) =>
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-force-refreshed') || 'false'
    );

    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        // 發現抓不到 Chunk，記錄狀態並強制重新整理
        window.sessionStorage.setItem('page-force-refreshed', 'true');
        window.location.reload();
        return { default: () => null } as any;
      }
      // 如果重整過還是失敗，才真的拋出錯誤
      throw error;
    }
  });

const Step1Input = lazyWithRetry(() => import('./Step1Input'));
const Step2Basic = lazyWithRetry(() => import('./Step2Basic'));
const Step2Deep = lazyWithRetry(() => import('./Step2Deep'));
const Step2DeepSegments = lazyWithRetry(() => import('./Step2DeepSegments'));
const Step3Visuals = lazyWithRetry(() => import('./Step3Visuals'));
const Step4Casting = lazyWithRetry(() => import('./Step4Casting'));
const Step5Output = lazyWithRetry(() => import('./Step5Output'));

// 導入 Hooks
import { useStep1Analysis } from '../hooks/steps/useStep1Analysis'; 
import { useStep2Vocabulary } from '../hooks/steps/useStep2Vocabulary';
import { useStep3Segments } from '../hooks/steps/useStep3Segments';
import { useStep4VisualsAndCasting } from '../hooks/steps/useStep4VisualsAndCasting';
import { useStep5Output } from '../hooks/steps/useStep5Output';

export default function StepRouter() {
  const { state, dispatch } = useWorkflowContext();
  
  // 注入 Hooks 邏輯
  const { handleStep1Analyze } = useStep1Analysis();
  const { 
    handleStep2BasicConfirm, 
    handleGenerateMnemonic, 
    handleGeneratePolyphonic, 
    handleGenerateShapeSimilar, 
    handleGenerateShapeSimilarDetails,
    handleGenerateIdiomDetails
  } = useStep2Vocabulary();
  const { 
    handleStep2DeepVocabConfirm, 
    handleStep2DeepSegmentsConfirm, // 此處對應 onConfirmSegments
    handleRegenerateStrategies, 
    handleGenerateSingleStrategy, 
    handleGenerateRhetoricGuidance,
    handleGenerateExtraActivity,
    handleRewriteQuestion
  } = useStep3Segments();
  const { 
    handleVisualsConfirm, 
    handleCastingConfirm, 
    handleSuggestTraits, 
    handleExtractImageTraits,
    handleGenerateVisualOptions,
    handleGenerateCastingOptions
  } = useStep4VisualsAndCasting();
  const { handleScriptPipeline, handleManualModule, handleRegenerateSingleSlide } = useStep5Output();

  // 🌟 [優化] 使用全域 JSON 解析工具，增加容錯與修復能力
  const parseJSON = (json: any) => {
    if (!json) return null;
    if (typeof json === 'object') return json;
    try {
      return sanitizeAndParseJSON(json);
    } catch (e) {
      console.error("StepRouter JSON 解析失敗:", e);
      return null;
    }
  };

  // 🌟 [保留] 您的全域返回邏輯
  const handleBack = () => {
    switch (state.currentStep) {
      case AppStep.STEP_2_BASIC:
        dispatch({ type: 'SET_STEP', payload: AppStep.STEP_1_INPUT });
        break;
      case AppStep.STEP_3_DEEP_VOCAB:
        dispatch({ type: 'SET_STEP', payload: AppStep.STEP_2_BASIC });
        break;
      case AppStep.STEP_3_DEEP_SEGMENTS:
        dispatch({ type: 'SET_STEP', payload: AppStep.STEP_3_DEEP_VOCAB });
        break;
      case AppStep.STEP_4_VISUALS:
        dispatch({ type: 'SET_STEP', payload: AppStep.STEP_3_DEEP_SEGMENTS });
        break;
      case AppStep.STEP_5_CASTING:
        dispatch({ type: 'SET_STEP', payload: AppStep.STEP_4_VISUALS });
        break;
      case AppStep.STEP_6_OUTPUT:
        dispatch({ type: 'SET_STEP', payload: AppStep.STEP_5_CASTING });
        break;
      default:
        console.warn("未定義的返回路徑:", state.currentStep);
        break;
    }
  };

  // 資料對象預處理
  const basicDataObj = useMemo(() => parseJSON(state.basicAnalysisResult), [state.basicAnalysisResult]);
  const deepVocabDataObj = useMemo(() => parseJSON(state.deepVocabResult), [state.deepVocabResult]);

  // Loading 骨架屏
  const LoadingFallback = () => (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
      <Loader2 className="animate-spin mb-4" size={32} />
      <p className="text-sm font-bold">V-MAX 模組動態調度中...</p>
    </div>
  );

  return (
    <Suspense fallback={<LoadingFallback />}>
      {(() => {
        switch (state.currentStep) {
          case AppStep.STEP_1_INPUT:
            return <Step1Input onAnalyze={handleStep1Analyze} isLoading={state.isLoading} />;
            
          case AppStep.STEP_2_BASIC:
            return (
              <Step2Basic
                analysis={state.basicAnalysisResult} 
                onConfirmBasic={handleStep2BasicConfirm} 
                isLoading={state.isLoading}
                onBack={handleBack}
              />
            );
            
          case AppStep.STEP_3_DEEP_VOCAB:
            if (!basicDataObj) return null;
            return (
              <Step2Deep
                basicData={basicDataObj}
                deepAnalysisResult={state.deepVocabResult}
                onConfirmDeepVocab={handleStep2DeepVocabConfirm}
                isLoading={state.isLoading}
                onGenerateMnemonic={handleGenerateMnemonic}
                onGeneratePolyphonic={handleGeneratePolyphonic}
                onGenerateShapeSimilar={handleGenerateShapeSimilar}
                onGenerateShapeSimilarDetails={handleGenerateShapeSimilarDetails}
                onGenerateIdiomDetails={handleGenerateIdiomDetails}
                onBack={handleBack}
              />
            );
            
          case AppStep.STEP_3_DEEP_SEGMENTS:
            if (!deepVocabDataObj) return null;
            return (
              <Step2DeepSegments
                currentData={deepVocabDataObj}
                deepSegmentsResult={state.deepSegmentsResult}
                onConfirmSegments={handleStep2DeepSegmentsConfirm} // 指向正確的 Hook Handler
                isLoading={state.isLoading}
                onRegenerateStrategies={handleRegenerateStrategies}
                onGenerateSingleStrategy={handleGenerateSingleStrategy}
                onGenerateRhetoricGuidance={handleGenerateRhetoricGuidance}
                onGenerateExtraActivity={handleGenerateExtraActivity}
                onRewriteQuestion={handleRewriteQuestion}
                onBack={handleBack}
              />
            );
            
          case AppStep.STEP_4_VISUALS:
            return (
              <Step3Visuals 
                visualResult={state.visualResult}
                onConfirmVisuals={handleVisualsConfirm}
                onGenerateOptions={handleGenerateVisualOptions}
                isLoading={state.isLoading}
                onBack={handleBack}
              />
            );
            
          case AppStep.STEP_5_CASTING:
            return (
              <Step4Casting 
                castingResult={state.castingResult}
                onConfirmCasting={handleCastingConfirm}
                onSuggestTraits={handleSuggestTraits}
                onGenerateCasting={handleGenerateCastingOptions}
                onGenerateExternalDnaPrompt={handleGenerateExternalDnaPrompt}
                handleExtractImageTraits={handleExtractImageTraits}
                isLoading={state.isLoading}
                onBack={handleBack}
              />
            );
            
          case AppStep.STEP_6_OUTPUT:
            return (
              <Step5Output 
                outputScript={state.outputScript} 
                outputWorksheet={state.outputWorksheet}
                outputAssessment={state.outputAssessment}
                outputKb={state.outputKb}
                outputNotebookLMGuide={state.outputNotebookLMGuide}
                outputGamifiedQuiz={state.outputGamifiedQuiz}
                outputInteractiveQuiz={state.outputInteractiveQuiz}
                onScriptPipeline={handleScriptPipeline}
                onManualModule={handleManualModule}
                onRegenerateSingleSlide={handleRegenerateSingleSlide}
                isLoading={state.isLoading}
                onBack={handleBack}
              />
            );
            
          default:
            return null;
        }
      })()}
    </Suspense>
  );
}