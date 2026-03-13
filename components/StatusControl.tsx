import React from 'react';
import { AppStep } from '../types';
import { VMAX_KERNEL_VERSION } from '../constants';
import { 
  FileDown, Scan, Atom, GitBranch, 
  Palette, UserCheck, Zap, RefreshCw, CheckCircle2 
} from 'lucide-react';

interface StatusControlProps {
  step: AppStep;
  statusText?: string;
  isProcessing: boolean;
  onReset: () => void;
}

const steps = [
    { id: AppStep.STEP_1_INPUT, label: '文本匯入', icon: FileDown },
    { id: AppStep.STEP_2_BASIC, label: '基礎定位', icon: Scan },
    { id: AppStep.STEP_3_DEEP_VOCAB, label: '語文輻射', icon: Atom },
    { id: AppStep.STEP_3_DEEP_SEGMENTS, label: '邏輯解構', icon: GitBranch },
    { id: AppStep.STEP_4_VISUALS, label: '視覺包裝', icon: Palette },
    { id: AppStep.STEP_5_CASTING, label: '靈魂選角', icon: UserCheck },
    { id: AppStep.STEP_6_OUTPUT, label: '核心產出', icon: Zap },
];

const StatusControl: React.FC<StatusControlProps> = ({ step, statusText, isProcessing, onReset }) => {
  
  return (
    <>
        {/* Mobile Header */}
        <div className="md:hidden w-full bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-2 font-bold text-slate-800">
                <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                    <Zap size={16} fill="currentColor" />
                </div>
                <span className="tracking-tight">V-MAX</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
                <button 
                    onClick={onReset}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Reset Project"
                >
                    <RefreshCw size={16} />
                </button>
                <span className="text-slate-500 font-medium">
                    {steps.find(s => s.id === step)?.label || "SYSTEM"}
                </span>
                {isProcessing && <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />}
            </div>
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 flex-shrink-0 bg-white border-r border-slate-100 h-screen sticky top-0 z-40">
          {/* Header */}
          <div className="p-6 pb-8 flex justify-between items-start">
            <div className="flex items-center gap-3 text-slate-800 font-bold tracking-tight">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-teal-200">
                    <Zap size={20} fill="currentColor" />
                </div>
                <div className="flex flex-col">
                    <span className="text-lg leading-none">V-MAX</span>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">Omni-Architect</span>
                </div>
            </div>
          </div>

          {/* Steps Navigation */}
          <div className="flex-1 overflow-y-auto px-4 space-y-1">
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workflow</div>
                <button 
                    onClick={onReset}
                    className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest flex items-center gap-1 transition-colors"
                    title="Reset Project"
                >
                    <RefreshCw size={10} />
                    RESET
                </button>
            </div>
            {steps.map((s, index) => {
                const isActive = step === s.id;
                const isCompleted = step > s.id;
                
                return (
                    <div 
                        key={s.id}
                        className={`
                            group flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative
                            ${isActive 
                                ? 'bg-teal-50 text-teal-800' 
                                : isCompleted 
                                    ? 'text-slate-600 hover:bg-slate-50' 
                                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                            }
                        `}
                    >
                        {/* Active Indicator Bar */}
                        {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-teal-500 rounded-r-full" />
                        )}

                        <div className={`
                            relative flex items-center justify-center w-6 h-6 rounded-full transition-colors
                            ${isActive ? 'text-teal-600' : isCompleted ? 'text-teal-500' : 'text-slate-300 group-hover:text-slate-400'}
                        `}>
                            {isCompleted ? (
                                <CheckCircle2 size={18} />
                            ) : (
                                <s.icon size={18} />
                            )}
                        </div>
                        
                        <span className={isActive ? 'font-semibold' : ''}>{s.label}</span>
                        
                        {isActive && isProcessing && (
                            <div className="ml-auto flex space-x-1">
                                <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce"></div>
                            </div>
                        )}
                    </div>
                );
            })}
          </div>

          {/* Status Footer */}
          <div className="p-4 m-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">系統狀態</span>
                <span className="text-[10px] font-mono text-slate-300">V-MAX 旗艦版 {VMAX_KERNEL_VERSION}</span>
            </div>
            <div className="flex items-center gap-2.5">
                <div className="relative flex h-2.5 w-2.5">
                  {isProcessing && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>}
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isProcessing ? 'bg-teal-500' : 'bg-emerald-500'}`}></span>
                </div>
                <span className={`text-xs font-medium truncate ${isProcessing ? 'text-teal-700' : 'text-slate-600'}`}>
                    {isProcessing ? (statusText || "正在運算中...") : "系統就緒，請指示"}
                </span>
            </div>
          </div>
        </aside>
    </>
  );
};

export default StatusControl;