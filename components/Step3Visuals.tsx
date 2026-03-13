// 檔案路徑: src/components/Step3Visuals.tsx

import React, { useState, useEffect } from 'react';
import { Palette, Box, Check, AlertCircle, ArrowRight, Info, ArrowLeft, Sparkles, Layout, ChevronDown, Edit3, Plus, X } from 'lucide-react';
import { VisualData, RecStyleItem, RecMetaphorItem } from '../types';

// 🌟 [SSOT 對齊] 載入 A-Y 全量風格庫
const ALL_STYLE_OPTIONS: RecStyleItem[] = [
  { code: 'A', name: '溫暖吉卜力', reason: 'Studio Ghibli style, hand-painted anime art, lush greenery, warm golden lighting.' },
  { code: 'B', name: '現代扁平', reason: 'Modern Flat Design, vector art, clean geometric shapes, bold solid colors.' },
  { code: 'C', name: '清新水彩', reason: 'Soft watercolor painting, paper texture, dreamy atmosphere.' },
  { code: 'D', name: '精緻剪紙', reason: 'Layered paper cut art, depth of field, subtle drop shadows.' },
  { code: 'E', name: '新海誠光影', reason: 'Makoto Shinkai style, hyper-realistic sky, cinematic anime.' },
  { code: 'F', name: '新國風水墨', reason: 'Traditional Chinese Ink wash, Zen minimalism, elegant calligraphy.' },
  { code: 'G', name: '3D 軟陶', reason: '3D Claymorphism, rounded edges, soft matte finish.' },
  { code: 'H', name: '像素積木', reason: 'Voxel art, 3D pixel blocks, LEGO-like aesthetic.' },
  { code: 'I', name: '塗鴉手帳', reason: 'Hand-drawn doodle, ballpoint pen lines, bullet journal aesthetic.' },
  { code: 'J', name: '奇幻繪本', reason: 'Vintage storybook collage, whimsical fantasy, saturated colors.' },
  { code: 'K', name: '療癒色鉛筆', reason: 'Colored pencil, waxy texture, soft warm tones.' },
  { code: 'L', name: '幾何資訊圖', reason: 'Isometric infographic, clean blocks, technical lines.' },
  { code: 'M', name: '復古浮世繪', reason: 'Ukiyo-e woodblock print, bold outlines, traditional Japanese art.' },
  { code: 'N', name: '熱血少年戰鬥', reason: 'Shonen manga style, speed lines, impact sparks, high contrast.' },
  { code: 'O', name: 'Vtuber 學院', reason: 'Vtuber stream overlay, anime theme, chat box UI, vibrant.' },
  { code: 'P', name: '黏土擬真世界', reason: '3D Claymorphism, macaron colors, rounded shapes.' },
  { code: 'Q', name: '學習漫畫風', reason: 'Educational manga paneling, black and white ink, screentones.' },
  { code: 'R', name: '虛擬立體書', reason: '3D Pop-up book paper engineering, realistic shadows.' },
  { code: 'S', name: '工程藍圖風', reason: 'Technical blueprint, cyanotype, white lines on blue grid.' },
  { code: 'T', name: '等距微縮世界', reason: 'Isometric diorama, voxel art style, tilt-shift effect.' },
  { code: 'U', name: '即時通訊介面', reason: 'Mobile chat interface, text bubbles, pastel gradient.' },
  { code: 'V', name: '拼貼誌手作感', reason: 'Mixed media zine collage, ripped paper, washi tape.' },
  { code: 'W', name: '暗黑學院風', reason: 'Dark academia, vintage library, parchment texture.' },
  { code: 'X', name: '吉卜力探索日誌', reason: 'Ghibli exploration journal, oil painting, botanical sketches.' },
  { code: 'Y', name: '卡哇伊貼紙美學', reason: 'Kawaii sticker bomb, white die-cut borders, grid paper.' }
];

interface Step3VisualsProps {
  visualResult: string | null;
  onConfirmVisuals: (style: RecStyleItem, metaphor: RecMetaphorItem) => void;
  onGenerateOptions: () => void;
  isLoading: boolean;
  onBack: () => void;
}

