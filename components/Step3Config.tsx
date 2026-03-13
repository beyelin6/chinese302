import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ChevronRight, FileCode } from 'lucide-react';

interface Step3ConfigProps {
  config: string;
  onConfirm: () => void;
  isLoading: boolean;
}

const Step3Config: React.FC<Step3ConfigProps> = ({ config, onConfirm, isLoading }) => {
  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
       <h2 className="text-xl font-bold text-white flex items-center">
        <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">3</span>
        戰略契約 (Config)
      </h2>
      <p className="text-slate-400 text-sm">
        系統已生成 YAML 設定檔，包含視覺識別 (Visual DNA) 與播放清單。請確認無誤後開始生產。
      </p>

      <div className="bg-slate-950 p-0 rounded-xl border border-slate-800 flex flex-col flex-1 overflow-hidden relative">
        <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
           <span className="text-xs text-slate-400 font-mono flex items-center">
             <FileCode size={14} className="mr-2" />
             config.yaml
           </span>
        </div>
        <div className="p-4 overflow-y-auto font-mono text-sm text-emerald-300 custom-scrollbar flex-1 whitespace-pre-wrap">
             <ReactMarkdown>{config}</ReactMarkdown>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={`flex items-center px-6 py-3 rounded-lg font-bold transition-all transform ${
             isLoading
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-105 shadow-lg shadow-indigo-900/50'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center">
               <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              生產六大模組中...
            </span>
          ) : (
            <>
              確認並生產 (Big 6)
              <ChevronRight className="ml-2" size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Step3Config;
