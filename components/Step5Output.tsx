// 檔案路徑: src/components/Step5Output.tsx

import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Layout, FileText, Check, Download, ArrowLeft, Loader2, 
  Sparkles, BookOpen, Database, Copy, Code, Zap
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
   * 3. 🌟 [核心進化]：根據「4 大核心細節」即時封裝 Unified Data
   * 這保證了即便在前端編輯過文字，匯出的 YAML 依然完整。
   */
  const syncRawCode = useMemo(() => {
    if (activeTab !== 'script') {
      return activeTab === 'worksheet' ? outputWorksheet || "" : 
             activeTab === 'assessment' ? outputAssessment || "" : 
             activeTab === 'kb' ? outputKb || "" : outputNotebookLMGuide || "";
    }

    const safeParse = (data: any) => {
      try { return typeof data === 'string' ? JSON.parse(data) : data; }
      catch { return {}; }
    };

    const visual = safeParse(state.visualResult);
    const casting = safeParse(state.castingResult);
    const analysis = state.analysisData;
    const vocabData = safeParse(state.deepVocabResult);

    // 🌟 構建與「之前設定」完全對位的 YAML 核心結構
    const unifiedPayload = {
      // ⚙️ NOTEBOOKLM DRIVER (系統級指令驅動)
      notebooklm_driver: {
        system_role: "You are the V-MAX Slide Architect. Generate slides based on the YAML constraints.",
        artistic_consistency: visual?.style?.code || "A",
        style_prompt: visual?.style?.description || "Maintain stylistic consistency.",
        dna_traits: {
          protagonist: casting?.protagonist || "主角視覺特徵",
          guide: `${casting?.guide?.name || '導師'} | ${casting?.guide?.visualDNA || '標準人設'}`
        }
      },
      // 🎬 第一部分：YAML 核心記錄細節 (四大細節)
      VMAX_STRUCTURE_YAML: {
        // 1. 視覺執行協定
        global_visual_protocol: { 
          artistic_consistency: visual?.style?.code || "A", 
          image_ratio: "16:9",
          rendering_priority: "Visual DNA Consistency"
        },
        // 2. 結構與隱喻選擇
        scaffolding_logic: {
          macro_structure: analysis?.visualStructureRecommendation || "N1 故事山",
          micro_thinking: "C1 氣泡圖 (分析) / T1 對比圖 (辨析)",
          visual_metaphor: visual?.metaphor?.label || "M3 故事絲帶",
          visual_description: `必須在背景中使用「${visual?.metaphor?.label || '隱喻元素'}」串連全課。`
        },
        // 3. 角色視覺錨點
        visual_dna_anchor: {
          protagonist_dna: casting?.protagonist || "主角視覺 DNA",
          guide_dna: casting?.guide?.visualDNA || "導師視覺 DNA"
        },
        // 4. 簡報結構藍圖 (動態記錄)
        slide_sequence_blueprint: {
          PART_A: "導航與鷹架 (P1-P3)",
          PART_B: "詳盡課文迴圈 (意義段解析)",
          PART_C: "原子語文與評量 (C1-C4)",
          PART_D_E: "策略、語文活動與結尾"
        }
      },
      // 第三部分：原子化動態腳本
      slides: editableSlides
    };

    return JSON.stringify(unifiedPayload, null, 2);
  }, [editableSlides, activeTab, state.visualResult, state.castingResult, state.analysisData, outputWorksheet, outputAssessment, outputKb, outputNotebookLMGuide]);

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
    { id: 'script', title: '一體化腳本', icon: Layout, data: outputScript, action: onScriptPipeline },
    { id: 'worksheet', title: '學習單', icon: FileText, data: outputWorksheet, action: () => onManualModule('worksheet') },
    { id: 'assessment', title: '評量卷', icon: Check, data: outputAssessment, action: () => onManualModule('assessment') },
    { id: 'kb', title: '知識庫', icon: Database, data: outputKb, action: () => onManualModule('kb') },
    { id: 'notebooklm', title: '操作指令', icon: BookOpen, data: outputNotebookLMGuide, action: () => onManualModule('notebooklm') },
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
              <Sparkles className="text-indigo-400" size={18} />
              V-MAX UNIFIED TERMINAL
            </h2>
            <div className="text-[10px] text-slate-500 font-mono">
              MODE: {activeTab === 'script' ? 'ENGINE_YAML_ACTIVE' : 'DOCUMENT_PREVIEW'}
            </div>
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
                  <div key={idx} className="bg-slate-800/40 border border-slate-700 rounded-xl overflow-hidden focus-within:border-indigo-500/50 transition-all">
                    <div className="bg-slate-800/80 px-4 py-2 border-b border-slate-700 text-[10px] font-mono text-slate-500 flex justify-between items-center">
                      <span>UNIT_SLIDE_{idx + 1} // {slide.type}</span>
                      <span className="flex items-center gap-1 text-emerald-500"><Check size={10}/> DNA_SYNCED</span>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex gap-2">
                         <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/30">鏡頭: {slide.lens || "中景"}</span>
                      </div>
                      <textarea 
                        value={slide.displayText} 
                        onChange={(e) => updateSlide(idx, 'displayText', e.target.value)}
                        className="w-full bg-slate-900/80 border border-slate-700 rounded-lg p-3 text-sm font-bold text-white focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                        placeholder="投影片顯示文字 (100% 原文鎖定)..."
                        rows={2}
                      />
                      <textarea 
                        value={slide.guideTalk} 
                        onChange={(e) => updateSlide(idx, 'guideTalk', e.target.value)}
                        className="w-full bg-slate-900/40 border border-slate-700 rounded-lg p-3 text-xs text-slate-400 italic focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                        placeholder="導師引導語腳本..."
                        rows={2}
                      />
                      <div className="text-[9px] text-slate-600 font-mono break-all line-clamp-1 hover:line-clamp-none transition-all">
                        IMAGE_PROMPT: {slide.visual_prompt}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                  <Loader2 size={40} className="animate-spin mb-4 text-indigo-500" />
                  <p className="font-bold text-sm tracking-widest uppercase">Executing Digital Twin Protocol...</p>
                </div>
              )
            ) : (
              <div className="bg-slate-800/20 rounded-2xl p-8 border border-slate-800 prose prose-invert max-w-none shadow-inner">
                <ReactMarkdown>{syncRawCode}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>

        {/* 右側：即時碼 (即時包含完整的四大核心記錄細節) */}
        <div className="w-[480px] border-l border-slate-700 bg-slate-900 flex flex-col">
          <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
            <span className="text-[10px] font-black text-indigo-400 flex items-center gap-2 tracking-widest uppercase">
              <Code size={12} /> {activeTab === 'script' ? 'Unified JSON Engine' : 'Raw Documentation'}
            </span>
            <button onClick={() => { navigator.clipboard.writeText(syncRawCode); setIsCopied(true); setTimeout(()=>setIsCopied(false), 2000); }} className="text-slate-400 hover:text-white">
              {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>
          <div className="flex-1 p-4 font-mono text-[10px] overflow-y-auto custom-scrollbar bg-black/20">
            <pre className="text-emerald-500/70 whitespace-pre-wrap leading-relaxed">
              <code>{syncRawCode}</code>
            </pre>
          </div>
          <div className="p-3 bg-indigo-600/10 border-t border-slate-700 text-[9px] text-indigo-400/60 font-mono">
            VMAX_PROTOCOL: {activeTab === 'script' ? 'SYNCED_WITH_DNA_ANCHOR' : 'READY_TO_COPY'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step5Output;