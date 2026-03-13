// 檔案路徑: src/components/Step5Output.tsx

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Layout, FileText, CheckSquare, Database, Terminal, 
  Gamepad2, Sparkles, Copy, Check, 
  AlertCircle, Download, Play, ArrowLeft, Loader2, Trash2, Plus, UserCircle2 
} from 'lucide-react';
import { AnalysisData } from '../types';
import { VMAX_KERNEL_VERSION } from '../constants';
import { useWorkflowContext } from '../context/WorkflowContext';
import { downloadProjectJson } from '../utils';

interface SlideData {
  id: string;
  type: string;
  cameraAngle: string;
  visualPrompt: string;
  displayText: string;
  guideTalk: string;
}

interface Step5OutputProps {
  outputScript: string | null;
  outputWorksheet: string | null;
  outputAssessment: string | null;
  outputKb: string | null;
  outputNotebookLMGuide: string | null; 
  outputGamifiedQuiz: string | null;
  analysisData: AnalysisData | null;
  onScriptPipeline: () => void;
  onManualModule: (key: string) => void;
  isLoading: boolean;
  onBack: () => void;
}

const Step5Output: React.FC<Step5OutputProps> = (props) => {
  const { state } = useWorkflowContext();
  const { 
    outputScript, outputNotebookLMGuide, outputWorksheet, 
    outputAssessment, outputKb, outputGamifiedQuiz, 
    onScriptPipeline, onManualModule, isLoading, onBack 
  } = props;
  
  const [isStarted, setIsStarted] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('script');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 🌟 [遺漏修補 1]：動態讀取 Step 4 選定的導師姓名
  const [guideName, setGuideName] = useState(() => {
    if (state.castingResult) {
      try {
        const casting = typeof state.castingResult === 'string' ? JSON.parse(state.castingResult) : state.castingResult;
        return casting.guide?.name || '林老師';
      } catch(e) {}
    }
    return '林老師';
  });

  const [slides, setSlides] = useState<SlideData[]>([]);

  useEffect(() => {
    if (outputScript) {
      try {
        const parsed = JSON.parse(outputScript);
        const finalSlides = parsed.slides || (Array.isArray(parsed) ? parsed : []);
        if (finalSlides.length > 0) {
          setSlides(finalSlides);
          setIsStarted(true);
        }
      } catch (e) {
        console.warn("純文字腳本偵測，改用預覽模式");
      }
    }
  }, [outputScript]);

  // --- 工具函數 ---
  const handleExportProject = () => {
    const snapshot = {
      analysisData: props.analysisData,
      deepVocabResult: state.deepVocabResult,
      deepSegmentsResult: state.deepSegmentsResult,
      visualResult: state.visualResult,
      castingResult: state.castingResult,
      outputScript,
      currentStep: 7,
      version: VMAX_KERNEL_VERSION
    };
    downloadProjectJson(snapshot, `VMAX_Project_${new Date().toISOString().split('T')[0]}`);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 🌟 [遺漏修補 2]：加回通用純文字下載函數
  const handleDownload = (text: string, label: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VMAX_${label.replace(/\s/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 🌟 [格式對齊]：轉化為 NotebookLM 易讀的 Markdown，並加回 YAML 視覺鎖定！
  const generateNotebookLMScript = (slidesData: SlideData[]) => {
    // 1. 從狀態中提取視覺與角色 DNA
    let styleCode = 'S-00';
    let protagonist = '標準學生';
    let guideVisualDNA = '標準導師';
    
    try {
      if (state.visualResult) {
        const visual = typeof state.visualResult === 'string' ? JSON.parse(state.visualResult) : state.visualResult;
        styleCode = visual?.style?.code || 'S-00';
      }
      if (state.castingResult) {
        const casting = typeof state.castingResult === 'string' ? JSON.parse(state.castingResult) : state.castingResult;
        protagonist = casting?.protagonist || '無設定';
        guideVisualDNA = casting?.guide?.visualDNA || '無設定';
      }
    } catch(e) {}

    // 2. 建立標題與基本設定
    let md = `# V-MAX 教學腳本 (NotebookLM 驅動版)\n\n`;
    md += `> 📌 **課程名稱**：${state.analysisData?.unitName || '教學簡報'}\n`;
    md += `> 👤 **引導導師**：${guideName}\n\n`;
    md += `=========================================\n\n`;

    // 🌟 3. [關鍵加回] 神級 YAML 控制區塊 (鎖定畫風與角色)
    md += `### 🧠 notebooklm_driver & VMAX_STRUCTURE_YAML\n`;
    md += `\`\`\`yaml\n`;
    md += `global_visual_protocol:\n`;
    md += `  artistic_consistency: "Inherit Style Code [${styleCode}]"\n`;
    md += `  image_ratio: "16:9"\n`;
    md += `visual_dna_anchor:\n`;
    md += `  protagonist: "${protagonist.replace(/\n/g, ' ')}"\n`;
    md += `  guide: "${guideVisualDNA.replace(/\n/g, ' ')}"\n`;
    md += `\`\`\`\n\n`;
    md += `=========================================\n\n`;

    // 4. 迴圈印出所有幻燈片 (確保文字逐字複製)
    slidesData.forEach((slide, idx) => {
      md += `## [P${idx + 1}] ${slide.type || '未指定'}\n`;
      md += `* **【鏡頭視角】**：${slide.cameraAngle || '中景'}\n`;
      
      // 嘗試解析視覺提示詞中的標籤 (對齊 Purity Protocol)
      const vp = slide.visualPrompt || '';
      const subjectMatch = vp.match(/Subject:\s*(.*?)(?=\n|Context:|$)/is);
      const contextMatch = vp.match(/Context:\s*(.*?)(?=\n|Composition:|$)/is);
      
      if (subjectMatch) {
        md += `* **【畫面焦點】**：${subjectMatch[1].trim()}\n`;
      }
      if (contextMatch) {
        md += `* **【背景細節】**：${contextMatch[1].trim()}\n`;
      }
      
      if (!subjectMatch && !contextMatch) {
        md += `* **【視覺提示詞】**：${vp.replace(/\n/g, ' ')}\n`;
      }

      md += `* **【顯示文字】**：\n`;
      md += `${slide.displayText || '---\n[無內容]\n---'}\n\n`;
      md += `* **【引導導師】**：\n`;
      md += `> ${slide.guideTalk || ''}\n\n`;
      md += `=========================================\n\n`;
    });
    return md;
  };

  // 修改下載按鈕，匯出這個完美的 TXT
  const handleDownloadScript = () => {
    const blob = new Blob([generateNotebookLMScript(slides)], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `VMAX_Script_${state.analysisData?.unitName || '教學'}.txt`;
    link.click();
  };

  const updateSlide = (idx: number, field: keyof SlideData, value: any) => {
    const newSlides = [...slides];
    newSlides[idx] = { ...newSlides[idx], [field]: value };
    setSlides(newSlides);
  };

  const insertSlide = (idx: number) => {
    const newSlide: SlideData = { 
      id: `P${Date.now()}`, 
      type: 'content_page', 
      cameraAngle: '中景', 
      visualPrompt: '', 
      displayText: '---\n# 新插入頁面\n---', 
      guideTalk: '' 
    };
    const newSlides = [...slides];
    newSlides.splice(idx, 0, newSlide);
    setSlides(newSlides);
  };

  const tabs = [
    { key: 'script', label: '原子化腳本', icon: Layout, content: outputScript, color: 'text-blue-500' },
    { key: 'notebookLM', label: '工作室指南', icon: Terminal, content: outputNotebookLMGuide, color: 'text-orange-500' },
    { key: 'gamified', label: '遊戲化測驗', icon: Gamepad2, content: outputGamifiedQuiz, color: 'text-rose-500' },
    { key: 'worksheet', label: '素養學習單', icon: FileText, content: outputWorksheet, color: 'text-emerald-500' },
    { key: 'assessment', label: '複習講義', icon: CheckSquare, content: outputAssessment, color: 'text-purple-500' },
    { key: 'kb', label: '知識庫資料', icon: Database, content: outputKb, color: 'text-amber-500' },
  ];

  const currentTab = tabs.find(t => t.key === activeTab);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
          <span className="bg-slate-900 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">5</span>
          V-MAX 產出中心
        </h2>
        <div className="flex items-center gap-3">
          <button onClick={handleExportProject} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95">
            <Database size={14} /> 儲存專案快照
          </button>
          <button onClick={onBack} className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-600 font-bold transition-colors">
            <ArrowLeft size={14} /> 返回視覺設定
          </button>
        </div>
      </div>

      {!isStarted && !outputScript ? (
        <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
           <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl p-12 w-full text-center space-y-8 animate-in zoom-in-95">
              <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner"><Sparkles size={40} /></div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">準備啟動旗艦流水線</h3>
                <p className="text-slate-500 leading-relaxed">系統將融合您的教學大綱、視覺 DNA 與角色設定，<br/>產出 100% 精準對齊的原子化教學腳本。</p>
              </div>
              <button onClick={onScriptPipeline} disabled={isLoading} className="w-full max-w-sm py-5 bg-slate-900 text-white rounded-2xl font-black text-xl shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
                {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Play size={24} />}
                {isLoading ? '核心編織中...' : '開始生產腳本'}
              </button>
           </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <ModuleCard title="素養學習單" icon={<FileText size={20}/>} status={outputWorksheet} isLoading={isLoading && state.loadingStatus?.includes('學習單')} onClick={() => onManualModule('worksheet')} color="emerald" />
             <ModuleCard title="複習講義" icon={<CheckSquare size={20}/>} status={outputAssessment} isLoading={isLoading && state.loadingStatus?.includes('講義')} onClick={() => onManualModule('assessment')} color="purple" />
             <ModuleCard title="遊戲化測驗" icon={<Gamepad2 size={20}/>} status={outputGamifiedQuiz} isLoading={isLoading && state.loadingStatus?.includes('測驗')} onClick={() => onManualModule('gamified')} color="rose" />
             <ModuleCard title="知識庫資料" icon={<Database size={20}/>} status={outputKb} isLoading={isLoading && state.loadingStatus?.includes('知識庫')} onClick={() => onManualModule('kb')} color="amber" />
          </div>

          <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-all border-b-4 flex items-center gap-2 ${activeTab === tab.key ? 'text-slate-900 border-slate-900 bg-slate-50' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
                <tab.icon size={16} className={activeTab === tab.key ? tab.color : ''} />
                {tab.label}
                {tab.content && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-hidden">
            {activeTab === 'script' && slides.length > 0 ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full pb-4">
                
                {/* 🌟 左側：編輯器模式 */}
                <div className="overflow-y-auto pr-4 space-y-4 custom-scrollbar">
                  
                  <div className="bg-slate-900 text-white p-6 rounded-[2rem] border border-slate-700 shadow-xl space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                       <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><UserCircle2 size={14}/> 腳本全域設定</h4>
                       <div className="flex gap-2">
                          <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded-md border border-blue-500/30">🎨 視覺 DNA：已鎖定</span>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold">導師姓名</label>
                        <input className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-indigo-300 font-black outline-none focus:border-indigo-500" value={guideName} onChange={e => setGuideName(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold">當前課程</label>
                        <div className="text-sm font-black text-slate-300 truncate px-1 py-2">{state.analysisData?.unitName}</div>
                      </div>
                    </div>
                  </div>

                  {slides.map((slide, sIdx) => (
                    <React.Fragment key={slide.id}>
                      {/* 🌟 插入按鈕：在每一頁上方 */}
                      <div className="flex justify-center -my-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button 
                          onClick={() => insertSlide(sIdx)}
                          className="bg-indigo-500 text-white p-1 rounded-full shadow-lg hover:scale-110 transition-transform"
                          title="在此插入新頁面"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 hover:border-indigo-300 transition-all shadow-sm group relative">
                        <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center gap-3">
                            <span className="bg-slate-900 text-white w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shadow-md">{sIdx + 1}</span>
                            <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-tighter">{slide.type}</span>
                            
                            {/* 🌟 讓鏡頭視角變為可編輯，這樣您可以手動微調 */}
                            <input 
                              className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 outline-none w-24 text-center focus:bg-white focus:ring-2 ring-emerald-200" 
                              value={slide.cameraAngle || ''} 
                              onChange={e => updateSlide(sIdx, 'cameraAngle', e.target.value)} 
                              placeholder="鏡頭視角"
                            />
                          </div>
                          <button onClick={() => setSlides(slides.filter((_, i) => i !== sIdx))} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">幻燈片顯示文字 (DisplayText Markdown)</label>
                            <textarea 
                              className="w-full text-sm font-bold bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-slate-200 focus:bg-white focus:border-indigo-200 outline-none text-slate-700 min-h-[120px] leading-relaxed" 
                              value={slide.displayText || ''} 
                              onChange={e => updateSlide(sIdx, 'displayText', e.target.value)} 
                              placeholder="--- \n標題 | 內容 \n---"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">視覺 DNA 提示詞 (Visual DNA Prompt)</label>
                            <textarea className="w-full text-xs font-mono bg-slate-900 text-emerald-400 p-5 rounded-[1.5rem] resize-none h-24 border border-slate-800 shadow-inner" value={slide.visualPrompt || ''} onChange={e => updateSlide(sIdx, 'visualPrompt', e.target.value)} />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-indigo-400 uppercase ml-2">導師完整對白 (GuideTalk Script)</label>
                            <textarea 
                              className="w-full text-sm bg-indigo-50/30 p-4 rounded-2xl border border-indigo-100 focus:bg-white focus:border-indigo-300 outline-none text-slate-800 min-h-[100px]" 
                              value={slide.guideTalk || ''} 
                              onChange={e => updateSlide(sIdx, 'guideTalk', e.target.value)} 
                            />
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  ))}
                  <button onClick={() => setSlides([...slides, { id: `P${Date.now()}`, type: 'content_page', cameraAngle: '中景', visualPrompt: '', displayText: '---\n# 新頁面\n---', guideTalk: '' }])} className="w-full py-10 border-4 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 font-black flex flex-col items-center justify-center gap-2 hover:border-indigo-300 hover:text-indigo-400 transition-all"><Plus size={32}/><span className="text-lg">新增幻燈片</span></button>
                </div>

                {/* 🌟 右側：即時 NotebookLM 腳本預覽 */}
                <div className="bg-slate-900 rounded-[2.5rem] p-10 flex flex-col shadow-2xl relative overflow-hidden h-full">
                   <div className="flex justify-between items-center mb-8 z-10">
                      <div>
                        <h4 className="text-indigo-400 font-black text-xl flex items-center gap-2">
                          <Terminal size={24} /> VMAX_Script.txt
                        </h4>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mt-1">
                          100% 對齊工作室指南格式
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => handleCopy(generateNotebookLMScript(slides), 'script_txt')} className="px-5 py-2.5 bg-slate-800 text-indigo-400 rounded-xl text-xs font-black hover:bg-slate-700 transition-all flex items-center gap-2 border border-slate-700 shadow-lg">
                           {copiedId === 'script_txt' ? <Check size={14} /> : <Copy size={14} />} 複製腳本 (COPY)
                        </button>
                        <button onClick={handleDownloadScript} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-lg active:scale-95">
                           <Download size={14} /> 匯出腳本 (EXPORT)
                        </button>
                      </div>
                   </div>
                   <pre className="flex-1 overflow-y-auto text-[12px] font-mono text-slate-300 leading-relaxed custom-scrollbar bg-slate-950/40 p-8 rounded-[2rem] border border-white/5 shadow-inner whitespace-pre-wrap">
                      {generateNotebookLMScript(slides)}
                   </pre>
                </div>
              </div>
            ) : (
              /* 🌟 [遺漏修補 3]：其餘模組預覽，加回 Cleaner 與 Download 按鈕 */
              <div className="h-full bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden flex flex-col">
                 {currentTab?.content ? (
                    <div className="flex-1 p-12 overflow-y-auto custom-scrollbar prose prose-slate max-w-none">
                       <div className="flex justify-end mb-10 gap-3 not-prose">
                          <button onClick={() => handleCopy(currentTab.content!, currentTab.key)} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-200 transition-all flex items-center gap-2 shadow-sm">
                             {copiedId === currentTab.key ? <Check size={16} /> : <Copy size={16} />} 複製內容
                          </button>
                          <button onClick={() => handleDownload(currentTab.content!, currentTab.label)} className="px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-500 transition-all flex items-center gap-2 shadow-sm">
                             <Download size={16} /> 下載 TXT
                          </button>
                       </div>
                       <ReactMarkdown>{currentScriptCleaner(currentTab.content)}</ReactMarkdown>
                    </div>
                 ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-20 text-center animate-in fade-in duration-500">
                       <AlertCircle size={80} className="mb-8 opacity-10" />
                       <h4 className="text-2xl font-black text-slate-400 mb-2">模組內容尚未生成</h4>
                       <p className="text-sm text-slate-400 mb-10">點擊上方的卡片按鈕，AI 將立即為您編織對應內容。</p>
                       <button onClick={() => onManualModule(activeTab)} className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all">立即啟動產出</button>
                    </div>
                 )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- 子元件：ModuleCard ---
interface ModuleCardProps { title: string; icon: React.ReactNode; status: string | null; isLoading: boolean; onClick: () => void; color: string; }
const ModuleCard: React.FC<ModuleCardProps> = ({ title, icon, status, isLoading, onClick, color }) => {
  const colorMap: Record<string, string> = { emerald: 'text-emerald-600', purple: 'text-purple-600', rose: 'text-rose-600', amber: 'text-amber-600' };
  const bgMap: Record<string, string> = { emerald: 'bg-emerald-50', purple: 'bg-purple-50', rose: 'bg-rose-50', amber: 'bg-amber-50' };
  const btnMap: Record<string, string> = { emerald: 'bg-emerald-600', purple: 'bg-purple-600', rose: 'bg-rose-600', amber: 'bg-amber-600' };

  return (
    <div className={`p-6 rounded-3xl border-2 transition-all ${status ? `${bgMap[color]} border-${color}-100 shadow-sm` : 'bg-white border-slate-100 hover:border-indigo-100 shadow-sm'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${status ? 'bg-white shadow-sm' : 'bg-slate-50 text-slate-400'}`}>
          <span className={status ? colorMap[color] : ''}>{icon}</span>
        </div>
        {status && <div className={`w-6 h-6 rounded-full ${btnMap[color]} text-white flex items-center justify-center shadow-md animate-in zoom-in`}><Check size={14} strokeWidth={4} /></div>}
      </div>
      <h4 className={`font-black text-base mb-5 ${status ? colorMap[color] : 'text-slate-800'}`}>{title}</h4>
      <button onClick={onClick} disabled={isLoading} className={`w-full py-3 rounded-xl text-xs font-black tracking-widest transition-all ${status ? `bg-white ${colorMap[color]} border border-current hover:bg-white/50` : `${btnMap[color]} text-white shadow-lg hover:scale-105`} disabled:opacity-50 active:scale-95`}>
        {isLoading ? <Loader2 size={14} className="animate-spin mx-auto"/> : (status ? '重新生成內容' : <span className="flex items-center justify-center gap-1"><Sparkles size={12} /> 立即產出</span>)}
      </button>
    </div>
  );
};

// 🌟 [遺漏修補 3]：加回注音與 Markdown 標籤清理器
const currentScriptCleaner = (text: string) => {
  if (!text) return "";
  return text
    .replace(/```(yaml|json|csv)?|```/gi, '\n\n---\n\n');
    // 註音協定要求保留注音，因此不再移除
};

export default Step5Output;