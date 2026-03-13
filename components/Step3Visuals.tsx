// 檔案路徑: src/components/Step3Visuals.tsx

import React, { useState, useEffect } from 'react';
import { Palette, Box, Check, AlertCircle, ArrowRight, Info, ArrowLeft, Sparkles, Layout, ChevronDown } from 'lucide-react';
import { VisualData, RecStyleItem, RecMetaphorItem } from '../types';

// 🌟 [對齊 SSOT] 全量視覺風格 A-M (手動鎖定，不受 AI 幻覺影響)
const ALL_STYLE_OPTIONS: RecStyleItem[] = [
  { code: 'A', name: '溫暖吉卜力', reason: 'Studio Ghibli style, hand-painted anime art, Hayao Miyazaki aesthetic.' },
  { code: 'B', name: '現代扁平', reason: 'Modern Flat Design, vector art, clean geometric shapes, minimalist.' },
  { code: 'C', name: '清新水彩', reason: 'Soft watercolor painting, paper texture, dreamy atmosphere.' },
  { code: 'D', name: '精緻剪紙', reason: 'Layered paper cut art, depth of field, craft aesthetic.' },
  { code: 'E', name: '新海誠光影', reason: 'Makoto Shinkai style, hyper-realistic sky, cinematic anime.' },
  { code: 'F', name: '新國風水墨', reason: 'Traditional Chinese Ink wash, Zen minimalism, elegant calligraphy.' },
  { code: 'G', name: '3D 軟陶', reason: '3D Claymorphism, rounded edges, soft matte finish, cute.' },
  { code: 'H', name: '像素積木', reason: 'Voxel art, 3D pixel blocks, LEGO-like aesthetic, digital construction.' },
  { code: 'I', name: '塗鴉手帳', reason: 'Hand-drawn doodle, ballpoint pen lines, bullet journal aesthetic.' },
  { code: 'J', name: '奇幻繪本', reason: 'Vintage storybook collage, whimsical fantasy, saturated colors.' },
  { code: 'K', name: '療癒色鉛筆', reason: 'Colored pencil, waxy texture, soft warm tones, innocence.' },
  { code: 'L', name: '幾何資訊圖', reason: 'Isometric infographic, clean blocks, logical structure.' },
  { code: 'M', name: '復古浮世繪', reason: 'Ukiyo-e woodblock print, bold outlines, traditional Japanese art.' }
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
  const [selectedStyle, setSelectedStyle] = useState<RecStyleItem>(ALL_STYLE_OPTIONS[0]); // 預設 A
  const [selectedMetaphor, setSelectedMetaphor] = useState<RecMetaphorItem | null>(null);

  useEffect(() => {
    if (!visualResult && !isLoading) onGenerateOptions();
  }, [visualResult, isLoading, onGenerateOptions]);

  useEffect(() => {
    if (!visualResult) return;
    try {
      // 🌟 [修復關鍵]：統一處理 Markdown 標籤並對齊 recommendations 欄位
      const cleanJson = visualResult.replace(/```json/g, '').replace(/```/g, '');
      const parsed = JSON.parse(cleanJson);
      
      // 抓取 AI 推薦的隱喻 (對齊 constants.ts 的 recommendations 欄位)
      const recommendations = parsed.recommendations || [];
      setData({ ...parsed, recommendations });

      // 自動預設選擇第一個推薦的隱喻
      if (recommendations.length > 0 && !selectedMetaphor) {
        setSelectedMetaphor(recommendations[0].metaphor);
        // 如果 AI 有推薦風格，也同步更新下拉選單的預設值
        const matchedStyle = ALL_STYLE_OPTIONS.find(s => s.code === recommendations[0].style.code);
        if (matchedStyle) setSelectedStyle(matchedStyle);
      }
    } catch (e) {
      console.error("JSON Parse Error", e);
    }
  }, [visualResult]);

  const handleConfirm = () => {
    if (selectedStyle && selectedMetaphor) {
      onConfirmVisuals(selectedStyle, selectedMetaphor);
    }
  };

  if (!data && isLoading) return <div className="p-20 text-center animate-pulse font-black text-slate-400">正在運算視覺隱喻...</div>;

  return (
    <div className="flex flex-col h-full space-y-8 pb-28 animate-in fade-in duration-500">
      {/* Header */}
      <div className="px-2">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <Palette className="text-indigo-600" size={32} /> 形式與風格
        </h2>
        <p className="text-slate-500 font-medium mt-1 text-sm">決定投影片的「物理屬性」，選擇最適合的視覺外衣與結構骨架。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-2">
        {/* 左側：風格下拉選單 */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-black">1</div>
            <h3 className="text-xl font-black text-slate-700">選擇視覺風格</h3>
          </div>

          <div className="relative group">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">系統風格庫 (A-M)</label>
            <div className="relative">
              <select 
                className="w-full bg-white border-2 border-slate-200 rounded-2xl px-6 py-4 appearance-none font-bold text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none cursor-pointer shadow-sm"
                value={selectedStyle.code}
                onChange={(e) => {
                  const style = ALL_STYLE_OPTIONS.find(s => s.code === e.target.value);
                  if (style) setSelectedStyle(style);
                }}
              >
                {ALL_STYLE_OPTIONS.map(s => (
                  <option key={s.code} value={s.code}>風格 {s.code}：{s.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
            </div>
          </div>

          {/* 風格預覽細節 */}
          <div className="p-6 bg-white border-2 border-indigo-100 rounded-[2rem] shadow-xl shadow-indigo-50">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-indigo-500" size={18} />
              <span className="text-sm font-black text-indigo-800">渲染參數 (Image Prompt)</span>
            </div>
            <p className="text-slate-600 text-sm italic leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              "{selectedStyle.reason}"
            </p>
          </div>
        </div>

        {/* 右側：推薦結構隱喻 (P3 結構視圖) */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-black">2</div>
            <h3 className="text-xl font-black text-slate-700">P3 結構視圖推薦</h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {data?.recommendations?.map((rec: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedMetaphor(rec.metaphor)}
                className={`p-5 rounded-[2rem] border-2 transition-all text-left flex items-start gap-4 ${
                  selectedMetaphor?.code === rec.metaphor.code
                    ? 'bg-emerald-50 border-emerald-500 shadow-lg'
                    : 'bg-white border-slate-100 hover:border-emerald-200 shadow-sm'
                }`}
              >
                <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  selectedMetaphor?.code === rec.metaphor.code ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'
                }`}>
                  {selectedMetaphor?.code === rec.metaphor.code && <Check size={14} strokeWidth={4} />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{rec.metaphor.code}</span>
                    <h5 className="font-black text-slate-800">{rec.metaphor.name}</h5>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{rec.metaphor.description}</p>
                </div>
              </button>
            ))}
            {(!data?.recommendations || data.recommendations.length === 0) && (
              <div className="p-10 border-2 border-dashed border-slate-200 rounded-[2rem] text-center text-slate-400 font-bold">
                暫無推薦隱喻，請嘗試點擊重新思考
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 底部導覽列 */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-200 flex justify-center gap-4 z-50 shadow-2xl">
        <button onClick={onBack} className="px-8 py-4 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition-all border border-slate-200">
          返回上一步
        </button>
        <button
          onClick={handleConfirm}
          disabled={!selectedStyle || !selectedMetaphor || isLoading}
          className="flex-1 max-w-xl py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 tracking-widest"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
          確認風格並進入選角
        </button>
      </div>
    </div>
  );
};

export default Step3Visuals;