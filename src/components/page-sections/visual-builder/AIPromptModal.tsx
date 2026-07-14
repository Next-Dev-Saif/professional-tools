'use client';

import { useState, useEffect } from 'react';
import { useDocumentStore } from '@/store/documentStore';
import { Button } from '@/components/core/Button';
import { Textarea } from '@/components/core/Textarea';
import { Sparkles, X, Loader2 } from 'lucide-react';

interface AIPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LOADING_MESSAGES = [
  "Hephaestus is warming the forge...",
  "Hammering the layout...",
  "Pouring molten pixels...",
  "Cooling the design...",
  "Applying UI/UX polish..."
];

export function AIPromptModal({ isOpen, onClose }: AIPromptModalProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingMsgIdx(0);
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/generate-layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.html) {
        // DOM Measurement Engine
        const stagingArea = document.createElement('div');
        stagingArea.style.position = 'absolute';
        stagingArea.style.left = '-9999px';
        stagingArea.style.top = '-9999px';
        stagingArea.style.width = '794px';
        // Remove minHeight so it flows naturally to calculate true heights
        stagingArea.style.backgroundColor = '#ffffff';
        stagingArea.innerHTML = data.html;
        document.body.appendChild(stagingArea);

        // Wait for browser to paint and calculate styles, plus images to load
        await new Promise(resolve => setTimeout(resolve, 300));

        const nodes = Array.from(stagingArea.querySelectorAll('[id^="hephaestus-"]'));
        const newElements: any[] = [];
        
        nodes.forEach((node, index) => {
          const el = node as HTMLElement;
          
          // Check if this node is nested inside another hephaestus block. If so, skip it to prevent double-layers.
          const parentHephaestus = el.parentElement?.closest('[id^="hephaestus-"]');
          if (parentHephaestus) return;

          const rect = el.getBoundingClientRect();
          const stagingRect = stagingArea.getBoundingClientRect();
          
          const x = rect.left - stagingRect.left;
          const y = rect.top - stagingRect.top;
          // Use offsetHeight/offsetWidth for more reliable inner dimensions if borders exist
          const width = el.offsetWidth || rect.width;
          const height = el.offsetHeight || rect.height;

          if (width > 0 && height > 0) {
            newElements.push({
              id: crypto.randomUUID(),
              type: 'html',
              x: Math.round(x),
              y: Math.round(y),
              width: Math.round(width),
              height: Math.round(height),
              content: el.outerHTML,
              zIndex: 10 + index,
            });
          }
        });

        document.body.removeChild(stagingArea);

        if (newElements.length > 0) {
          useDocumentStore.getState().setElements(newElements);
          onClose();
          setPrompt('');
        } else {
          setError('The AI generated an HTML document, but failed to include identifiable blocks.');
        }

      } else {
        setError(data.error || 'Failed to generate layout.');
      }
    } catch (e) {
      setError('An error occurred while contacting the AI service.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border/50 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-border/50 flex items-center justify-between bg-gradient-to-r from-purple-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg">AI Layout Generator</h2>
              <p className="text-xs text-foreground/60">Powered by Cohere</p>
            </div>
          </div>
          <button onClick={onClose} disabled={isLoading} className="p-2 hover:bg-foreground/5 rounded-full text-foreground/60 transition-colors disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <Textarea
            label="What are you building?"
            placeholder="e.g. A sleek, modern invoice template for a freelance web developer, including a header, a table for items, and a signature block at the bottom."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px]"
            disabled={isLoading}
          />

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={onClose} className="flex-1" disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleGenerate} 
              className="flex-1 bg-gradient-to-r from-purple-500 to-primary hover:opacity-90 border-0 text-white transition-all"
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> 
                  <span className="animate-pulse">{LOADING_MESSAGES[loadingMsgIdx]}</span>
                </div>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" /> Generate Design
                </>
              )}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