const Step3Visuals: React.FC<Step3VisualsProps> = ({ visualResult, onConfirmVisuals, onGenerateOptions, isLoading, onBack }) => {
  const [data, setData] = useState<any>(null);
  const [selectedStyle, setSelectedStyle] = useState<RecStyleItem>(ALL_STYLE_OPTIONS[0]);
  const [selectedMetaphor, setSelectedMetaphor] = useState<RecMetaphorItem | null>(null);
  
  // 🌟 保留自訂修改功能
  const [isEditing, setIsEditing] = useState(false);
  const [customDesc, setCustomDesc] = useState("");

  useEffect(() => {
    if (!visualResult && !isLoading) onGenerateOptions();
  }, [visualResult, isLoading, onGenerateOptions]);

  useEffect(() => {
    if (!visualResult) return;
    try {
      const cleanJson = visualResult.replace(/```json/g, '').replace(/```/g, '');
      const parsed = JSON.parse(cleanJson);
      
      // 🌟 [修復對齊]：正確抓取 AI 推薦的隱喻
      const recommendations = parsed.recommendations || [];
      setData({ ...parsed, recommendations });

      if (recommendations.length > 0 && !selectedMetaphor) {
        setSelectedMetaphor(recommendations[0].metaphor);
        const matchedStyle = ALL_STYLE_OPTIONS.find(s => s.code === recommendations[0].style.code);
        if (matchedStyle) {
            setSelectedStyle(matchedStyle);
            setCustomDesc(matchedStyle.reason);
        }
      }
    } catch (e) { console.error("Parse Error", e); }
  }, [visualResult]);

  const handleConfirm = () => {
    if (selectedStyle && selectedMetaphor) {
      // 合併手寫修改後的描述
      const finalStyle = { ...selectedStyle, reason: isEditing ? customDesc : selectedStyle.reason };
      onConfirmVisuals(finalStyle, selectedMetaphor);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-8 pb-32 animate-in fade-in duration-500">
      <div className="px-2">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <Palette className="text-indigo-600" size={32} /> 形式與風格 (Flexible Skin)
        </h2>
        <p className="text-slate-500 font-medium mt-1 text-sm">您可以從風格庫挑選，或進一步微調描述。風格與隱喻是獨立決定的。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-2">
        {/* 🌟 左側：風格選擇 (下拉 + 自訂) */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-black shadow-sm">1</div>
            <h3 className="text-xl font-black text-slate-700">選擇並微調風格</h3>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">系統風格庫 (A-Y)</label>
              <select 
                className="w-full bg-white border-2 border-slate-200 rounded-2xl px-6 py-4 appearance-none font-bold text-slate-700 focus:border-indigo-500 transition-all outline-none cursor-pointer shadow-sm"
                value={selectedStyle.code}
                onChange={(e) => {
                  const style = ALL_STYLE_OPTIONS.find(s => s.code === e.target.value);
                  if (style) {
                      setSelectedStyle(style);
                      setCustomDesc(style.reason);
                  }
                }}
              >
                {ALL_STYLE_OPTIONS.map(s => <option key={s.code} value={s.code}>風格 {s.code}：{s.name}</option>)}
              </select>
              <ChevronDown className="absolute right-5 top-[2.4rem] text-slate-400 pointer-events-none" size={20} />
            </div>

            {/* 編輯區域 */}
            <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-indigo-600 flex items-center gap-2"><Edit3 size={14}/> 渲染參數微調 (Image Prompt)</span>
                <button 
                  onClick={() => setIsEditing(!isEditing)} 
                  className={`text-[10px] font-black px-3 py-1 rounded-full transition-all ${isEditing ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}
                >
                  {isEditing ? '鎖定描述' : '開啟編輯'}
                </button>
              </div>
              {isEditing ? (
                <textarea 
                  className="w-full h-32 bg-white border-2 border-indigo-200 rounded-xl p-4 text-sm font-mono text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10"
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                />
              ) : (
                <div className="text-sm text-slate-500 italic leading-relaxed px-2">"{customDesc}"</div>
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

          <div className="grid grid-cols-1 gap-4">
            {data?.recommendations?.map((rec: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedMetaphor(rec.metaphor)}
                className={`p-5 rounded-[2rem] border-2 transition-all text-left flex items-start gap-4 ${
                  selectedMetaphor?.code === rec.metaphor.code ? 'bg-emerald-50 border-emerald-500 shadow-lg' : 'bg-white border-slate-100 hover:border-emerald-200 shadow-sm'
                }`}
              >
                <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedMetaphor?.code === rec.metaphor.code ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>
                  {selectedMetaphor?.code === rec.metaphor.code && <Check size={14} strokeWidth={4} />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{rec.metaphor.code}</span>
                    <h5 className="font-black text-slate-800">{rec.metaphor.name}</h5>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{rec.metaphor.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 底部按鈕 */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-200 flex justify-center gap-4 z-50">
        <button onClick={onBack} className="px-8 py-4 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition-all border border-slate-200">返回</button>
        <button onClick={handleConfirm} disabled={isLoading} className="flex-1 max-w-xl py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
          {isLoading ? <Sparkles className="animate-spin" /> : <ArrowRight />} 確認並進入選角
        </button>
      </div>
    </div>
  );
};

export default Step3Visuals;