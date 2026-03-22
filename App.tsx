// 檔案路徑: src/App.tsx

import React, { useState } from 'react';
import { 
  Key, Settings, AlertCircle, ChevronRight, Zap, 
  ShieldCheck, AlertTriangle, RotateCcw, Check, Save, Download 
} from 'lucide-react';
import { AppStep } from './types';
import { useWorkflow, useWorkflowContext } from './context/WorkflowContext';
import { hasApiKey } from './services/gemini';

import { ApiKeyModal } from './components/ApiKeyModal';
import StepRouter from './components/StepRouter'; 
import GlobalProgressBar from './components/GlobalProgressBar'; 

function AppContent() {
  const { 
    currentStep, 
    isLoading, 
    loadingStatus, 
    error, 
    dispatch, 
    apiKeys, 
    setApiKeys, 
    showApiKeyModal, 
    setShowApiKeyModal 
  } = useWorkflow();

  // 🌟 取得完整的全域狀態，準備打包下載
  const { state: fullState } = useWorkflowContext();

  const handleSaveProject = () => {
    // 排除掉不需存檔的暫時狀態（如載入中、API Key 等）
    const { isLoading, error, loadingStatus, apiKeys, showApiKeyModal, ...persistentData } = fullState;
    
    // 轉成 JSON 檔案
    const blob = new Blob([JSON.stringify(persistentData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // 自動抓取課文名稱當檔名
    const lessonTitle = persistentData.analysisData?.basicInfo?.unitName || '未命名專案';
    link.download = `VMAX_Project_${lessonTitle}.json`;
    
    link.click();
    URL.revokeObjectURL(url);
  };
  
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // 🌟 [新增] 用來強制刷新所有子元件的鑰匙
  const [resetKey, setResetKey] = useState(0); 

  const handleResetClick = () => {
    setShowResetConfirm(true);
  };

  const executeReset = () => {
    dispatch({ type: 'RESET_WORKFLOW' }); // 1. 重置全域狀態 (回到 Step 1)
    setResetKey(prev => prev + 1);        // 2. 🌟 [關鍵] 更改 Key，強制把舊的輸入框與文件砍掉重練
    setShowResetConfirm(false);
  };

  const getLoadingText = () => {
    if (loadingStatus) return loadingStatus;
    const steps: Record<number, string> = {
      1: "正在掃描系統定位與生字特徵...",
      2: "提取基礎資訊與核心生字...",
      3: "執行語文輻射（形近字/多音字對齊）...",
      4: "深度解構意義段落與教學策略...",
      5: "生成視覺隱喻與風格 DNA...",
      6: "角色 DNA 鑄造中...",
      7: "正在編織原子化腳本與 PART C 語文迴圈..." 
    };
    return steps[currentStep] || "神經網路運算中...";
  };

  const hasKeys = apiKeys.length > 0;

  const visualSteps = [
    { step: 1, label: '文本匯入' },
    { step: 2, label: '基礎定位' },
    { step: 3, label: '語文輻射' },
    { step: 4, label: '邏輯解構' },
    { step: 5, label: '視覺包裝' },
    { step: 6, label: '選角中心' }, // 🌟 補上這行！讓進度條顯示出來
    { step: 7, label: '產出中心' }
  ];
  let activeStepIndex = 0;
  visualSteps.forEach((s, idx) => {
    if (currentStep >= s.step) activeStepIndex = idx;
  });

  return (
    <div className="flex flex-col h-screen w-full bg-[#F8FAFC] text-slate-900 selection:bg-indigo-100 font-sans overflow-hidden">
      
      <GlobalProgressBar isLoading={isLoading} statusText={getLoadingText()} />

      <header className="bg-white border-b border-slate-200 h-16 shrink-0 flex items-center justify-between px-6 shadow-sm z-40">
        
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-md shadow-emerald-500/20">
            <Zap size={20} fill="currentColor" />
          </div>
          <div>
            <h1 className="font-black text-slate-800 leading-none tracking-wider text-lg">V-MAX</h1>
            <p className="text-[9px] font-black text-slate-400 tracking-[0.2em] mt-0.5">OMNI-ARCHITECT</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {visualSteps.map((s, idx) => {
            const isActive = activeStepIndex === idx;
            const isPast = activeStepIndex > idx;
            
            return (
              <React.Fragment key={s.step}>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-500 ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-md transform scale-105' 
                    : isPast 
                      ? 'text-emerald-600 font-bold' 
                      : 'text-slate-400'
                }`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${
                    isActive ? 'bg-white/20' : isPast ? 'bg-emerald-100' : 'bg-slate-100'
                  }`}>
                    {isPast ? <Check size={12} strokeWidth={4} /> : idx + 1}
                  </div>
                  <span className={`text-xs ${isActive ? 'font-black tracking-widest' : 'font-bold'}`}>{s.label}</span>
                </div>
                {idx < visualSteps.length - 1 && (
                  <ChevronRight size={14} className={isPast ? 'text-emerald-400 mx-1' : 'text-slate-200 mx-1'} strokeWidth={3} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {/* 🌟 在這裡插入「儲存專案」按鈕 🌟 */}
          {currentStep > AppStep.STEP_1_INPUT && (
            <button 
              onClick={handleSaveProject} 
              className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl transition-all shadow-sm border border-emerald-200" 
              title="手動備份目前進度"
            >
              <Save size={16} />
            </button>
          )}

          <button 
            onClick={() => setShowApiKeyModal(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-widest transition-all border shadow-sm ${
              hasKeys 
                ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50' 
                : 'bg-red-50 text-red-600 border-red-200 animate-pulse'
            }`}
          >
            {hasKeys ? <ShieldCheck size={14} className="text-emerald-500" /> : <Key size={14} />}
            <span>{hasKeys ? 'ENGINE READY' : 'KEY REQUIRED'}</span>
          </button>
          
          <div className="w-[1px] h-6 bg-slate-200 mx-1"></div>

          <button 
            onClick={handleResetClick}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
          >
            <RotateCcw size={14} className={isLoading ? 'animate-spin' : ''} />
            重置
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth custom-scrollbar">
          <div className="max-w-6xl mx-auto w-full relative pb-10">
            
            <ApiKeyModal />

            {showResetConfirm && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
                  <div className="flex items-center gap-3 mb-4 text-amber-600">
                    <div className="p-2 bg-amber-100 rounded-full">
                      <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">確認重置進度？</h3>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed mb-6">
                    這將會清除您目前所有的分析資料與步驟進度，且無法復原。確定要繼續嗎？
                  </p>
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setShowResetConfirm(false)} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">取消</button>
                    <button onClick={executeReset} className="px-4 py-2 text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors shadow-md">確定重置</button>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center shadow-lg">
                <div className="p-2 bg-red-100 rounded-lg mr-3 shrink-0"><AlertCircle size={20} className="text-red-600" /></div>
                <div className="flex-1"><p className="font-bold text-sm mb-0.5 text-red-800">核心運算錯誤</p><p className="text-xs break-all leading-relaxed opacity-90">{error}</p></div>
                <button onClick={() => dispatch({ type: 'SET_ERROR', payload: null })} className="ml-4 p-2 hover:bg-red-200 rounded-full transition-colors shrink-0"><Settings size={16} className="text-red-400 rotate-90" /></button>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-[2rem] p-1.5 md:p-2 min-h-[calc(100vh-10rem)] flex flex-col shadow-xl mt-12 relative overflow-hidden">
              <div className="flex-1 p-2 md:p-4 overflow-hidden relative z-10">
                  {/* 🌟 [修補關鍵 3] 把 resetKey 綁定上來 */}
                  <StepRouter key={resetKey} /> 
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}