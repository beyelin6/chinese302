// 檔案路徑: src/components/Step2DeepSegments.tsx

import React, { useState, useEffect } from 'react';
import { Brain, Edit2, Trash2, Check, X, Plus, RefreshCw, Layers, ArrowRight, Sparkles, AlertCircle, Wand2, Zap, ArrowLeft, Tag } from 'lucide-react';
import { AnalysisData, SegmentItem, StrategyItem } from '../types';
import { Step2WritingFocus } from './Step2WritingFocus';
import { useWorkflowContext } from '../context/WorkflowContext';
import { sanitizeAndParseJSON } from '../utils/jsonParser';

// 🛡️ [防崩潰裝甲]：確保所有送入 JSX 渲染的變數絕對是「字串」
const safeRender = (val: any): string => {
  if (!val) return "";
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val.word || val.label || val.name || JSON.stringify(val);
  return String(val);
};

// 🌟 新增：語文活動卡片組件 (處理局部狀態)
const LanguageActivityCard = ({ activity, idx, onGenerateExtraActivity, grade }: { 
  activity: any, 
  idx: number, 
  onGenerateExtraActivity: (title: string, content: string, grade: string) => Promise<any>,
  grade: string
}) => {
  const [extensions, setExtensions] = useState<any[]>(activity.extensions || []);
  const [isExpanding, setIsExpanding] = useState(false);

  const onExpand = async () => {
    setIsExpanding(true);
    const result = await onGenerateExtraActivity(activity.title, activity.content, grade);
    if (result) setExtensions(result.extension);
    setIsExpanding(false);
  };

  return (
    <div className="bg-indigo-50/50 border-2 border-indigo-100 rounded-3xl p-5 hover:border-indigo-300 transition-all group">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
          {idx + 1}
        </div>
        <h4 className="font-black text-slate-800">{activity.title}</h4>
      </div>
      <div className="bg-white/80 rounded-2xl p-4 text-sm text-slate-600 leading-relaxed border border-indigo-50 group-hover:shadow-inner transition-all">
        {activity.content}
      </div>

      {/* 🌟 擴充結果顯示區 */}
      {extensions.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-2 animate-in zoom-in-95 duration-300">
          {extensions.map((ext, eIdx) => (
            <div key={eIdx} className="bg-indigo-600 text-white text-xs p-3 rounded-xl shadow-sm text-left">
              <div className="font-bold mb-1">Q: {ext.q}</div>
              <div className="opacity-80">A: {ext.a}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex justify-between items-center border-t border-indigo-100 pt-3">
        <button 
          onClick={onExpand}
          disabled={isExpanding}
          className="flex items-center gap-1.5 text-xs font-black text-indigo-600 hover:text-indigo-800 bg-indigo-100/50 px-3 py-1.5 rounded-lg hover:bg-indigo-200/50 transition-colors"
        >
          {isExpanding ? <RefreshCw size={14} className="animate-spin" /> : <Wand2 size={14} />}
          {extensions.length > 0 ? '重新生成擴充' : 'AI 舉一反三擴充'}
        </button>

        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-indigo-400 hover:text-indigo-600">
          <input type="checkbox" className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500" defaultChecked />
          納入本次教案腳本
        </label>
      </div>
    </div>
  );
};

interface Step2DeepSegmentsProps {
  currentData: AnalysisData; // Context (Basic + Vocab)
  deepSegmentsResult: string | null; // The raw JSON string from Step 2.75
  onConfirmSegments: (refinedAnalysis: AnalysisData) => void;
  isLoading: boolean;
  onRegenerateStrategies: (data: AnalysisData) => Promise<StrategyItem[]>;
  onGenerateSingleStrategy: (data: AnalysisData, existingStrategies: StrategyItem[], targetType?: string) => Promise<StrategyItem | null>;
  onGenerateRhetoricGuidance: (segmentTitle: string, rhetoricName: string, rhetoricExample: string) => Promise<{teachingPoint: string, application: string} | null>;
  onGenerateExtraActivity: (title: string, content: string, grade: string) => Promise<any>;
  onRewriteQuestion: (summary: string, content: string) => Promise<string | null>;
  onBack: () => void;
}

const Step2DeepSegments: React.FC<Step2DeepSegmentsProps> = ({ 
    currentData, 
    deepSegmentsResult, 
    onConfirmSegments, 
    isLoading, 
    onRegenerateStrategies, 
    onGenerateSingleStrategy,
    onGenerateRhetoricGuidance,
    onGenerateExtraActivity,
    onRewriteQuestion,
    onBack
}) => {
  const { state, dispatch } = useWorkflowContext();
  const [data, setData] = useState<AnalysisData | null>(null);

  // 🌟 [防呆提取]：確保這兩個列表絕對是陣列
  const vocabList = data?.coreVocabulary || currentData?.coreVocabulary || [];
  const activityList = data?.languageActivities || currentData?.languageActivities || [];
  
  const [parseError, setParseError] = useState<string | null>(null);
  
  // Loading states
  const [isRegeneratingStrategies, setIsRegeneratingStrategies] = useState(false);
  const [generatingType, setGeneratingType] = useState<string | null>(null);
  const [generatingRhetoricGuidance, setGeneratingRhetoricGuidance] = useState<string | null>(null); // format: "segmentIdx-rhetoricIdx"
  const [rewritingQuestion, setRewritingQuestion] = useState<string | null>(null); // format: "segmentIdx-questionIdx"

  // Edit states
  const [editingSection, setEditingSection] = useState<'segment' | 'strategy' | null>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [tempEditValue, setTempEditValue] = useState<any>(null);

  // Input states for Array additions
  const [keywordInput, setKeywordInput] = useState("");
  const [diffWordInput, setDiffWordInput] = useState("");

  // Helper for checking if any strategy generation is in progress
  const isGeneratingAnyStrategy = generatingType !== null || isRegeneratingStrategies;

  useEffect(() => {
    try {
      if (!deepSegmentsResult) return;

      // 🌟 [優化] 使用全域 JSON 解析工具，增加容錯與修復能力
      const parsed = typeof deepSegmentsResult === 'object' 
        ? deepSegmentsResult 
        : sanitizeAndParseJSON(deepSegmentsResult);
      
      if (!parsed) {
        setParseError("解析深度解構資料失敗：結果為空。");
        return;
      }
      
      // Merge Segments Data with Previous Data
      const mergedData: AnalysisData = {
          ...currentData, 
          segments: parsed.segments || [],
          strategies: parsed.strategies || [],
          languageActivities: parsed.languageActivities || currentData.languageActivities || [],
      };

      // Patch segments keywords/difficultWords if missing
      mergedData.segments.forEach((seg: any) => {
          if (!seg.keywords) seg.keywords = [];
          if (!seg.difficultWords) seg.difficultWords = [];
          if (!seg.rhetorics) seg.rhetorics = [];
          if (!seg.sentencePatterns) seg.sentencePatterns = [];
          if (!seg.readingQuestions) seg.readingQuestions = [];
          if (!seg.dokQuestions) seg.dokQuestions = [];
      });

      setData(mergedData);
      setParseError(null);
    } catch (e) {
      console.error("JSON Parse Error", e);
      setParseError("無法解析深度解構資料。");
    }
  }, [deepSegmentsResult, currentData]);

  const handleConfirm = () => {
    console.log("Confirming Deep Segments...", { isEditingAny, data });
    if (isEditingAny) {
      alert("請先完成所有編輯（點擊儲存按鈕）後再繼續。");
      return;
    }
    if (!data) {
      alert("資料尚未載入完成，請稍候。");
      return;
    }
    onConfirmSegments(data);
  };

  // --- Handlers ---
  const handleRegenerateStrategiesClick = async () => {
    if (!data) return;
    setIsRegeneratingStrategies(true);
    try {
        const newStrategies = await onRegenerateStrategies(data);
        if (newStrategies && newStrategies.length > 0) {
            setData(prev => prev ? ({ ...prev, strategies: newStrategies }) : null);
        }
    } catch (error) {
        console.error("Regeneration failed", error);
        alert("AI 重新發想失敗，請稍後再試。");
    } finally {
        setIsRegeneratingStrategies(false);
    }
  };

  const handleGenerateSingleStrategyClick = async (type: string) => {
    if (!data) return;
    setGeneratingType(type);
    try {
        const newStrategy = await onGenerateSingleStrategy(data, data.strategies, type);
        if (newStrategy) {
             setData(prev => prev ? ({ ...prev, strategies: [...prev.strategies, newStrategy] }) : null);
        }
    } catch (error) {
        alert(`AI 發想 ${type} 策略失敗。`);
    } finally {
        setGeneratingType(null);
    }
  };

  const handleRefreshSpecificStrategy = async (index: number) => {
      if (!data) return;
      const itemToRefresh = data.strategies[index];
      const targetType = itemToRefresh.type || 'Rhetoric'; 
      setGeneratingType(`refresh-${index}`); 

      try {
          const otherStrategies = data.strategies.filter((_, i) => i !== index);
          const newStrategy = await onGenerateSingleStrategy(data, otherStrategies, targetType);
          if (newStrategy) {
              const newStrategies = [...data.strategies];
              newStrategies[index] = newStrategy;
              setData(prev => prev ? ({ ...prev, strategies: newStrategies }) : null);
          }
      } catch (error) {
           console.error("Specific Strategy Regeneration failed", error);
      } finally {
          setGeneratingType(null);
      }
  };
  
  const handleGenerateRhetoricGuidanceClick = async (segmentIdx: number, rhetoricIdx: number) => {
      if (!data) return;
      const segment = data.segments[segmentIdx];
      const rhetoric = segment.rhetorics[rhetoricIdx];
      const key = `${segmentIdx}-${rhetoricIdx}`;
      
      setGeneratingRhetoricGuidance(key);
      try {
          const result = await onGenerateRhetoricGuidance(segment.title, rhetoric.name, rhetoric.example);
          if (result) {
              const newData = { ...data };
              newData.segments[segmentIdx].rhetorics[rhetoricIdx].pedagogicalPoint = result.teachingPoint;
              newData.segments[segmentIdx].rhetorics[rhetoricIdx].application = result.application;
              setData(newData);
          }
      } catch (error) {
          console.error("Failed to generate rhetoric guidance", error);
          alert("AI 生成教學引導失敗，請稍後再試。");
      } finally {
          setGeneratingRhetoricGuidance(null);
      }
  };

  const handleRewriteQuestionClick = async (segmentIdx: number, questionIdx: number, type: 'dok' | 'reading' = 'dok') => {
      if (!data) return;
      const segment = data.segments[segmentIdx];
      const questionObj = type === 'dok' 
        ? segment.dokQuestions?.[questionIdx] 
        : segment.readingQuestions?.[questionIdx];
      
      if (!questionObj) return;

      const key = `${type}-${segmentIdx}-${questionIdx}`;
      setRewritingQuestion(key);
      try {
          const result = await onRewriteQuestion(segment.summary, questionObj.question);
          if (result) {
              const newData = { ...data };
              if (type === 'dok' && newData.segments[segmentIdx].dokQuestions) {
                  newData.segments[segmentIdx].dokQuestions[questionIdx].question = result;
              } else if (type === 'reading' && newData.segments[segmentIdx].readingQuestions) {
                  newData.segments[segmentIdx].readingQuestions[questionIdx].question = result;
              }
              setData(newData);
          }
      } catch (error) {
          console.error("Failed to rewrite question", error);
          alert("AI 換個問法失敗，請稍後再試。");
      } finally {
          setRewritingQuestion(null);
      }
  };

  // --- CRUD Operations ---
  const deleteItem = (section: 'segments' | 'strategies', index: number) => {
    if (!data) return;
    const newData = { ...data };
    if (section === 'segments') newData.segments.splice(index, 1);
    if (section === 'strategies') newData.strategies.splice(index, 1);
    setData(newData);
  };

  const startEdit = (section: 'segment' | 'strategy', index: number, item: any) => {
    setEditingSection(section);
    setEditingIndex(index);
    const copy = JSON.parse(JSON.stringify(item));
    
    // Reset local inputs
    setKeywordInput("");
    setDiffWordInput("");

    setTempEditValue(copy);
  };

  const addNewSegmentItem = () => {
    if (!data) return;
    const newItem: SegmentItem = {
        title: "新段落", summary: "段落大意", keywords: [], difficultWords: [], rhetorics: [], sentencePatterns: [], deepDive: ""
    };
    const newData = { ...data };
    newData.segments.push(newItem);
    setData(newData);
    startEdit('segment', newData.segments.length - 1, newItem);
  };

  const saveEdit = () => {
    if (!data) return;
    const newData = { ...data };
    
    if (editingSection === 'segment') {
       newData.segments[editingIndex] = tempEditValue;
    } else if (editingSection === 'strategy') {
      newData.strategies[editingIndex] = tempEditValue;
    }
    setData(newData);
    cancelEdit();
  };

  const cancelEdit = () => {
    setEditingSection(null);
    setEditingIndex(-1);
    setTempEditValue(null);
    setKeywordInput("");
    setDiffWordInput("");
  };

  // --- Array Manipulation Helpers for Editing ---
  const removeKeyword = (idx: number) => {
      const newKeywords = [...(tempEditValue.keywords || [])];
      newKeywords.splice(idx, 1);
      setTempEditValue({ ...tempEditValue, keywords: newKeywords });
  };

  const addKeyword = () => {
      if (!keywordInput.trim()) return;
      const newKeywords = [...(tempEditValue.keywords || []), keywordInput.trim()];
      setTempEditValue({ ...tempEditValue, keywords: newKeywords });
      setKeywordInput("");
  };

  const removeDiffWord = (idx: number) => {
      const newWords = [...(tempEditValue.difficultWords || [])];
      newWords.splice(idx, 1);
      setTempEditValue({ ...tempEditValue, difficultWords: newWords });
  };

  const addDiffWord = () => {
      if (!diffWordInput.trim()) return;
      const newWords = [...(tempEditValue.difficultWords || []), diffWordInput.trim()];
      setTempEditValue({ ...tempEditValue, difficultWords: newWords });
      setDiffWordInput("");
  };

  // 🛡️ 防護升級：處理可能傳入物件的狀況
  const appendDifficultWordFromList = (wordObj: any) => {
      if (!tempEditValue || editingSection !== 'segment') return;
      // 強制取出字串值
      const wordStr = typeof wordObj === 'object' ? (wordObj.word || "") : String(wordObj);
      if (!wordStr) return;
      
      const current = tempEditValue.difficultWords || [];
      if (current.includes(wordStr)) return;
      setTempEditValue({...tempEditValue, difficultWords: [...current, wordStr]});
  };

  // --- Render Helpers ---
  if (parseError || !data) {
    return (
      <div className="flex flex-col h-full space-y-6">
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-center text-red-700">
           <AlertCircle className="mr-2" size={20} />
           {parseError || "深度資料載入中..."}
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 max-h-96 overflow-y-auto whitespace-pre-wrap font-mono text-sm text-slate-600 shadow-sm">
           {deepSegmentsResult}
        </div>
      </div>
    );
  }

  const isEditingAny = editingSection !== null;

  return (
    <div className="flex flex-col h-full relative">
       <div className="flex-1 overflow-y-auto custom-scrollbar pb-32 px-1">
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
             {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center">
                        <span className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm shadow-md shadow-emerald-200">2.75</span>
                        深度解構 (Deep Segments)
                    </h2>
                </div>
                <p className="text-slate-700 text-sm">
                    Step 2.75 階段確認：意義段劃分與教學策略發想。確認無誤後，AI 將進行「形式與風格 (Step 3)」。
                </p>
            </div>

            {/* 1. Segments Section */}
            <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-300 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-sm">意義段分析 (Segments)</h3>
                    <span className="text-xs text-slate-600">{data.segments.length} 段落</span>
                </div>
                <div className="divide-y divide-slate-200">
                    {data.segments.map((item, idx) => (
                        <div key={idx} className="p-4 hover:bg-slate-50 transition-colors group">
                             {editingSection === 'segment' && editingIndex === idx ? (
                                <div className="space-y-4 bg-slate-50 p-3 rounded-lg border border-slate-300 shadow-inner">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-slate-800 text-xs font-bold uppercase tracking-wider">編輯段落 {idx + 1}</h4>
                                        <button onClick={cancelEdit} className="text-slate-500 hover:text-slate-700"><X size={16}/></button>
                                    </div>
                                    
                                    <input className="bg-white border border-slate-300 rounded p-2 text-slate-900 text-sm w-full font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={tempEditValue.title} onChange={(e) => setTempEditValue({...tempEditValue, title: e.target.value})} placeholder="段落標題" />
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                         {/* Keywords Chip Editor */}
                                        <div className="space-y-2">
                                            <label className="text-xs text-emerald-600 font-bold uppercase flex items-center">
                                                <Brain size={12} className="mr-1" />
                                                心智圖細節 (Keywords)
                                            </label>
                                            <div className="bg-white border border-slate-300 rounded p-2 min-h-[60px] flex flex-wrap gap-2">
                                                {(tempEditValue.keywords || []).map((kw: any, i: number) => (
                                                    <div key={i} className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-2 py-1 rounded-full flex items-center">
                                                        {safeRender(kw)} {/* 🛡️ 防護 */}
                                                        <button onClick={() => removeKeyword(i)} className="ml-1 hover:text-emerald-900 text-emerald-500"><X size={12}/></button>
                                                    </div>
                                                ))}
                                                <div className="flex items-center gap-1 flex-1 min-w-[100px]">
                                                    <input 
                                                        className="bg-transparent text-slate-900 text-xs outline-none w-full placeholder-slate-500" 
                                                        value={keywordInput}
                                                        onChange={(e) => setKeywordInput(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                                                        placeholder="+ 新增關鍵詞 (Enter)"
                                                    />
                                                    <button onClick={addKeyword} disabled={!keywordInput.trim()} className="text-slate-500 hover:text-emerald-600"><Plus size={14}/></button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Difficult Words Chip Editor */}
                                        <div className="space-y-2">
                                            <label className="text-xs text-blue-600 font-bold uppercase flex items-center justify-between">
                                                <span className="flex items-center"><Sparkles size={12} className="mr-1" />段落難詞 (Difficult Words)</span>
                                            </label>
                                            <div className="bg-white border border-slate-300 rounded p-2 min-h-[60px] flex flex-wrap gap-2">
                                                {(tempEditValue.difficultWords || []).map((dw: any, i: number) => (
                                                    <div key={i} className="bg-blue-50 border border-blue-200 text-blue-700 text-xs px-2 py-1 rounded-full flex items-center">
                                                        {safeRender(dw)} {/* 🛡️ 防護 */}
                                                        <button onClick={() => removeDiffWord(i)} className="ml-1 hover:text-blue-900 text-blue-500"><X size={12}/></button>
                                                    </div>
                                                ))}
                                                <div className="flex items-center gap-1 flex-1 min-w-[100px]">
                                                    <input 
                                                        className="bg-transparent text-slate-900 text-xs outline-none w-full placeholder-slate-500" 
                                                        value={diffWordInput}
                                                        onChange={(e) => setDiffWordInput(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && addDiffWord()}
                                                        placeholder="+ 新增難詞 (Enter)"
                                                    />
                                                     <button onClick={addDiffWord} disabled={!diffWordInput.trim()} className="text-slate-500 hover:text-blue-600"><Plus size={14}/></button>
                                                </div>
                                            </div>
                                            
                                            {/* Helper Chips */}
                                            {currentData.textbookDifficultWords && currentData.textbookDifficultWords.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {currentData.textbookDifficultWords.map((wordObj, wi) => (
                                                        <button 
                                                            key={wi} 
                                                            onClick={() => appendDifficultWordFromList(wordObj)}
                                                            className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded hover:bg-slate-200 hover:text-slate-700 transition-colors flex items-center"
                                                        >
                                                            <Plus size={8} className="mr-1" />{safeRender(wordObj)} {/* 🛡️ 防護: 將物件轉回字串 */}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                     <textarea className="w-full bg-white border border-slate-300 rounded p-3 text-slate-900 text-xs h-20 focus:ring-2 focus:ring-blue-500 outline-none" value={tempEditValue.summary} onChange={(e) => setTempEditValue({...tempEditValue, summary: e.target.value})} placeholder="段落大意" />
                                    
                                        {/* Rhetoric Array Editor */}
                                        <div className="space-y-2 border-t border-slate-300 pt-3">
                                            <label className="text-xs text-purple-600 font-bold uppercase flex items-center"><Wand2 size={12} className="mr-1"/> 修辭技巧 (Rhetoric)</label>
                                            {(tempEditValue.rhetorics || []).map((r: any, i: number) => (
                                                <div key={i} className="flex flex-col gap-2 mb-2 bg-white p-2 rounded border border-slate-300">
                                                    <div className="flex gap-2 items-center">
                                                        <input className="w-[30%] bg-slate-50 border border-slate-300 rounded p-1.5 text-slate-900 text-xs focus:ring-2 focus:ring-purple-500 outline-none" value={r.name} onChange={(e) => {
                                                            const newArr = [...tempEditValue.rhetorics]; newArr[i].name = e.target.value; setTempEditValue({...tempEditValue, rhetorics: newArr});
                                                        }} placeholder="名稱 (例: 譬喻)" />
                                                        <input className="flex-1 bg-slate-50 border border-slate-300 rounded p-1.5 text-slate-800 text-xs focus:ring-2 focus:ring-purple-500 outline-none" value={r.example} onChange={(e) => {
                                                            const newArr = [...tempEditValue.rhetorics]; newArr[i].example = e.target.value; setTempEditValue({...tempEditValue, rhetorics: newArr});
                                                        }} placeholder="原文例句" />
                                                        <button onClick={() => {
                                                            const newArr = [...tempEditValue.rhetorics]; newArr.splice(i, 1); setTempEditValue({...tempEditValue, rhetorics: newArr});
                                                        }} className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                                                    </div>
                                                    <input className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-slate-800 text-xs focus:ring-2 focus:ring-purple-500 outline-none" value={r.analysis || ''} onChange={(e) => {
                                                        const newArr = [...tempEditValue.rhetorics]; newArr[i].analysis = e.target.value; setTempEditValue({...tempEditValue, rhetorics: newArr});
                                                    }} placeholder="作用分析 (Analysis)" />
                                                    <input className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-slate-800 text-xs focus:ring-2 focus:ring-purple-500 outline-none" value={r.pedagogicalPoint || ''} onChange={(e) => {
                                                        const newArr = [...tempEditValue.rhetorics]; newArr[i].pedagogicalPoint = e.target.value; setTempEditValue({...tempEditValue, rhetorics: newArr});
                                                    }} placeholder="教學引導 (Pedagogical Point)" />
                                                    <input className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-slate-800 text-xs focus:ring-2 focus:ring-purple-500 outline-none" value={r.application || ''} onChange={(e) => {
                                                        const newArr = [...tempEditValue.rhetorics]; newArr[i].application = e.target.value; setTempEditValue({...tempEditValue, rhetorics: newArr});
                                                    }} placeholder="互動微任務 (Application)" />
                                                </div>
                                            ))}
                                            <button onClick={() => {
                                                const newArr = [...(tempEditValue.rhetorics || []), { name: '', example: '', analysis: '', pedagogicalPoint: '', application: '' }];
                                                setTempEditValue({...tempEditValue, rhetorics: newArr});
                                            }} className="text-xs text-blue-600 flex items-center hover:text-blue-800 px-2 py-1 rounded hover:bg-slate-100 transition-colors w-fit"><Plus size={12} className="mr-1"/>新增修辭</button>
                                        </div>

                                        {/* Sentence Pattern Array Editor */}
                                        <div className="space-y-2 border-t border-slate-300 pt-3">
                                            <label className="text-xs text-amber-600 font-bold uppercase flex items-center"><Layers size={12} className="mr-1"/> 句型應用 (Sentence Patterns)</label>
                                            {(tempEditValue.sentencePatterns || []).map((p: any, i: number) => (
                                                <div key={i} className="flex gap-2 mb-1 items-center bg-white p-1 rounded border border-slate-300">
                                                    <input className="w-[30%] bg-slate-50 border border-slate-300 rounded p-1.5 text-slate-900 text-xs focus:ring-2 focus:ring-amber-500 outline-none" value={p.name} onChange={(e) => {
                                                        const newArr = [...tempEditValue.sentencePatterns]; newArr[i].name = e.target.value; setTempEditValue({...tempEditValue, sentencePatterns: newArr});
                                                    }} placeholder="句型 (例: 不但...而且)" />
                                                    <input className="flex-1 bg-slate-50 border border-slate-300 rounded p-1.5 text-slate-800 text-xs focus:ring-2 focus:ring-amber-500 outline-none" value={p.example} onChange={(e) => {
                                                        const newArr = [...tempEditValue.sentencePatterns]; newArr[i].example = e.target.value; setTempEditValue({...tempEditValue, sentencePatterns: newArr});
                                                    }} placeholder="原文例句" />
                                                    <button onClick={() => {
                                                        const newArr = [...tempEditValue.sentencePatterns]; newArr.splice(i, 1); setTempEditValue({...tempEditValue, sentencePatterns: newArr});
                                                    }} className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                                                </div>
                                            ))}
                                            <button onClick={() => {
                                                const newArr = [...(tempEditValue.sentencePatterns || []), { name: '', example: '' }];
                                                setTempEditValue({...tempEditValue, sentencePatterns: newArr});
                                            }} className="text-xs text-blue-600 flex items-center hover:text-blue-800 px-2 py-1 rounded hover:bg-slate-100 transition-colors w-fit"><Plus size={12} className="mr-1"/>新增句型</button>
                                        </div>

                                        {/* Reading Questions Array Editor */}
                                        <div className="space-y-2 border-t border-slate-300 pt-3">
                                            <label className="text-xs text-amber-600 font-bold uppercase flex items-center"><Tag size={12} className="mr-1"/> 閱讀理解提問 (Reading Questions)</label>
                                            {(tempEditValue.readingQuestions || []).map((q: any, i: number) => (
                                                <div key={i} className="flex flex-col gap-2 mb-2 bg-white p-2 rounded border border-slate-300">
                                                    <div className="flex gap-2 items-center">
                                                        <select className="w-[30%] bg-slate-50 border border-slate-300 rounded p-1.5 text-slate-900 text-xs focus:ring-2 focus:ring-amber-500 outline-none" value={q.type} onChange={(e) => {
                                                            const newArr = [...(tempEditValue.readingQuestions || [])]; newArr[i].type = e.target.value; setTempEditValue({...tempEditValue, readingQuestions: newArr});
                                                        }}>
                                                            <option value="提取訊息">提取訊息</option>
                                                            <option value="推論分析">推論分析</option>
                                                            <option value="比較評估">比較評估</option>
                                                        </select>
                                                        <input className="flex-1 bg-slate-50 border border-slate-300 rounded p-1.5 text-slate-800 text-xs focus:ring-2 focus:ring-amber-500 outline-none" value={q.question} onChange={(e) => {
                                                            const newArr = [...(tempEditValue.readingQuestions || [])]; newArr[i].question = e.target.value; setTempEditValue({...tempEditValue, readingQuestions: newArr});
                                                        }} placeholder="問題內容" />
                                                        <button onClick={() => {
                                                            const newArr = [...(tempEditValue.readingQuestions || [])]; newArr.splice(i, 1); setTempEditValue({...tempEditValue, readingQuestions: newArr});
                                                        }} className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                                                    </div>
                                                    <input className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-slate-800 text-xs focus:ring-2 focus:ring-amber-500 outline-none" value={q.answer} onChange={(e) => {
                                                        const newArr = [...(tempEditValue.readingQuestions || [])]; newArr[i].answer = e.target.value; setTempEditValue({...tempEditValue, readingQuestions: newArr});
                                                    }} placeholder="參考答案" />
                                                </div>
                                            ))}
                                            <button onClick={() => {
                                                const newArr = [...(tempEditValue.readingQuestions || []), { type: '提取訊息', question: '', answer: '' }];
                                                setTempEditValue({...tempEditValue, readingQuestions: newArr});
                                            }} className="text-xs text-blue-600 flex items-center hover:text-blue-800 px-2 py-1 rounded hover:bg-slate-100 transition-colors w-fit"><Plus size={12} className="mr-1"/>新增提問</button>
                                        </div>

                                        {/* DOK Questions Array Editor */}
                                        <div className="space-y-2 border-t border-slate-300 pt-3">
                                            <label className="text-xs text-indigo-600 font-bold uppercase flex items-center"><Sparkles size={12} className="mr-1"/> 深度思維提問 (DOK 3-4)</label>
                                            {(tempEditValue.dokQuestions || []).map((q: any, i: number) => (
                                                <div key={i} className="flex flex-col gap-2 mb-2 bg-white p-2 rounded border border-slate-300">
                                                    <div className="flex gap-2 items-center">
                                                        <input className="w-[30%] bg-slate-50 border border-slate-300 rounded p-1.5 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" value={q.type} onChange={(e) => {
                                                            const newArr = [...(tempEditValue.dokQuestions || [])]; newArr[i].type = e.target.value; setTempEditValue({...tempEditValue, dokQuestions: newArr});
                                                        }} placeholder="類型 (例: 策略應用)" />
                                                        <input className="flex-1 bg-slate-50 border border-slate-300 rounded p-1.5 text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" value={q.question} onChange={(e) => {
                                                            const newArr = [...(tempEditValue.dokQuestions || [])]; newArr[i].question = e.target.value; setTempEditValue({...tempEditValue, dokQuestions: newArr});
                                                        }} placeholder="問題內容" />
                                                        <button onClick={() => {
                                                            const newArr = [...(tempEditValue.dokQuestions || [])]; newArr.splice(i, 1); setTempEditValue({...tempEditValue, dokQuestions: newArr});
                                                        }} className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                                                    </div>
                                                    <input className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" value={q.intent} onChange={(e) => {
                                                        const newArr = [...(tempEditValue.dokQuestions || [])]; newArr[i].intent = e.target.value; setTempEditValue({...tempEditValue, dokQuestions: newArr});
                                                    }} placeholder="教學意圖" />
                                                </div>
                                            ))}
                                            <button onClick={() => {
                                                const newArr = [...(tempEditValue.dokQuestions || []), { type: '策略應用', question: '', intent: '' }];
                                                setTempEditValue({...tempEditValue, dokQuestions: newArr});
                                            }} className="text-xs text-blue-600 flex items-center hover:text-blue-800 px-2 py-1 rounded hover:bg-slate-100 transition-colors w-fit"><Plus size={12} className="mr-1"/>新增 DOK 提問</button>
                                        </div>

                                    <textarea className="w-full bg-white border border-slate-300 rounded p-3 text-slate-900 text-xs h-16 focus:ring-2 focus:ring-blue-500 outline-none" value={tempEditValue.deepDive} onChange={(e) => setTempEditValue({...tempEditValue, deepDive: e.target.value})} placeholder="深究提問" />

                                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-300">
                                        <button onClick={cancelEdit} className="px-4 py-2 text-slate-600 hover:text-slate-800 bg-slate-100 rounded-lg text-sm">取消</button>
                                        <button onClick={saveEdit} className="px-4 py-2 text-white bg-teal-600 hover:bg-teal-500 rounded-lg text-sm flex items-center shadow-md shadow-teal-200"><Check size={16} className="mr-1"/> 儲存修改</button>
                                    </div>
                                </div>
                             ) : (
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h4 className="text-emerald-700 font-bold text-sm mb-1">{item.title}</h4>
                                        
                                        {item.keywords && item.keywords.length > 0 && (
                                            <div className="flex flex-wrap gap-1 items-center mb-2">
                                                <Brain size={10} className="text-emerald-600"/>
                                                {/* 🛡️ 防護 */}
                                                {item.keywords.map((kw: any, kwi: number) => <span key={kwi} className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">{safeRender(kw)}</span>)}
                                            </div>
                                        )}

                                         <p className="text-xs text-slate-800 mb-2">{item.summary}</p>

                                        {/* 💎 深度思維鑽石區 (DOK 3-4 Questions) */}
                                        {item.dokQuestions && item.dokQuestions.length > 0 && (
                                          <div className="mt-4 grid grid-cols-1 gap-3">
                                            {item.dokQuestions.map((dok: any, dIdx: number) => {
                                              const isRewriting = rewritingQuestion === `dok-${idx}-${dIdx}`;
                                              return (
                                              <div key={dIdx} className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-r-2xl group hover:shadow-md transition-all">
                                                <div className="flex items-start gap-3">
                                                  <div className="mt-1 bg-blue-600 text-white p-1 rounded-lg">
                                                    <Sparkles size={12} />
                                                  </div>
                                                  <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                      <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                                          {dok.type}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-medium">DOK Level 3-4</span>
                                                      </div>
                                                      <button 
                                                        onClick={() => handleRewriteQuestionClick(idx, dIdx, 'dok')}
                                                        disabled={isRewriting || isEditingAny}
                                                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${isRewriting ? 'text-amber-600 bg-amber-50' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50 opacity-0 group-hover:opacity-100'}`}
                                                      >
                                                        {isRewriting ? <RefreshCw size={12} className="animate-spin" /> : <Wand2 size={12} />}
                                                        {isRewriting ? '正在換問法...' : 'AI 換問法'}
                                                      </button>
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-800 leading-relaxed">
                                                      {isRewriting ? (
                                                        <span className="text-amber-600 animate-pulse">AI 正在重新設計問法...</span>
                                                      ) : dok.question}
                                                    </p>
                                                    <p className="mt-2 text-[10px] text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity italic">
                                                      🎯 教學意圖：{dok.intent}
                                                    </p>
                                                  </div>
                                                </div>
                                              </div>
                                            )})}
                                          </div>
                                        )}
                                        
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {/* 🛡️ 防護 */}
                                            {item.difficultWords && item.difficultWords.length > 0 && item.difficultWords.map((w: any, wi: number) => (
                                                <span key={wi} className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full flex items-center"><Sparkles size={8} className="mr-1 opacity-50"/>{safeRender(w)}</span>
                                            ))}
                                        </div>

                                        {/* ✨ 新增 1：渲染修辭與分析 */}
                                        {item.rhetorics && item.rhetorics.length > 0 && (
                                          <div className="mt-4 border-t border-slate-200 pt-4">
                                            <h4 className="text-sm font-bold text-slate-800 mb-2">修辭與寫作分析</h4>
                                            {item.rhetorics.map((rhet, i) => {
                                                const isGeneratingThis = generatingRhetoricGuidance === `${idx}-${i}`;
                                                return (
                                              <div key={i} className="mb-3 p-3 bg-slate-50 rounded-xl border border-slate-300 relative group/rhetoric">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-teal-700">{rhet.name}</span>
                                                        <span className="text-xs text-slate-500 font-mono">"{rhet.example}"</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleGenerateRhetoricGuidanceClick(idx, i)}
                                                        disabled={isGeneratingThis || isEditingAny}
                                                        className={`p-1 rounded hover:bg-slate-100 transition-colors ${isGeneratingThis ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-600 opacity-0 group-hover/rhetoric:opacity-100'}`}
                                                        title="AI 優化教學引導與微任務"
                                                    >
                                                        {isGeneratingThis ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                                    </button>
                                                </div>
                                                {/* 動態顯示寫作分析與提問 */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                                  {rhet.analysis && (
                                                    <div className="bg-white p-2 rounded shadow-sm text-xs border border-slate-200">
                                                      <span className="font-bold text-slate-500 block mb-1">【寫作效果】</span> 
                                                      <span className="text-slate-800">{rhet.analysis}</span>
                                                    </div>
                                                  )}
                                                  {rhet.pedagogicalPoint && (
                                                    <div className="bg-teal-50 p-2 rounded shadow-sm text-xs border border-teal-100">
                                                      <span className="font-bold text-teal-600 block mb-1">【教學提問】</span> 
                                                      <span className="text-teal-900">{rhet.pedagogicalPoint}</span>
                                                    </div>
                                                  )}
                                                </div>
                                                {rhet.application && (
                                                    <div className="mt-2 pt-2 border-t border-slate-200/50">
                                                        <label className="text-[10px] font-bold text-amber-600 block mb-1">互動微任務</label>
                                                        <p className="text-xs text-slate-800">{rhet.application}</p>
                                                    </div>
                                                )}
                                              </div>
                                            )})}
                                          </div>
                                        )}

                                         {/* Display Sentence Patterns */}
                                        {item.sentencePatterns && item.sentencePatterns.length > 0 && (
                                            <div className="flex flex-col gap-1 mt-2">
                                                {item.sentencePatterns.map((p, i) => (
                                                    <div key={i} className="text-xs">
                                                        <span className="text-amber-700 font-bold bg-amber-50 px-1 rounded mr-2">句型: {p.name}</span>
                                                        <span className="text-slate-600 italic">"{p.example}"</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* ✨ 新增 2：渲染閱讀小挑戰 */}
                                        {item.readingQuestions && item.readingQuestions.length > 0 && (
                                          <div className="mt-4 p-4 bg-amber-50/50 border border-amber-200 rounded-xl">
                                            <div className="flex items-center gap-2 mb-3">
                                              <span className="text-[10px] px-2 py-0.5 bg-amber-200 text-amber-800 font-bold rounded tracking-wider">隨堂挑戰</span>
                                              <h4 className="text-sm font-bold text-amber-900">閱讀理解提問</h4>
                                            </div>
                                            <ul className="space-y-3">
                                              {item.readingQuestions.map((q, qIdx) => {
                                                const isRewriting = rewritingQuestion === `reading-${idx}-${qIdx}`;
                                                return (
                                                <li key={qIdx} className="text-sm bg-white p-3 rounded-lg border border-amber-100 shadow-sm group/reading">
                                                  <div className="flex items-start gap-2">
                                                    <span className="font-bold text-amber-600 shrink-0">[{q.type}]</span>
                                                    <div className="flex-1">
                                                      <div className="flex items-center justify-between mb-1">
                                                        <span className="text-slate-900 font-medium">
                                                          {isRewriting ? (
                                                            <span className="text-amber-600 animate-pulse">AI 正在重新設計問法...</span>
                                                          ) : q.question}
                                                        </span>
                                                        <button 
                                                          onClick={() => handleRewriteQuestionClick(idx, qIdx, 'reading')}
                                                          disabled={isRewriting || isEditingAny}
                                                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${isRewriting ? 'text-amber-600 bg-amber-50' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50 opacity-0 group-hover/reading:opacity-100'}`}
                                                        >
                                                          {isRewriting ? <RefreshCw size={12} className="animate-spin" /> : <Wand2 size={12} />}
                                                          {isRewriting ? '正在換問法...' : 'AI 換問法'}
                                                        </button>
                                                      </div>
                                                      <div className="mt-2 text-slate-600 italic text-xs">
                                                        答：{q.answer}
                                                      </div>
                                                    </div>
                                                  </div>
                                                </li>
                                              )})}
                                            </ul>
                                          </div>
                                        )}

                                        <div className="mt-3 text-xs text-blue-700 bg-blue-50 p-2 rounded border border-blue-100"><span className="font-bold opacity-70">深究: </span>{item.deepDive}</div>
                                    </div>
                                    <div className={`flex gap-2 ml-4 transition-opacity ${isEditingAny ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'}`}>
                                        <button onClick={() => startEdit('segment', idx, item)} className="text-blue-500 hover:text-blue-700 p-1.5 hover:bg-slate-100 rounded"><Edit2 size={16} /></button>
                                        <button onClick={() => deleteItem('segments', idx)} className="text-red-400 hover:text-red-600 p-1.5 hover:bg-slate-100 rounded"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                             )}
                        </div>
                    ))}
                </div>
                 <div className="p-2 bg-slate-50 border-t border-slate-300 flex justify-center">
                    <button onClick={addNewSegmentItem} disabled={isEditingAny} className={`flex items-center gap-2 text-xs py-1 px-4 rounded transition-colors w-full justify-center ${isEditingAny ? 'text-slate-400 cursor-not-allowed' : 'text-slate-600 hover:text-teal-600 hover:bg-slate-100'}`}>
                        <Plus size={14} /> 新增段落
                    </button>
                </div>
            </div>

            {/* 🌟 1.5 Writing Focus Section */}
            <Step2WritingFocus vocabulary={vocabList} />

            {/* 🌟 新增：語文活動輻射看板 */}
            {activityList.length > 0 && (
              <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-2 text-indigo-600 font-black px-2">
                  <Sparkles size={20} />
                  <h3>課本語文活動（延伸技能）</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activityList.map((activity: any, idx: number) => (
                    <LanguageActivityCard 
                      key={idx}
                      activity={activity}
                      idx={idx}
                      onGenerateExtraActivity={onGenerateExtraActivity}
                      grade={data?.grade || currentData?.grade || '小學三年級'}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 2. Strategies Section */}
             <div className="bg-white border border-slate-300 rounded-xl overflow-hidden relative shadow-sm">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-300 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 text-sm">語文百寶箱 (Strategies)</h3>
                        <span className="text-xs text-slate-600">{data.strategies.length} 策略</span>
                    </div>
                    <button onClick={handleRegenerateStrategiesClick} disabled={isGeneratingAnyStrategy || isEditingAny} className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded-full transition-all border ${isRegeneratingStrategies ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                        <RefreshCw size={12} className={isRegeneratingStrategies ? "animate-spin" : ""} /> 重新發想
                    </button>
                </div>
                <div className="divide-y divide-slate-100 grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100">
                    {data.strategies.map((item, idx) => {
                        const isRhetoric = item.type === 'Rhetoric';
                        const isThinking = item.type === 'Thinking';
                        const borderColor = isRhetoric ? 'border-purple-200' : isThinking ? 'border-sky-200' : 'border-amber-200';
                        const headerColor = isRhetoric ? 'text-purple-700' : isThinking ? 'text-sky-700' : 'text-amber-700';
                        const badgeColor = isRhetoric ? 'bg-purple-100 text-purple-700' : isThinking ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700';

                        // Specific loading state for this card
                        const isRefreshingThis = generatingType === `refresh-${idx}`;

                        return (
                        <div key={idx} className={`p-4 bg-white hover:bg-slate-50 transition-colors group relative border ${borderColor} m-2 rounded-xl shadow-sm`}>
                             {/* Specific Item Loading Overlay */}
                             {isRefreshingThis && (
                                <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-xl backdrop-blur-sm">
                                    <RefreshCw className="text-teal-500 animate-spin mr-2" size={16} />
                                    <span className="text-xs text-teal-600">更新中...</span>
                                </div>
                             )}

                             {editingSection === 'strategy' && editingIndex === idx ? (
                                <div className="flex flex-col gap-3">
                                    <div className="flex gap-2">
                                        <select className="bg-slate-50 border border-slate-300 rounded p-1.5 text-slate-800 text-sm w-1/3" value={tempEditValue.type || 'Rhetoric'} onChange={(e) => setTempEditValue({...tempEditValue, type: e.target.value})}>
                                            <option value="Rhetoric">🔮 修辭</option><option value="Thinking">🧠 思考</option><option value="Task">⚡ 任務</option>
                                        </select>
                                        <input className="bg-slate-50 border border-slate-300 rounded p-1.5 text-slate-800 text-sm font-bold flex-1" value={tempEditValue.title} onChange={(e) => setTempEditValue({...tempEditValue, title: e.target.value})} />
                                    </div>
                                    <textarea className="bg-slate-50 border border-slate-300 rounded p-2 text-slate-800 text-xs w-full h-16" value={tempEditValue.method || ''} onChange={(e) => setTempEditValue({...tempEditValue, method: e.target.value})} placeholder="方法論 (Method)" />
                                    <textarea className="bg-slate-50 border border-slate-300 rounded p-2 text-slate-800 text-xs w-full h-16" value={tempEditValue.teachingPoint} onChange={(e) => setTempEditValue({...tempEditValue, teachingPoint: e.target.value})} placeholder="教學引導 (Insight)" />
                                    <textarea className="bg-slate-50 border border-slate-300 rounded p-2 text-slate-800 text-xs w-full h-16" value={tempEditValue.application} onChange={(e) => setTempEditValue({...tempEditValue, application: e.target.value})} placeholder="微任務 (Interaction)" />
                                    <div className="flex justify-end gap-2 mt-1">
                                        <button onClick={cancelEdit} className="p-1 text-slate-400 hover:text-slate-600"><X size={18} /></button>
                                        <button onClick={saveEdit} className="p-1 text-teal-600 hover:text-teal-700"><Check size={18} /></button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col h-full">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeColor}`}>
                                                {item.type}
                                            </span>
                                            <h4 className={`font-bold text-sm mt-2 ${headerColor}`}>{item.title}</h4>
                                        </div>
                                         <div className={`flex gap-1 transition-opacity ${isEditingAny ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'}`}>
                                            <button 
                                                onClick={() => handleRefreshSpecificStrategy(idx)} 
                                                className="text-teal-500 hover:text-teal-700 p-1"
                                                disabled={isGeneratingAnyStrategy}
                                            >
                                                <RefreshCw size={14} className={isRefreshingThis ? "animate-spin" : ""} />
                                            </button>
                                            <button onClick={() => startEdit('strategy', idx, item)} className="text-blue-500 hover:text-blue-700 p-1"><Edit2 size={14} /></button>
                                            <button onClick={() => deleteItem('strategies', idx)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                                        </div>
                                    </div>

                                    {/* Content Blocks */}
                                    <div className="space-y-3 flex-1 text-xs">
                                        {item.method && (
                                            <div>
                                                <div className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">方法論 (Method)</div>
                                                <div className="text-slate-800">{item.method}</div>
                                            </div>
                                        )}
                                        <div>
                                            <div className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">教學引導 (Insight)</div>
                                            <div className="text-slate-800">{item.teachingPoint}</div>
                                        </div>
                                         <div className="bg-slate-50 p-2 rounded border border-slate-300">
                                            <div className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">1分鐘微任務 (Interaction)</div>
                                            <div className="text-slate-800">{item.application}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );})}
                </div>
                 <div className="p-2 bg-slate-50 border-t border-slate-300 flex flex-col gap-2 justify-center items-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">✨ AI 新增策略 (請選擇類型)</span>
                    <div className="flex gap-2 w-full justify-center">
                        <button 
                            onClick={() => handleGenerateSingleStrategyClick('Rhetoric')} 
                            disabled={isGeneratingAnyStrategy || isEditingAny}
                            className={`flex-1 max-w-[120px] flex items-center justify-center gap-1 text-xs py-1.5 px-2 rounded border border-purple-200 bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {generatingType === 'Rhetoric' ? <RefreshCw size={12} className="animate-spin" /> : <Wand2 size={12} />}
                            修辭
                        </button>
                        <button 
                            onClick={() => handleGenerateSingleStrategyClick('Thinking')} 
                            disabled={isGeneratingAnyStrategy || isEditingAny}
                            className={`flex-1 max-w-[120px] flex items-center justify-center gap-1 text-xs py-1.5 px-2 rounded border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {generatingType === 'Thinking' ? <RefreshCw size={12} className="animate-spin" /> : <Brain size={12} />}
                            思考
                        </button>
                        <button 
                            onClick={() => handleGenerateSingleStrategyClick('Task')} 
                            disabled={isGeneratingAnyStrategy || isEditingAny}
                            className={`flex-1 max-w-[120px] flex items-center justify-center gap-1 text-xs py-1.5 px-2 rounded border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {generatingType === 'Task' ? <RefreshCw size={12} className="animate-spin" /> : <Zap size={12} />}
                            任務
                        </button>
                    </div>
                </div>
            </div>

          </div>
       </div>

        {/* Confirm Footer */}
       <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-300 flex justify-center gap-4 z-10 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
             <button
                onClick={onBack}
                disabled={isLoading}
                className="px-6 py-3 text-slate-700 font-bold rounded-xl border border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center disabled:opacity-50"
             >
                <ArrowLeft className="mr-2" size={20} />
                返回上一步
             </button>
             <button
                onClick={handleConfirm}
                disabled={isEditingAny || isLoading}
                className={`flex-1 max-w-xl py-3 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center ${
                    isEditingAny || isLoading
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-teal-600 hover:bg-teal-500 shadow-teal-200'
                }`}
             >
                {isLoading ? (
                    "正在分析形式與風格..."
                ) : (
                    <>
                        深度解構完成，前往形式風格
                        <ArrowRight className="ml-2" size={20} />
                    </>
                )}
             </button>
      </div>
    </div>
  );
};

export default Step2DeepSegments;