import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Layers, FileText, CheckSquare, BookOpen, Database, Download } from 'lucide-react';

interface Step4OutputProps {
  output: string;
}

const Step4Output: React.FC<Step4OutputProps> = ({ output }) => {
  const [activeTab, setActiveTab] = useState<'script' | 'worksheet' | 'assessment' | 'kb'>('script');

  // Simple heuristic to split output if possible, otherwise show full log
  // Since the output is a continuous stream, we will display it in a raw viewer but with good typography
  
  return (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center">
          <span className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">4</span>
          六大模組產出 (Big 6 Production)
        </h2>
        <button className="flex items-center text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded transition-colors border border-slate-700">
          <Download size={14} className="mr-2" />
          匯出全部
        </button>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700 flex-1 flex flex-col overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-900/50">
          <button
            onClick={() => setActiveTab('script')}
            className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'script' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-900/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers size={16} className="mr-2" />
            投影片腳本
          </button>
          <button
             onClick={() => setActiveTab('worksheet')}
             className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'worksheet' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-900/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileText size={16} className="mr-2" />
            學習單與複習
          </button>
           <button
             onClick={() => setActiveTab('assessment')}
             className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'assessment' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-900/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <CheckSquare size={16} className="mr-2" />
            評量與詳解
          </button>
           <button
             onClick={() => setActiveTab('kb')}
             className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'kb' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-900/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Database size={16} className="mr-2" />
            知識庫
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-950">
           <div className="prose prose-invert prose-emerald max-w-none">
             {/* 
                In a real scenario, we would parse `output` into sections. 
                For this prototype, we assume the output comes as one big markdown block, 
                and we simply display it. The tabs above are simulated for UI fidelity.
             */}
             <div className="p-4 bg-slate-900 rounded border border-slate-800 mb-4 text-xs font-mono text-slate-500">
                [系統訊息]: 以下為完整產出內容。上方分頁標籤僅為模擬顯示。
             </div>
             <ReactMarkdown 
              components={{
                code(props) {
                  const {children, className, node, ...rest} = props
                  return (
                    <code className="bg-slate-800 text-orange-300 px-1 py-0.5 rounded text-sm font-mono border border-slate-700" {...rest}>
                      {children}
                    </code>
                  )
                },
                pre(props) {
                   return <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto border border-slate-800 my-4" {...props} />
                }
              }}
             >
              {output}
             </ReactMarkdown>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Step4Output;