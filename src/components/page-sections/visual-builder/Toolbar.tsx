'use client';

import { useState } from 'react';
import { useDocumentStore } from '@/store/documentStore';
import { Button } from '@/components/core/Button';
import { Undo, Redo, Download, Printer, Plus, Trash2, QrCode, Stamp, Image as ImageIcon, Square, Sparkles } from 'lucide-react';
import { useStore } from 'zustand';
import { AIPromptModal } from './AIPromptModal';

export function Toolbar() {
  const { addElement, selectedElementId, removeElement } = useDocumentStore();
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  
  // Zundo temporal state for undo/redo
  const undo = useDocumentStore.temporal.getState().undo;
  const redo = useDocumentStore.temporal.getState().redo;
  const pastStates = useStore(useDocumentStore.temporal, state => state.pastStates);
  const futureStates = useStore(useDocumentStore.temporal, state => state.futureStates);

  const handleAddElement = (type: 'text' | 'qr' | 'stamp' | 'image' | 'shape') => {
    let width = 200, height = 50, content = '';
    
    if (type === 'qr') {
      width = 150; height = 150; content = 'https://example.com';
    } else if (type === 'stamp') {
      width = 200; height = 80; content = 'APPROVED';
    } else if (type === 'shape') {
      width = 150; height = 150;
    } else if (type === 'image') {
      width = 200; height = 200; content = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80';
    } else {
      content = 'Double click to edit text';
    }

    addElement({
      type,
      x: 50 + Math.random() * 50,
      y: 50 + Math.random() * 50,
      width,
      height,
      content,
      zIndex: 10,
    });
  };

  const handlePrint = () => window.print();

  return (
    <>
      <header className="h-16 border-b border-border/50 bg-surface/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 print:hidden overflow-x-auto">
        <div className="flex items-center gap-4 shrink-0">
          <h1 className="font-bold tracking-tight flex items-center gap-2">
            Visual Document Builder
            <button 
              onClick={() => setIsAIModalOpen(true)}
              className="ml-3 bg-gradient-to-r from-purple-500 to-primary text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:opacity-90 transition-opacity"
              title="Generate Layout with AI"
            >
              <Sparkles className="w-3.5 h-3.5" /> AI Generate
            </button>
          </h1>
          <div className="w-px h-6 bg-border/50 mx-2" />
        
        <div className="flex gap-1">
          <Button variant="secondary" className="!p-2" onClick={() => undo()} disabled={pastStates.length === 0} title="Undo (Ctrl+Z)">
            <Undo className="w-4 h-4" />
          </Button>
          <Button variant="secondary" className="!p-2" onClick={() => redo()} disabled={futureStates.length === 0} title="Redo (Ctrl+Y)">
            <Redo className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {selectedElementId && (
          <Button variant="secondary" onClick={() => removeElement(selectedElementId)} className="text-red-500 hover:text-red-600 border-transparent" title="Delete Selected">
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
        <div className="w-px h-6 bg-border/50 mx-1" />
        
        {/* Element Creators */}
        <div className="flex items-center gap-1 bg-background/50 rounded-lg p-1 border border-border/50">
          <Button variant="secondary" className="!p-2" onClick={() => handleAddElement('text')} title="Add Text">
            <Plus className="w-4 h-4" />
          </Button>
          <Button variant="secondary" className="!p-2" onClick={() => handleAddElement('qr')} title="Add QR Code">
            <QrCode className="w-4 h-4" />
          </Button>
          <Button variant="secondary" className="!p-2" onClick={() => handleAddElement('stamp')} title="Add Stamp">
            <Stamp className="w-4 h-4" />
          </Button>
          <Button variant="secondary" className="!p-2" onClick={() => handleAddElement('image')} title="Add Image">
            <ImageIcon className="w-4 h-4" />
          </Button>
          <Button variant="secondary" className="!p-2" onClick={() => handleAddElement('shape')} title="Add Shape">
            <Square className="w-4 h-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border/50 mx-1" />
        <Button variant="secondary" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" /> Print
        </Button>
        <Button variant="primary" onClick={handlePrint}>
          <Download className="w-4 h-4 mr-2" /> Export PDF
        </Button>
      </div>
    </header>
      <AIPromptModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
    </>
  );
}
