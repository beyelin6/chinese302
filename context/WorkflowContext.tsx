// 檔案路徑: src/context/WorkflowContext.tsx

import React, { createContext, useContext, useReducer, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { AppStep, WorkflowState, WorkflowAction } from '../types';
import { workflowReducer, initialState } from './workflowReducer';
import { saveToDB, loadFromDB } from '../utils.ts'; 
import { setApiKeys as setServiceApiKeys } from '../services/gemini';

// 1. 拆分 Context，確保 Dispatch 永遠不會改變引用的地址
const WorkflowStateContext = createContext<WorkflowState | undefined>(undefined);
const WorkflowDispatchContext = createContext<React.Dispatch<WorkflowAction> | undefined>(undefined);

export const WorkflowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(workflowReducer, initialState);

  // 初始化持久化
  useEffect(() => {
    const initPersistence = async () => {
      const saved = await loadFromDB('vmax_last_state');
      if (saved) dispatch({ type: 'RESTORE_STATE', payload: saved });
    };
    initPersistence();
  }, []);

  // 🌟 [重構] 獨立的狀態儲存邏輯 (Debounced Persistence)
  const saveState = useCallback(() => {
    if (state.currentStep > AppStep.IDLE || state.analysisData) {
      // 過濾掉不需要持久化的暫態 (UI State)
      const { isLoading, error, loadingStatus, apiKeys, showApiKeyModal, ...persistentData } = state;
      saveToDB('vmax_last_state', persistentData).catch(e => console.error("[V-MAX Kernel] IDB Save Error:", e));
    }
  }, [state]);

  // 日常防抖儲存
  useEffect(() => {
    const timer = setTimeout(saveState, 1500);
    return () => clearTimeout(timer);
  }, [saveState]);

  // 邊界防禦：分頁關閉、重整或隱藏時強制觸發急救存檔
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') saveState();
    };
    
    window.addEventListener('beforeunload', saveState);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', saveState);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [saveState]);

  // 2. 只有在 state 真正變動時才更新，Dispatch 引用保持不變
  const stateValue = useMemo(() => state, [state]);

  return (
    <WorkflowStateContext.Provider value={stateValue}>
      <WorkflowDispatchContext.Provider value={dispatch}>
        {children}
      </WorkflowDispatchContext.Provider>
    </WorkflowStateContext.Provider>
  );
};

// --- 🌟 高性能 Selector Hooks ---

/**
 * 僅獲取 Dispatch，組件使用此 Hook 觸發 Action 時，不會因為 State 變動而重繪
 */
export const useWorkflowDispatch = () => {
  const context = useContext(WorkflowDispatchContext);
  if (!context) throw new Error("useWorkflowDispatch must be used within WorkflowProvider");
  return context;
};

/**
 * 獲取完整狀態 (謹慎使用)
 */
export const useWorkflowState = () => {
  const context = useContext(WorkflowStateContext);
  if (!context) throw new Error("useWorkflowState must be used within WorkflowProvider");
  return context;
};

/**
 * 🌟 專用 Selector：僅訂閱 Loading 狀態
 * 這能確保只有進度條會重繪，下方的內容區域不會動！
 */
export const useWorkflowLoading = () => {
  const state = useWorkflowState();
  return useMemo(() => ({
    isLoading: state.isLoading,
    loadingStatus: state.loadingStatus,
    error: state.error
  }), [state.isLoading, state.loadingStatus, state.error]);
};

/**
 * 🌟 專用 Selector：獲取核心數據
 */
export const useWorkflowData = () => {
  const state = useWorkflowState();
  return useMemo(() => state.analysisData, [state.analysisData]);
};

/**
 * 兼容舊版 Hook (內部已優化)
 */
export const useWorkflowContext = () => {
  const state = useWorkflowState();
  const dispatch = useWorkflowDispatch();
  return useMemo(() => ({ state, dispatch }), [state, dispatch]);
};

/**
 * 🌟 提供給 ApiKeyModal 使用的 Hook
 */
export const useWorkflow = () => {
  const state = useWorkflowState();
  const dispatch = useWorkflowDispatch();
  
  const setApiKeys = useCallback((keys: string[]) => {
    setServiceApiKeys(keys); // 同步到服務
    dispatch({ type: 'SET_API_KEYS', payload: keys });
  }, [dispatch]);

  const setShowApiKeyModal = useCallback((show: boolean) => {
    dispatch({ type: 'SET_SHOW_API_KEY_MODAL', payload: show });
  }, [dispatch]);

  return useMemo(() => ({
    ...state,
    dispatch,
    apiKeys: state.apiKeys,
    setApiKeys,
    showApiKeyModal: state.showApiKeyModal,
    setShowApiKeyModal
  }), [state, dispatch, setApiKeys, setShowApiKeyModal]);
};
