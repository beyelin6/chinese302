// 檔案路徑: src/components/Step1Input.tsx

import React, { useState, useRef, useMemo } from 'react';
import { Upload, Image as ImageIcon, FileType, X, Loader2, CheckCircle2 } from 'lucide-react';
import { MediaData } from '../types';
import { useWorkflowContext } from '../context/WorkflowContext';
import mammoth from 'mammoth';

interface Step1InputProps {
  onAnalyze: (text: string, media: MediaData[]) => void;
  isLoading: boolean; // 來自 WorkflowContext 的 AI 載入狀態
}

const Step1Input: React.FC<Step1InputProps> = ({ onAnalyze, isLoading }) => {
  const { dispatch } = useWorkflowContext();
  const [text, setText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<MediaData[]>([]);
  const [readingProgress, setReadingProgress] = useState<number>(0); 
  const [isReading, setIsReading] = useState(false); // 本地檔案讀取狀態
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🛡️ [安全檢查] 雙重鎖定：讀取中或分析中皆不可再次點擊
  const isReady = useMemo(() => {
    const hasContent = text.trim().length > 0 || selectedFiles.length > 0;
    return hasContent && !isLoading && !isReading;
  }, [text, selectedFiles, isLoading, isReading]);

  const handleImportSnapshot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        dispatch({ type: 'IMPORT_SNAPSHOT', payload: json });
        alert("專案快照匯入成功！已恢復先前進度。");
      } catch (err) {
        alert("匯入失敗：檔案格式不正確。");
      }
    };
    reader.readAsText(file);
  };

  // 🌟 [新增] 策略一：純文字檔本地瞬間攔截器
  const handleTxtImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 確認是純文字檔 (.txt, .md, .markdown)
    if (file.type === "text/plain" || file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.markdown')) {
      setIsReading(true);
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const content = event.target?.result as string;
        // 將讀取到的純文字，直接塞進 textarea 中（若原本有字則換行附加）
        setText(prev => prev ? prev + "\n\n" + content : content);
        setIsReading(false);
        // 清空 input value，允許重複上傳同一個檔案
        e.target.value = ''; 
      };
      
      reader.onerror = () => {
        alert("純文字檔讀取失敗！");
        setIsReading(false);
      };
      
      // 以純文字模式讀取檔案 (瞬間完成)
      reader.readAsText(file);
    } else {
      // 若不是 .txt，則走原本的多媒體檔案上傳邏輯 (存入 selectedFiles)
      setSelectedFiles(prev => [...prev, {
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        data: '', // 這裡原本有 base64 轉換邏輯，可維持您原本的寫法
        // url: URL.createObjectURL(file) // MediaData 不支援 url，故註解掉
      }]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsReading(true);
    setReadingProgress(0);
    
    const fileList = Array.from(files);
    const totalFiles = fileList.length;
    let processedCount = 0;

    const readFile = (file: File): Promise<void> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        
        // 🌟 [UX 優化] 實時計算讀取進度
        reader.onprogress = (event) => {
          if (event.lengthComputable) {
            const fileProgress = (event.loaded / event.total) * 100;
            const overallProgress = ((processedCount / totalFiles) * 100) + (fileProgress / totalFiles);
            setReadingProgress(Math.round(overallProgress));
          }
        };

        reader.onload = async (event) => {
          const content = event.target?.result;
          
          // 根據 MIME Type 分流
          if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
             // 處理 Word (.docx)
             try {
                const arrayBuffer = content as ArrayBuffer;
                const result = await mammoth.extractRawText({ arrayBuffer });
                const extractedText = result.value;
                setText(prev => prev + (prev ? "\n\n" : "") + `[FILE: ${file.name}]\n${extractedText}`);
             } catch (err) {
                console.error("Word file parsing error:", err);
                alert(`無法讀取 Word 檔案: ${file.name}`);
             }
          } else if (file.type.startsWith('image/') || file.type === 'application/pdf') {
            // 圖片/PDF 轉 Base64
            const base64Data = (content as string).split(',')[1];
            setSelectedFiles(prev => [...prev, { 
              mimeType: file.type, 
              data: base64Data, 
              name: file.name 
            }]);
          } else {
            // 純文字直接提取
            setText(prev => prev + (prev ? "\n\n" : "") + (content as string));
          }
          
          processedCount++;
          setReadingProgress(Math.round((processedCount / totalFiles) * 100));
          resolve();
        };
        
        if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
            reader.readAsArrayBuffer(file);
        } else if (file.type.startsWith('image/') || file.type === 'application/pdf') {
            reader.readAsDataURL(file);
        } else {
            reader.readAsText(file);
        }
      });
    };

    // 依序處理檔案，防止大量 Base64 轉換造成記憶體壓力
    for (const file of fileList) {
      await readFile(file);
    }

    setTimeout(() => {
      setIsReading(false);
      setReadingProgress(0);
    }, 500); // 視覺過渡延遲
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* 檔案上傳熱區 */}
      <div 
        onClick={() => !isReading && !isLoading && fileInputRef.current?.click()}
        className={`relative group border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${
          isReading ? 'border-teal-400 bg-teal-50/50' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/30'
        } ${(isReading || isLoading) ? 'cursor-not-allowed opacity-80' : ''}`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          multiple 
          hidden 
          accept="image/*,.pdf,.txt,.md,.docx"
        />
        
        {isReading ? (
          <div className="flex flex-col items-center gap-3 w-full max-w-xs">
            <Loader2 className="animate-spin text-teal-500" size={40} />
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                    className="bg-teal-500 h-full transition-all duration-300" 
                    style={{ width: `${readingProgress}%` }}
                />
            </div>
            <span className="text-sm font-bold text-teal-600 tracking-tight">正在處理本地檔案 ({readingProgress}%)</span>
          </div>
        ) : (
          <>
            <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
              <Upload className="text-blue-500" size={32} />
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-800">點擊或拖拽課文圖檔/PDF/Word</p>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-mono">JPG, PNG, PDF, DOCX, TXT</p>
            </div>
          </>
        )}
      </div>

      {/* 文本輸入區 */}
      <div className="flex flex-col gap-2">
        {/* 🌟 [新增] 策略一 UI：極速純文字匯入區 */}
        <label className="flex items-center gap-3 p-4 bg-emerald-50 border-2 border-dashed border-emerald-200 hover:border-emerald-400 rounded-2xl cursor-pointer transition-all mb-4">
          <FileType className="text-emerald-500" size={24} />
          <div>
            <p className="text-sm font-bold text-emerald-800">極速匯入教材文字檔</p>
            <p className="text-[10px] text-emerald-600">本地讀取，不消耗 API 額度</p>
          </div>
          <input type="file" className="hidden" accept=".txt,.md,.markdown" onChange={handleTxtImport} />
        </label>

        <label className="text-xs font-bold text-slate-600 uppercase tracking-widest px-1">直接輸入或貼上課文</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="在此處貼上課文內容..."
          className="w-full h-48 p-4 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none transition-all resize-none text-slate-900 leading-relaxed placeholder:text-slate-400"
        />
      </div>

      {/* 檔案預覽清單 */}
      {selectedFiles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {selectedFiles.map((file, idx) => (
            <div key={idx} className="relative group bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                {file.mimeType.includes('image') ? <ImageIcon size={18} /> : <FileType size={18} />}
              </div>
              <span className="text-[10px] font-medium text-slate-700 truncate flex-1">{file.name || '已載入媒體'}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 核心執行按鈕 */}
      <button
        onClick={() => onAnalyze(text, selectedFiles)}
        disabled={!isReady}
        className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-lg transition-all transform ${
          !isReady
            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white hover:scale-[1.01] shadow-xl hover:shadow-blue-200 active:scale-95'
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={24} />
            <span>神經網路運算中...</span>
          </>
        ) : (
          <>
            <CheckCircle2 size={24} />
            <span>開始解構文本 (STEP 1)</span>
          </>
        )}
      </button>

      {/* 匯入舊專案 */}
      <div className="mt-4 p-4 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center">
        <p className="text-xs text-slate-500 mb-2">已有儲存的專案？</p>
        <input type="file" id="import-vmax" accept=".json" onChange={handleImportSnapshot} className="hidden" />
        <label htmlFor="import-vmax" className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all">
          匯入專案快照 (.json)
        </label>
      </div>
    </div>
  );
};

export default Step1Input;