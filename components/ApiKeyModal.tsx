// src/components/ApiKeyModal.tsx
import React, { useState } from 'react';
import { X, Key, Save, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';

export const ApiKeyModal = () => {
  const { apiKeys, setApiKeys, showApiKeyModal, setShowApiKeyModal } = useWorkflow();
  const [inputValue, setInputValue] = useState('');
  const [showConfirm, setShowConfirm] = useState(false); // 🌟 二次確認狀態

  const handleClear = () => {
    setApiKeys([]);
    setShowConfirm(false);
  };

  const handleSave = () => {
    const lines = inputValue.split('\n').map(l => l.trim()).filter(l => l.length > 5);
    if (lines.length === 0) return;
    const newKeys = Array.from(new Set([...apiKeys, ...lines]));
    setApiKeys(newKeys);
    setInputValue('');
  };

  const removeKey = (index: number) => {
    const updated = apiKeys.filter((_, i) => i !== index);
    setApiKeys(updated);
  };

  if (!showApiKeyModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <Key className="text-blue-600" size={20} />
            <h2 className="text-lg font-black text-slate-800">金鑰管理中心</h2>
          </div>
          <button onClick={() => setShowApiKeyModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 已儲存清單 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-400">金鑰數量 ({apiKeys.length})</span>
              {apiKeys.length > 0 && (
                !showConfirm ? (
                  <button onClick={() => setShowConfirm(true)} className="text-red-500 text-[10px] hover:text-red-700 font-bold px-2 py-1 hover:bg-red-50 rounded-lg">全部清空</button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={handleClear} className="text-red-600 font-bold text-[10px] bg-red-50 px-2 py-0.5 rounded">確定</button>
                    <button onClick={() => setShowConfirm(false)} className="text-slate-400 text-[10px] bg-slate-100 px-2 py-0.5 rounded">取消</button>
                  </div>
                )
              )}
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {apiKeys.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-xs">
                  尚未儲存任何金鑰，請於下方新增
                </div>
              ) : (
                apiKeys.map((key, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-100 group">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={14} className="text-blue-500" />
                      <code className="text-[10px] text-blue-700 font-mono">
                        {key.substring(0, 10)}••••••••{key.substring(key.length - 4)}
                      </code>
                    </div>
                    <button onClick={() => removeKey(idx)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-white rounded-lg transition-all shadow-sm">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 mb-2 uppercase">新增付費金鑰 (支援多行)</label>
            <textarea
              className="w-full h-24 p-4 text-xs font-mono border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none resize-none bg-slate-50"
              placeholder="請貼上您的 Gemini API Key..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <p className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
              <AlertCircle size={10} /> 系統將自動輪替使用多組金鑰以維持穩定。
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={!inputValue.trim()}
            className="w-full py-4 bg-slate-900 hover:bg-black disabled:bg-slate-200 text-white rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-xl"
          >
            <Save size={18} />
            確認儲存並更新
          </button>
        </div>
      </div>
    </div>
  );
};
