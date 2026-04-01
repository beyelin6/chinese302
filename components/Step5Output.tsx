// 檔案路徑: src/components/Step5Output.tsx

import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Layout, FileText, Check, Download, ArrowLeft, Loader2, 
  Sparkles, BookOpen, Database, Copy, Printer, Wand2, CheckCircle,
  Gamepad2, Zap, Trash2
} from 'lucide-react';
import { useWorkflowContext } from '../context/WorkflowContext';
import InteractiveQuiz from './InteractiveQuiz';

interface Step5OutputProps {
  outputScript: string | null;
  outputWorksheet: string | null;
  outputAssessment: string | null;
  outputKb: string | null;
  outputNotebookLMGuide: string | null;
  outputGamifiedQuiz: string | null;
  outputInteractiveQuiz: string | null;
  onScriptPipeline: () => void;
  onManualModule: (key: string) => void;
  onRegenerateSingleSlide?: (slideData: any) => Promise<any>;
  isLoading: boolean;
  onBack: () => void;
}

const Step5Output: React.FC<Step5OutputProps> = ({ 
  outputScript, outputWorksheet, outputAssessment, outputKb, 
  outputNotebookLMGuide, outputGamifiedQuiz, outputInteractiveQuiz,
  onScriptPipeline, onManualModule, onRegenerateSingleSlide, isLoading, onBack 
}) => {
  const { state, dispatch } = useWorkflowContext();
  const [activeTab, setActiveTab] = useState('script');
  const [isCopied, setIsCopied] = useState(false);
  const [editableSlides, setEditableSlides] = useState<any[]>([]);
  const prevSlidesLength = useRef(0);
  const [viewMode, setViewMode] = useState<'json' | 'human'>('human'); 
  
  const [regeneratingIdx, setRegeneratingIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!outputScript && !isLoading) {
      onScriptPipeline();
    }
  }, [outputScript, isLoading, onScriptPipeline]);

