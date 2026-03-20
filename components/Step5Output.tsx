// 檔案路徑: src/components/Step5Output.tsx

import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Layout, FileText, Check, Download, ArrowLeft, Loader2, 
  Sparkles, BookOpen, Database, Copy, Code, Zap, MessageSquare,
  Image as ImageIcon, MessageCircle, CheckCircle // 🌟 修復：補齊缺少的 Icons
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
  const prevSlidesLength = useRef(0);

  // 🌟 視角切換開關 (右側面板使用)
  const [viewMode, setViewMode] = useState<'json' | 'human'>('human'); 

  // 1. 初始化與自動觸發
  useEffect(() => {
    if (!outputScript && !isLoading) {
      onScriptPipeline();
    }
  }, [outputScript, isLoading, onScriptPipeline]);

  // 2. 增量同步邏輯：解析傳入的統一腳本 (YAML + Slides)
  useEffect(() => {
    if (outputScript) {
      try {
        const parsed = JSON.parse(outputScript);
        const incomingSlides = parsed.slides || (Array.isArray(parsed) ? parsed : []);
        
        if (incomingSlides.length > prevSlidesLength.current) {
          setEditableSlides(incomingSlides);
          prevSlidesLength.current = incomingSlides.length;
        }
      } catch (e) {
        console.error("解析腳本失敗", e);
      }
    }
  }, [outputScript]);

  /**
   * 3. 🌟 核心引擎：根據當前分頁與狀態，即時封裝資料
   */
  const syncRawCode = useMemo(() => {
    if (activeTab !== 'script') {
      return activeTab === 'worksheet' ? outputWorksheet || "" : 
             activeTab === 'assessment' ? outputAssessment || "" : 
             activeTab === 'kb' ? outputKb || "" : 
             activeTab === 'notebooklm' ? outputNotebookLMGuide || "" : outputGamifiedQuiz || "";
    }

    const safeParse = (data: any) => {
      try { return typeof data === 'string' ? JSON.parse(data) : data; }
      catch { return {}; }
    };

    const visual = safeParse(state.visualResult);
    const casting = safeParse(state.castingResult);
    const analysis = state.analysisData;

    // 構建與「之前設定」完全對位的 YAML 核心結構
    const unifiedPayload = {
      notebooklm_driver: {
        system_role: "You are the V-MAX Slide Architect. Generate slides based on the YAML constraints.",
        artistic_consistency: visual?.style?.code || "A",
        style_prompt: visual?.style?.description || "Maintain stylistic consistency.",
        dna_traits: {
          protagonist: casting?.protagonist || "主角視覺特徵",
          guide: `${casting?.guide?.name || '導師'} | ${casting?.guide?.visualDNA || '標準人設'}`
        }
      },
      VMAX_STRUCTURE_YAML: {
        global_visual_protocol: { 
          artistic_consistency: visual?.style?.code || "A", 
          image_ratio: "16:9",
          rendering_priority: "Visual DNA Consistency"
        },
        scaffolding_logic: {
          macro_structure: analysis?.visualStructureRecommendation || "N1 故事山",
          micro_thinking: "C1 氣泡圖 / T1 對比圖",
          visual_metaphor: visual?.metaphor?.name || "隱喻設計",
          visual_description: `必須在背景中使用「${visual?.metaphor?.name || '專屬隱喻'}」串連全課。`
        },
        visual_dna_anchor: {
          protagonist_dna: casting?.protagonist || "主角視覺 DNA",
          guide_dna: casting?.guide?.visualDNA || "導師視覺 DNA"
        }
      },
      slides: editableSlides
    };

    return JSON.stringify(unifiedPayload, null, 2);
  }, [editableSlides, activeTab, state.visualResult, state.castingResult, state.analysisData, outputWorksheet, outputAssessment, outputKb, outputNotebookLMGuide, outputGamifiedQuiz]);

  const updateSlide = (index: number, field: string, value: string) => {
    const newSlides = [...editableSlides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setEditableSlides(newSlides);
  };

  const handleDownload = () => {
    if (!syncRawCode) return;
    const blob = new Blob(['\ufeff', syncRawCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VMAX_${activeTab.toUpperCase()}_UNIFIED.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const modules = [
    { id: 'script', title: '教學腳本', icon: Layout, data: outputScript, action: onScriptPipeline },
    { id: 'worksheet', title: '學習單', icon: FileText, data: outputWorksheet, action: () => onManualModule('worksheet') },
    { id: 'assessment', title: '評量卷', icon: CheckCircle, data: outputAssessment, action: () => onManualModule('assessment') },
    { id: 'kb', title: '知識庫', icon: Database, data: outputKb, action: () => onManualModule('kb') },
    { id: 'notebooklm', title: '生成指令', icon: BookOpen, data: outputNotebookLMGuide, action: () => onManualModule('notebooklm') },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 overflow-hidden animate-in fade-in duration-500">
      
      {/* 🌟 頂部導覽列 (Header) */}
      <div className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 flex-shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h2 className="font-black text-lg tracking-tight flex items-center gap-2 text-slate-800">
              <Sparkles className="text-indigo-600" size={18} />
              V-MAX UNIFIED TERMINAL
            </h2>
            <div className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase font-mono">
              MODE: {activeTab === 'script' ? 'ENGINE_YAML_ACTIVE' : 'DOCUMENT_PREVIEW'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl mr-2">
            {modules.map(mod => (
              <button
                key={mod.id}
                onClick={() => { setActiveTab(mod.id); if(!mod.data) mod.action(); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === mod.id 
                    ? 'bg-white text-indigo-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                }`}
              >
                <mod.icon size={14} /> {mod.title}
              </button>
            ))}
          </div>
          <div className="w-px h-6 bg-slate-200 mx-2" />
          <button onClick={handleDownload} className="bg-teal-600 hover:bg-teal-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-2">
            <Download size={14} /> 匯出
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* 左側：編輯區 / 文件閱讀區 */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50">
          <div className="max-w-3xl mx-auto space-y-6 pb-20">
            {activeTab === 'script' ? (
              editableSlides.length > 0 ? (
                editableSlides.map((slide, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden focus-within:border-indigo-300 transition-all">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 text-xs font-mono text-slate-500 flex justify-between items-center">
                      <span>UNIT_SLIDE_{idx + 1} // {slide.type}</span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
                        <Check size={12}/> DNA_SYNCED
                      </span>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="flex gap-2">
                         <span className="inline-block text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-md">鏡頭: {slide.lens || "中景"}</span>
                      </div>
                      <textarea 
                        value={slide.displayText} 
                        onChange={(e) => updateSlide(idx, 'displayText', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-800 focus:ring-1 focus:ring-indigo-500 outline-none resize-none min-h-[60px]"
                        placeholder="投影片顯示文字 (100% 原文鎖定)..."
                      />
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <textarea 
                          value={slide.guideTalk} 
                          onChange={(e) => updateSlide(idx, 'guideTalk', e.target.value)}
                          className="w-full bg-transparent border-none p-0 text-sm text-slate-700 leading-relaxed font-medium focus:ring-0 outline-none resize-none italic min-h-[60px]"
                          placeholder="導師引導語腳本..."
                        />
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 break-all line-clamp-1 hover:line-clamp-none transition-all">
                        IMAGE_PROMPT: {slide.visual_prompt}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                  <Loader2 size={40} className="animate-spin mb-4 text-indigo-500" />
                  <p className="font-bold text-sm tracking-widest uppercase">Executing Digital Twin Protocol...</p>
                </div>
              )
            ) : (
              // 🌟 其他模組 (學習單/測驗等) 的 Markdown 渲染
              <div className="bg-white rounded-2xl p-8 border border-slate-200 prose prose-slate max-w-none shadow-sm min-h-[600px]">
                {syncRawCode ? (
                  <ReactMarkdown>{syncRawCode}</ReactMarkdown>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 mt-20">
                    <Loader2 size={40} className="animate-spin mb-4 text-indigo-500" />
                    <p className="font-bold">AI 正在為您撰寫 {modules.find(m => m.id === activeTab)?.title}...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 右側：即時碼 / 劇本預覽 */}
        <div className="w-[480px] border-l border-slate-200 bg-slate-50 flex flex-col shadow-[-10px_0_15px_-10px_rgba(0,0,0,0.05)] z-10">
          <div className="px-4 py-3 bg-white border-b border-slate-200 flex justify-between items-center">
            
            {/* 🌟 只有在 script 頁籤才顯示「人類/JSON切換開關」 */}
            {activeTab === 'script' ? (
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setViewMode('human')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'human' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  劇本預覽
                </button>
                <button 
                  onClick={() => setViewMode('json')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'json' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  JSON 原始碼
                </button>
              </div>
            ) : (
              <div className="text-sm font-black text-slate-700 flex items-center gap-2">
                <Code size={16} className="text-indigo-500" /> 純文字數據
              </div>
            )}

            <button onClick={() => { navigator.clipboard.writeText(syncRawCode); setIsCopied(true); setTimeout(()=>setIsCopied(false), 2000); }} className="text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1 text-xs font-bold bg-slate-100 px-3 py-1.5 rounded-lg active:scale-95">
              {isCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              {isCopied ? '已複製' : '複製全部'}
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-[#f8fafc]">
            {activeTab === 'script' && viewMode === 'human' ? (
              // 🌟 劇本卡片模式
              <div className="space-y-4">
                {editableSlides.map((slide, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                      <span className="font-black text-indigo-700 text-sm">P{slide.page_number || (idx+1)}: {slide.title}</span>
                      <span className="text-[9px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded font-mono uppercase tracking-tighter">{slide.type}</span>
                    </div>
                    <div className="space-y-3">
                       <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 block mb-1 flex items-center gap-1"><ImageIcon size={12}/> 場景提示 (Prompt)</span>
                          <p className="text-[11px] text-slate-600 italic font-mono leading-relaxed line-clamp-2" title={slide.visual_prompt}>{slide.visual_prompt}</p>
                       </div>
                       <div>
                          <span className="text-[10px] font-bold text-slate-500 block mb-1 flex items-center gap-1"><Layout size={12}/> 畫面文字 (Text)</span>
                          <p className="text-sm text-slate-800 font-bold whitespace-pre-wrap leading-snug">{slide.displayText}</p>
                       </div>
                       <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                          <span className="text-[10px] font-bold text-indigo-400 block mb-1 flex items-center gap-1"><MessageCircle size={12}/> 導師台詞 (Speech)</span>
                          <p className="text-xs text-indigo-900 leading-relaxed font-medium">
                            {slide.guideAction && <span className="text-indigo-500 italic mr-1">({slide.guideAction})</span>}
                            {slide.guideTalk}
                          </p>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // 💻 JSON 原始碼 / 其他模組純文字模式
              <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-slate-600 bg-slate-100/50 p-4 rounded-xl border border-slate-200">
                <code>{syncRawCode}</code>
              </pre>
            )}
          </div>
          <div className="p-3 bg-indigo-50 border-t border-slate-200 text-[9px] text-indigo-400 font-bold font-mono">
            VMAX_PROTOCOL: {activeTab === 'script' ? 'SYNCED_WITH_DNA_ANCHOR' : 'READY_TO_COPY'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step5Output;