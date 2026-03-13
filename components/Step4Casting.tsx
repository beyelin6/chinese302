// 檔案路徑: src/components/Step4Casting.tsx

import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Users, Check, AlertCircle, Play, 
  Info, Edit2, X, ArrowLeft, Sparkles, ImagePlus, Loader2 
} from 'lucide-react';
import { CastingData, GuideCandidate, MediaData } from '../types';
import ReactMarkdown from 'react-markdown';

interface Step4CastingProps {
  castingResult: string | null;
  onConfirmCasting: (protagonistTraits: string, guide: GuideCandidate, customGuideVisuals?: string) => void;
  onSuggestTraits: (gender: string, age: string, toneLabel: string) => Promise<string>;
  onGenerateCasting: () => void;
  handleExtractImageTraits?: (media: MediaData) => Promise<string | null>;
  isLoading: boolean;
  onBack: () => void;
}

const TONE_OPTIONS = [
  { code: 'G1', label: '溫暖', desc: '關懷/陪伴', color: 'border-pink-200 text-pink-700 bg-pink-50 hover:bg-pink-100' },
  { code: 'G2', label: '邏輯', desc: '推理/分析', color: 'border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100' },
  { code: 'G3', label: '知識', desc: '百科/權威', color: 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100' },
  { code: 'G4', label: '幽默', desc: '風趣/搞笑', color: 'border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100' },
  { code: 'G5', label: '熱血', desc: '激勵/動感', color: 'border-red-200 text-red-700 bg-red-50 hover:bg-red-100' },
  { code: 'G6', label: '神秘', desc: '奇幻/引導', color: 'border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100' },
];

const Step4Casting: React.FC<Step4CastingProps> = ({ 
  castingResult, 
  onConfirmCasting, 
  onSuggestTraits,
  onGenerateCasting,
  handleExtractImageTraits,
  isLoading, 
  onBack 
}) => {
  const [data, setData] = useState<CastingData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editingGuide, setEditingGuide] = useState<GuideCandidate | null>(null);
  const [customProtagonist, setCustomProtagonist] = useState<string>('');
  
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!castingResult && !isLoading) {
      onGenerateCasting();
    }
  }, [castingResult, isLoading, onGenerateCasting]);

  useEffect(() => {
    try {
      if (!castingResult) return;
      let cleanJson = castingResult;
      if (cleanJson.includes('```json')) {
        cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '');
      } else if (cleanJson.includes('```')) {
        cleanJson = cleanJson.replace(/```/g, '');
      }
      
      const parsed = JSON.parse(cleanJson);
      
      // 確保資料結構相容
      const formattedData: CastingData = {
        contextTone: parsed.contextTone || "本課語境分析中...",
        candidates: parsed.candidates || [],
        protagonist: parsed.protagonist,
        fusionTable: parsed.fusionTable
      };

      setData(formattedData);
      setCustomProtagonist(formattedData.protagonist?.traits || '');
      setParseError(null);
    } catch (err: any) {
      console.error("Casting JSON Parse Error:", err);
      setParseError("AI 回傳的選角資料格式異常，請嘗試重新生成。");
    }
  }, [castingResult]);

  const handleEditClick = (guide: GuideCandidate, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(guide.id);
    setEditingGuide({ ...guide });
  };

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!data || !editingGuide) return;
    const updatedCandidates = data.candidates.map(g => g.id === editingGuide.id ? editingGuide : g);
    setData({ ...data, candidates: updatedCandidates });
    setIsEditing(null);
  };

  const handleConfirm = () => {
    if (!data || !selectedGuide) return;
    const guide = data.candidates.find(g => g.id === selectedGuide);
    if (guide) {
      onConfirmCasting(customProtagonist, guide);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !handleExtractImageTraits) return;

    setIsExtracting(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const media: MediaData = {
          mimeType: file.type,
          data: base64Data,
          name: file.name
        };
        const traits = await handleExtractImageTraits(media);
        if (traits) {
          setCustomProtagonist(traits.replace(/```yaml|```/g, '').trim());
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("萃取圖片特徵失敗", error);
    } finally {
      setIsExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const isEditingAny = isEditing !== null;

  if (parseError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <AlertCircle size={48} className="text-red-400 mb-4" />
        <p className="text-red-500 font-bold">{parseError}</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-slate-100 rounded-lg text-sm">返回上一步</button>
      </div>
    );
  }

  if (!data) return null;

  const isModeA = data.protagonist && data.protagonist.name !== "None";

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-8 duration-700 pb-24 relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
          <span className="bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
          靈魂與策略 (Soul Casting)
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
        
        {/* 🌟 [新增] 語境共鳴分析 */}
        {data.contextTone && (
          <div className="bg-teal-50/50 border border-teal-100 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
            <div className="bg-teal-100 p-2 rounded-xl text-teal-600">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-1">本課語境共鳴分析 (Context Tone)</div>
              <p className="text-sm text-slate-700 font-medium italic">「{data.contextTone}」</p>
            </div>
          </div>
        )}

        {/* 故事主角 DNA (Mode A 限定) */}
        {isModeA && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <User className="text-blue-500" /> 故事主角 DNA 鎖定
            </h3>
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/3">
                <div className="text-sm font-bold text-slate-800">{data.protagonist.name}</div>
                <div className="text-xs text-slate-500 mb-2">{data.protagonist.gender} • {data.protagonist.age}</div>
                
                {handleExtractImageTraits && (
                   <div className="mt-4">
                     <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                     <button 
                       onClick={() => fileInputRef.current?.click()}
                       disabled={isExtracting || isLoading}
                       className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-blue-200 text-blue-600 rounded-lg text-xs font-bold shadow-sm hover:bg-blue-50 transition-colors"
                     >
                       {isExtracting ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
                       {isExtracting ? "正在解析圖片..." : "上傳圖片萃取 DNA"}
                     </button>
                   </div>
                )}
              </div>
              <div className="flex-1">
                 <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Visual DNA Traits (可手動修改)</label>
                 <textarea
                   value={customProtagonist}
                   onChange={(e) => setCustomProtagonist(e.target.value)}
                   className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm font-mono text-slate-700 shadow-inner outline-none focus:ring-2 focus:ring-blue-500"
                   rows={4}
                 />
              </div>
            </div>
          </div>
        )}

        {/* 引導者選角 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
           <h3 className="text-lg font-black text-slate-800 mb-1 flex items-center gap-2">
              <Users className="text-teal-600" /> 選擇引導者 (Guide Casting)
           </h3>
           <p className="text-sm text-slate-500 mb-6">請選擇一位最適合本課文風的引導角色。AI 已根據課文靈魂為您編織了專屬人設。</p>
 
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {data.candidates.map((guide) => {
               const isSelected = selectedGuide === guide.id;
               
               return (
                 <div 
                   key={guide.id} 
                   onClick={() => !isEditingAny && setSelectedGuide(guide.id)}
                   className={`relative border-2 rounded-2xl p-5 transition-all cursor-pointer ${
                     isSelected 
                       ? 'border-teal-500 bg-teal-50/30 shadow-md' 
                       : 'border-slate-200 hover:border-teal-300 hover:shadow-sm bg-white'
                   } ${isEditingAny && isEditing !== guide.id ? 'opacity-50 pointer-events-none' : ''}`}
                 >
                   {/* 右上角核取圈圈 */}
                   <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                     isSelected ? 'border-teal-500 bg-teal-500' : 'border-slate-300'
                   }`}>
                     {isSelected && <Check size={14} className="text-white" />}
                   </div>
 
                   {isEditing === guide.id ? (
                     <div className="space-y-4 animate-in fade-in duration-300" onClick={e => e.stopPropagation()}>
                       <div className="grid grid-cols-2 gap-4">
                         <div>
                           <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">角色名稱</label>
                           <input 
                             type="text" 
                             value={editingGuide?.name || ''} 
                             onChange={(e) => setEditingGuide({...editingGuide!, name: e.target.value})}
                             className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                           />
                         </div>
                         <div>
                           <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">角色頭銜</label>
                           <input 
                             type="text" 
                             value={editingGuide?.title || ''} 
                             onChange={(e) => setEditingGuide({...editingGuide!, title: e.target.value})}
                             className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                           />
                         </div>
                       </div>
 
                       <textarea
                         value={editingGuide?.visualDNA || ''}
                         onChange={(e) => setEditingGuide({...editingGuide!, visualDNA: e.target.value})}
                         className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-600 shadow-inner outline-none focus:ring-2 focus:ring-teal-500"
                         rows={4}
                         placeholder="Visual DNA 特徵..."
                       />
                       
                       <div className="flex gap-2">
                         <button onClick={handleSaveEdit} className="flex-1 bg-slate-900 text-white py-2 rounded-lg text-xs font-bold shadow-lg hover:bg-slate-800 transition-colors">儲存設定</button>
                         <button onClick={() => setIsEditing(null)} className="px-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 transition-colors">取消</button>
                       </div>
                     </div>
                   ) : (
                     <>
                       <div className="flex justify-between items-start mb-3">
                         <div>
                           <h4 className="font-black text-slate-800 text-lg">{guide.name}</h4>
                           <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded-full text-slate-500 uppercase font-bold">
                             {guide.title}
                           </span>
                         </div>
                         <button 
                           onClick={(e) => handleEditClick(guide, e)}
                           className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors"
                         >
                           <Edit2 size={16} />
                         </button>
                       </div>
                       
                       <p className="text-xs text-slate-600 mb-4 leading-relaxed line-clamp-3">
                         {guide.teachingStyle}
                       </p>
 
                       {/* 🌟 核心優化：顯示適配邏輯 */}
                       <div className="bg-teal-50/50 p-3 rounded-xl border border-dashed border-teal-200 mb-4">
                         <p className="text-[10px] text-teal-600 flex items-center gap-1 font-bold mb-1">
                           <Sparkles size={10} /> 為什麼適合這課？
                         </p>
                         <p className="text-[10px] text-slate-500 italic leading-tight">
                           {guide.whyFit}
                         </p>
                       </div>
 
                       <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                         <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Visual DNA</div>
                         <div className="text-xs font-mono text-slate-600 truncate" title={guide.visualDNA}>
                           {guide.visualDNA}
                         </div>
                       </div>
                     </>
                   )}
                 </div>
               );
             })}
           </div>
        </div>
      </div>

      {/* Confirm Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 flex justify-center gap-4 z-10 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="px-6 py-3 text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center disabled:opacity-50"
        >
          <ArrowLeft className="mr-2" size={20} />
          返回上一步
        </button>
        <button
          onClick={handleConfirm}
          disabled={!selectedGuide || isLoading || isEditingAny}
          className={`flex-1 max-w-xl py-3 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center ${
            !selectedGuide || isLoading || isEditingAny
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none' 
              : 'bg-teal-600 hover:bg-teal-500 shadow-teal-200'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={20} />
              正在生產核心模組...
            </span>
          ) : isEditingAny ? (
            "請先儲存引導者設定"
          ) : (
            <>
              確認選角，開始生產
              <Play className="ml-2" size={20} fill="currentColor" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Step4Casting;