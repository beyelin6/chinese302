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

  // 🌟 視角切換開關
  const [viewMode, setViewMode] = useState<'json' | 'human'>('human'); // 預設為人類閱讀模式

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
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 overflow-hidden animate-fade-in">
      
      {/* 🌟 頂部導覽列 (Header)：純白底色 + 底部輕微陰影 */}
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
        
        {/* 左側：編輯區 (明亮版卡片設計) */}
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
                        className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-800 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                        placeholder="投影片顯示文字 (100% 原文鎖定)..."
                        rows={2}
                      />
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <textarea 
                          value={slide.guideTalk} 
                          onChange={(e) => updateSlide(idx, 'guideTalk', e.target.value)}
                          className="w-full bg-transparent border-none p-0 text-sm text-slate-700 leading-relaxed font-medium focus:ring-0 outline-none resize-none italic"
                          placeholder="導師引導語腳本..."
                          rows={2}
                        />
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 break-all line-clamp-1 hover:line-clamp-none transition-all">
                        IMAGE_PROMPT: {slide.visual_prompt}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader2 size={40} className="animate-spin mb-4 text-indigo-500" />
                  <p className="font-bold text-sm tracking-widest uppercase">Executing Digital Twin Protocol...</p>
                </div>
              )
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 prose prose-slate max-w-none shadow-sm">
                <ReactMarkdown>{syncRawCode}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>

        {/* 右側：即時碼 / 劇本預覽 (明亮版) */}
        <div className="w-[480px] border-l border-slate-200 bg-slate-50 flex flex-col">
          <div className="px-4 py-3 bg-white border-b border-slate-200 flex justify-between items-center">
            
            {/* 🌟 視角切換開關 */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode('human')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'human' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                劇本模式
              </button>
              <button 
                onClick={() => setViewMode('json')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'json' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                JSON 程式碼
              </button>
            </div>

            <button onClick={() => { navigator.clipboard.writeText(syncRawCode); setIsCopied(true); setTimeout(()=>setIsCopied(false), 2000); }} className="text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1 text-xs font-bold bg-slate-100 px-2 py-1 rounded-md">
              {isCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              複製全文
            </button>
          </div>
          <div className="flex-1 p-4 font-mono text-xs leading-relaxed text-slate-700 overflow-y-auto custom-scrollbar bg-[#f8fafc]">
            {viewMode === 'json' ? (
              <pre className="whitespace-pre-wrap break-words">
                <code>{syncRawCode}</code>
              </pre>
            ) : (
              <div className="space-y-6 font-sans">
                {editableSlides.map((slide, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                      <span className="font-black text-indigo-700 text-sm">#{slide.page_number || idx + 1} {slide.title}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-md font-mono">{slide.lens}</span>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="font-bold text-slate-500 text-xs block mb-1">🖼️ 畫面提示 (Visual)</span>
                        <span className="text-slate-600">{slide.visual_prompt}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-500 text-xs block mb-1">📝 顯示文字 (Text)</span>
                        <div className="text-slate-800 font-medium whitespace-pre-wrap">{slide.displayText}</div>
                      </div>
                      <div className="bg-indigo-50/50 p-2 rounded-lg border border-indigo-100">
                        <span className="font-bold text-indigo-400 text-xs block mb-1">🧑‍🏫 導師台詞 (Speech)</span>
                        <span className="text-indigo-900 font-medium">
                          {slide.guideAction ? <span className="text-indigo-500 italic mr-1">({slide.guideAction})</span> : null}
                          {slide.guideTalk}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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