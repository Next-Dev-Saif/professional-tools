'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Loader2, Send, Bot } from 'lucide-react';
import Image from 'next/image';
import { useAgent } from '@/context/AgentContext';

export function GlobalAIAgent() {
  const { activePageName, activeSchema, onFill } = useAgent();
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If no page is registered with the agent, we don't show the FAB.
  if (!activePageName || !onFill) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/agent/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolId: 'form-filler',
          parameters: {
            prompt: prompt,
            schemaDescription: activeSchema,
          },
          buffered: true,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to generate response');
      }

      const data = await res.json();

      let parsedContent;
      try {
        // The API returns { content: "{\"field\": \"value\"}" }
        // Cohere sometimes wraps JSON in markdown blocks
        const cleanContent = data.content.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/```$/, '').trim();
        parsedContent = JSON.parse(cleanContent);
      } catch (err) {
        throw new Error('Received invalid JSON format from AI');
      }

      onFill(parsedContent);
      setPrompt('');
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-[380px] bg-background/80 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.12)] rounded-3xl overflow-hidden"
          >
            <div className="p-5 border-b border-border/50 flex justify-between items-center ">
              <div className="flex items-center gap-3">
                <div className="bg-primary p-2 rounded-full shadow-inner">
                  <img src="/logo.svg" alt="Agent Icon" width={16} height={16} className="h-8 w-8 rounded-full" />
                </div>
                <h3 className="font-bold text-sm tracking-wide text-primary">
                  Autofill {activePageName}
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-foreground/50 hover:text-foreground hover:bg-foreground/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5">
              <div className="mb-4">
                <p className="text-[13px] text-foreground/60 leading-relaxed font-medium">
                  I can automatically build this <strong className="text-primary">{activePageName}</strong> for you. Describe what you need in plain English below.
                </p>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g. Create an invoice for Acme Corp for 50 hours of web dev..."
                rows={8}
                className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all placeholder:text-foreground/30 shadow-inner"
                autoFocus
              />

              {error && (
                <div className="mt-2 text-xs text-rose-500 font-medium px-1">
                  {error}
                </div>
              )}

              <div className="mt-5 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading || !prompt.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {isLoading ? 'Generating...' : 'Autofill'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-white dark:bg-zinc-900 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center hover:shadow-[0_8px_30px_rgba(37,99,235,0.4)] transition-all border border-zinc-200 dark:border-zinc-800 relative group overflow-hidden"
      >
        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Image src="/logo.svg" alt="AI Agent Logo" width={28} height={28} className="relative z-10 transition-transform group-hover:scale-110" />
      </motion.button>
    </div>
  );
}
