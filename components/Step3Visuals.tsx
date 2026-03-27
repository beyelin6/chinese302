// 檔案路徑: src/components/Step3Visuals.tsx

import React, { useState, useEffect } from 'react';
import { 
  Palette, Box, Check, AlertCircle, ArrowRight, 
  Info, ArrowLeft, Sparkles, Layout, ChevronDown, 
  Edit3, Loader2, Blend
} from 'lucide-react';
import { VisualData, RecStyleItem, RecMetaphorItem } from '../types';
import { sanitizeAndParseJSON } from '../utils/jsonParser';
import { ALL_STYLE_OPTIONS } from '../visual-library';

// 🌟 [SSOT 對齊] 載入 A-Z 全量風格庫
// ALL_STYLE_OPTIONS is now imported from visual-library.ts

interface Step3VisualsProps {
  visualResult: string | null;
  onConfirmVisuals: (style: RecStyleItem, metaphor: RecMetaphorItem) => void;
  onGenerateOptions: () => void;
  isLoading: boolean;
  onBack: () => void;
}

const Step3Visuals: React.FC<Step3VisualsProps> = ({ visualResult, onConfirmVisuals, onGenerateOptions, isLoading, onBack }) => {
  const [data, setData] = useState<any>(null);
  
  // 🌟 [升級為陣列] 支援多重風格選擇
  const [selectedStyles, setSelectedStyles] = useState<RecStyleItem[]>([]);
  const [selectedMetaphor, setSelectedMetaphor] = useState<RecMetaphorItem | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [customDesc, setCustomDesc] = useState("");

  useEffect(() => {
    if (!visualResult && !isLoading) onGenerateOptions();
  }, [visualResult, isLoading, onGenerateOptions]);

  useEffect(() => {
    if (!visualResult) return;
    try {
      const parsed = typeof visualResult === 'object' 
        ? visualResult 
        : sanitizeAndParseJSON(visualResult);
      
      if (!parsed) return;
      
      const recommendations = parsed.recommendations || [];
      setData({ ...parsed, recommendations });

      if (recommendations.length > 0 && !selectedMetaphor) {
        setSelectedMetaphor(recommendations[0].metaphor);
        
        // 初始載入時，將 AI 推薦的第一個風格加入陣列
        const matchedStyle = ALL_STYLE_OPTIONS.find(s => s.code === recommendations[0].style.code);
        if (matchedStyle && selectedStyles.length === 0) {
            setSelectedStyles([matchedStyle]);
            setCustomDesc(matchedStyle.reason);
        }
      }
    } catch (e) { console.error("Parse Error", e); }
  }, [visualResult]);

  // 🌟 當選擇的風格陣列改變時，自動更新編輯區的文字
  useEffect(() => {
    if (!isEditing) {
      setCustomDesc(selectedStyles.map(s => s.reason).join(', blended with '));
    }
  }, [selectedStyles, isEditing]);

  // 🌟 風格開關邏輯 (Toggle)
  const handleToggleStyle = (style: RecStyleItem) => {
    setSelectedStyles(prev => {
      const isAlreadySelected = prev.find(s => s.code === style.code);
      if (isAlreadySelected) {
        // 如果已經選了，且不是最後一個，就把它移除
        if (prev.length > 1) {
            return prev.filter(s => s.code !== style.code);
        }
        return prev; // 保持至少有一個風格被選中
      } else {
        // 最多允許融合 3 種風格，避免提示詞過長導致 AI 錯亂
        if (prev.length >= 3) {
            alert("最多只能融合 3 種風格喔！");
            return prev;
        }
        return [...prev, style];
      }
    });
  };

  const handleConfirm = () => {
    if (selectedStyles.length > 0 && selectedMetaphor) {
      // 🌟 風格融合魔法：把多個風格組合成一個全新的虛擬風格
      const blendedStyle: RecStyleItem = {
        code: selectedStyles.map(s => s.code).join('+'), // 例如: "A+S"
        name: selectedStyles.map(s => s.name).join(' x '), // 例如: "溫暖吉卜力 x 工程藍圖風"
        reason: isEditing ? customDesc : selectedStyles.map(s => s.reason).join(', blended with ')
      };
      
      onConfirmVisuals(blendedStyle, selectedMetaphor);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-8 pb-32 animate-in fade-in duration-500">
      <div className="px-2">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <Palette className="text-indigo-600" size={32} /> 形式與風格 (Style Blending)
        </h2>
        <p className="text-slate-500 font-medium mt-1 text-sm">點擊多個風格面板即可進行「畫風融合」（最多 3 種）。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-2">
        
        {/* 🌟 左側：風格融合調色盤 */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-black shadow-sm">1</div>
            <h3 className="text-xl font-black text-slate-700">選擇並微調風格</h3>
            {selectedStyles.length > 1 && (
              <span className="text-xs font-bold bg-purple-100 text-purple-700 px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">
                <Blend size={12}/> 已啟動融合魔法
              </span>
            )}
          </div>

          <div className="space-y-4">
            {/* 🌟 風格網格選擇區 */}
            <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 max-h-[400px] overflow-y-auto custom-scrollbar shadow-inner space-y-8">
              {[...new Set(ALL_STYLE_OPTIONS.map(s => s.category))].map(cat => (
                <div key={cat} className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">{cat}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ALL_STYLE_OPTIONS.filter(s => s.category === cat).map(style => {
                      const isSelected = selectedStyles.some(s => s.code === style.code);
                      return (
                        <button
                          key={style.code}
                          onClick={() => handleToggleStyle(style)}
                          className={`p-3 rounded-xl border-2 text-left transition-all relative overflow-hidden flex flex-col ${
                            isSelected 
                              ? 'bg-indigo-50 border-indigo-500 shadow-md' 
                              : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-100/50'
                          }`}
                        >
                          <span className={`text-[10px] font-black mb-1 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`}>
                            [{style.code}]
                          </span>
                          <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-indigo-900' : 'text-slate-600'}`}>
                            {style.name}
                          </span>
                          {isSelected && (
                            <div className="absolute top-2 right-2 text-indigo-500">
                              <Check size={14} strokeWidth={4} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* 🌟 編輯區域 */}
            <div className="bg-white p-6 rounded-[2rem] border-2 border-indigo-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-indigo-600 flex items-center gap-2">
                  <Edit3 size={14}/> 融合後的 Prompt (可手動修改)
                </span>
                <button 
                  onClick={() => setIsEditing(!isEditing)} 
                  className={`text-[10px] font-black px-3 py-1 rounded-full transition-all ${isEditing ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  {isEditing ? '鎖定描述' : '開啟編輯'}
                </button>
              </div>
              {isEditing ? (
                <textarea 
                  className="w-full h-24 bg-slate-50 border-2 border-indigo-200 rounded-xl p-4 text-xs font-mono text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10"
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  placeholder="在此修改生圖提示詞..."
                />
              ) : (
                <div className="text-xs font-mono text-slate-500 italic leading-relaxed px-2 bg-slate-50 p-4 rounded-xl border border-slate-100 break-words">
                  {customDesc}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 🌟 右側：P3 結構視圖推薦 (獨立選取) */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-black shadow-sm">2</div>
            <h3 className="text-xl font-black text-slate-700">P3 結構視圖推薦</h3>
          </div>

          <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
            {data?.recommendations?.map((rec: any, idx: number) => {
              // 確保不會有重複的選項，或是允許使用者看見更多元的推薦
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedMetaphor(rec.metaphor)}
                  className={`p-4 rounded-2xl border-2 transition-all text-left flex items-start gap-4 ${
                    selectedMetaphor?.code === rec.metaphor.code ? 'bg-emerald-50 border-emerald-500 shadow-md' : 'bg-white border-slate-200 hover:border-emerald-200 shadow-sm'
                  }`}
                >
                  <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${selectedMetaphor?.code === rec.metaphor.code ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>
                    {selectedMetaphor?.code === rec.metaphor.code && <Check size={12} strokeWidth={4} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{rec.metaphor.code}</span>
                      <h5 className="font-bold text-sm text-slate-800">{rec.metaphor.name}</h5>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">{rec.metaphor.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 底部按鈕 */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-200 flex justify-center gap-4 z-50">
        <button onClick={onBack} className="px-8 py-4 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition-all border border-slate-200">返回</button>
        <button onClick={handleConfirm} disabled={isLoading || selectedStyles.length === 0 || !selectedMetaphor} className="flex-1 max-w-xl py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100">
          {isLoading ? <Loader2 className="animate-spin" /> : <ArrowRight />} 確認並進入選角
        </button>
      </div>
    </div>
  );
};

export default Step3Visuals;