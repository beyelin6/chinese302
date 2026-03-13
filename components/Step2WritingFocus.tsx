import React from 'react';
import { PenTool, AlertCircle } from 'lucide-react';
import { VocabularyItem } from '../types';

interface Step2WritingFocusProps {
  vocabulary: VocabularyItem[];
}

export const Step2WritingFocus: React.FC<Step2WritingFocusProps> = ({ vocabulary }) => {
  const focusedItems = vocabulary.filter(item => item.isFocused);
  if (focusedItems.length === 0) return null;

  return (
    <div className="my-8 space-y-4 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-2 text-orange-600 font-black px-2">
        <PenTool size={20} />
        <h3>生字寫法特寫（教學重點）</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {focusedItems.map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border-2 border-orange-200 shadow-xl flex items-center gap-6">
            {/* 巨大展示字 */}
            <div className="w-24 h-24 bg-orange-50 rounded-2xl border-4 border-orange-400 flex items-center justify-center text-6xl font-black text-slate-800">
              {item.word}
            </div>
            {/* 提醒文字 */}
            <div className="flex-1">
              <div className="flex items-center gap-2 text-orange-700 font-bold mb-1">
                <AlertCircle size={16} />
                <span>{item.radical}部 寫法注意</span>
              </div>
              <p className="text-lg font-black text-slate-700 leading-snug">
                {item.writingTips || "請參考課本正確筆順"}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="h-px bg-slate-100 mt-8" /> {/* 分隔線 */}
    </div>
  );
};
