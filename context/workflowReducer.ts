// 檔案路徑: src/context/workflowReducer.ts

import { AppStep, WorkflowState, WorkflowAction } from '../types';
import { getApiKeys } from '../services/gemini';

export const initialState: WorkflowState = {
  currentStep: AppStep.STEP_1_INPUT,
  isLoading: false,
  loadingStatus: null,
  error: null,
  basicAnalysisResult: null,
  analysisData: null,
  deepVocabResult: null,
  deepSegmentsResult: null,
  visualResult: null,
  castingResult: null,
  outputScript: null,
  outputWorksheet: null,
  outputAssessment: null,
  outputKb: null,
  outputNotebookLMGuide: null,
  outputGamifiedQuiz: null,
  apiKeys: getApiKeys(),
  showApiKeyModal: false,
};

export function workflowReducer(state: WorkflowState, action: WorkflowAction): WorkflowState {
  switch (action.type) {
    case 'RESTORE_STATE': 
      return { ...action.payload, apiKeys: getApiKeys() };
    case 'IMPORT_SNAPSHOT':
      return { 
        ...initialState, 
        ...action.payload, 
        isLoading: false, 
        error: null,
        apiKeys: state.apiKeys
      };
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_LOADING': 
      return { ...state, isLoading: action.payload };
    case 'SET_LOADING_STATUS':
      return { ...state, loadingStatus: action.payload };
    case 'SET_ERROR': 
      return { ...state, error: action.payload };
    case 'SET_BASIC_RESULT':
      return { ...state, basicAnalysisResult: action.payload.basicAnalysisResult, analysisData: action.payload.analysisData };
    case 'SET_VOCAB_RESULT':
      return { ...state, deepVocabResult: action.payload };
    case 'SET_SEGMENTS_RESULT':
      return { ...state, deepSegmentsResult: action.payload };
    case 'SET_DEEP_SEGMENTS_RESULT':
      return { ...state, deepSegmentsResult: action.payload };
    case 'SET_VISUAL_RESULT':
      return { ...state, visualResult: action.payload };
    case 'SET_CASTING_RESULT':
      return { ...state, castingResult: action.payload };
    case 'SET_OUTPUTS': 
      return { ...state, ...action.payload };
    case 'RESET_WORKFLOW': 
      return { ...initialState, apiKeys: state.apiKeys };
    case 'SET_API_KEYS':
      return { ...state, apiKeys: action.payload };
    case 'SET_SHOW_API_KEY_MODAL':
      return { ...state, showApiKeyModal: action.payload };
    case 'ADD_LANGUAGE_ACTIVITIES':
      if (!state.analysisData) return state;
      return {
        ...state,
        analysisData: {
          ...state.analysisData,
          languageActivities: [
            ...(state.analysisData.languageActivities || []),
            ...action.payload
          ]
        }
      };
    default: 
      return state;
  }
}
