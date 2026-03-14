// 檔案路徑: src/components/Step5Output.tsx

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Layout, FileText, Check, Download, ArrowLeft, Loader2, Sparkles, BookOpen, Database, AlertCircle } from 'lucide-react';
import { useWorkflowContext } from '../context/WorkflowContext';

interface Step5OutputProps {
  outputScript: string | null;
  outputWorksheet: string | null;
  outputAssessment: string | null;
  outputKb: string | null;
  outputNotebookLMGuide: string | null;
  outputGamifiedQuiz: string | null;
  analysisData: any;
  onScriptPipeline: () => void;
  onManualModule: (key: string) => void;
  isLoading: boolean;
  onBack: () => void;
}

const Step5Output: React.FC<Step5OutputProps> = ({ 
  outputScript, outputWorksheet, outputAssessment, outputKb, 
  outputNotebookLMGuide, outputGamifiedQuiz, onScriptPipeline, 
  onManualModule, isLoading, onBack 
}) => {
  const { state } = useWorkflowContext();
  const [activeTab, setActiveTab] = useState('script');

  // 🌟 將 JSON 轉換為 Markdown 的函數
  const generateNotebookLMScript = (slidesData: any[]) => {
    let styleCode = 'A';
    let protagonist = '標準主角';
    let guideDNA = '標準導師';
    try {
      const visual = state.visualResult ? JSON.parse(state.visualResult as string) : null;
      const casting = state.castingResult ? JSON.parse(state.castingResult as string) : null;
      styleCode = visual?.style?.code || 'A';
      protagonist = casting?.protagonist?.name || '主角';
      guideDNA = casting?.guide?.visualDNA || '無設定';
    } catch(e) {}

    let md = `# V-MAX 教學腳本 (NotebookLM 驅動版)\n\n`;
    md += `### 🧠 VMAX_STRUCTURE_YAML\n\`\`\`yaml\nglobal_visual_protocol:\n  artistic_consistency: "Inherit Style [${styleCode}]"\nvisual_dna_anchor:\n  protagonist: "${protagonist}"\n  guide: "${guideDNA}"\n\`\`\`\n\n`;
    
    slidesData.forEach((slide, idx) => {
      md += `## [P${idx + 1}] ${slide.type || '投影片'}\n`;
      md += `* **【顯示文字】**：\n${slide.displayText || '---'}\n\n`;
      md += `* **【引導語/腳本】**：\n> ${slide.guideTalk || '---'}\n\n`;
      md += `=========================================\n\n`;
    });
    return md;
  };

  // 🛡️ [醫療級防護] 安全解析腳本資料，防止畫面崩潰
  let scriptContent = '';
  if (outputScript) {
    try {
      let cleanJson = outputScript;
      if (cleanJson.includes('```json')) cleanJson = cleanJson.replace(/```json/gi, '').replace(/```/g, '');
      else if (cleanJson.includes('```')) cleanJson = cleanJson.replace(/```/g, '');
      
      const parsed = JSON.parse(cleanJson);
      // 聰明抓取陣列 (有些 AI 會包在 { slides: [...] } 或 { data: [...] } 裡面)
      const parsedSlides = Array.isArray(parsed) ? parsed : (parsed.slides || parsed.data || Object.values(parsed)[0]);
      
      if (Array.isArray(parsedSlides) && parsedSlides.length > 0) {
          scriptContent = generateNotebookLMScript(parsedSlides);
      } else {
          scriptContent = outputScript; // 若找不到陣列，直接顯示原始文字
      }
    } catch (e) {
      console.error("腳本 JSON 解析失敗，降級為原始文字", e);
      scriptContent = outputScript; 
    }
  }

  // 動態取得當前要顯示的內容
  const getCurrentContent = () => {
    switch(activeTab) {
      case 'script': return scriptContent;
      case 'worksheet': return outputWorksheet;
      case 'assessment': return outputAssessment;
      case 'kb': return outputKb;
      case 'notebooklm': return outputNotebookLMGuide;
      case 'quiz': return outputGamifiedQuiz;
      default: return '';
    }
  };

  const currentContent = getCurrentContent();

  const handleDownloadTXT = () => {
    if (!currentContent) return;
    const blob = new Blob(['\ufeff', currentContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VMAX_Output_${activeTab.toUpperCase()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const modules = [
    { id: 'script', title: '教學腳本', icon: Layout, data: outputScript, action: onScriptPipeline, styles: { bg: 'bg-indigo-100', text: 'text-indigo-600', btn: 'bg-indigo-600', hover: 'hover:bg-indigo-700' } },
    { id: 'worksheet', title: '學習單', icon: FileText, data: outputWorksheet, action: () => onManualModule('worksheet'), styles: { bg: 'bg-emerald-100', text: 'text-emerald-600', btn: 'bg-emerald-600', hover: 'hover:bg-emerald-700' } },
    { id: 'assessment', title: '評量卷', icon: Check, data: outputAssessment, action: () => onManualModule('assessment'), styles: { bg: 'bg-blue-100', text: 'text-blue-600', btn: 'bg-blue-600', hover: 'hover:bg-blue-700' } },
    { id: 'kb', title: '知識庫', icon: Database, data: outputKb, action: () => onManualModule('kb'), styles: { bg: 'bg-purple-100', text: 'text-purple-600', btn: 'bg-purple-600', hover: 'hover:bg-purple-700' } },
    { id: 'notebooklm', title: 'NotebookLM 指引', icon: BookOpen, data: outputNotebookLMGuide, action: () => onManualModule('notebooklm'), styles: { bg: 'bg-amber-100', text: 'text-amber-600', btn: 'bg-amber-600', hover: 'hover:bg-amber-700' } },
    { id: 'quiz', title: '遊戲化測驗', icon: Sparkles, data: outputGamifiedQuiz, action: () => onManualModule('quiz'), styles: { bg: 'bg-rose-100', text: 'text-rose-600', btn: 'bg-rose-600', hover: 'hover:bg-rose-700' } },
  ];

  return (
    <div className="flex flex-col h-full space-y-6 pb-24 animate-in fade-in duration-500">
      <div className="px-2 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Layout className="text-indigo-600" size={32} /> 六大模組產出
          </h2>
          <p className="text-slate-500 font-medium mt-1">點擊卡片可切換預覽畫面，點擊下方按鈕即可觸發 AI 原子級生成。</p>
        </div>
      </div>

      {/* 🚨 [新增] 錯誤警報器：如果 AI 當機或 API 錯誤，這裡會顯示紅字 */}
      {state.error && (
        <div className="mx-2 p-4 bg-red-100 border-2 border-red-300 rounded-2xl flex items-start gap-3 shadow-sm">
          <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-black text-red-800">產出過程發生錯誤</h4>
            <p className="text-red-700 text-sm font-medium">{state.error}</p>
          </div>
        </div>
      )}

      {/* 🚀 模組卡片區 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 px-2">
        {modules.map((mod) => {
          const isActive = activeTab === mod.id;
          const hasData = !!mod.data;
          
          return (
            <div 
              key={mod.id} 
              onClick={() => setActiveTab(mod.id)}
              className={`p-6 bg-white border-2 rounded-[2rem] transition-all cursor-pointer ${
                isActive ? 'border-indigo-400 shadow-xl shadow-indigo-100' : 
                hasData ? 'border-emerald-200 hover:border-emerald-400 shadow-sm' : 'border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-2xl ${hasData ? 'bg-emerald-100 text-emerald-600' : `${mod.styles.bg} ${mod.styles.text}`}`}>
                  <mod.icon size={24} />
                </div>
                <h3 className="font-black text-lg text-slate-800">{mod.title}</h3>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveTab(mod.id); mod.action(); }}
                disabled={isLoading}
                className={`w-full py-3 rounded-xl font-black text-sm flex justify-center items-center gap-2 transition-all ${
                  hasData 
                    ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' 
                    : `${mod.styles.btn} text-white shadow-lg hover:scale-[1.02] active:scale-95 ${mod.styles.hover}`
                } disabled:opacity-50`}
              >
                {isLoading && isActive ? <Loader2 className="animate-spin" size={18} /> : (hasData ? '重新生成' : <><Sparkles size={18}/> 立即產出</>)}
              </button>
            </div>
          )
        })}
      </div>

      {/* 📝 產出預覽區 */}
      <div className="flex-1 bg-slate-900 rounded-[2rem] border border-slate-800 flex flex-col overflow-hidden mx-2 shadow-2xl mt-4 min-h-[500px]">
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <span className="text-emerald-400 font-black flex items-center gap-2">
            {currentContent ? <><Check size={18}/> 產出成功</> : <><Loader2 size={18}/> 尚未產出</>}
            <span className="text-slate-500 text-sm ml-2">| 目前檢視：{modules.find(m => m.id === activeTab)?.title}</span>
          </span>
          
          <button 
            onClick={handleDownloadTXT} 
            disabled={!currentContent}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-4 py-2 rounded-xl font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} /> 下載 TXT
          </button>
        </div>
        
        {/* 🛡️ [醫療級防護] 確保即使資料壞掉，依然能印出原始碼 */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 prose prose-invert prose-emerald max-w-none">
          {currentContent ? (
            currentContent.trim().startsWith('{') || currentContent.trim().startsWith('[') ? (
              <pre className="text-emerald-300 text-xs whitespace-pre-wrap font-mono bg-slate-800 p-4 rounded-xl border border-slate-700">
                {currentContent}
              </pre>
            ) : (
              <ReactMarkdown>{currentContent}</ReactMarkdown>
            )
          ) : (
            <div className="flex items-center justify-center h-full text-slate-600 font-bold">
              請點擊上方的「立即產出」按鈕，AI 會自動為您生成對應的內容。
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-200 flex justify-center z-50">
        <button onClick={onBack} disabled={isLoading} className="px-8 py-4 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition-all border border-slate-200 flex items-center gap-2">
          <ArrowLeft size={20} /> 返回修改設定
        </button>
      </div>
    </div>
  );
};

export default Step5Output;
