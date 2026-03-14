// 檔案路徑: src/components/Step5Output.tsx

import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Layout, FileText, Check, Download, ArrowLeft, Loader2, 
  Sparkles, BookOpen, Database, AlertCircle, Copy, Edit3, Save 
} from 'lucide-react';
import { useWorkflowContext } from '../context/WorkflowContext';

interface Step5OutputProps {
  outputScript: string | null;
  outputWorksheet: string | null;
  outputAssessment: string | null;
  outputKb: string | null;
  outputNotebookLMGuide: string | null;
  outputGamifiedQuiz: string | null;
  onScriptPipeline: () => void;
  onManualModule: (key: string) => void;
  isLoading: boolean;
  onBack: () => void;
}

const Step5Output: React.FC<Step5OutputProps> = ({ 
  outputScript, outputWorksheet, outputAssessment, outputKb, 
  outputNotebookLMGuide, outputGamifiedQuiz, onScriptPipeline, 
  onManualModule, isLoading, onBack 
}) => {
  const { state } = useWorkflowContext();
  const [activeTab, setActiveTab] = useState('script');
  const [isCopied, setIsCopied] = useState(false);

  // 1. 自動觸發機制
  useEffect(() => {
    if (!outputScript && !isLoading) {
      onScriptPipeline();
    }
  }, [outputScript, isLoading, onScriptPipeline]);

  // 2. 解析 JSON 腳本為物件結構 (用於卡片渲染)
  const scriptSlides = useMemo(() => {
    if (!outputScript) return [];
    try {
      let cleanJson = outputScript.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return Array.isArray(parsed) ? parsed : (parsed.slides || parsed.data || []);
    } catch (e) {
      return [];
    }
  }, [outputScript]);

  const currentContent = useMemo(() => {
    switch(activeTab) {
      case 'worksheet': return outputWorksheet;
      case 'assessment': return outputAssessment;
      case 'kb': return outputKb;
      case 'notebooklm': return outputNotebookLMGuide;
      case 'quiz': return outputGamifiedQuiz;
      default: return null;
    }
  }, [activeTab, outputWorksheet, outputAssessment, outputKb, outputNotebookLMGuide, outputGamifiedQuiz]);

  const handleCopy = () => {
    const textToCopy = activeTab === 'script' ? outputScript : currentContent;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const modules = [
    { id: 'script', title: '教學腳本', icon: Layout, data: outputScript, action: onScriptPipeline, color: 'indigo' },
    { id: 'worksheet', title: '學習單', icon: FileText, data: outputWorksheet, action: () => onManualModule('worksheet'), color: 'emerald' },
    { id: 'assessment', title: '評量卷', icon: Check, data: outputAssessment, action: () => onManualModule('assessment'), color: 'blue' },
    { id: 'kb', title: '知識庫', icon: Database, data: outputKb, action: () => onManualModule('kb'), color: 'purple' },
    { id: 'notebooklm', title: 'NotebookLM', icon: BookOpen, data: outputNotebookLMGuide, action: () => onManualModule('notebooklm'), color: 'amber' },
    { id: 'quiz', title: '遊戲測驗', icon: Sparkles, data: outputGamifiedQuiz, action: () => onManualModule('quiz'), color: 'rose' },
  ];

  return (
    <div className="flex flex-col h-full space-y-6 pb-24 animate-in fade-in duration-700 bg-slate-50/50">
      
      {/* 標題與狀態 */}
      <div className="flex justify-between items-end px-2">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
              <Sparkles size={24} />
            </div>
            AI 全原子模組產出
          </h2>
          <p className="text-slate-500 font-bold mt-1 ml-11">所有教學模組已就緒，隨時可供下載或匯入。 </p>
        </div>
      </div>

      {/* 模組選擇導覽器 (強化視覺反饋) */}
      <div className="flex overflow-x-auto pb-2 gap-4 px-2 no-scrollbar">
        {modules.map((mod) => {
          const isActive = activeTab === mod.id;
          const hasData = !!mod.data;
          return (
            <button 
              key={mod.id}
              onClick={() => { setActiveTab(mod.id); if(!hasData) mod.action(); }}
              className={`flex-none w-44 p-4 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group ${
                isActive ? 'border-indigo-600 bg-white shadow-xl -translate-y-1' : 'border-slate-200 bg-white/50 grayscale hover:grayscale-0'
              }`}
            >
              <div className={`p-2 rounded-lg w-fit mb-3 ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                <mod.icon size={20} />
              </div>
              <div className="font-black text-slate-800 text-left">{mod.title}</div>
              <div className="text-[10px] font-bold text-slate-400 text-left uppercase tracking-widest mt-1">
                {hasData ? '● Ready' : '○ Standby'}
              </div>
              {isActive && <div className="absolute bottom-0 left-0 h-1 w-full bg-indigo-600" />}
            </button>
          )
        })}
      </div>

      {/* 主內容區 - 雙色調佈景 */}
      <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col mx-2 relative min-h-[600px]">
        
        {/* 工具列 */}
        <div className="bg-slate-50 px-8 py-4 border-b flex justify-between items-center">
            <div className="flex items-center gap-4">
               <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-1 rounded font-black uppercase tracking-widest">
                 Preview Mode
               </span>
               <h3 className="font-black text-slate-700">{modules.find(m => m.id === activeTab)?.title}</h3>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
              >
                {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                {isCopied ? '已複製' : '複製內容'}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                <Download size={14} /> 匯出模組
              </button>
            </div>
        </div>

        {/* 渲染內容 */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {isLoading && !currentContent && activeTab !== 'script' ? (
             <div className="flex flex-col items-center justify-center h-full py-20 space-y-4">
                <div className="relative">
                  <Loader2 size={48} className="animate-spin text-indigo-600" />
                  <Sparkles size={20} className="absolute -top-2 -right-2 text-amber-400 animate-bounce" />
                </div>
                <p className="font-black text-slate-400">正在啟動原子能運算，撰寫中...</p>
             </div>
          ) : activeTab === 'script' && scriptSlides.length > 0 ? (
            /* 🌟 [亮點優化] 投影片卡片渲染 */
            <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
              {scriptSlides.map((slide: any, idx: number) => (
                <div key={idx} className="group relative bg-slate-50 border-2 border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:border-indigo-300 transition-all">
                  <div className="bg-slate-200/50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Slide {idx + 1} // {slide.type}</span>
                    <Edit3 size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" />
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="space-y-2">
                      <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">顯示文字 (Display)</div>
                      <div className="text-xl font-bold text-slate-800 leading-relaxed bg-white p-4 rounded-xl border border-slate-100 shadow-inner">
                        {slide.displayText || '---'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">引導語腳本 (Guide Talk)</div>
                      <div className="text-sm text-slate-600 leading-relaxed italic border-l-4 border-emerald-400 pl-4 py-2">
                        {slide.guideTalk || '---'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : currentContent ? (
            <div className="prose prose-slate prose-indigo max-w-4xl mx-auto bg-slate-50 p-10 rounded-3xl border border-slate-100 shadow-inner">
               <ReactMarkdown>{currentContent}</ReactMarkdown>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-slate-300">
               <AlertCircle size={64} strokeWidth={1} className="mb-4" />
               <p className="font-bold">尚未生成內容，請點擊上方模組開始產出</p>
            </div>
          )}
        </div>
      </div>

      {/* 底部導航 */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-200 flex justify-center z-50">
        <button 
          onClick={onBack} 
          disabled={isLoading} 
          className="px-8 py-4 text-slate-500 font-black hover:bg-slate-100 rounded-2xl transition-all border-2 border-slate-200 flex items-center gap-2"
        >
          <ArrowLeft size={20} /> 返回修改選角設定
        </button>
      </div>
    </div>
  );
};

export default Step5Output;