useEffect(() => {
    if (outputScript) {
      try {
        // 安全解析字串
        const parsed = typeof outputScript === 'string' ? JSON.parse(outputScript) : outputScript;
        
        // 🌟 強化容錯：支援各種資料結構 (陣列、包含 slides 的物件、包含 presentation_data 的物件)
        const incomingSlides = parsed?.presentation_data?.slides || parsed?.slides || (Array.isArray(parsed) ? parsed : []);
        
        // 只要一拿到任何新頁面，就立刻渲染到畫面上 (這就是分段顯示的關鍵！)
        if (incomingSlides.length > 0) {
          setEditableSlides(incomingSlides);
        }
      } catch (e) {
        console.error("解析腳本失敗", e);
      }
    }
  }, [outputScript]);
  const handleRegenerateClick = async (idx: number, slide: any) => {
    if (!onRegenerateSingleSlide) return;
    setRegeneratingIdx(idx);
    try {
      const newSlideData = await onRegenerateSingleSlide(slide);
      if (newSlideData) {
        const newSlides = [...editableSlides];
        newSlides[idx] = { ...newSlides[idx], ...newSlideData, page_number: slide.page_number };
        setEditableSlides(newSlides);
        
        const currentPayload = JSON.parse(outputScript || '{}');
        const newPayload = { ...currentPayload, slides: newSlides };
        dispatch({ type: 'SET_OUTPUTS', payload: { outputScript: JSON.stringify(newPayload, null, 2) } });
      }
    } catch (e) {
      alert("重寫失敗，請稍後再試！");
    } finally {
      setRegeneratingIdx(null);
    }
  };

  const syncRawCode = useMemo(() => {
    if (activeTab !== 'script') {
      switch (activeTab) {
        case 'worksheet': return outputWorksheet || "";
        case 'assessment': return outputAssessment || "";
        case 'kb': return outputKb || "";
        case 'notebooklm': return outputNotebookLMGuide || "";
        case 'gamified': return outputGamifiedQuiz || "";
        case 'interactive': return outputInteractiveQuiz || "";
        default: return "";
      }
    }

    const safeParse = (data: any) => {
      try { return typeof data === 'string' ? JSON.parse(data) : data; }
      catch { return {}; }
    };

    const visual = safeParse(state.visualResult);
    const casting = safeParse(state.castingResult);
    const analysis = state.analysisData;
    const lessonTitle = analysis?.basicInfo?.unitName || analysis?.title || analysis?.subject || '未命名課文';

    // 🌟 解析主角與導師的 DNA，並處理雙軌模式 (useRefMode)
    const protagDNA = casting?.protagonist?.visualDNA || casting?.protagonist?.description || '無特殊主角設定';
    const guideDNA = casting?.guide?.visualDNA || '標準人設';
    const isImageAnchorMode = !!casting?.guide?.useRefMode;
    const finalGuideInstruction = isImageAnchorMode 
      ? `[IMAGE_ANCHOR_MODE] 🚨 絕對鎖定！請完全以「上傳之基準圖」作為唯一長相標準。參考輔助特徵：${guideDNA}`
      : `[TEXT_DNA_MODE] 請嚴格依照以下文字設定繪製：${guideDNA}`;

    if (viewMode === 'human') {
      let humanReadableText = `# 📚 視覺化教學腳本：${lessonTitle}\n\n`;
      humanReadableText += `> 🎨 **視覺風格**：${visual?.style?.description || '保持一致'}\n`;
      humanReadableText += `> 👤 **導師設定**：${casting?.guide?.name || '標準導師'} ${isImageAnchorMode ? '(🔗 已啟用基準圖鎖定)' : ''}\n\n---\n\n`;

      editableSlides.forEach((slide, idx) => {
        humanReadableText += `## 🎬 投影片 P${slide.page_number || (idx + 1)}：${slide.title || '未命名場景'}\n`;
        humanReadableText += `- **模組定位**：\`${slide.type || '一般'}\`\n`;
        humanReadableText += `- **排版指令**：\`${slide.layout || '預設'}\`\n`;
        humanReadableText += `- **鏡頭指令**：\`${slide.lens || '中景'}\`\n\n`;
        humanReadableText += `### 📝 畫面顯示文字\n${slide.displayText || '(無文字)'}\n\n`;
        humanReadableText += `### 🗣️ 導師引導台詞\n> ${slide.guideAction ? `*(${slide.guideAction})* ` : ''}${slide.guideTalk || '(無台詞)'}\n\n`;
        humanReadableText += `### 🖼️ AI 生圖提示詞\n\`\`\`text\n${slide.visual_prompt || '(無)'}\n\`\`\`\n\n---\n\n`;
      });
      return humanReadableText;
    }

    let yamlString = `notebooklm_driver:
  system_role: "You are the V-MAX Slide Architect. Generate slides based on the YAML constraints. CRITICAL: You MUST use Multi-Box UI Layout according to the 'layout' and 'lens' properties of each slide."
  ui_layout_protocol:
    core_rule: "NEVER put all displayText into a single visual container. You MUST split the text into distinct spatial UI boxes. CRITICAL: You MUST also render the 'guideTalk' text directly ON THE SLIDE visually as a Speech Bubble or Quote Box!"
    layout_mapping:
      wide-scene: "Split screen 50/50. Left: Wide-angle scene image. Right: Text content separated into primary block (段落大意) and secondary block (難詞顯影)."
      dialogue-scene: "Split Screen Layout. CRITICAL: Render guideTalk in a speech bubble on the left, and main text on the right. NO guide character visible on the right side."
      close-tool: "Split screen. Left: Close-up image of the guide/tool. Right: Text separated into definition blocks (e.g., 修辭/句型) with distinct colored borders."
      quiz-card: "Single Info Board. Top: Image of guide. Bottom: Two distinct colored tag boxes. Blue tag box for 【提取】(Extraction) questions, Amber/Orange tag box for 【推論】(Inference) questions."
      split-2: "Split Screen Layout. CRITICAL: Put the text for Character 1 INSIDE the left panel under its image, and Character 2 INSIDE the right panel. Put the 【💡 辨析口訣】 in a separate wide box at the bottom. NO guide character."
      grid-3: "3-Column Grid Layout. CRITICAL: Put the text for each character INSIDE its corresponding column under its image. Put the 【💡 辨析口訣】 in a separate wide box at the bottom. NO guide character."
      grid-4: "2x2 Grid Layout. CRITICAL: Put the text for each character INSIDE its corresponding cell under its image. Put the 【💡 辨析口訣】 in a separate wide box at the bottom. NO guide character."
      compare-scale: "Balance Screen Layout. Left and right distinct scenario images. NO guide character."
      triptych: "3-panel Balance Screen Layout. Left, center, and right distinct scenario images. NO guide character."
      story-panel: "Horizontal Split Layout. Top 60% is a clear image explicitly illustrating the example sentence (CRITICAL: NO text overlay on the image). Bottom 40% is a structured text box containing the idiom title, definition, and example sentence. NO guide character."
      pattern-drill: "Single Image, Large Text overlay."
      punctuation-chart: "Single Image, Large Text overlay."
      phrase-demo: "Single Image, Large Text overlay."
      speech-stage: "Single Image, Large Text overlay."
      info-flow: "Single Box Focus, Large Text overlay."
      step-flow: "Single Box Focus, Large Text overlay."
      single-board: "Single Info Board Layout."
  artistic_consistency: "${visual?.style?.code || "A"}"
  style_prompt: "${visual?.style?.description || "Maintain stylistic consistency."}"
  dna_traits:
    protagonist: "${protagDNA.replace(/"/g, '\\"')}"
    guide: "${(casting?.guide?.name || '導師')} | ${finalGuideInstruction.replace(/"/g, '\\"')}"
VMAX_STRUCTURE_YAML:
  global_visual_protocol:
    artistic_consistency: "${visual?.style?.code || "A"}"
    image_ratio: "16:9"
    rendering_priority: "Visual DNA Consistency"
  scaffolding_logic:
    macro_structure: "${analysis?.visualStructureRecommendation || "N1 故事山"}"
    micro_thinking: "C1 氣泡圖 / T1 對比圖"
    visual_description: "請專注於畫面主體與場景，嚴禁在背景隨意加上不相關的隱喻裝飾物。"
  visual_dna_anchor:
    protagonist_dna: "${protagDNA.replace(/"/g, '\\"')}"
    guide_dna: "${finalGuideInstruction.replace(/"/g, '\\"')}"
slides:\n`;

    editableSlides.forEach((slide) => {
      yamlString += `  - page_number: ${slide.page_number || 1}\n`;
      yamlString += `    part_label: "${slide.part_label || ''}"\n`;
      yamlString += `    type: "${slide.type || ''}"\n`;
      yamlString += `    title: "${(slide.title || '').replace(/"/g, '\\"')}"\n`;
      yamlString += `    layout: "${slide.layout || ''}"\n`;
      yamlString += `    lens: "${slide.lens || ''}"\n`;
      yamlString += `    visual_prompt: |-\n      ${(slide.visual_prompt || '').replace(/\n/g, '\n      ')}\n`;
      yamlString += `    displayText: |-\n      ${(slide.displayText || '').replace(/\n/g, '\n      ')}\n`;
      yamlString += `    guideAction: "${(slide.guideAction || '').replace(/"/g, '\\"')}"\n`;
      yamlString += `    guideTalk: |-\n      ${(slide.guideTalk || '').replace(/\n/g, '\n      ')}\n`;
    });

    return yamlString;
  }, [editableSlides, activeTab, viewMode, state.visualResult, state.castingResult, state.analysisData, outputWorksheet, outputAssessment, outputKb, outputNotebookLMGuide, outputGamifiedQuiz, outputInteractiveQuiz]);

  const updateSlide = (index: number, field: string, value: string) => {
    const newSlides = [...editableSlides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setEditableSlides(newSlides);
    
    const currentPayload = JSON.parse(outputScript || '{}');
    const newPayload = { ...currentPayload, slides: newSlides };
    dispatch({ type: 'SET_OUTPUTS', payload: { outputScript: JSON.stringify(newPayload, null, 2) } });
  };

  // 🌟 新增的刪除投影片功能 🌟
  const handleDeleteSlide = (indexToDelete: number) => {
    const isConfirmed = window.confirm("確定要刪除這張投影片嗎？刪除後，後續的頁碼會自動往前遞補喔！");
    
    if (isConfirmed) {
      // 1. 過濾掉被點擊刪除的那一頁
      const updatedSlides = editableSlides.filter((_, idx) => idx !== indexToDelete);
      
      // 2. 重新編排頁碼，確保不會跳號 (1, 2, 3...)
      const renumberedSlides = updatedSlides.map((slide, idx) => ({
        ...slide,
        page_number: idx + 1
      }));

      // 3. 更新畫面 State
      setEditableSlides(renumberedSlides);
      
      // 4. 同步更新到全域 Context (這樣左邊的 YAML 跟匯出功能才會同步)
      const currentPayload = JSON.parse(outputScript || '{}');
      const newPayload = { ...currentPayload, slides: renumberedSlides };
      dispatch({ type: 'SET_OUTPUTS', payload: { outputScript: JSON.stringify(newPayload, null, 2) } });
    }
  };

  const handleDownload = () => {
    if (!syncRawCode) return;

    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const timeString = `${mm}${dd}_${hh}${min}`;

    const lessonTitle = state.analysisData?.basicInfo?.unitName || state.analysisData?.title || state.analysisData?.subject || '未命名課文';
    const safeLessonTitle = lessonTitle.replace(/[\\/:*?"<>| ]/g, "_");
    
    const moduleName = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
    const extension = (activeTab === 'script' && viewMode === 'human') ? 'md' : 'txt';
    const dynamicFileName = `${safeLessonTitle}_${moduleName}_${timeString}.${extension}`;

    const blob = new Blob(['\ufeff', syncRawCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = dynamicFileName; 
    link.click();
    URL.revokeObjectURL(url);
  };

  const modules = [
    { id: 'script', title: '教學腳本', icon: Layout, data: outputScript, action: onScriptPipeline },
    { id: 'worksheet', title: '學習單', icon: FileText, data: outputWorksheet, action: () => onManualModule('worksheet') },
    { id: 'assessment', title: '評量卷', icon: CheckCircle, data: outputAssessment, action: () => onManualModule('assessment') },
    { id: 'interactive', title: '互動測驗', icon: Zap, data: outputInteractiveQuiz, action: () => onManualModule('interactive') },
    { id: 'gamified', title: '遊戲化題庫', icon: Gamepad2, data: outputGamifiedQuiz, action: () => onManualModule('gamified') },
    { id: 'kb', title: '知識庫', icon: Database, data: outputKb, action: () => onManualModule('kb') },
    { id: 'notebooklm', title: '生成指令', icon: BookOpen, data: outputNotebookLMGuide, action: () => onManualModule('notebooklm') },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 overflow-hidden animate-in fade-in duration-500">
      
      <div className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 flex-shrink-0 z-10 shadow-sm print:hidden">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h2 className="font-black text-lg tracking-tight flex items-center gap-2 text-slate-800">
              <Sparkles className="text-indigo-600" size={18} />
              V-MAX 視覺化簡報控制台
            </h2>
            <div className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase font-mono">
              MODE: {activeTab === 'script' ? (viewMode === 'human' ? 'STORYBOARD_VIEW' : 'ENGINE_YAML_ACTIVE') : 'DOCUMENT_PREVIEW'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl mr-2">
            {modules.map(mod => (
              <button
                key={mod.id}
                onClick={() => { setActiveTab(mod.id); if(!mod.data) mod.action(); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === mod.id 
                    ? 'bg-white text-indigo-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                }`}
              >
                <mod.icon size={14} /> {mod.title}
              </button>
            ))}
          </div>
          <div className="w-px h-6 bg-slate-200 mx-2" />
          
          {activeTab === 'script' && viewMode === 'human' && (
            <button onClick={() => window.print()} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-2 mr-2">
              <Printer size={14} /> 列印 PDF 簡報
            </button>
          )}

          <button onClick={handleDownload} className="bg-teal-600 hover:bg-teal-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-2">
            <Download size={14} /> 匯出文檔
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50 print:p-0 print:bg-white">
          <div className="max-w-3xl mx-auto space-y-6 pb-20 print:pb-0">
            {activeTab === 'script' ? (
              editableSlides.length > 0 ? (
                editableSlides.map((slide, idx) => (
                  <div key={idx} className={`bg-white border ${regeneratingIdx === idx ? 'border-indigo-400 shadow-indigo-100' : 'border-slate-200'} rounded-2xl shadow-sm overflow-hidden focus-within:border-indigo-300 transition-all print:shadow-none print:border-b print:rounded-none print:mb-8 relative`}>
                    
                    {/* 🌟 局部 Loading 遮罩 */}
                    {regeneratingIdx === idx && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-indigo-600">
                        <Loader2 size={32} className="animate-spin mb-2" />
                        <span className="font-bold text-sm tracking-widest animate-pulse">AI 正在重寫此頁...</span>
                      </div>
                    )}

                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 text-xs font-mono text-slate-500 flex justify-between items-center print:bg-white print:border-b-2 print:border-slate-800">
                      <span className="font-bold text-slate-800">投影片 P{slide.page_number || (idx + 1)} // 類型：{slide.type}</span>
                      
                      {/* 🌟 動作按鈕群組 (重寫 + 刪除) */}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleRegenerateClick(idx, slide)}
                          disabled={regeneratingIdx !== null}
                          className="text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-full flex items-center gap-1 transition-colors print:hidden shadow-sm border border-indigo-100 active:scale-95"
                        >
                          <Wand2 size={12}/> AI 重寫這頁
                        </button>
                        
                        <button 
                          onClick={() => handleDeleteSlide(idx)}
                          disabled={regeneratingIdx !== null}
                          className="text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-full flex items-center gap-1 transition-colors print:hidden shadow-sm border border-red-100 active:scale-95"
                          title="刪除此頁"
                        >
                          <Trash2 size={12}/> 刪除
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-5 space-y-4">
                      
                      <div className="flex gap-2">
                         <span className="inline-block text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-100 px-2 py-1 rounded-md print:bg-white print:border-slate-300 print:text-slate-600">
                           📏 排版: {slide.layout || "未指定"}
                         </span>
                         <span className="inline-block text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-md print:bg-white print:border-slate-300 print:text-slate-600">
                           🎥 鏡頭: {slide.lens || "未指定"}
                         </span>
                      </div>
                      
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1">
                          <Layout size={12}/> 📝 畫面呈現文字
                        </span>
                        
                        <div className="space-y-3">
                          {(slide.displayText || '').split(/(?=(?:^|\n)#{3,4} )/).map((p: string) => p.trim()).filter(Boolean).map((block: string, bIdx: number, arr: string[]) => {
                            const titleMatch = block.match(/^#{3,4}\s+(.+)/);
                            const blockTitle = titleMatch ? titleMatch[1].replace(/[💡🔍🧠✍️#*-]/g, '').trim() : `文本區塊 ${bIdx + 1}`;
                            
                            let blockStyle = "border-slate-200";
                            if (slide.layout === 'quiz-card' && blockTitle.includes('提取')) blockStyle = "border-blue-400 bg-blue-50/30";
                            if (slide.layout === 'quiz-card' && blockTitle.includes('推論')) blockStyle = "border-amber-400 bg-amber-50/30";
                            
                            return (
                              <div key={bIdx} className={`bg-white border ${blockStyle} rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-indigo-400 shadow-sm transition-all print:border-l-4 print:border-l-indigo-400 print:rounded-none print:shadow-none`}>
                                <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-100 text-[11px] font-black text-slate-600 flex items-center gap-1 print:hidden">
                                   <Layout size={10} className="text-indigo-400"/> {blockTitle} 
                                   <span className="text-[9px] text-slate-400 font-normal ml-auto">(NotebookLM 將獨立渲染此區塊)</span>
                                </div>
                                <textarea 
                                  value={block} 
                                  onChange={(e) => {
                                    const newArr = [...arr];
                                    newArr[bIdx] = e.target.value;
                                    updateSlide(idx, 'displayText', newArr.join('\n\n'));
                                  }}
                                  className="w-full bg-transparent p-3 text-sm font-bold text-slate-700 outline-none resize-none min-h-[80px] print:p-0 print:border-none print:text-base print:bg-transparent"
                                  placeholder="在此輸入投影片內容..."
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl print:bg-transparent print:border-l-4 print:border-l-indigo-500 print:rounded-none mt-4">
                        <span className="text-xs font-bold text-indigo-400 mb-1 block">🗣️ 導師引導台詞 (將印在對話框)</span>
                        <textarea 
                          value={slide.guideTalk} 
                          onChange={(e) => updateSlide(idx, 'guideTalk', e.target.value)}
                          className="w-full bg-transparent border-none p-0 text-sm text-slate-700 leading-relaxed font-medium focus:ring-0 outline-none resize-none italic min-h-[60px] print:text-base"
                          placeholder="導師引導語腳本..."
                        />
                      </div>
                      
                      <div className="text-[10px] font-mono text-slate-400 break-all line-clamp-1 hover:line-clamp-none transition-all print:text-slate-300">
                        🎨 AI 圖像提示: {slide.visual_prompt}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-32 text-slate-400 print:hidden">
                  <Loader2 size={40} className="animate-spin mb-4 text-indigo-500" />
                  <p className="font-bold text-sm tracking-widest uppercase">產出視覺分鏡中...</p>
                </div>
              )
            ) : activeTab === 'interactive' ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm min-h-[600px]">
                {outputInteractiveQuiz ? (
                  <InteractiveQuiz quizData={outputInteractiveQuiz} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 mt-20">
                    <Loader2 size={40} className="animate-spin mb-4 text-indigo-500" />
                    <p className="font-bold tracking-widest uppercase">AI 正在為您生成互動測驗題庫...</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 prose prose-slate max-w-none shadow-sm min-h-[600px] print:border-none print:shadow-none">
                {syncRawCode ? (
                  <ReactMarkdown>{syncRawCode}</ReactMarkdown>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 mt-20 print:hidden">
                    <Loader2 size={40} className="animate-spin mb-4 text-indigo-500" />
                    <p className="font-bold">AI 正在為您撰寫 {modules.find(m => m.id === activeTab)?.title}...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="w-[480px] border-l border-slate-200 bg-slate-50 flex flex-col shadow-[-10px_0_15px_-10px_rgba(0,0,0,0.05)] z-10 print:hidden">
          <div className="px-4 py-3 bg-white border-b border-slate-200 flex justify-between items-center">
            {activeTab === 'script' ? (
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setViewMode('human')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'human' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  劇本預覽 (無代碼)
                </button>
                <button 
                  onClick={() => setViewMode('json')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'json' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  YAML 原始碼
                </button>
              </div>
            ) : (
              <div className="text-sm font-black text-slate-700 flex items-center gap-2">
                <FileText size={16} className="text-indigo-500" /> 排版預覽
              </div>
            )}

            <button onClick={() => { navigator.clipboard.writeText(syncRawCode); setIsCopied(true); setTimeout(()=>setIsCopied(false), 2000); }} className="text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1 text-xs font-bold bg-slate-100 px-3 py-1.5 rounded-lg active:scale-95">
              {isCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              {isCopied ? '已複製' : '複製文字'}
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-[#f8fafc]">
            {activeTab === 'script' && viewMode === 'human' ? (
              <div className="prose prose-sm prose-slate max-w-none bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <ReactMarkdown>{syncRawCode}</ReactMarkdown>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-slate-600 bg-slate-100/50 p-4 rounded-xl border border-slate-200">
                <code>{syncRawCode}</code>
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step5Output;