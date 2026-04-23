import React, { createContext, useContext, useReducer, useCallback } from 'react';
import {
  LeadContextState,
  BasicInfoForm,
  PropertyInfoForm,
  IncomeInfoForm,
  ReferenceForm,
  UploadedFile,
  TabKey,
  TabState,
  TabCompletionState,
} from '../types';

// ── Initial state ──────────────────────────────────────────────────────────────

const initialTabCompletion: TabCompletionState = {
  [TabKey.BasicInfo]: TabState.Active,
  [TabKey.PropertyInfo]: TabState.Locked,
  [TabKey.IncomeInfo]: TabState.Locked,
  [TabKey.PhotoUpload]: TabState.Locked,
  [TabKey.DocumentUpload]: TabState.Locked,
  [TabKey.References]: TabState.Locked,
};

const initialState: LeadContextState = {
  leadId: null,
  quickLeadDone: false,
  tabCompletion: initialTabCompletion,
  basicInfo: {
    salutation: '', firstName: '', middleName: '', lastName: '', dob: '',
    gender: '', maritalStatus: '', fatherName: '', motherName: '',
    spouseName: '', nationality: '', religion: '', panNumber: '',
    aadharNumber: '', email: '', alternateMobile: '',
  },
  propertyInfo: {
    propertyType: '', propertyLocation: '', propertyArea: '', areaUnit: '',
    propertyAge: '', marketValue: '', distressValue: '', ownerName: '',
    ownerContact: '', propertyDescription: '',
  },
  incomeInfo: {
    employmentType: '', companyName: '', designation: '', monthlyIncome: '',
    otherIncome: '', totalExperience: '', currentJobExperience: '',
    bankName: '', accountNumber: '', ifscCode: '',
  },
  photos: [],
  documents: [],
  references: [],
};

// ── Pure: get next tab ─────────────────────────────────────────────────────────

const TAB_ORDER = [
  TabKey.BasicInfo, TabKey.PropertyInfo, TabKey.IncomeInfo,
  TabKey.PhotoUpload, TabKey.DocumentUpload, TabKey.References,
];

const getNextTab = (current: TabKey): TabKey | null => {
  const idx = TAB_ORDER.indexOf(current);
  return idx < TAB_ORDER.length - 1 ? TAB_ORDER[idx + 1] : null;
};

const updateTabCompletion = (
  state: TabCompletionState,
  completedTab: TabKey,
): TabCompletionState => {
  const next = getNextTab(completedTab);
  return {
    ...state,
    [completedTab]: TabState.Completed,
    ...(next ? { [next]: TabState.Active } : {}),
  };
};

// ── Actions ────────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_LEAD_ID'; payload: string }
  | { type: 'SET_QUICK_LEAD_DONE' }
  | { type: 'UPDATE_BASIC_INFO'; payload: Partial<BasicInfoForm> }
  | { type: 'UPDATE_PROPERTY_INFO'; payload: Partial<PropertyInfoForm> }
  | { type: 'UPDATE_INCOME_INFO'; payload: Partial<IncomeInfoForm> }
  | { type: 'COMPLETE_TAB'; payload: TabKey }
  | { type: 'ADD_PHOTO'; payload: UploadedFile }
  | { type: 'REMOVE_PHOTO'; payload: string }
  | { type: 'ADD_DOCUMENT'; payload: UploadedFile }
  | { type: 'REMOVE_DOCUMENT'; payload: string }
  | { type: 'ADD_REFERENCE'; payload: ReferenceForm }
  | { type: 'UPDATE_REFERENCE'; payload: { id: string; data: Partial<ReferenceForm> } }
  | { type: 'REMOVE_REFERENCE'; payload: string }
  | { type: 'RESET' };

// ── Pure reducer ───────────────────────────────────────────────────────────────

