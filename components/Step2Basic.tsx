// 檔案路徑: src/components/Step2Basic.tsx

import React, { useState, useEffect, useCallback, memo } from 'react';
import { 
  BookOpen, Check, X, ArrowRight, ArrowLeft, 
  PenTool, CheckSquare, Square, Type, Layers, 
  Hash, Info, Sparkles, MessageSquare, Tag, Search 
} from 'lucide-react';
import { AnalysisData, VocabularyItem } from '../types';
import { useWorkflowContext } from '../context/WorkflowContext';

// --------------------------------------------------------
// 🛡️ 步驟一：將單一「卡片」抽成獨立元件，並用 React.memo 包覆
// 這樣只要這個字 (item) 的資料沒變，React 就絕對不會重畫它！
// --------------------------------------------------------
const VocabCard = memo(({ 
  item, 
  onToggleFocus,
  onUpdateOption,
  onProofread
}: { 
  item: VocabularyItem; 
  onToggleFocus: (word: string) => void;
  onUpdateOption: (word: string, key: 'wantsWritingTips' | 'wantsShapeSimilar' | 'wantsPolyphonic') => void;
  onProofread: (item: VocabularyItem) => void;
}) => {
  return (
    <div 
      className={`group p-1 rounded-[2rem] border-2 transition-all duration-300 ${
        item.isFocused ? 'border-teal-500 bg-teal-50/30 shadow-xl scale-[1.02]' : 'border-slate-100 bg-white hover:border-slate-200'
      }`}
    >
      <div onClick={() => onToggleFocus(item.word)} className="flex items-center gap-4 p-5 cursor-pointer relative">
        {/* 🌟 認讀字標籤：即使是認讀字，勾選後 AI 也會抓取形近/多音數據 */}
        {item.type?.includes("認讀") && (
          <span className="absolute top-3 right-3 text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-black border border-amber-200 flex items-center gap-1 shadow-sm">
            <Tag size={10} /> 認讀
          </span>
        )}
        
        <div className={item.isFocused ? 'text-teal-600' : 'text-slate-300'}>
          {item.isFocused ? <CheckSquare size={26} className="fill-teal-50" /> : <Square size={26} />}
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800 tracking-tighter">{item.word}</span>
            <span className="text-xs font-bold text-slate-400">{item.radical}部 / {item.zhuyin}</span>
          </div>
        </div>
      </div>

      {/* 🌟 展開配置：處理「不教寫法，只教形近」的關鍵區域 */}
      {item.isFocused && (
        <div className="px-5 pb-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          
          {/* 字形說明框：根據 wantsWritingTips 開關連動顯示/隱藏 */}
          {item.wantsWritingTips && (
            <div className="p-3.5 bg-white rounded-2xl border border-teal-100 text-xs font-bold text-slate-600 flex items-start gap-3 shadow-inner">
              <div className="p-1 bg-teal-50 rounded-lg text-teal-600 mt-0.5"><PenTool size={14} /></div>
              <div className="flex-1">
                <span className="text-teal-700 font-black block mb-0.5 text-[10px] uppercase">寫法提醒：</span>
                <p className="leading-relaxed opacity-80">{item.writingTips}</p>
              </div>
            </div>
          )}

          {/* 教學意圖三色按鈕 */}
          <div className="flex gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onUpdateOption(item.word, 'wantsWritingTips'); }}
              className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-2xl text-[10px] font-black border-2 transition-all duration-200 ${
                item.wantsWritingTips ? 'bg-teal-600 border-teal-600 text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-400'
              }`}
            >
              <PenTool size={16} /> 教字形
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onUpdateOption(item.word, 'wantsShapeSimilar'); }}
              className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-2xl text-[10px] font-black border-2 transition-all duration-200 ${
                item.wantsShapeSimilar ? 'bg-orange-500 border-orange-500 text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-400'
              }`}
            >
              <Layers size={16} /> 教形近
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onUpdateOption(item.word, 'wantsPolyphonic'); }}
              className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-2xl text-[10px] font-black border-2 transition-all duration-200 ${
                item.wantsPolyphonic ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-400'
              }`}
            >
              <Hash size={16} /> 教多音
            </button>
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); onProofread(item); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-[10px] font-black border-2 border-slate-100 text-teal-600 hover:bg-teal-50 transition-all active:scale-95 shadow-sm"
          >
            <Search size={14} /> 進入人工校對與比對模式
          </button>
        </div>
      )}
    </div>
  );
});

interface Step2BasicProps {
  analysis: string | null; 
  onConfirmBasic: (confirmedData: AnalysisData) => void;
  isLoading: boolean;
  onUpdateVocab: (word: string, updatedData: Partial<VocabularyItem>) => void;
  onBack: () => void;
}

const Step2Basic: React.FC<Step2BasicProps> = ({ analysis, onConfirmBasic, isLoading, onUpdateVocab, onBack }) => {
  const { state, dispatch } = useWorkflowContext();
  const [data, setData] = useState<AnalysisData | null>(null);
  const [proofreadItem, setProofreadItem] = useState<VocabularyItem | null>(null);

  // 🌟 [防呆提取]：確保即使資料尚未解析完成，元件也不會崩潰
  const vocabList = data?.coreVocabulary || [];
  const activityList = data?.languageActivities || [];
  
  const rawContext = state.analysisData?.fullText || "";

  // 下面要怎麼 filter 都不會壞掉了！
  const selectedVocabs = vocabList.filter((v: any) => v.isFocused);

  useEffect(() => {
    if (!analysis) return;
    try {
      const cleanJson = analysis.replace(/```json/g, '').replace(/```/g, '');
      const parsed = JSON.parse(cleanJson);
      
      // 🌟 [自動化意圖配置]：初始化時預設「形近字」為開啟，「字形」、「多音」為關閉
      if (parsed.coreVocabulary) {
        parsed.coreVocabulary = parsed.coreVocabulary.map((v: any) => ({
          ...v,
          isFocused: v.isFocused ?? false,
          wantsWritingTips: false,  
          wantsShapeSimilar: true, 
          wantsPolyphonic: false,  
          writingTips: v.writingTips || "請注意字形比例與重心。"
        }));
      }

      // [難詞與成語物件化] 支援 Selectable 結構
      const mapSelected = (list: any[]) => (list || []).map((i: any) => 
        typeof i === 'string' ? { word: i, isSelected: true } : { ...i, isSelected: i.isSelected ?? true }
      );
      parsed.textbookDifficultWords = mapSelected(parsed.textbookDifficultWords);
      parsed.idioms = mapSelected(parsed.idioms);

      setData(parsed);
    } catch (e) {
      console.error("Step 2.0 解析失敗", e);
    }
  }, [analysis]);

  // 🌟 使用 useCallback 確保這個函數的記憶體位置不會每次都改變
  const toggleFocus = useCallback((word: string) => {
    setData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        coreVocabulary: prev.coreVocabulary.map(v => 
          v.word === word ? { ...v, isFocused: !v.isFocused } : v
        )
      };
    });
  }, []);

  const updateOption = useCallback((word: string, key: 'wantsWritingTips' | 'wantsShapeSimilar' | 'wantsPolyphonic') => {
    setData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        coreVocabulary: prev.coreVocabulary.map(v => 
          v.word === word ? { ...v, [key]: !v[key] } : v
        )
      };
    });
  }, []);

  const handleSaveProofread = (updatedItem: VocabularyItem) => {
    setData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        coreVocabulary: prev.coreVocabulary.map(v => 
          v.word === updatedItem.word ? updatedItem : v
        )
      };
    });
    onUpdateVocab(updatedItem.word, updatedItem);
    setProofreadItem(null);
  };

  // 🛡️ 加上防呆保護，避免 undefined 造成 .filter 當機
  const handleDeleteWord = (idx: number) => {
    // 👈 確保絕對是陣列，防止 filter 報錯
    const currentWords = data?.textbookDifficultWords || []; 
    const updated = currentWords.filter((_, i) => i !== idx);
    setData({ ...data!, textbookDifficultWords: updated });
  };

  const handleDeleteIdiom = (idx: number) => {
    // 👈 確保絕對是陣列，防止 filter 報錯
    const currentIdioms = data?.idioms || []; 
    const updated = currentIdioms.filter((_, i) => i !== idx);
    setData({ ...data!, idioms: updated });
  };

  if (!data) return null;

  return (
    <div className="flex flex-col h-full space-y-8 pb-32 animate-in fade-in duration-500">
      {/* 標題與核心摘要區 */}
      <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><BookOpen size={120} /></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
            <span className="bg-teal-500 p-2 rounded-2xl shadow-lg shadow-teal-500/20"><Type size={24} /></span>
            STEP 2.0：教學重點定錨
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-90">
             <div className="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                <span className="text-[10px] font-bold text-teal-300 block mb-1 uppercase tracking-tighter">文本類型</span>
                <div className="font-bold truncate">{data.basicInfo?.genre || "未分類"}</div>
             </div>
             <div className="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                <span className="text-[10px] font-bold text-teal-300 block mb-1 uppercase tracking-tighter">寫作手法</span>
                <div className="font-bold truncate">{data.basicInfo?.writingTechnique || "一般描述"}</div>
             </div>
             <div className="bg-white/10 p-4 rounded-2xl border border-white/10 col-span-2 backdrop-blur-sm">
                <span className="text-[10px] font-bold text-teal-300 block mb-1 uppercase tracking-tighter">核心主旨</span>
                <div className="font-bold text-sm line-clamp-1 italic">「{data.basicInfo?.mainIdea || "分析中..."}」</div>
             </div>
          </div>
        </div>
      </div>

      {/* 生字與認讀字配置網格 */}
      <section className="space-y-4 px-2">
        <div className="flex items-center justify-between px-4">
          <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
            <PenTool size={20} className="text-orange-500" /> 生字與認讀字決策
          </h3>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase">
            已選中 {selectedVocabs.length} 項
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vocabList.map((item) => (
            <VocabCard 
              key={item.word}
              item={item}
              onToggleFocus={toggleFocus}
              onUpdateOption={updateOption}
              onProofread={setProofreadItem}
            />
          ))}
        </div>
      </section>

      {/* 難詞與成語管理區 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
            <MessageSquare size={18} className="text-blue-500" /> 難詞管理 (將注入 STEP 2.75 段落深究)
          </h3>
          <div className="flex flex-wrap gap-2">
            {(data.textbookDifficultWords || []).map((item, idx) => (
              <button 
                key={idx} 
                onClick={() => handleDeleteWord(idx)}
                className="px-5 py-2 rounded-full text-xs font-bold transition-all border-2 bg-slate-50 border-slate-100 text-slate-400 hover:border-rose-200 hover:text-rose-500 flex items-center gap-2"
              >
                {item.word}
                <X size={12} />
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-500" /> 成語管理 (將注入 STEP 2.5 深度解析)
          </h3>
          <div className="flex flex-wrap gap-2">
            {(data.idioms || []).map((item, idx) => (
              <button 
                key={idx} 
                onClick={() => handleDeleteIdiom(idx)}
                className="px-5 py-2 rounded-full text-xs font-bold transition-all border-2 bg-white border-slate-100 text-slate-400 hover:border-rose-200 hover:text-rose-500 flex items-center gap-2"
              >
                {item.word}
                <X size={12} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 全域浮動控制列 */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 backdrop-blur-xl p-4 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-200 z-50 animate-in slide-in-from-bottom-8">
        <button onClick={onBack} className="px-8 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-full transition-all flex items-center gap-2 active:scale-95">
          <ArrowLeft size={18} /> 返回
        </button>
        <button
          onClick={() => onConfirmBasic(data)}
          disabled={isLoading}
          className="px-12 py-3 bg-teal-600 text-white font-black rounded-full shadow-lg shadow-teal-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:bg-slate-300"
        >
          {isLoading ? "運算資源調度中..." : "確認教學配置，啟動精準抓取"}
          {!isLoading && <ArrowRight size={18} />}
        </button>
      </div>
    </div>
  );
};

export default Step2Basic;