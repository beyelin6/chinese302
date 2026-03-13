import React, { useState, useEffect } from 'react';
import { Palette, Box, Check, AlertCircle, ArrowRight, Info, ArrowLeft, Sparkles, Layout, Plus, Edit3, X } from 'lucide-react';
import { VisualData, RecStyleItem, RecMetaphorItem } from '../types';

interface Step3VisualsProps {
  visualResult: string | null;
  onConfirmVisuals: (style: RecStyleItem, metaphor: RecMetaphorItem) => void;
  onGenerateOptions: () => void;
  isLoading: boolean;
  onBack: () => void;
}

const Step3Visuals: React.FC<Step3VisualsProps> = ({ 
  visualResult, 
  onConfirmVisuals, 
  onGenerateOptions,
  isLoading, 
  onBack 
}) => {
  const [data, setData] = useState<VisualData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  
  // Style: Multi-select + Custom
  const [selectedStyleCodes, setSelectedStyleCodes] = useState<string[]>([]);
  const [customStyle, setCustomStyle] = useState<{name: string, desc: string, isActive: boolean}>({
    name: '', desc: '', isActive: false
  });
  const [isEditingCustom, setIsEditingCustom] = useState(false);

  // Metaphor: Single-select
  const [selectedMetaphor, setSelectedMetaphor] = useState<RecMetaphorItem | null>(null);

  useEffect(() => {
    if (!visualResult && !isLoading) {
      onGenerateOptions();
    }
  }, [visualResult, isLoading, onGenerateOptions]);

  useEffect(() => {
    try {
      if (!visualResult) return;

      let cleanJson = visualResult;
      if (cleanJson.includes('```json')) {
        cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '');
      } else if (cleanJson.includes('```')) {
        cleanJson = cleanJson.replace(/```/g, '');
      }
      const parsed = JSON.parse(cleanJson);
      
      // Ensure styles is an array
      if (!parsed.styles || !Array.isArray(parsed.styles)) {
          parsed.styles = [];
      }
      
      // Ensure metaphors is an array
      if (!parsed.metaphors || !Array.isArray(parsed.metaphors)) {
          parsed.metaphors = [];
      }

      setData(parsed);
    } catch (e) {
      console.error("JSON Parse Error", e);
      setParseError("無法解析 AI 回傳的視覺建議。");
    }
  }, [visualResult]);

  const toggleStyle = (code: string) => {
      setSelectedStyleCodes(prev => 
        prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
      );
  };

  const handleConfirm = () => {
      if (!data || !selectedMetaphor) return;

      // 1. Collect selected presets
      const selectedPresets = data.styles.filter(s => selectedStyleCodes.includes(s.code));
      
      // 2. Check if we have valid custom style
      const hasCustom = customStyle.isActive && customStyle.name.trim().length > 0;

      if (selectedPresets.length === 0 && !hasCustom) return;

      // 3. Merge into a single composite style
      let finalName = selectedPresets.map(s => s.name).join(' + ');
      let finalCode = selectedPresets.map(s => s.code).join('+');
      let finalReason = selectedPresets.map(s => s.reason).join('; ');

      if (hasCustom) {
          const customNameFull = `${customStyle.name} (${customStyle.desc})`;
          finalName = finalName ? `${finalName} + ${customNameFull}` : customNameFull;
          finalCode = finalCode ? `${finalCode}+CUSTOM` : 'CUSTOM';
          finalReason = finalReason ? `${finalReason}; Custom Mix` : 'Custom Mix';
      }

      const compositeStyle: RecStyleItem = {
          name: finalName,
          code: finalCode,
          reason: finalReason
      };

      onConfirmVisuals(compositeStyle, selectedMetaphor);
  };

  const hasValidSelection = (selectedStyleCodes.length > 0 || (customStyle.isActive && customStyle.name.trim().length > 0)) && selectedMetaphor !== null;

  if (parseError || !data) {
     return (
      <div className="flex flex-col h-full space-y-6">
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl flex items-center text-red-700">
           <AlertCircle className="mr-3" size={24} />
           {parseError || "資料載入中..."}
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-300 max-h-96 overflow-y-auto whitespace-pre-wrap font-mono text-sm text-slate-800 shadow-inner custom-scrollbar">
           {visualResult}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-32 px-1">
         <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center">
                        <span className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm shadow-md shadow-emerald-200">3</span>
                        形式與風格 (Flexible Skin)
                    </h2>
                </div>
                <p className="text-slate-700 text-sm">
                    決定投影片的「物理屬性」。請為您的課程選擇最適合的視覺外衣與結構骨架。
                </p>
            </div>

            {/* 🌟 [新增] 動態視覺錨定 (Visual DNA Anchors) */}
            {data.visualAnchor && (
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2 text-blue-800 font-black">
                        <Sparkles size={20} className="text-blue-600" />
                        本課專屬視覺 DNA 掃描結果
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* 角色特徵 */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest">角色特徵 (Character)</label>
                            <div className="flex flex-wrap gap-2">
                                {data.visualAnchor.character_traits.map((trait, i) => (
                                    <span key={i} className="px-2 py-1 bg-white text-blue-700 border border-blue-200 rounded-lg text-xs font-bold shadow-sm">
                                        {trait}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* 場景關鍵字 */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest">場景關鍵字 (Environment)</label>
                            <div className="flex flex-wrap gap-2">
                                {data.visualAnchor.environment_traits.map((trait, i) => (
                                    <span key={i} className="px-2 py-1 bg-white text-slate-700 border border-slate-200 rounded-lg text-xs font-bold shadow-sm">
                                        {trait}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* 核心色調 */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest">核心色調 (Colors)</label>
                            <div className="flex flex-wrap gap-2">
                                {data.visualAnchor.core_colors.length > 0 ? (
                                    data.visualAnchor.core_colors.map((color, i) => (
                                        <span key={i} className="px-2 py-1 bg-white text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold shadow-sm">
                                            {color}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs text-slate-400 italic">文中未提及具體顏色</span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-[10px] text-blue-400 italic pt-2 border-t border-blue-100">
                        💡 系統已鎖定以上座標，後續生成的每一張投影片都將嚴格繼承這些視覺 DNA。
                    </div>
                </div>
            )}

            {/* AI Consistency Check */}
            {data.consistencyAnalysis && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start shadow-sm relative overflow-hidden">
                    <Sparkles className="flex-shrink-0 mr-3 mt-1 text-emerald-600" size={18} />
                    <div>
                        <h3 className="text-emerald-800 font-bold text-sm mb-1">AI 風格一致性檢核</h3>
                        <p className="text-slate-800 text-sm leading-relaxed">{data.consistencyAnalysis}</p>
                    </div>
                </div>
            )}

            {/* Styles Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-blue-700 flex items-center">
                        <Palette className="mr-2 text-blue-500" size={20}/> 
                        推薦視覺風格 (Visual Style)
                    </h3>
                    <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-200 flex items-center font-medium">
                        <Check size={12} className="mr-1"/> 可複選混搭 / 自訂
                    </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Preset Styles */}
                    {data.styles.map((style, idx) => {
                        const isSelected = selectedStyleCodes.includes(style.code);
                        return (
                            <button
                                key={idx}
                                onClick={() => toggleStyle(style.code)}
                                className={`p-5 rounded-2xl text-left transition-all border relative overflow-hidden group h-full flex flex-col ${
                                    isSelected 
                                    ? 'bg-blue-50 border-blue-400 shadow-md shadow-blue-100' 
                                    : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`font-bold text-lg ${isSelected ? 'text-blue-800' : 'text-slate-900 group-hover:text-blue-700'}`}>
                                        {style.name}
                                    </span>
                                    <span className="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-700 border border-slate-300">
                                        {style.code}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-700 leading-relaxed flex-1 group-hover:text-slate-900 transition-colors">
                                    {style.reason}
                                </p>
                                
                                {/* Selection Indicator */}
                                <div className={`absolute inset-0 border-2 rounded-2xl pointer-events-none transition-opacity duration-300 ${isSelected ? 'border-blue-500 opacity-100' : 'border-transparent opacity-0'}`}></div>
                                {isSelected && (
                                    <div className="absolute top-0 right-0 bg-blue-500 rounded-bl-xl p-1.5 shadow-sm">
                                        <Check size={14} className="text-white" />
                                    </div>
                                )}
                            </button>
                        );
                    })}

                    {/* Custom Style Card */}
                    <div 
                        className={`p-1 rounded-2xl border transition-all relative overflow-hidden flex flex-col ${
                            customStyle.isActive
                            ? 'bg-indigo-50 border-indigo-400 shadow-md shadow-indigo-100' 
                            : 'bg-slate-100 border-slate-300 border-dashed hover:border-indigo-300'
                        }`}
                    >
                        {!isEditingCustom && !customStyle.isActive ? (
                             <button onClick={() => { setIsEditingCustom(true); setCustomStyle({...customStyle, isActive: true}); }} className="w-full h-full flex flex-col items-center justify-center min-h-[160px] text-slate-500 hover:text-indigo-600 transition-colors">
                                <Plus size={32} className="mb-2 opacity-50"/>
                                <span className="font-bold">自訂風格</span>
                                <span className="text-xs opacity-60 mt-1">混合或創造新視覺</span>
                             </button>
                        ) : (
                            <div className="p-4 flex flex-col h-full relative">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-indigo-700 font-bold flex items-center">
                                        <Edit3 size={16} className="mr-2"/> 自訂參數
                                    </span>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setCustomStyle({...customStyle, isActive: !customStyle.isActive})}
                                            className={`text-[10px] px-2 py-1 rounded-full border ${customStyle.isActive ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-slate-200 text-slate-600 border-slate-300'}`}
                                        >
                                            {customStyle.isActive ? "已啟用" : "已停用"}
                                        </button>
                                    </div>
                                </div>
                                                                <input 
                                    className="bg-white border border-slate-300 rounded p-2 text-slate-900 text-sm mb-2 focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-500"
                                    placeholder="風格名稱 (例: 賽博龐克宮崎駿)"
                                    value={customStyle.name}
                                    onChange={(e) => setCustomStyle({...customStyle, name: e.target.value})}
                                />
                                <textarea 
                                    className="bg-white border border-slate-300 rounded p-2 text-slate-900 text-xs flex-1 focus:ring-2 focus:ring-indigo-500 outline-none resize-none placeholder-slate-500 leading-relaxed"
                                    placeholder="視覺描述 (例: 霓虹燈光、機械細節、溫暖手繪質感...)"
                                    value={customStyle.desc}
                                    onChange={(e) => setCustomStyle({...customStyle, desc: e.target.value})}
                                />

                                {customStyle.isActive && (
                                     <div className="absolute top-0 right-0 bg-indigo-500 rounded-bl-xl p-1.5 shadow-sm pointer-events-none">
                                        <Check size={14} className="text-white" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Metaphors Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-purple-700 flex items-center">
                        <Box className="mr-2 text-purple-500" size={20}/> 
                        推薦結構隱喻 (Structural Metaphor)
                    </h3>
                     <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full border border-slate-200 font-medium">
                        單選 (結構骨架)
                    </span>
                </div>
                
                {/* Explanatory Block */}
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start text-sm text-purple-800 shadow-sm">
                    <Info className="flex-shrink-0 mr-3 mt-0.5 text-purple-500" size={18} />
                    <div className="flex-1">
                        <span className="font-bold block mb-1 text-purple-700">P3 結構視圖 (The Fusion Map)</span>
                        <p className="opacity-80 leading-relaxed text-xs text-purple-900">
                            系統將把課文的「意義段 (骨架)」轉化為您選擇的「視覺隱喻 (皮肉)」。
                            例如選擇「冒險地圖」，段落將變為地圖站點；選擇「漢堡圖」，段落將變為層層堆疊的食材。
                        </p>
                    </div>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.metaphors.map((meta, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedMetaphor(meta)}
                            className={`relative group border-2 p-5 rounded-2xl transition-all cursor-pointer text-left h-full flex flex-col ${
                                selectedMetaphor?.code === meta.code 
                                ? 'border-teal-500 bg-teal-50 shadow-md' 
                                : 'border-slate-200 bg-white hover:border-teal-200 hover:shadow-md'
                            }`}
                        >
                            <div className="flex justify-between items-center mb-3">
                                <span className="bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded font-mono">{meta.code}</span>
                                <span className="text-[10px] font-black text-teal-600 tracking-tighter uppercase">{meta.category}</span>
                            </div>
                            <h4 className="font-black text-slate-800 mb-2 text-lg">{meta.name}</h4>
                            <div className="flex items-start gap-3 flex-1">
                                <p className="text-[11px] text-slate-500 leading-relaxed italic line-clamp-3">
                                    {meta.visual}
                                </p>
                            </div>

                            {/* Selection Indicator */}
                            {selectedMetaphor?.code === meta.code && (
                                <div className="absolute -top-2 -right-2 bg-teal-500 text-white p-1 rounded-full shadow-lg">
                                    <Check size={14} />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
         </div>
      </div>

       {/* --- CONFIRM BUTTON (STICKY FOOTER) --- */}
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
                disabled={!hasValidSelection || isLoading}
                className={`flex-1 max-w-xl py-3 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center ${
                    !hasValidSelection || isLoading
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-teal-600 hover:bg-teal-500 shadow-teal-200'
                }`}
             >
                 {isLoading ? (
                    <span className="flex items-center">
                        <Sparkles className="animate-spin mr-2" size={20} />
                        正在召喚靈魂與選角...
                    </span>
                 ) : (
                    <>
                        確認選擇，進入選角
                        <ArrowRight className="ml-2" size={20} />
                    </>
                 )}
             </button>
      </div>
    </div>
  );
};

export default Step3Visuals;