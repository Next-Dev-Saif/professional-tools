'use client';

import { useDocumentStore } from '@/store/documentStore';
import { Input } from '@/components/core/Input';
import { Select } from '@/components/core/Select';
import { Textarea } from '@/components/core/Textarea';
import { Palette, Type, Move, Maximize, FileText } from 'lucide-react';

export function PropertySidebar() {
  const { 
    elements, 
    selectedElementId, 
    updateElement, 
    globalSettings, 
    updateGlobalSettings 
  } = useDocumentStore();

  const selectedElement = elements.find(el => el.id === selectedElementId);

  return (
    <aside className="w-[320px] bg-surface/50 border-l border-border/50 backdrop-blur-md shrink-0 flex flex-col h-full">
      <div className="p-5 border-b border-border/50">
        <h2 className="font-semibold text-[15px]">Properties</h2>
        <p className="text-xs text-foreground/60 mt-1">
          {selectedElement ? 'Editing Element' : 'Global Settings'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {selectedElement ? (
          // Element Properties
          <div className="space-y-5 animate-in fade-in duration-200">
            {selectedElement.type === 'text' && (
              <Textarea
                label="Text Content"
                value={selectedElement.content || ''}
                onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                className="min-h-[100px]"
              />
            )}

            {selectedElement.type === 'qr' && (
              <Input
                label="QR Code Destination URL"
                value={selectedElement.content || ''}
                onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
              />
            )}

            {selectedElement.type === 'stamp' && (
              <Input
                label="Stamp Text"
                value={selectedElement.content || ''}
                onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
              />
            )}

            {selectedElement.type === 'image' && (
              <Input
                label="Image URL"
                value={selectedElement.content || ''}
                onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
              />
            )}

            {selectedElement.type === 'html' && (
              <Textarea
                label="Raw HTML"
                value={selectedElement.content || ''}
                onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                className="min-h-[200px] font-mono text-xs"
              />
            )}

            <div className="space-y-3 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 text-foreground/80 text-sm font-medium">
                <Move className="w-4 h-4" /> Position
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  label="X (px)"
                  value={selectedElement.x}
                  onChange={(e) => updateElement(selectedElement.id, { x: Number(e.target.value) })}
                />
                <Input
                  type="number"
                  label="Y (px)"
                  value={selectedElement.y}
                  onChange={(e) => updateElement(selectedElement.id, { y: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 text-foreground/80 text-sm font-medium">
                <Maximize className="w-4 h-4" /> Size
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  label="Width"
                  value={selectedElement.width}
                  onChange={(e) => updateElement(selectedElement.id, { width: Number(e.target.value) })}
                />
                <Input
                  type="number"
                  label="Height"
                  value={selectedElement.height}
                  onChange={(e) => updateElement(selectedElement.id, { height: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border/50">
              <div className="flex items-center justify-between text-foreground/80 text-sm font-medium">
                <span>Layering (Z-Index)</span>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">{selectedElement.zIndex || 0}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => useDocumentStore.getState().sendBackward(selectedElement.id)}
                  className="py-2 bg-surface hover:bg-surface/80 border border-border/50 rounded-xl text-xs font-medium transition-colors"
                >
                  Send Backward
                </button>
                <button 
                  onClick={() => useDocumentStore.getState().bringForward(selectedElement.id)}
                  className="py-2 bg-surface hover:bg-surface/80 border border-border/50 rounded-xl text-xs font-medium transition-colors"
                >
                  Bring Forward
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-border/50">
              <button 
                onClick={() => useDocumentStore.getState().removeElement(selectedElement.id)}
                className="w-full py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-medium rounded-xl text-sm transition-colors border border-red-500/20 flex justify-center items-center gap-2"
              >
                Delete Element
              </button>
            </div>
          </div>
        ) : (
          // Global Properties
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-foreground/80 text-sm font-medium">
                <Palette className="w-4 h-4" /> Brand Identity
              </div>
              <div className="flex items-center gap-3">
                <input name="globalSettings.primaryColor" 
                  type="color" 
                  value={globalSettings.primaryColor}
                  onChange={(e) => updateGlobalSettings({ primaryColor: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer border border-border/50 bg-transparent"
                />
                <div className="flex-1">
                  <Input
                    value={globalSettings.primaryColor}
                    onChange={(e) => updateGlobalSettings({ primaryColor: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 text-foreground/80 text-sm font-medium">
                <Type className="w-4 h-4" /> Typography
              </div>
              <Select
                options={[
                  { value: 'Inter, sans-serif', label: 'Inter (Modern)' },
                  { value: 'Georgia, serif', label: 'Georgia (Classic)' },
                  { value: 'monospace', label: 'Monospace (Code)' },
                ]}
                value={globalSettings.fontFamily}
                onChange={(e) => updateGlobalSettings({ fontFamily: e.target.value })}
              />
            </div>
            
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm text-foreground/70 flex gap-3 mt-4">
               <FileText className="w-5 h-5 text-primary shrink-0" />
               <p>Click on the canvas or drag an element to select it and edit its properties.</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
