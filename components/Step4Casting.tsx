// 檔案路徑: src/components/Step4Casting.tsx

import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Users, Check, AlertCircle, Play, 
  Info, Edit2, X, ArrowLeft, Sparkles, ImagePlus, Loader2,
  CheckCircle, Wand2, Upload, Image as ImageIcon, Plus, Copy
} from 'lucide-react';
import { CastingData, GuideCandidate, MediaData } from '../types';
import ReactMarkdown from 'react-markdown';
import { useWorkflowContext } from '../context/WorkflowContext';
import { sendMessageToGemini } from '../services/gemini';
import { EXTRACT_IMAGE_TRAITS_PROMPT } from '../constants';

const compressImage = (imageFile: File, maxWidth = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality).split(',')[1];
        resolve(compressedBase64);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

const GuideEditModal = ({ isOpen, onClose, initialData, onSave }: { isOpen: boolean; onClose: () => void; initialData: any; onSave: (updatedData: any) => void; }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    role: initialData?.description || '',
    gender: initialData?.gender || '未指定',
    age: initialData?.age || '30s',
    persona: initialData?.persona || '專業溫暖',
    visualDNA: initialData?.visualDNA || ''
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        name: initialData.name || '',
        role: initialData.description || '',
        gender: initialData.gender || '未指定',
        age: initialData.age || '30s',
        persona: initialData.persona || '專業溫暖',
        visualDNA: initialData.visualDNA || ''
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleAIBrainstorm = async () => {
    setIsGenerating(true);
    try {
      const prompt = `
        請扮演專業的角色設計師。根據以下設定，為教學引導者設計一段精確的 Visual DNA 提示詞：
        - 姓名：${formData.name}
        - 職業/定位：${formData.role}
        - 性別：${formData.gender}
        - 年齡：${formData.age}
        - 個性/語氣：${formData.persona}
        
        ⚠️ 終極生圖規範 (為了方便後續去背應用)：
        1. 必須以英文輸出，特徵之間用 Pipe (|) 分隔。
        2. 開頭必須鎖定：Age: ${formData.age}, ${formData.gender === '男' ? 'Male' : formData.gender === '女' ? 'Female' : 'Person'}。
        3. 必須包含：[Full-body shot] (全身像)、[Standing position] (站姿)、[Frontal view] (正面)。
        4. 🚨 背景指令 (核心)：必須加上 "isolated on a pure white background" (在純白背景中孤立) 與 "clean edges" (邊緣整潔)。
        5. 畫風指令：watercolor style illustration (水彩風格) 但嚴禁任何背景渲染或陰影。
        6. 包含髮型、服裝配件，但絕對不要輸出 markdown 外框或解釋。
      `;
      const result = await sendMessageToGemini(prompt, [], 0.7);
      setFormData(prev => ({ ...prev, visualDNA: result.replace(/```yaml|```|`/g, '').trim() }));
    } catch (error) {
      console.error('AI 發想失敗:', error);
      alert('發想失敗，請稍後再試');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const compressedBase64 = await compressImage(file);
      const result = await sendMessageToGemini(EXTRACT_IMAGE_TRAITS_PROMPT, [{ data: compressedBase64, mimeType: 'image/jpeg' }]);
      setFormData(prev => ({ ...prev, visualDNA: result.replace(/```yaml|```|`/g, '').trim() }));
    } catch (error) {
      console.error('圖片解析或壓縮失敗:', error);
      alert('圖片解析失敗，請確保圖片格式正確或稍後再試。');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Edit2 className="text-blue-600" size={24} />
            客製化引導者設定
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/50 custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600">人名</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="例如: 墨語" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600">角色/職業</label>
              <input type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="例如: 創意觀察家" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600">性別</label>
              <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="未指定">未指定</option>
                <option value="男">男 (Male)</option>
                <option value="女">女 (Female)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600">年齡設定 (Age)</label>
              <input type="text" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="例如: 30s, Elderly, 12" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600">語氣與性格 (Persona)</label>
            <input type="text" value={formData.persona} onChange={e => setFormData({...formData, persona: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="例如: 專業、溫暖且具啟發性" />
          </div>

          <div className="p-5 bg-white border border-indigo-100 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                <ImageIcon size={18} className="text-indigo-500"/>
                Visual DNA (外觀提示詞)
              </label>
              <div className="flex gap-2">
                <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={isUploading}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                  {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  圖片萃取
                </button>
                <button 
                  onClick={handleAIBrainstorm} 
                  disabled={isGenerating}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                  AI 發想
                </button>
              </div>
            </div>
            <textarea 
              value={formData.visualDNA} 
              onChange={e => setFormData({...formData, visualDNA: e.target.value})} 
              rows={3} 
              className="w-full p-3 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 font-mono text-sm leading-relaxed" 
              placeholder="Age: 30s | Hair: Black topknot | Eyes: Sharp and focused..."
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-white rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors">取消</button>
          <button 
            onClick={() => {
              onSave({
                ...initialData,
                name: formData.name,
                description: formData.role,
                gender: formData.gender,
                age: formData.age,
                persona: formData.persona,
                visualDNA: formData.visualDNA
              });
              onClose();
            }} 
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <CheckCircle size={18} />
            儲存設定
          </button>
        </div>
      </div>
    </div>
  );
};

interface Step4CastingProps {
  castingResult: string | null;
  onConfirmCasting: (protagonistTraits: string, guide: GuideCandidate, customGuideVisuals?: string) => void;
  onSuggestTraits: (gender: string, age: string, toneLabel: string) => Promise<string>;
  onGenerateCasting: () => void;
  onGenerateExternalDnaPrompt: (guideName: string, persona: string) => Promise<string>;
  handleExtractImageTraits?: (media: MediaData) => Promise<string | null>;
  isLoading: boolean;
  onBack: () => void;
}

const TONE_OPTIONS = [
  { code: 'G1', label: '溫暖', desc: '關懷/陪伴', color: 'border-pink-200 text-pink-700 bg-pink-50 hover:bg-pink-100' },
  { code: 'G2', label: '邏輯', desc: '推理/分析', color: 'border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100' },
  { code: 'G3', label: '知識', desc: '百科/權威', color: 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100' },
  { code: 'G4', label: '幽默', desc: '風趣/搞笑', color: 'border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100' },
  { code: 'G5', label: '熱血', desc: '激勵/動感', color: 'border-red-200 text-red-700 bg-red-50 hover:bg-red-100' },
  { code: 'G6', label: '神秘', desc: '奇幻/引導', color: 'border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100' },
];

const Step4Casting: React.FC<Step4CastingProps> = ({ 
  castingResult, 
  onConfirmCasting, 
  onSuggestTraits,
  onGenerateCasting,
  onGenerateExternalDnaPrompt,
  handleExtractImageTraits,
  isLoading, 
  onBack 
}) => {
  const { state, dispatch } = useWorkflowContext();
  const [data, setData] = useState<CastingData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);
  const [editingCandidate, setEditingCandidate] = useState<GuideCandidate | null>(null);
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customProtagonist, setCustomProtagonist] = useState<string>('');

  const [generatedDnaPrompt, setGeneratedDnaPrompt] = useState<string>('');
  const [isPromptCopied, setIsPromptCopied] = useState(false);
  
  // 🌟 從零捏臉功能
  const [customGuideData, setCustomGuideData] = useState({
    name: '專屬導師',
    description: '專為本課設計的引導者',
    gender: '未指定',
    age: '25',
    persona: '專業且親切'
  });
  const [customGuideVisuals, setCustomGuideVisuals] = useState<string>('');
  const [isExtractingCustom, setIsExtractingCustom] = useState(false);
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);
  const customGuideFileInputRef = useRef<HTMLInputElement>(null);

  const [isExtracting, setIsExtracting] = useState(false);
  const [extractingGuideId, setExtractingGuideId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const guideFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!castingResult && !isLoading) {
      onGenerateCasting();
    }
  }, [castingResult, isLoading, onGenerateCasting]);

  useEffect(() => {
    try {
      if (!castingResult) return;
      let cleanJson = castingResult;
      if (cleanJson.includes('```json')) {
        cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '');
      } else if (cleanJson.includes('```')) {
        cleanJson = cleanJson.replace(/```/g, '');
      }
      
      const parsed = JSON.parse(cleanJson);
      
      const formattedData: CastingData = {
        mode: parsed.mode || "Field Trip Mode",
        candidates: parsed.candidates || [],
        protagonist: parsed.protagonist || { name: "None", description: "", visualDNA: "", isNone: true },
        contextTone: parsed.contextTone || "本課語境分析中...",
        fusionTable: parsed.fusionTable
      };

      setData(formattedData);
      setCustomProtagonist(formattedData.protagonist?.visualDNA || '');
      setParseError(null);
    } catch (err: any) {
      console.error("Casting JSON Parse Error:", err);
      setParseError("AI 回傳的選角資料格式異常，請嘗試重新生成。");
    }
  }, [castingResult]);

  const handleEditClick = (guide: GuideCandidate, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCandidate({ ...guide });
  };

  const handleCreateCustomClick = () => {
    setIsCreatingCustom(true);
  };

  const handleSaveGuide = (updatedGuide: any) => {
    if (!data) return;
    
    if (updatedGuide.id === 'NEW_CUSTOM') {
      const newId = `CUSTOM_${Date.now()}`;
      const newCandidate = { ...updatedGuide, id: newId };
      setData({
        ...data,
        candidates: [...data.candidates, newCandidate]
      });
      setSelectedGuide(newId);
    } else {
      const updatedCandidates = data.candidates.map((c: any) => 
        c.id === updatedGuide.id ? updatedGuide : c
      );
      
      setData({
        ...data,
        candidates: updatedCandidates
      });
    }
  };

  const handleConfirm = () => {
    if (!data || !selectedGuide) return;
    
    // 如果老師有產出 Dna Prompt，代表他打算開外部模式
    const hasPrompt = !!generatedDnaPrompt;

    if (selectedGuide === 'CUSTOM_GUIDE') {
      const customGuide: GuideCandidate = {
        id: 'CUSTOM_GUIDE',
        name: customGuideData.name,
        persona: customGuideData.persona, 
        description: customGuideData.description,
        gender: customGuideData.gender,
        age: customGuideData.age,
        visualDNA: customGuideVisuals || '使用預設視覺設定'
      };
      
      const finalGuide = hasPrompt ? { ...customGuide, useRefMode: true } : customGuide;
      onConfirmCasting(customProtagonist, finalGuide as any, customGuideVisuals);
    } else {
      const guide = data.candidates.find(g => g.id === selectedGuide);
      if (guide) {
        // 在回傳時根據是否生成過 prompt，自動掛上 useRefMode
        const finalGuide = hasPrompt ? { ...guide, useRefMode: true } : guide;
        onConfirmCasting(customProtagonist, finalGuide as any);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !handleExtractImageTraits) return;

    setIsExtracting(true);
    try {
      const compressedBase64 = await compressImage(file);
      const media: MediaData = { mimeType: 'image/jpeg', data: compressedBase64, name: file.name };
      const traits = await handleExtractImageTraits(media);
      if (traits) {
        setCustomProtagonist(traits.replace(/```yaml|```|`/g, '').trim());
      }
    } catch (error) {
      alert('圖片解析失敗，請確保圖片格式正確或稍後再試。');
    } finally {
      setIsExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleGuideFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !handleExtractImageTraits || !extractingGuideId || !data) return;

    setIsExtracting(true);
    try {
      const compressedBase64 = await compressImage(file);
      const media: MediaData = { mimeType: 'image/jpeg', data: compressedBase64, name: file.name };
      const traits = await handleExtractImageTraits(media);
      if (traits) {
        const updatedCandidates = data.candidates.map(c => 
          c.id === extractingGuideId ? { ...c, visualDNA: traits.replace(/```yaml|```|`/g, '').trim() } : c
        );
        setData({
          ...data,
          candidates: updatedCandidates
        });
      }
    } catch (error) {
      alert('圖片解析失敗，請確保圖片格式正確或稍後再試。');
    } finally {
      setIsExtracting(false);
      setExtractingGuideId(null);
      if (guideFileInputRef.current) guideFileInputRef.current.value = '';
    }
  };

  const isEditingAny = !!editingCandidate;

  if (parseError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <AlertCircle size={48} className="text-red-400 mb-4" />
        <p className="text-red-500 font-bold">{parseError}</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-slate-100 rounded-lg text-sm">返回上一步</button>
      </div>
    );
  }

  if (!data) return null;

  const isModeA = data.mode === "Drama Mode" && data.protagonist && !data.protagonist.isNone;

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-8 duration-700 pb-24 relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
          <span className="bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
          靈魂與策略 (Soul Casting)
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
        {data.contextTone && (
          <div className="bg-teal-50/50 border border-teal-100 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
            <div className="bg-teal-100 p-2 rounded-xl text-teal-600">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-1">本課語境共鳴分析 (Context Tone)</div>
              <p className="text-sm text-slate-700 font-medium italic">「{data.contextTone}」</p>
            </div>
          </div>
        )}

        {isModeA && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <User className="text-blue-500" /> 故事主角 DNA 鎖定
            </h3>
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/3">
                <div className="text-sm font-bold text-slate-800">{data.protagonist.name}</div>
                <div className="text-xs text-slate-500 mb-2">{data.protagonist.description}</div>
                
                {handleExtractImageTraits && (
                   <div className="mt-4">
                     <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                     <button 
                       onClick={() => fileInputRef.current?.click()}
                       disabled={isExtracting || isLoading}
                       className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-blue-200 text-blue-600 rounded-lg text-xs font-bold shadow-sm hover:bg-blue-50 transition-colors"
                     >
                       {isExtracting ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
                       {isExtracting ? "正在解析圖片..." : "上傳圖片萃取 DNA"}
                     </button>
                   </div>
                )}
              </div>
              <div className="flex-1">
                 <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Visual DNA Traits (可手動修改)</label>
                 <textarea
                   value={customProtagonist}
                   onChange={(e) => setCustomProtagonist(e.target.value)}
                   className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm font-mono text-slate-700 shadow-inner outline-none focus:ring-2 focus:ring-blue-500"
                   rows={4}
                 />
                 {data.protagonist?.verification && (
                   <div className="mt-3 flex gap-2 items-start p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                     <div className="bg-indigo-100 p-1 rounded-md text-indigo-600 mt-0.5">
                       <Sparkles size={12} />
                     </div>
                     <div className="flex-1">
                       <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">AI 角色判定根據</div>
                       <p className="text-[11px] text-indigo-700 leading-relaxed font-medium">
                         {data.protagonist.verification}
                       </p>
                     </div>
                   </div>
                 )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
           <h3 className="text-lg font-black text-slate-800 mb-1 flex items-center gap-2">
              <Users className="text-teal-600" /> 選擇引導者 (Guide Casting)
           </h3>
           <p className="text-sm text-slate-500 mb-6">請選擇一位最適合本課文風的引導角色。AI 已根據課文靈魂為您編織了專屬人設。</p>
 
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             <input type="file" ref={guideFileInputRef} onChange={handleGuideFileUpload} accept="image/*" className="hidden" />
             
             {data.candidates.map((guide) => {
               const isSelected = selectedGuide === guide.id;
               const isExtractingThis = extractingGuideId === guide.id;
               
               return (
                 <div 
                   key={guide.id} 
                   onClick={() => !isEditingAny && setSelectedGuide(guide.id)}
                   className={`relative border-2 rounded-2xl p-5 transition-all cursor-pointer ${
                     isSelected 
                       ? 'border-teal-500 bg-teal-50/30 shadow-md' 
                       : 'border-slate-200 hover:border-teal-300 hover:shadow-sm bg-white'
                   } ${isEditingAny ? 'opacity-50 pointer-events-none' : ''}`}
                 >
                   <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                     isSelected ? 'border-teal-500 bg-teal-500' : 'border-slate-300'
                   }`}>
                     {isSelected && <Check size={14} className="text-white" />}
                   </div>

                   <div className="flex justify-between items-start mb-3">
                     <div>
                       <h4 className="font-black text-slate-800 text-lg">{guide.name}</h4>
                       <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${
                         TONE_OPTIONS.find(t => t.code === guide.persona)?.color.split(' ').slice(1, 3).join(' ') || 'bg-slate-100 text-slate-500'
                       }`}>
                         {TONE_OPTIONS.find(t => t.code === guide.persona)?.label || guide.persona}
                       </span>
                     </div>
                     <div className="flex gap-1">
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           setExtractingGuideId(guide.id);
                           guideFileInputRef.current?.click();
                         }}
                         disabled={isExtracting || isLoading}
                         className={`p-1.5 rounded-md transition-colors ${isExtractingThis ? 'text-teal-600 bg-teal-50' : 'text-slate-400 hover:text-teal-600 hover:bg-teal-50'}`}
                         title="上傳圖片萃取 DNA"
                       >
                         {isExtractingThis ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                       </button>
                       <button 
                         onClick={(e) => handleEditClick(guide, e)}
                         className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors"
                         title="編輯設定"
                       >
                         <Edit2 size={16} />
                       </button>
                     </div>
                   </div>
                   
                   <p className="text-xs text-slate-600 mb-4 leading-relaxed line-clamp-3">
                     {guide.description}
                   </p>

                   <div className="flex flex-wrap gap-2 mb-4">
                     {guide.gender && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">性別: {guide.gender}</span>}
                     {guide.age && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">年齡: {guide.age}</span>}
                   </div>

                   <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                     <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Visual DNA</div>
                     <div className="text-xs font-mono text-slate-600 truncate" title={guide.visualDNA}>
                       {guide.visualDNA}
                     </div>
                   </div>
                 </div>
               );
             })}

             {/* 🌟 新增：自訂引導者按鈕 */}
             <div 
               onClick={handleCreateCustomClick}
               className="border-2 border-dashed border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 hover:border-teal-400 hover:bg-teal-50/30 transition-all cursor-pointer group min-h-[200px]"
             >
               <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-teal-100 group-hover:text-teal-600 transition-colors">
                 <Plus size={24} />
               </div>
               <div className="text-center">
                 <div className="font-bold text-slate-600 group-hover:text-teal-700">自訂引導者</div>
                 <div className="text-[10px] text-slate-400">從零開始捏臉</div>
               </div>
             </div>
           </div>
        </div>

        {/* 👇 魔法按鈕區塊 👇 */}
        {selectedGuide && data.candidates.find(g => g.id === selectedGuide) && (
          <div className="p-6 bg-indigo-50/50 border-2 border-indigo-100 rounded-2xl relative overflow-hidden animate-in fade-in slide-in-from-top-4">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Wand2 size={64} className="text-indigo-900" />
            </div>
            
            <h3 className="text-lg font-black text-indigo-900 flex items-center gap-2 mb-2">
              <ImagePlus size={20} className="text-indigo-600" />
              生成高階生圖提示詞 (NANOBANANA 專用)
            </h3>
            <p className="text-xs text-indigo-700/70 mb-4 font-medium max-w-2xl">
              若您希望在 NotebookLM 中獲得 100% 完美的角色連貫性，請先點擊下方按鈕，生成專屬的英文提示詞，並前往 NANOBANANA 生成角色圖片。系統將自動啟用基準圖鎖定模式。
            </p>

            {!generatedDnaPrompt ? (
              <button 
                onClick={async () => {
                  const currentObj = data.candidates.find(g => g.id === selectedGuide);
                  if (currentObj) {
                    const prompt = await onGenerateExternalDnaPrompt(currentObj.name, currentObj.persona);
                    setGeneratedDnaPrompt(prompt);
                  }
                }}
                disabled={isLoading}
                className="px-6 py-3 bg-white border-2 border-indigo-200 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition-all flex items-center gap-2 shadow-sm"
              >
                {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
                幫我寫生圖提示詞
              </button>
            ) : (
              <div className="space-y-3 relative z-10 animate-in fade-in slide-in-from-bottom-2">
                <textarea 
                  readOnly 
                  value={generatedDnaPrompt}
                  className="w-full h-32 p-4 bg-white border-2 border-indigo-200 rounded-xl text-sm font-mono text-slate-700 focus:outline-none resize-none shadow-inner"
                />
                <div className="flex justify-end items-center gap-3">
                  <span className="text-xs text-teal-600 font-bold bg-teal-50 px-3 py-1.5 rounded-md border border-teal-100">
                    ✅ 已自動為您啟用「基準圖鎖定模式」
                  </span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(generatedDnaPrompt);
                      setIsPromptCopied(true);
                      setTimeout(() => setIsPromptCopied(false), 2000);
                    }}
                    className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-md active:scale-95"
                  >
                    {isPromptCopied ? <CheckCircle size={16} /> : <Copy size={16} />}
                    {isPromptCopied ? '已複製！快去貼給 NANOBANANA' : '複製提示詞'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {/* 👆 魔法按鈕區塊結束 👆 */}
      </div>

      <GuideEditModal 
        isOpen={!!editingCandidate || isCreatingCustom}
        initialData={editingCandidate || { id: 'NEW_CUSTOM', name: '', description: '', gender: '未指定', age: '30s', persona: '專業溫暖', visualDNA: '' }}
        onClose={() => {
          setEditingCandidate(null);
          setIsCreatingCustom(false);
        }}
        onSave={handleSaveGuide}
      />

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 flex justify-center gap-4 z-10 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="px-6 py-3 text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center disabled:opacity-50"
        >
          <ArrowLeft className="mr-2" size={20} />
          返回上一步
        </button>
        <button
          onClick={handleConfirm}
          disabled={!selectedGuide || isLoading || isEditingAny}
          className={`flex-1 max-w-xl py-3 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center ${
            !selectedGuide || isLoading || isEditingAny
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none' 
              : 'bg-teal-600 hover:bg-teal-500 shadow-teal-200'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={20} />
              正在生產核心模組...
            </span>
          ) : isEditingAny ? (
            "請先儲存引導者設定"
          ) : (
            <>
              確認選角，開始生產
              <Play className="ml-2" size={20} fill="currentColor" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Step4Casting;