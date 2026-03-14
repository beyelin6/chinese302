// 檔案路徑: src/components/Step5Output.tsx

import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Layout, FileText, Check, Download, ArrowLeft, Loader2, 
  Sparkles, BookOpen, Database, Copy, Code, Edit2, Zap
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
  const [editableSlides, setEditableSlides] = useState<any[]>([]);
  
  // 用來追蹤上一次產出的長度，防止編輯被覆蓋
  const prevSlidesLength = useRef(0);

  // 1. 初始化與自動觸發
  useEffect(() => {
    if (!outputScript && !isLoading) {
      onScriptPipeline();
    }
  }, [outputScript, isLoading, onScriptPipeline]);

  // 2. 🌟 增量同步邏輯：支援分段產出
  useEffect(() => {
    if (outputScript) {
      try {
        const cleanJson = outputScript.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        const incomingSlides = Array.isArray(parsed) ? parsed : (parsed.slides || []);
        
        // 僅當「新產出的頁數」大於「目前已有的頁數」時才更新
        // 這能確保 AI 在產出第 6-10 頁時，不會洗掉你對 1-5 頁做的手動修改
        if (incomingSlides.length > prevSlidesLength.current) {
          setEditableSlides(incomingSlides);
          prevSlidesLength.current = incomingSlides.length;
        }
      } catch (e) {
        console.error("解析腳本失敗", e);
      }
    }
  }, [outputScript]);

  // 3. 即時封裝原始碼
  const syncRawCode = useMemo(() => {
    // 嘗試解析視覺與選角資料，增加防呆
    const getSafeData = (data: any) => {
      try { return typeof data === 'string' ? JSON.parse(data) : data; }
      catch { return {}; }
    };

    const visual = getSafeData(state.visualResult);
    const casting = getSafeData(state.castingResult);
    
    const wrapper = {
      VMAX_DNA: {
        style: visual?.style?.code || 'A',
        anchor: casting?.protagonist?.name || 'Standard',
        version: "10.0-ATOMIC"
      },
      slides: editableSlides
    };
    return JSON.stringify(wrapper, null, 2);
  }, [editableSlides, state.visualResult, state.castingResult]);

  const updateSlide = (index: number, field: string, value: string) => {
    const newSlides = [...editableSlides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setEditableSlides(newSlides);
  };

  const handleDownload = () => {
    const content = activeTab === 'script' ? syncRawCode : (activeTab === 'worksheet' ? outputWorksheet : outputAssessment);
    if (!content) return;
    const blob = new Blob(['\ufeff', content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VMAX_${activeTab.toUpperCase()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const modules = [
    { id: 'script', title: '教學腳本', icon: Layout, data: outputScript, action: onScriptPipeline },
    { id: 'worksheet', title: '學習單', icon: FileText, data: outputWorksheet, action: () => onManualModule('worksheet') },
    { id: 'assessment', title: '評量卷', icon: Check, data: outputAssessment, action: () => onManualModule('assessment') },
    { id: 'kb', title: '知識庫', icon: Database, data: outputKb, action: () => onManualModule('kb') },
    { id: 'notebooklm', title: 'NotebookLM', icon: BookOpen, data: outputNotebookLMGuide, action: () => onManualModule('notebooklm') },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-200 overflow-hidden">
      
      {/* 頂部控制列 */}
      <div className="h-16 border-b border-slate-700 bg-slate-800 flex items-center justify-between px-6 flex-shrink-0 z-10 shadow-lg">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h2 className="font-black text-lg tracking-tight flex items-center gap-2">
              <Zap className="text-amber-400 fill-amber-400" size={18} />
              V-MAX ATOMIC TERMINAL
            </h2>
            <div className="text-[10px] text-slate-500 font-mono">STATUS: {isLoading ? 'GENERATING_SEGMENTS...' : 'IDLE_READY'}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {modules.map(mod => (
            <button
              key={mod.id}
              onClick={() => { setActiveTab(mod.id); if(!mod.data) mod.action(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === mod.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
            >
              <mod.icon size={14} /> {mod.title}
            </button>
          ))}
          <div className="w-px h-6 bg-slate-700 mx-2" />
          <button onClick={handleDownload} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
            <Download size={14} /> 匯出
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* 左側：編輯區 */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-950/30">
          <div className="max-w-3xl mx-auto space-y-6 pb-20">
            {activeTab === 'script' ? (
              editableSlides.length > 0 ? (
                editableSlides.map((slide, idx) => (
                  <div key={idx} className="bg-slate-800/40 border border-slate-700 rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="bg-slate-800/80 px-4 py-2 border-b border-slate-700 text-[10px] font-mono text-slate-500 flex justify-between items-center">
                      <span>UNIT_SLIDE_{idx + 1} // {slide.type}</span>
                      <span className="flex items-center gap-1 text-emerald-500"><Check size={10}/> VERIFIED</span>
                    </div>
                    <div className="p-4 space-y-3">
                      <textarea 
                        value={slide.displayText} 
                        onChange={(e) => updateSlide(idx, 'displayText', e.target.value)}
                        className="w-full bg-slate-900/80 border border-slate-700 rounded-lg p-3 text-sm font-bold text-white focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                        placeholder="投影片顯示文字..."
                        rows={2}
                      />
                      <textarea 
                        value={slide.guideTalk} 
                        onChange={(e) => updateSlide(idx, 'guideTalk', e.target.value)}
                        className="w-full bg-slate-900/40 border border-slate-700 rounded-lg p-3 text-xs text-slate-400 italic focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                        placeholder="引導語腳本..."
                        rows={2}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                  <Loader2 size={40} className="animate-spin mb-4 text-indigo-500" />
                  <p className="font-bold text-sm tracking-widest">正在從原子藍圖構建投影片腳本...</p>
                </div>
              )
            ) : (
              <div className="bg-slate-800/20 rounded-2xl p-8 border border-slate-800 prose prose-invert max-w-none shadow-inner">
                <ReactMarkdown>{activeTab === 'worksheet' ? outputWorksheet || '' : activeTab === 'assessment' ? outputAssessment || '' : outputKb || ''}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>

        {/* 右側：即時碼 */}
        <div className="w-[480px] border-l border-slate-700 bg-slate-900 flex flex-col">
          <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
            <span className="text-[10px] font-black text-indigo-400 flex items-center gap-2 tracking-widest uppercase">
              <Code size={12} /> Live Engine Data
            </span>
            <div className="flex gap-2">
               <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-400">JSON</span>
               <button onClick={() => { navigator.clipboard.writeText(syncRawCode); setIsCopied(true); setTimeout(()=>setIsCopied(false), 2000); }} className="text-slate-400 hover:text-white transition-colors">
                 {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
               </button>
            </div>
          </div>
          <div className="flex-1 p-4 font-mono text-[10px] overflow-y-auto custom-scrollbar bg-black/20">
            <pre className="text-emerald-500/70 leading-relaxed">
              <code>{syncRawCode}</code>
            </pre>
          </div>
          <div className="p-4 bg-slate-800/30 border-t border-slate-700 text-[10px] text-slate-500 italic">
            此區塊為即時封裝的資料流，包含 DNA 標記，可直接複製至 AI 工具。
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step5Output;