// 檔案路徑: src/components/Step2Deep.tsx

import React, { useState, useEffect } from 'react';
import { 
  Edit2, Trash2, Check, X, Plus, RefreshCw, AlertCircle, 
  Wand2, ArrowRight, ArrowLeft, BookOpen, Sparkles, Wand 
} from 'lucide-react';
import { AnalysisData, VocabularyItem, ShapeSimilarItem, PolyphonicItem } from '../types';
import { sanitizeAndParseJSON } from '../utils/jsonParser';

interface Step2DeepProps {
  basicData: AnalysisData; 
  deepAnalysisResult: string | null; 
  onConfirmDeepVocab: (refinedAnalysis: string) => void;
  isLoading: boolean;
  onGenerateMnemonic: (chars: ShapeSimilarItem[]) => Promise<string>;
  onGeneratePolyphonic: (char: string) => Promise<PolyphonicItem[]>;
  onGenerateShapeSimilar: (char: string) => Promise<ShapeSimilarItem[]>;
  onGenerateShapeSimilarDetails: (char: string) => Promise<ShapeSimilarItem | null>;
  // 🌟 確保這行存在，對接 Hook 裡的魔法棒功能
  onGenerateIdiomDetails: (idiom: string) => Promise<any>; 
  onBack: () => void;
}

