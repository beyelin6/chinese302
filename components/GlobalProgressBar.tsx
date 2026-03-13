// 檔案路徑: src/components/GlobalProgressBar.tsx

import React, { useEffect, useState } from 'react';

interface GlobalProgressBarProps {
  isLoading: boolean;
  statusText?: string;
}

export default function GlobalProgressBar({ isLoading, statusText = "AI 核心運算中..." }: GlobalProgressBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLoading) {
      setProgress(0);
      // 智慧型偽進度邏輯：前段快、中段慢、後段極慢 (卡在 85~90% 等待 API 回應)
      interval = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress < 30) return oldProgress + 8; // 快速衝刺到 30%
          if (oldProgress < 60) return oldProgress + 3; // 中速到 60%
          if (oldProgress < 85) return oldProgress + 0.5; // 慢速到 85%
          if (oldProgress < 95) return oldProgress + 0.1; // 極慢速逼近 95%
          return oldProgress; // 停在 95% 等待 isLoading 變成 false
        });
      }, 300);
    } else {
      // 當 API 回應 (isLoading 變為 false) 時，瞬間填滿到 100%
      setProgress(100);
      
      // 延遲 500 毫秒後將進度條歸零並隱藏，讓使用者能看到 100% 的瞬間
      const timeout = setTimeout(() => {
        setProgress(0);
      }, 500);
      return () => clearTimeout(timeout);
    }

    return () => clearInterval(interval);
  }, [isLoading]);

  // 如果沒有在載入，且進度已經歸零，則不渲染任何東西
  if (!isLoading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex flex-col items-center pointer-events-none">
      
      {/* 頂部進度條本體 */}
      <div className="h-1.5 w-full bg-slate-100/20 overflow-hidden shadow-sm">
        <div 
          className="h-full bg-teal-500 transition-all ease-out"
          style={{ 
            width: `${progress}%`,
            transitionDuration: isLoading ? '300ms' : '150ms' // 成功時加速填滿
          }}
        />
      </div>

      {/* 懸浮狀態提示藥丸 (Pill) */}
      <div 
        className={`mt-4 px-5 py-2.5 bg-slate-800/95 backdrop-blur-sm text-white text-sm font-medium rounded-full shadow-2xl flex items-center gap-3 transition-all duration-300 ${
            isLoading ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <svg className="animate-spin h-4 w-4 text-teal-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="tracking-wide">{statusText}</span>
        <span className="text-teal-400 font-mono w-8 text-right">{Math.floor(progress)}%</span>
      </div>
      
    </div>
  );
}
