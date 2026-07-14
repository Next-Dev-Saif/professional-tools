import { create } from 'zustand';

export type LineItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number;
};

export type InvoiceTemplate = 'minimal' | 'modern' | 'professional';

interface InvoiceState {
  senderName: string;
  senderAddress: string;
  senderEmail: string;
  clientName: string;
  clientAddress: string;
  clientEmail: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  template: InvoiceTemplate;
  items: LineItem[];
  taxRate: number;
  
  // Actions
  updateField: (field: string, value: any) => void;
  addItem: () => void;
  updateItem: (id: string, field: keyof LineItem, value: any) => void;
  removeItem: (id: string) => void;
}

export const useInvoiceStore = create<InvoiceState>((set) => ({
  senderName: 'Hephaestus Engineering',
  senderAddress: 'Forge Level 7\nMount Olympus, GR 10001',
  senderEmail: 'billing@hephaestus.dev',
  clientName: 'Client Organization',
  clientAddress: '123 Business Avenue\nMetropolis, NY 10001',
  clientEmail: 'accounts@client.org',
  invoiceNumber: 'INV-2026-001',
  date: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  template: 'modern',
  items: [
    { id: '1', description: 'Senior Web Engineering Services', quantity: 40, rate: 150 },
  ],
  taxRate: 0, 

  updateField: (field, value) => set({ [field]: value }),
  
  addItem: () => set((state) => ({
    items: [...state.items, { id: crypto.randomUUID(), description: '', quantity: 1, rate: 0 }]
  })),
  
  updateItem: (id, field, value) => set((state) => ({
    items: state.items.map(item => item.id === id ? { ...item, [field]: value } : item)
  })),
  
  removeItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id)
  }))
}));
