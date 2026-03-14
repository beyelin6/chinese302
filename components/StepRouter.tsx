// 檔案路徑: src/components/StepRouter.tsx

import React, { Suspense, lazy, useMemo } from 'react';
import { AppStep } from '../types';
import { useWorkflowContext } from '../context/WorkflowContext';
import { Loader2 } from 'lucide-react';

// 🌟 [優化 1] 延遲載入所有組件，解決 429 請求過載問題
const Step1Input = lazy(() => import('./Step1Input'));
const Step2Basic = lazy(() => import('./Step2Basic'));
const Step2Deep = lazy(() => import('./Step2Deep'));
const Step2DeepSegments = lazy(() => import('./Step2DeepSegments'));
const Step3Visuals = lazy(() => import('./Step3Visuals'));
const Step4Casting = lazy(() => import('./Step4Casting'));
const Step5Output = lazy(() => import('./Step5Output'));

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
    handleStep3Confirm, 
    handleStep4Confirm, 
    handleSuggestTraits, 
    handleExtractImageTraits,
    handleGenerateVisualOptions,
    handleGenerateCastingOptions
  } = useStep4VisualsAndCasting();
  const { handleScriptPipeline, handleManualModule } = useStep5Output();

  // 🌟 [保留] 您的原始 JSON 解析邏輯
  const parseJSON = (json: string | null) => {
    if (!json) return null;
    try {
      let cleanJson = json;
      if (cleanJson.includes('```json')) {
        cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '');
      } else if (cleanJson.includes('```')) {
        cleanJson = cleanJson.replace(/```/g, '');
      }
      return JSON.parse(cleanJson);
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
                onConfirmVisuals={handleStep3Confirm}
                onGenerateOptions={handleGenerateVisualOptions}
                isLoading={state.isLoading}
                onBack={handleBack}
              />
            );
            
          case AppStep.STEP_5_CASTING:
            return (
              <Step4Casting 
                castingResult={state.castingResult}
                onConfirmCasting={handleStep4Confirm}
                onSuggestTraits={handleSuggestTraits}
                onGenerateCasting={handleGenerateCastingOptions}
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
                analysisData={state.analysisData}
                onScriptPipeline={handleScriptPipeline}
                onManualModule={handleManualModule}
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