const reducer = (state: LeadContextState, action: Action): LeadContextState => {
  switch (action.type) {
    case 'SET_LEAD_ID':
      return { ...state, leadId: action.payload };
    case 'SET_QUICK_LEAD_DONE':
      return { ...state, quickLeadDone: true };
    case 'UPDATE_BASIC_INFO':
      return { ...state, basicInfo: { ...state.basicInfo, ...action.payload } };
    case 'UPDATE_PROPERTY_INFO':
      return { ...state, propertyInfo: { ...state.propertyInfo, ...action.payload } };
    case 'UPDATE_INCOME_INFO':
      return { ...state, incomeInfo: { ...state.incomeInfo, ...action.payload } };
    case 'COMPLETE_TAB':
      return { ...state, tabCompletion: updateTabCompletion(state.tabCompletion, action.payload) };
    case 'ADD_PHOTO':
      return { ...state, photos: [...state.photos, action.payload] };
    case 'REMOVE_PHOTO':
      return { ...state, photos: state.photos.filter((p) => p.id !== action.payload) };
    case 'ADD_DOCUMENT':
      return { ...state, documents: [...state.documents, action.payload] };
    case 'REMOVE_DOCUMENT':
      return { ...state, documents: state.documents.filter((d) => d.id !== action.payload) };
    case 'ADD_REFERENCE':
      return { ...state, references: [...state.references, action.payload] };
    case 'UPDATE_REFERENCE':
      return {
        ...state,
        references: state.references.map((r) =>
          r.id === action.payload.id ? { ...r, ...action.payload.data } : r,
        ),
      };
    case 'REMOVE_REFERENCE':
      return { ...state, references: state.references.filter((r) => r.id !== action.payload) };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

// ── Context ────────────────────────────────────────────────────────────────────

interface LeadContextValue {
  state: LeadContextState;
  setLeadId: (id: string) => void;
  setQuickLeadDone: () => void;
  updateBasicInfo: (d: Partial<BasicInfoForm>) => void;
  updatePropertyInfo: (d: Partial<PropertyInfoForm>) => void;
  updateIncomeInfo: (d: Partial<IncomeInfoForm>) => void;
  completeTab: (tab: TabKey) => void;
  addPhoto: (f: UploadedFile) => void;
  removePhoto: (id: string) => void;
  addDocument: (f: UploadedFile) => void;
  removeDocument: (id: string) => void;
  addReference: (r: ReferenceForm) => void;
  updateReference: (id: string, d: Partial<ReferenceForm>) => void;
  removeReference: (id: string) => void;
  resetLead: () => void;
}

const LeadContext = createContext<LeadContextValue | null>(null);

export const LeadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setLeadId = useCallback((id: string) => dispatch({ type: 'SET_LEAD_ID', payload: id }), []);
  const setQuickLeadDone = useCallback(() => dispatch({ type: 'SET_QUICK_LEAD_DONE' }), []);
  const updateBasicInfo = useCallback((d: Partial<BasicInfoForm>) => dispatch({ type: 'UPDATE_BASIC_INFO', payload: d }), []);
  const updatePropertyInfo = useCallback((d: Partial<PropertyInfoForm>) => dispatch({ type: 'UPDATE_PROPERTY_INFO', payload: d }), []);
  const updateIncomeInfo = useCallback((d: Partial<IncomeInfoForm>) => dispatch({ type: 'UPDATE_INCOME_INFO', payload: d }), []);
  const completeTab = useCallback((tab: TabKey) => dispatch({ type: 'COMPLETE_TAB', payload: tab }), []);
  const addPhoto = useCallback((f: UploadedFile) => dispatch({ type: 'ADD_PHOTO', payload: f }), []);
  const removePhoto = useCallback((id: string) => dispatch({ type: 'REMOVE_PHOTO', payload: id }), []);
  const addDocument = useCallback((f: UploadedFile) => dispatch({ type: 'ADD_DOCUMENT', payload: f }), []);
  const removeDocument = useCallback((id: string) => dispatch({ type: 'REMOVE_DOCUMENT', payload: id }), []);
  const addReference = useCallback((r: ReferenceForm) => dispatch({ type: 'ADD_REFERENCE', payload: r }), []);
  const updateReference = useCallback((id: string, d: Partial<ReferenceForm>) => dispatch({ type: 'UPDATE_REFERENCE', payload: { id, data: d } }), []);
  const removeReference = useCallback((id: string) => dispatch({ type: 'REMOVE_REFERENCE', payload: id }), []);
  const resetLead = useCallback(() => dispatch({ type: 'RESET' }), []);

  return (
    <LeadContext.Provider value={{
      state, setLeadId, setQuickLeadDone, updateBasicInfo, updatePropertyInfo,
      updateIncomeInfo, completeTab, addPhoto, removePhoto, addDocument,
      removeDocument, addReference, updateReference, removeReference, resetLead,
    }}>
      {children}
    </LeadContext.Provider>
  );
};

export const useLeadStore = (): LeadContextValue => {
  const ctx = useContext(LeadContext);
  if (!ctx) throw new Error('useLeadStore must be inside LeadProvider');
  return ctx;
};