const Step2Deep: React.FC<Step2DeepProps> = (props) => {
  const { 
    basicData, deepAnalysisResult, onConfirmDeepVocab, isLoading, 
    onGenerateMnemonic, onGeneratePolyphonic, onGenerateShapeSimilar, 
    onGenerateShapeSimilarDetails, onGenerateIdiomDetails, onBack 
  } = props;

  const [data, setData] = useState<AnalysisData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  // 🌟 [防呆提取]：確保這兩個列表絕對是陣列
  const vocabList = data?.vocabulary || [];
  const idiomList = data?.deepIdiomsDetails || [];
  
  // 狀態管理
  const [isGeneratingMnemonic, setIsGeneratingMnemonic] = useState(false);
  const [isGeneratingPolyphonic, setIsGeneratingPolyphonic] = useState(false);
  const [isGeneratingShapeSimilar, setIsGeneratingShapeSimilar] = useState(false);
  const [isAddingSpecificChar, setIsAddingSpecificChar] = useState(false);
  const [isGeneratingIdiomAuto, setIsGeneratingIdiomAuto] = useState(false); // 🌟 魔法棒載入狀態
  
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [tempEditValue, setTempEditValue] = useState<any>(null);
  const [customCharInput, setCustomCharInput] = useState<string>('');

  const [editingIdiomIndex, setEditingIdiomIndex] = useState<number>(-1);
  const [tempIdiomValue, setTempIdiomValue] = useState<any>(null);

  useEffect(() => {
    if (!deepAnalysisResult) return;
    try {
      const parsed = typeof deepAnalysisResult === 'string' ? sanitizeAndParseJSON(deepAnalysisResult) : deepAnalysisResult;
      const rawVocab = parsed.vocabulary || parsed.vocabularyRadiation || parsed.vocabulary_radiation || [];
      const focusedWords = new Set(basicData.coreVocabulary?.filter(v => v.isFocused).map(v => v.word));
      
      const vocabulary = rawVocab.map((v: any, idx: number) => ({
        ...v,
        id: v.id || `v-${idx}-${Date.now()}`,
        isFocused: focusedWords.size === 0 ? true : focusedWords.has(v.word)
      }));

      setData({
          ...basicData,
          vocabulary,
          deepIdiomsDetails: parsed.deepIdiomsDetails || parsed.idioms || [],
          segments: [], strategies: [],
      });
      setParseError(null);
    } catch (e) {
      setParseError("無法解析語文輻射資料，請重試。");
    }
  }, [deepAnalysisResult, basicData]);

  const handleConfirm = () => { if (data) onConfirmDeepVocab(JSON.stringify(data, null, 2)); };

  // --- 🌟 成語 AI 自動填空邏輯 (魔法棒) ---
  const handleAutoFillIdiom = async () => {
    if (!tempIdiomValue.word) {
        alert("請先輸入成語名稱！");
        return;
    }
    setIsGeneratingIdiomAuto(true);
    try {
        const result = await onGenerateIdiomDetails(tempIdiomValue.word);
        if (result) {
            setTempIdiomValue({
                ...tempIdiomValue,
                definition: result.definition || '',
                example: result.example || '',
                synonyms: result.synonyms || [],
                antonyms: result.antonyms || []
            });
        }
    } finally {
        setIsGeneratingIdiomAuto(false);
    }
  };

  // --- 基礎 CRUD 邏輯 (略，與您版本一致) ---
  const handleAddSpecificShapeSimilar = async (targetChar: string) => {
    if (!targetChar || targetChar.length !== 1) return;
    setIsAddingSpecificChar(true);
    try {
      const details = await onGenerateShapeSimilarDetails(targetChar);
      if (details) {
        const currentArr = tempEditValue.shapeSimilar || [];
        setTempEditValue({ ...tempEditValue, shapeSimilar: [...currentArr, { ...details, char: targetChar }] });
      }
    } catch (e) {
      const currentArr = tempEditValue.shapeSimilar || [];
      setTempEditValue({ ...tempEditValue, shapeSimilar: [...currentArr, { char: targetChar, radical: '', words: '', explanation: '' }] });
    } finally { setIsAddingSpecificChar(false); setCustomCharInput(''); }
  };

  const handleGenMnemonic = async () => {
      if (!onGenerateMnemonic || !tempEditValue.shapeSimilar || tempEditValue.shapeSimilar.length < 1) return;
      setIsGeneratingMnemonic(true);
      try {
          const mnemonic = await onGenerateMnemonic(tempEditValue.shapeSimilar);
          setTempEditValue({...tempEditValue, mnemonic });
      } catch (e) {} finally { setIsGeneratingMnemonic(false); }
  };

  const handleGenPolyphonic = async () => {
      if (!onGeneratePolyphonic || !tempEditValue.word) return;
      setIsGeneratingPolyphonic(true);
      try {
          const char = tempEditValue.word.charAt(0);
          const result = await onGeneratePolyphonic(char);
          if (result && result.length > 0) setTempEditValue({ ...tempEditValue, polyphonic: result });
      } catch (e) {} finally { setIsGeneratingPolyphonic(false); }
  };

  const handleGenShapeSimilarBatch = async () => {
      if (!onGenerateShapeSimilar || !tempEditValue.word) return;
      setIsGeneratingShapeSimilar(true);
      try {
          const char = tempEditValue.word.charAt(0);
          const result = await onGenerateShapeSimilar(char);
          if (result && result.length > 0) {
              const currentSimilar = tempEditValue.shapeSimilar || [];
              setTempEditValue({ ...tempEditValue, shapeSimilar: [...currentSimilar, ...result] });
          }
      } catch (e) {} finally { setIsGeneratingShapeSimilar(false); }
  };

  const startEdit = (index: number, item: any) => { setEditingIndex(index); setTempEditValue(JSON.parse(JSON.stringify(item))); setCustomCharInput(''); };
  const saveEdit = () => { if (data) { const newData = { ...data }; newData.vocabulary[editingIndex] = tempEditValue; setData(newData); cancelEdit(); } };
  const cancelEdit = () => { setEditingIndex(-1); setTempEditValue(null); };
  const deleteVocabCard = (index: number) => { if (data) setData({ ...data, vocabulary: data.vocabulary.filter((_, i) => i !== index) }); };

  const startEditIdiom = (index: number, idiom: any) => { setEditingIdiomIndex(index); setTempIdiomValue(JSON.parse(JSON.stringify(idiom))); };
  const cancelEditIdiom = () => { setEditingIdiomIndex(-1); setTempIdiomValue(null); };
  const deleteIdiom = (index: number) => { if (data) setData({ ...data, deepIdiomsDetails: (data.deepIdiomsDetails || []).filter((_, i) => i !== index) }); };
  const addNewIdiom = () => { if (!data) return; const newIdx = (data.deepIdiomsDetails || []).length; startEditIdiom(newIdx, { word: '', definition: '', example: '', synonyms: [], antonyms: [] }); };
  
  const saveEditIdiom = () => {
    if (!data) return;
    const newData = { ...data };
    const newIdioms = [...(newData.deepIdiomsDetails || [])];
    let processedTemp = { ...tempIdiomValue };
    if (typeof processedTemp.synonyms === 'string') processedTemp.synonyms = processedTemp.synonyms.split(/[,、，]/).map((s:string)=>s.trim()).filter(Boolean);
    if (typeof processedTemp.antonyms === 'string') processedTemp.antonyms = processedTemp.antonyms.split(/[,、，]/).map((s:string)=>s.trim()).filter(Boolean);
    if (editingIdiomIndex >= newIdioms.length) { newIdioms.push(processedTemp); } else { newIdioms[editingIdiomIndex] = processedTemp; }
    newData.deepIdiomsDetails = newIdioms;
    setData(newData);
    setEditingIdiomIndex(-1);
    setTempIdiomValue(null);
  };

  // --- 編輯介面渲染器 ---
  const renderVocabEditor = () => {
      if (!tempEditValue) return null;
      return (
        <div key={`editor-${editingIndex}`} className="col-span-1 md:col-span-2 space-y-6 bg-indigo-50/50 p-6 rounded-[2.5rem] border-2 border-indigo-200 shadow-xl mb-6 animate-in zoom-in-95">
            <div className="flex gap-3 items-center border-b border-indigo-100 pb-4">
                <input className="bg-white border-2 border-slate-200 rounded-2xl p-3 text-slate-900 font-black text-2xl w-24 text-center" value={tempEditValue.word} onChange={(e) => setTempEditValue({...tempEditValue, word: e.target.value})} />
                <input className="bg-white border-2 border-slate-200 rounded-2xl p-3 text-slate-900 text-sm w-32" value={tempEditValue.zhuyin || ''} onChange={(e) => setTempEditValue({...tempEditValue, zhuyin: e.target.value})} placeholder="注音" />
                <input className="bg-white border-2 border-slate-200 rounded-2xl p-3 text-slate-900 text-sm flex-1" value={tempEditValue.type} onChange={(e) => setTempEditValue({...tempEditValue, type: e.target.value})} placeholder="模式" />
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                    <label className="text-sm text-slate-700 font-black tracking-widest shrink-0">【形近字管理】</label>
                    <div className="flex items-center gap-2">
                       <button onClick={handleGenShapeSimilarBatch} className="text-[10px] flex items-center px-3 py-1.5 rounded-full bg-white text-emerald-600 border border-emerald-200 shadow-sm font-bold">
                          <Wand2 size={12} className="mr-1"/> AI 批量推薦
                       </button>
                       <div className="flex items-center bg-white border-2 border-blue-200 rounded-full pl-3 pr-1 py-1">
                          <input className="w-12 text-[10px] outline-none text-blue-600 font-black bg-transparent" placeholder="輸入字" value={customCharInput} onChange={(e) => setCustomCharInput(e.target.value)} maxLength={1} />
                          <button onClick={() => handleAddSpecificShapeSimilar(customCharInput)} className="p-1.5 bg-blue-600 text-white rounded-full"><Plus size={10}/></button>
                       </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(tempEditValue.shapeSimilar || []).map((item: any, i: number) => (
                      <div key={`edit-sim-${i}`} className="flex flex-col gap-2 p-4 bg-white rounded-3xl border border-slate-200 relative group shadow-sm">
                          <button onClick={() => { const newArr = [...tempEditValue.shapeSimilar]; newArr.splice(i, 1); setTempEditValue({...tempEditValue, shapeSimilar: newArr}); }} className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                          <div className="flex gap-2 items-center">
                              <input className="w-10 h-10 bg-slate-100 rounded-xl text-center text-indigo-600 font-black text-xl outline-none" value={item.char} onChange={(e) => { const newArr = [...tempEditValue.shapeSimilar]; newArr[i].char = e.target.value; setTempEditValue({...tempEditValue, shapeSimilar: newArr}); }} />
                              <div className="flex-1 grid grid-cols-2 gap-2">
                                <input className="bg-slate-50 border rounded-xl p-2 text-[10px]" value={item.radical} onChange={(e) => { const newArr = [...tempEditValue.shapeSimilar]; newArr[i].radical = e.target.value; setTempEditValue({...tempEditValue, shapeSimilar: newArr}); }} placeholder="部首" />
                                <input className="bg-slate-50 border rounded-xl p-2 text-[10px]" value={item.words} onChange={(e) => { const newArr = [...tempEditValue.shapeSimilar]; newArr[i].words = e.target.value; setTempEditValue({...tempEditValue, shapeSimilar: newArr}); }} placeholder="造詞" />
                              </div>
                          </div>
                          <textarea className="w-full bg-slate-50 border rounded-xl p-2 text-[10px] h-12 resize-none" value={item.explanation} onChange={(e) => { const newArr = [...tempEditValue.shapeSimilar]; newArr[i].explanation = e.target.value; setTempEditValue({...tempEditValue, shapeSimilar: newArr}); }} />
                      </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-4 px-1">
                    <label className="text-[10px] text-slate-500 uppercase font-black">記憶口訣</label>
                    <button onClick={handleGenMnemonic} disabled={isGeneratingMnemonic} className="text-[10px] px-3 py-1.5 rounded-full bg-white text-indigo-600 border border-indigo-200">
                        {isGeneratingMnemonic ? <RefreshCw size={12} className="animate-spin"/> : <Wand2 size={12}/>} 重編口訣
                    </button>
                </div>
                <textarea className="w-full bg-white border-2 border-slate-100 rounded-[1.5rem] p-4 text-sm text-emerald-700 font-bold h-16 outline-none shadow-inner" value={tempEditValue.mnemonic || ''} onChange={(e) => setTempEditValue({...tempEditValue, mnemonic: e.target.value})} />
            </div>

            <div className="space-y-3 pt-4 border-t border-indigo-100">
                <div className="flex justify-between items-center px-1">
                    <label className="text-sm text-slate-700 font-black tracking-widest">【多音字管理】</label>
                    <button onClick={handleGenPolyphonic} className="text-[10px] px-3 py-1.5 rounded-full bg-white text-indigo-600 border border-indigo-200">AI 掃描所有讀音</button>
                </div>
                {(tempEditValue.polyphonic || []).map((item: any, i: number) => (
                     <div key={`edit-poly-${i}`} className="flex gap-2 bg-white p-3 rounded-2xl border border-slate-200">
                        <input className="w-20 bg-slate-50 rounded-xl p-2 text-xs font-black text-indigo-600" value={item.zhuyin} onChange={(e) => { const newArr = [...tempEditValue.polyphonic]; newArr[i].zhuyin = e.target.value; setTempEditValue({...tempEditValue, polyphonic: newArr}); }} placeholder="注音" />
                        <input className="w-24 bg-slate-50 rounded-xl p-2 text-xs font-bold" value={item.words} onChange={(e) => { const newArr = [...tempEditValue.polyphonic]; newArr[i].words = e.target.value; setTempEditValue({...tempEditValue, polyphonic: newArr}); }} placeholder="詞語" />
                        <input className="flex-1 bg-slate-50 rounded-xl p-2 text-xs" value={item.usage} onChange={(e) => { const newArr = [...tempEditValue.polyphonic]; newArr[i].usage = e.target.value; setTempEditValue({...tempEditValue, polyphonic: newArr}); }} placeholder="用法" />
                        <button onClick={() => { const newArr = [...tempEditValue.polyphonic]; newArr.splice(i, 1); setTempEditValue({...tempEditValue, polyphonic: newArr}); }} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-indigo-100">
                <button onClick={cancelEdit} className="px-6 py-2.5 text-slate-400 font-bold">放棄</button>
                <button onClick={saveEdit} className="px-10 py-2.5 bg-indigo-600 text-white rounded-full font-black shadow-lg">儲存修改</button>
            </div>
        </div>
      );
  };

  // --- 🌟 成語編輯器渲染 (加入魔法棒按鈕) ---
  const renderIdiomEditor = () => {
    if (!tempIdiomValue) return null;
    return (
      <div className="bg-indigo-50/80 border-2 border-indigo-200 rounded-[3rem] p-10 relative shadow-inner mb-6 animate-in zoom-in-95">
         <div className="flex gap-4 items-center mb-8">
            <input className="text-3xl font-black text-indigo-900 bg-white px-6 py-3 rounded-2xl border border-indigo-100 shadow-sm outline-none w-64 text-center" value={tempIdiomValue.word} onChange={e => setTempIdiomValue({...tempIdiomValue, word: e.target.value})} placeholder="輸入成語名稱" />
            
            {/* 🌟 魔法棒按鈕 */}
            <button 
                onClick={handleAutoFillIdiom}
                disabled={isGeneratingIdiomAuto || !tempIdiomValue.word}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
                {isGeneratingIdiomAuto ? <RefreshCw size={20} className="animate-spin" /> : <Sparkles size={20} />}
                {isGeneratingIdiomAuto ? 'AI 正在思考...' : 'AI 自動填寫內容'}
            </button>
         </div>
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
                <div>
                    <label className="text-[10px] font-black text-indigo-500 uppercase block mb-2 tracking-widest">釋義說明</label>
                    <textarea className="w-full p-4 rounded-2xl border outline-none text-slate-700 font-bold leading-relaxed h-24 focus:border-indigo-400 bg-white" value={tempIdiomValue.definition} onChange={e => setTempIdiomValue({...tempIdiomValue, definition: e.target.value})} placeholder="自動生成或手動編輯..." />
                </div>
                <div>
                    <label className="text-[10px] font-black text-amber-500 uppercase block mb-2 tracking-widest">應用例句</label>
                    <textarea className="w-full p-4 rounded-2xl border outline-none text-slate-600 font-medium h-24 focus:border-amber-400 bg-white" value={tempIdiomValue.example} onChange={e => setTempIdiomValue({...tempIdiomValue, example: e.target.value})} placeholder="造個句子吧..." />
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
                <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100">
                    <label className="text-[10px] font-black text-emerald-600 block mb-2">近義詞 (用、號隔開)</label>
                    <input className="w-full p-3 rounded-xl border font-bold text-emerald-800 bg-white outline-none focus:border-emerald-400" value={Array.isArray(tempIdiomValue.synonyms) ? tempIdiomValue.synonyms.join('、') : tempIdiomValue.synonyms} onChange={e => setTempIdiomValue({...tempIdiomValue, synonyms: e.target.value})} />
                </div>
                <div className="bg-rose-50/50 p-6 rounded-[2rem] border border-rose-100">
                    <label className="text-[10px] font-black text-rose-600 block mb-2">反義詞 (用、號隔開)</label>
                    <input className="w-full p-3 rounded-xl border font-bold text-rose-800 bg-white outline-none focus:border-rose-400" value={Array.isArray(tempIdiomValue.antonyms) ? tempIdiomValue.antonyms.join('、') : tempIdiomValue.antonyms} onChange={e => setTempIdiomValue({...tempIdiomValue, antonyms: e.target.value})} />
                </div>
            </div>
         </div>
         <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-indigo-100">
            <button onClick={cancelEditIdiom} className="px-8 py-3 rounded-full text-slate-500 font-bold hover:bg-slate-100">放棄修改</button>
            <button onClick={saveEditIdiom} className="px-10 py-3 rounded-full bg-indigo-600 text-white font-black hover:bg-indigo-700 shadow-lg">儲存成語卡</button>
         </div>
      </div>
    );
  };

  if (parseError || !data) {
    return <div className="flex flex-col items-center justify-center h-96 space-y-6"><RefreshCw className="animate-spin text-blue-500" size={60} /><p className="text-slate-800 text-xl font-black">正在為您編織語文輻射地圖...</p></div>;
  }

  return (
    <div className="flex flex-col h-full relative">
       {/* 標題與生字列表區 (保持不變) */}
       <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><Sparkles size={120} /></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-2 flex items-center gap-3"><span className="bg-blue-500 p-2 rounded-2xl"><BookOpen size={24} /></span> Step 2.5：語文輻射與精準微調</h2>
            <p className="text-slate-400 font-medium">針對核心生字與成語，您可以手動追加、修改或使用 AI 自動生成。</p>
          </div>
       </div>

       <div className="flex-1 overflow-y-auto pb-40 px-1 custom-scrollbar">
          {/* 生字循環渲染 (略，同前) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {vocabList.map((vocabItem, vIdx) => {
                if (!vocabItem.isFocused) return null;
                if (editingIndex === vIdx) return <React.Fragment key={`edit-${vIdx}`}>{renderVocabEditor()}</React.Fragment>;
                return (
                <div key={`vocab-${vIdx}`} className="bg-white rounded-[2.5rem] shadow-sm border-2 border-slate-100 p-8 hover:border-indigo-300 transition-all group relative overflow-hidden">
                  <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all"><button onClick={() => startEdit(vIdx, vocabItem)} className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white"><Edit2 size={18} /></button><button onClick={() => deleteVocabCard(vIdx)} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white"><Trash2 size={18} /></button></div>
                  <div className="flex items-start gap-6 mb-8"><div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl flex flex-col items-center justify-center text-white shrink-0 shadow-xl"><span className="text-3xl font-black">{vocabItem.word}</span><span className="text-[10px] font-bold mt-1">{vocabItem.zhuyin}</span></div><div><div className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-slate-500 uppercase mb-2 inline-block">{vocabItem.type || '綜合辨析'}</div><h3 className="text-xl font-black text-slate-800">教學輻射卡</h3></div></div>
                  <div className="space-y-4">
                    {vocabItem.polyphonic && vocabItem.polyphonic.length > 0 && <div className="space-y-2">{vocabItem.polyphonic.map((poly, pIdx) => (<div key={`poly-${pIdx}`} className="bg-indigo-50/50 p-4 rounded-3xl border border-indigo-100 flex items-center justify-between"><div className="flex items-center gap-4"><span className="bg-white px-3 py-1 rounded-xl text-indigo-700 font-black text-sm shadow-sm">{poly.zhuyin}</span><span className="text-slate-800 font-bold">{poly.words}</span></div><span className="text-[10px] text-slate-400 font-medium italic">{poly.usage}</span></div>))}</div>}
                    {vocabItem.shapeSimilar && vocabItem.shapeSimilar.length > 0 && <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{vocabItem.shapeSimilar.map((sim, sIdx) => (<div key={`sim-${vIdx}-${sIdx}`} className="bg-slate-50 p-4 rounded-3xl border border-slate-100 hover:bg-white transition-all shadow-sm"><div className="flex items-center gap-3 mb-2"><span className="text-blue-600 font-black text-2xl">{sim.char}</span><div className="h-4 w-[1px] bg-slate-200"></div><span className="text-slate-700 font-bold text-sm truncate">{sim.words}</span></div><p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">{sim.explanation}</p></div>))}</div>}
                    {vocabItem.mnemonic && <div className="mt-4 p-5 bg-emerald-50 rounded-[1.5rem] border border-emerald-100 relative"><Sparkles size={14} className="absolute top-4 right-4 text-emerald-300" /><p className="text-xs font-bold text-emerald-700 italic">「{vocabItem.mnemonic}」</p></div>}
                  </div>
                </div>);
            })}
          </div>

          <div className="space-y-6 mt-16 pb-20">
             <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 px-4"><div className="p-2 bg-indigo-100 rounded-xl text-indigo-600"><BookOpen size={20} /></div> 成語深度解析</h3>
             <div className="grid grid-cols-1 gap-6">
               {idiomList.map((idiom, idx) => {
                 if (editingIdiomIndex === idx) return <React.Fragment key={`edit-idiom-${idx}`}>{renderIdiomEditor()}</React.Fragment>;
                 return (
                   <div key={`idiom-${idx}`} className="bg-white border-2 border-slate-100 rounded-[3rem] p-10 relative group hover:border-indigo-200 transition-all">
                     <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-all"><button onClick={() => startEditIdiom(idx, idiom)} className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white"><Edit2 size={24} /></button><button onClick={() => deleteIdiom(idx)} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white"><Trash2 size={24} /></button></div>
                     <div className="flex items-center gap-4 mb-8"><div className="text-3xl font-black text-slate-900 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">【{idiom.word}】</div></div>
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                       <div className="space-y-6">
                         <div><span className="text-[10px] font-black text-indigo-500 uppercase block mb-2 tracking-widest">釋義說明</span><p className="text-slate-700 text-lg font-bold leading-relaxed">{idiom.definition}</p></div>
                         <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 italic"><span className="text-[10px] font-black text-amber-500 block mb-2 tracking-widest">應用例句</span><p className="text-slate-600 font-medium">「{idiom.example}」</p></div>
                       </div>
                       <div className="grid grid-cols-1 gap-4">
                          <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100"><span className="text-[10px] font-black text-emerald-600 block mb-3 tracking-widest">近義詞辨析</span><div className="flex flex-wrap gap-2">{idiom.synonyms?.map((s: string, i: number) => <span key={`syn-${i}`} className="bg-white px-5 py-2 rounded-2xl text-sm text-emerald-700 border border-emerald-100 font-black shadow-sm">{s}</span>)}</div></div>
                          <div className="bg-rose-50/50 p-6 rounded-[2rem] border border-rose-100"><span className="text-[10px] font-black text-rose-600 block mb-3 tracking-widest">反義詞對照</span><div className="flex flex-wrap gap-2">{idiom.antonyms?.map((a: string, i: number) => <span key={`ant-${i}`} className="bg-white px-5 py-2 rounded-2xl text-sm text-rose-700 border border-rose-100 font-black shadow-sm">{a}</span>)}</div></div>
                       </div>
                     </div>
                   </div>
                 );
               })}
               {/* 🌟 關鍵修正：渲染「正在新增」的空白卡編輯器 */}
               {editingIdiomIndex !== -1 && editingIdiomIndex === idiomList.length && (
                 <div className="animate-in slide-in-from-bottom-4 duration-300">
                    {renderIdiomEditor()}
                 </div>
               )}
             </div>
             <button onClick={addNewIdiom} disabled={editingIdiomIndex !== -1} className={`w-full py-8 border-4 border-dashed border-slate-200 rounded-[3rem] text-slate-400 font-black flex flex-col items-center justify-center gap-3 transition-all mt-6 ${editingIdiomIndex !== -1 ? 'opacity-50' : 'hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/50'}`}><div className="p-4 bg-white rounded-full shadow-sm"><Plus size={32} /></div><span className="tracking-widest text-lg">新增自訂成語解析卡</span></button>
          </div>
       </div>

       <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-slate-900/90 backdrop-blur-2xl p-4 rounded-full shadow-2xl border border-white/10 z-50 animate-in slide-in-from-bottom-10">
        <button onClick={onBack} className="px-8 py-3 text-slate-400 font-black hover:text-white transition-all flex items-center gap-2 active:scale-95"><ArrowLeft size={20} /> 返回配置</button>
        <div className="w-[1px] h-8 bg-white/10"></div>
        <button onClick={handleConfirm} disabled={editingIndex !== -1 || editingIdiomIndex !== -1 || isLoading} className="px-12 py-4 bg-indigo-600 text-white font-black rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:bg-slate-700"><Check size={22} /> 確認辨析，進入邏輯解構</button>
      </div>
    </div>
  );
};

export default Step2Deep;