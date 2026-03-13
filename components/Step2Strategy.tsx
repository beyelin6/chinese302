import React, { useState, useCallback, memo } from 'react';
import { Target, BookOpen, MessageCircle, Trash2, RefreshCw, ArrowRight, ChevronDown, ChevronUp, BrainCircuit, Wand2, Loader2 } from 'lucide-react';
import { AnalysisData } from '../types';
import { sendMessageToGemini } from '../services/gemini'; // 引入 Gemini 服務

// 🌟 [重構 Phase 3] 將單一段落卡片獨立並深度記憶化 (Deep Memoization)
// 確保打字修改段落大意時，只有當前這張卡片會重繪，解決打字卡頓問題！
const SegmentCard = memo(({
  segment,
  idx,
  isExpanded,
  segmentQuestions,
  onToggleExpand,
  onUpdateSummary,
  onUpdateQuestion,
  onDeleteQuestion
}: {
  segment: any;
  idx: number;
  isExpanded: boolean;
  segmentQuestions: any[];
  onToggleExpand: (idx: number) => void;
  onUpdateSummary: (idx: number, newSummary: string) => void;
  onUpdateQuestion: (globalIdx: number, newContent: string) => void;
  onDeleteQuestion: (globalIdx: number) => void;
}) => {
  // --- 🌟 Inline Copilot 狀態管理 ---
  const [isPolishingSummary, setIsPolishingSummary] = useState(false);
  const [polishingQIdx, setPolishingQIdx] = useState<number | null>(null);

  const handlePolishSummary = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!segment.summary) return;
    setIsPolishingSummary(true);
    try {
        // 🛡️ 強化防呆：加上絕對忠於原意的限制
        const prompt = `你是一個專業的國小語文老師與教材編輯。請幫我把以下段落大意潤飾得更精煉、更生動、且更適合放在教案中。

⚠️ 【最高準則：絕對忠於原意】
請「嚴格」保留原本的意思，絕對禁止自行發明、腦補或添加原本沒有的情節與設定！

原句：${segment.summary}

請直接回傳一句潤飾後的結果，絕對不要加上任何引號或其他解釋廢話。`;
        const res = await sendMessageToGemini(prompt, [], 0);
        // 使用更安全的正則表達式，避免編譯器誤判
        const cleanRes = res.replace(/`{3}(?:json|markdown)?/gi, '').replace(/`{3}/g, '').trim();
        onUpdateSummary(idx, cleanRes);
    } catch (err: any) {
        alert("AI 潤飾失敗：" + err.message);
    } finally {
        setIsPolishingSummary(false);
    }
  };

  const handleRewriteQuestion = async (globalIdx: number, content: string) => {
    setPolishingQIdx(globalIdx);
    try {
        // 🛡️ 強化防呆：把該段落大意 (segment.summary) 傳給 AI 作為框架，並嚴格限制不准亂加情節
        const prompt = `你是一個專業的國小語文教學設計師。請幫我把這句教學提問「換個問法」，讓它更具啟發性、引導學生深入思考。

⚠️ 【最高準則：絕對忠於課文】
請「嚴格」根據以下段落大意來重構問題，絕對禁止自行發明、腦補、或添加課文中根本沒有的角色與情節！

【本段大意參考】：${segment.summary || "無"}
【需要換句話說的原問句】：${content}

請直接回傳一個新的問句，絕對不要加上任何引號或其他解釋廢話。`;
        const res = await sendMessageToGemini(prompt, [], 0);
        // 使用更安全的正則表達式，避免編譯器誤判
        const cleanRes = res.replace(/`{3}(?:json|markdown)?/gi, '').replace(/`{3}/g, '').trim();
        onUpdateQuestion(globalIdx, cleanRes);
    } catch (err: any) {
        alert("AI 換問法失敗：" + err.message);
    } finally {
        setPolishingQIdx(null);
    }
  };

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-300 ${isExpanded ? 'border-blue-400 shadow-md' : 'border-slate-200 shadow-sm hover:border-blue-300'}`}>
      
      {/* 卡片標題列 (可點擊展開/收合) */}
      <div 
        className="p-4 flex items-center justify-between cursor-pointer bg-slate-50/50 rounded-t-2xl"
        onClick={() => onToggleExpand(idx)}
      >
        <div className="flex items-center gap-3">
          <span className="bg-blue-100 text-blue-700 font-black px-3 py-1 rounded-lg text-sm">
            第 {idx + 1} 段
          </span>
          <span className="font-bold text-slate-700 line-clamp-1">
            {segment.summary || "段落大意..."}
          </span>
        </div>
        {isExpanded ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
      </div>

      {/* 卡片展開內容區 */}
      {isExpanded && (
        <div className="p-5 border-t border-slate-100 space-y-5">
          
          {/* 段落大意編輯區 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-500 flex items-center gap-1">
                📝 段落大意微調
              </label>
              {/* 🌟 新增：段落大意 Copilot 魔杖 */}
              <button 
                onClick={handlePolishSummary}
                disabled={isPolishingSummary || !segment.summary}
                className="text-[10px] flex items-center gap-1 bg-amber-50 text-amber-600 border border-amber-200 px-2 py-1 rounded hover:bg-amber-100 transition-colors disabled:opacity-50 shadow-sm"
              >
                {isPolishingSummary ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                AI 潤飾大意
              </button>
            </div>
            <textarea 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all resize-none leading-relaxed"
              rows={2}
              value={segment.summary || ""}
              onChange={(e) => onUpdateSummary(idx, e.target.value)}
            />
          </div>

          {/* 專屬提問清單 */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-500 flex items-center gap-1">
              <MessageCircle size={16} /> 教學提問 (DOK 層次)
            </label>
            
            {segmentQuestions.length > 0 ? (
              segmentQuestions.map((q, qIdx) => (
                <div key={qIdx} className="flex items-start gap-3 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-black px-2 py-1 rounded mt-0.5 whitespace-nowrap">
                    {q.type || "提問"}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">
                      {polishingQIdx === q.globalIndex ? (
                        <span className="text-amber-600 flex items-center gap-2 font-bold">
                           <Loader2 size={14} className="animate-spin"/> AI 正在重新設計問法...
                        </span>
                      ) : q.content}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {/* 🌟 新增：提問換句話說 Copilot */}
                    <button 
                      onClick={() => handleRewriteQuestion(q.globalIndex, q.content)}
                      disabled={polishingQIdx === q.globalIndex}
                      className="p-1.5 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors" 
                      title="AI 換個更棒的問法 (Copilot)"
                    >
                      <Wand2 size={16} />
                    </button>
                    {/* 🌟 實作：刪除提問 */}
                    <button 
                      onClick={() => onDeleteQuestion(q.globalIndex)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" 
                      title="刪除此題"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400 text-sm flex flex-col items-center justify-center gap-2">
                <BrainCircuit size={20} />
                尚未分配提問
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // 效能護城河
  return prevProps.isExpanded === nextProps.isExpanded &&
         prevProps.segment.summary === nextProps.segment.summary &&
         JSON.stringify(prevProps.segmentQuestions) === JSON.stringify(nextProps.segmentQuestions);
});

interface Props {
  data: AnalysisData;
  setData: (data: AnalysisData) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step2Strategy: React.FC<Props> = ({ data, setData, onNext, onBack }) => {
  // 控制哪個段落卡片被展開 (預設展開第一段)
  const [expandedSegment, setExpandedSegment] = useState<number | null>(0);

  const handleToggleExpand = useCallback((idx: number) => {
    setExpandedSegment(prev => prev === idx ? null : idx);
  }, []);

  const handleUpdateSummary = useCallback((idx: number, newSummary: string) => {
    if (!data.segments) return;
    const updated = [...data.segments];
    updated[idx] = { ...updated[idx], summary: newSummary };
    setData({ ...data, segments: updated });
  }, [data, setData]);

  // 🌟 實作 Copilot 所需的 Update 與 Delete 邏輯
  const handleUpdateQuestion = useCallback((globalIdx: number, newContent: string) => {
    if (!data.strategies) return;
    const updated = [...data.strategies];
    updated[globalIdx] = { ...updated[globalIdx], content: newContent };
    setData({ ...data, strategies: updated });
  }, [data, setData]);

  const handleDeleteQuestion = useCallback((globalIdx: number) => {
    if (!data.strategies) return;
    const updated = [...data.strategies];
    updated.splice(globalIdx, 1);
    setData({ ...data, strategies: updated });
  }, [data, setData]);

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in slide-in-from-right-8 duration-500 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800 flex items-center">
          <span className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm shadow-md shadow-emerald-200">4</span>
          邏輯解構與策略分配
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
        
        {/* 1. 寫作聚光燈 (Writing Focus) */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 rounded-3xl text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
            <Target size={120} />
          </div>
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-orange-100">
            <Target size={20} /> 本課寫法焦點
          </h3>
          <p className="text-2xl font-black leading-relaxed">
            {data.basicInfo?.writingTechnique || "分析中..."}
          </p>
          <p className="text-sm mt-2 text-orange-100">
            💡 系統將以此寫作手法為核心，在最後的腳本中自動生成教學引導語。
          </p>
        </div>

        {/* 2. 段落策略手風琴卡片 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <BookOpen size={20} className="text-blue-600" /> 意義段與提問策略分配
            </h3>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md flex items-center gap-1 border border-slate-200">
              <Wand2 size={12} className="text-amber-500"/> 點擊魔杖圖示可呼叫 AI 助手
            </span>
          </div>
          
          {data.segments && data.segments.map((segment, idx) => {
            const isExpanded = expandedSegment === idx;
            // 🌟 將原陣列索引 (globalIndex) 綁定上去，以利精準修改或刪除
            const segmentQuestions = data.strategies
              ?.map((s, globalIndex) => ({ ...s, globalIndex }))
              ?.filter(s => s.segmentIndex === idx) || [];

            return (
              <SegmentCard
                key={`segment-${idx}`}
                segment={segment}
                idx={idx}
                isExpanded={isExpanded}
                segmentQuestions={segmentQuestions}
                onToggleExpand={handleToggleExpand}
                onUpdateSummary={handleUpdateSummary}
                onUpdateQuestion={handleUpdateQuestion}
                onDeleteQuestion={handleDeleteQuestion}
              />
            );
          })}
        </div>
      </div>

      {/* Footer 控制列 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 flex justify-between z-10 px-6 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
        <button onClick={onBack} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all border border-transparent hover:border-slate-200">
          返回上一步
        </button>
        <button
          onClick={onNext}
          className="px-8 py-3 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-xl shadow-lg shadow-teal-200 transition-all flex items-center text-lg active:scale-95"
        >
          確認邏輯，進入視覺包裝
          <ArrowRight className="ml-2" size={20} />
        </button>
      </div>
    </div>
  );
};