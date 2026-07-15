import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { temporal } from 'zundo';

export type ElementType = 'text' | 'image' | 'shape' | 'stamp' | 'signature' | 'qr' | 'html';

export interface VisualElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  style?: Record<string, any>;
  zIndex: number;
}

export interface ClientData {
  id: string;
  name: string;
  email: string;
  address: string;
}

interface DocumentState {
  // Canvas Elements
  elements: VisualElement[];
  selectedElementId: string | null;
  
  // Global Styling
  globalSettings: {
    primaryColor: string;
    fontFamily: string;
    backgroundColor: string;
  };

  // Actions
  addElement: (element: Omit<VisualElement, 'id'>) => void;
  updateElement: (id: string, updates: Partial<VisualElement>) => void;
  removeElement: (id: string) => void;
  setSelectedElement: (id: string | null) => void;
  updateGlobalSettings: (settings: Partial<DocumentState['globalSettings']>) => void;
  
  // Layering
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  setElements: (elements: VisualElement[]) => void;
}

export const useDocumentStore = create<DocumentState>()(
  temporal(
    (set) => ({
      elements: [],
      selectedElementId: null,
      globalSettings: {
        primaryColor: '#f97316', // orange-500
        fontFamily: 'Inter, sans-serif',
        backgroundColor: '#ffffff',
      },

      setElements: (elements) => set({ elements }),

      addElement: (element) => set((state) => {
        const newId = crypto.randomUUID();
        // Automatically place new element at the highest z-index
        const maxZ = Math.max(0, ...state.elements.map(e => e.zIndex || 0));
        return {
          elements: [...state.elements, { ...element, id: newId, zIndex: maxZ + 1 }],
          selectedElementId: newId,
        };
      }),

      updateElement: (id, updates) => set((state) => ({
        elements: state.elements.map((el) => 
          el.id === id ? { ...el, ...updates } : el
        )
      })),

      removeElement: (id) => set((state) => ({
        elements: state.elements.filter((el) => el.id !== id),
        selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
      })),

      bringForward: (id) => set((state) => {
        const maxZ = Math.max(0, ...state.elements.map(e => e.zIndex || 0));
        return {
          elements: state.elements.map(el => el.id === id ? { ...el, zIndex: maxZ + 1 } : el)
        };
      }),

      sendBackward: (id) => set((state) => {
        const minZ = Math.min(0, ...state.elements.map(e => e.zIndex || 0));
        return {
          elements: state.elements.map(el => el.id === id ? { ...el, zIndex: minZ - 1 } : el)
        };
      }),

      setSelectedElement: (id) => set({ selectedElementId: id }),
      
      updateGlobalSettings: (updates) => set((state) => ({
        globalSettings: { ...state.globalSettings, ...updates }
      })),
    }),
    {
      partialize: (state) => {
        // Don't track selection state in undo history
        const { selectedElementId, ...rest } = state;
        return rest;
      },
    }
  )
);

// Separate CRM store for persistence across different documents
interface CRMState {
  savedClients: ClientData[];
  saveClient: (client: Omit<ClientData, 'id'>) => void;
  removeClient: (id: string) => void;
}

export const useCRMStore = create<CRMState>()(
  persist(
    (set) => ({
      savedClients: [],
      saveClient: (client) => set((state) => ({
        savedClients: [...state.savedClients, { ...client, id: crypto.randomUUID() }]
      })),
      removeClient: (id) => set((state) => ({
        savedClients: state.savedClients.filter((c) => c.id !== id)
      })),
    }),
    {
      name: 'hephaestus-crm-storage',
    }
  )
);
