'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Eye, AlignLeft, Sparkles, Plus, Trash2, Megaphone } from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { ThreeDViewer } from '@/components/core/ThreeDViewer';

interface NoteItem {
  id: string;
  text: string;
}

const TEMPLATES = {
  custom: {
    name: 'Custom / Manual',
  },
  major: {
    name: 'Major Release (v3.0.0)',
    version: 'v3.0.0',
    intro: 'Welcome to the biggest update of the year! We have completely overhauled the rendering engine and introduced highly requested features.',
    features: [
      { id: 'f1', text: 'Brand new 3D graphics pipeline for rendering interactive documents.' },
      { id: 'f2', text: 'Added support for real-time collaboration with multi-cursor tracking.' },
      { id: 'f3', text: 'Introduced AI-powered natural language document generation.' }
    ],
    fixes: [
      { id: 'b1', text: 'Resolved memory leak in background tabs.' }
    ]
  },
  patch: {
    name: 'Hotfix Patch (v2.4.1)',
    version: 'v2.4.1',
    intro: 'This is a minor patch addressing several critical issues reported by the community over the weekend.',
    features: [],
    fixes: [
      { id: 'b1', text: 'Fixed crash when loading corrupted save files.' },
      { id: 'b2', text: 'Corrected alignment issue in the top navigation bar on mobile.' },
      { id: 'b3', text: 'Patched security vulnerability in the authentication flow.' }
    ]
  }
};

export function ReleaseNotesClient() {
  const docId = useId().replace(/:/g, '').toUpperCase().slice(0, 6);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [template, setTemplate] = useState<keyof typeof TEMPLATES>('custom');
  
  const [version, setVersion] = useState('v2.4.0');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [intro, setIntro] = useState("We are thrilled to announce the release of v2.4.0, which introduces major performance improvements and several highly-requested features!");
  
  const [features, setFeatures] = useState<NoteItem[]>([
    { id: 'f1', text: 'Added a new visual builder for 3D document generation.' },
    { id: 'f2', text: 'Implemented real-time collaboration cursors across all text editors.' }
  ]);
  
  const [fixes, setFixes] = useState<NoteItem[]>([
    { id: 'b1', text: 'Fixed a race condition causing the sidebar to sometimes crash on load.' },
    { id: 'b2', text: 'Resolved memory leak in the WebGL renderer when switching tabs rapidly.' }
  ]);

  useEffect(() => {
    const handleAgentCommand = (event: MessageEvent) => {
      // Check if it's our custom event from the extension
      if (event.data?.type === 'HEPHAESTUS_AGENT_COMMAND' && event.data?.action === 'fill_fields') {
        const { fields } = event.data;
        if (!fields) return;

        // If the payload explicitly contains arrays for features or fixes, update state directly!
        if (Array.isArray(fields.features)) {
          setFeatures(fields.features.map((text: string, i: number) => ({ id: `agent-f-${i}`, text })));
        }
        if (Array.isArray(fields.fixes)) {
          setFixes(fields.fixes.map((text: string, i: number) => ({ id: `agent-b-${i}`, text })));
        }
        
        // Also handle the simple string fields that might be mapped to React state
        if (fields.version) setVersion(fields.version);
        if (fields.date) setDate(fields.date);
        if (fields.intro) setIntro(fields.intro);
        if (fields.template && Object.keys(TEMPLATES).includes(fields.template)) {
          setTemplate(fields.template as keyof typeof TEMPLATES);
        }
      }
    };

    window.addEventListener('message', handleAgentCommand);
    return () => window.removeEventListener('message', handleAgentCommand);
  }, []);

  const previewRef = useRef<HTMLDivElement>(null);
  const [textureUrl, setTextureUrl] = useState<string>('');
  const [isGenerating3D, setIsGenerating3D] = useState(false);
  const [aspect, setAspect] = useState<number>(1.414);

  const addItem = (setter: React.Dispatch<React.SetStateAction<NoteItem[]>>, list: NoteItem[]) => {
    setter([...list, { id: Math.random().toString(36).substring(7), text: '' }]);
  };

  const updateItem = (setter: React.Dispatch<React.SetStateAction<NoteItem[]>>, list: NoteItem[], id: string, text: string) => {
    setter(list.map(item => item.id === id ? { ...item, text } : item));
  };

  const removeItem = (setter: React.Dispatch<React.SetStateAction<NoteItem[]>>, list: NoteItem[], id: string) => {
    setter(list.filter(item => item.id !== id));
  };

  const generateTexture = async () => {
    if (!previewRef.current) return;
    setIsGenerating3D(true);
    try {
      const dataUrl = await toJpeg(previewRef.current, { 
        quality: 0.8, 
        pixelRatio: 1.0,
        skipAutoScale: true,
        backgroundColor: '#ffffff'
      });
      setTextureUrl(dataUrl);
      
      const rect = previewRef.current.getBoundingClientRect();
      if (rect.width && rect.height) {
        setAspect(rect.height / rect.width);
      }
    } catch (err) {
      console.error('Failed to generate texture', err);
    } finally {
      setIsGenerating3D(false);
    }
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const key = e.target.value as keyof typeof TEMPLATES;
    setTemplate(key);
    if (key !== 'custom') {
      const t = TEMPLATES[key];
      setVersion(t.version);
      setIntro(t.intro);
      setFeatures(t.features);
      setFixes(t.fixes);
    }
  };

  useEffect(() => {
    if (viewMode === '3d') {
      const timer = setTimeout(generateTexture, 800);
      return () => clearTimeout(timer);
    }
  }, [viewMode, version, date, intro, features, fixes]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !previewRef.current) return;
    const contentHtml = previewRef.current.innerHTML;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Release Notes: ${version}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; padding: 2rem; max-width: 800px; margin: 0 auto; color: #1a1a1a; }
          </style>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body>
          ${contentHtml}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 1000);
  };

  return (
    <div className="flex flex-col md:flex-row md:h-screen md:overflow-hidden bg-background">
      {/* Left Sidebar */}
      <div className="w-full md:w-[320px] lg:w-[400px] xl:w-[460px] border-b md:border-b-0 md:border-r border-border/50 bg-surface/30 backdrop-blur-md flex flex-col md:h-full z-10 overflow-y-auto custom-scrollbar">
        <div className="p-6 border-b border-border/50 sticky top-0 bg-surface/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-3 mb-6">
            <Megaphone className="w-6 h-6 text-purple-500 shrink-0" />
            <div>
              <h2 className="text-lg font-bold tracking-tight">Release Notes</h2>
              <p className="text-xs text-foreground/60">Changelog Beautifier</p>
            </div>
          </div>

          <div className="flex bg-foreground/5 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('2d')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === '2d' ? 'bg-background shadow-sm text-foreground' : 'text-foreground/60 hover:text-foreground'}`}
            >
              <AlignLeft className="w-4 h-4" /> 2D Preview
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === '3d' ? 'bg-background shadow-sm text-foreground' : 'text-foreground/60 hover:text-foreground'}`}
            >
              <Eye className="w-4 h-4" /> 3D View
            </button>
          </div>

          <div className="mt-4">
            <select name="template"
              value={template}
              onChange={handleTemplateChange}
              className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground/80 cursor-pointer"
            >
              {Object.entries(TEMPLATES).map(([key, value]) => (
                <option key={key} value={key}>{value.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Metadata */}
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 flex items-center gap-2">
              <Megaphone className="w-3 h-3" /> Release Info
            </label>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input name="version"
                  type="text"
                  placeholder="Version (e.g. v2.4.0)"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-purple-500"
                />
                <input name="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground/80"
                />
              </div>
              <textarea name="intro"
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                placeholder="Brief introduction or highlight..."
                rows={3}
                className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-y custom-scrollbar"
              />
            </div>
          </div>

          <div className="h-px bg-border/50 w-full" />

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-emerald-500" /> New Features
              </label>
              <button 
                onClick={() => addItem(setFeatures, features)}
                className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 hover:bg-emerald-500/10 px-2 py-1 rounded-md transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Feature
              </button>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {features.map((item, index) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-2 relative group"
                  >
                    <input name={`features[${index}]`}
                      type="text"
                      value={item.text}
                      onChange={(e) => updateItem(setFeatures, features, item.id, e.target.value)}
                      className="flex-1 bg-foreground/5 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-all"
                      placeholder="Describe the feature..."
                    />
                    <button 
                      onClick={() => removeItem(setFeatures, features, item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-foreground/30 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="h-px bg-border/50 w-full" />

          {/* Fixes */}
          <div className="space-y-4 pb-8">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 flex items-center gap-2">
                <AlignLeft className="w-3 h-3 text-rose-500" /> Bug Fixes
              </label>
              <button 
                onClick={() => addItem(setFixes, fixes)}
                className="flex items-center gap-1 text-[11px] font-bold text-rose-500 hover:bg-rose-500/10 px-2 py-1 rounded-md transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Fix
              </button>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {fixes.map((item, index) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-2 relative group"
                  >
                    <input name={`fixes[${index}]`}
                      type="text"
                      value={item.text}
                      onChange={(e) => updateItem(setFixes, fixes, item.id, e.target.value)}
                      className="flex-1 bg-foreground/5 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-500 transition-all"
                      placeholder="Describe the bug fix..."
                    />
                    <button 
                      onClick={() => removeItem(setFixes, fixes, item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-foreground/30 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Right Content - Preview */}
      <div className="flex-1 relative bg-foreground/5 overflow-hidden flex flex-col min-h-[500px] md:h-screen">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-surface/50 backdrop-blur-md sticky top-0 z-20">
          <h3 className="text-sm font-semibold text-foreground/80 tracking-wide uppercase">Document Preview</h3>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-1.5 bg-background border border-border/50 hover:bg-surface/80 rounded-lg text-sm font-medium transition-all shadow-sm"
          >
            <Download className="w-4 h-4" /> Print / Save PDF
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto p-8 flex justify-center items-start custom-scrollbar ${viewMode === '3d' ? 'absolute opacity-0 pointer-events-none -z-10 w-full h-full' : 'relative z-10'}`}>
          <div
            ref={previewRef}
            className={`w-full max-w-[800px] h-fit shadow-2xl origin-top rounded-3xl flex flex-col p-12 relative overflow-hidden border ${template === 'custom' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-100 text-slate-900'}`}
            style={{ minHeight: '1131px', fontFamily: '"Inter", sans-serif' }}
          >
            {/* Header Banner */}
            {template === 'major' && (
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"></div>
            )}
            {template === 'custom' && (
              <div className="absolute top-0 left-0 right-0 h-32 bg-slate-950 border-b-4 border-blue-500"></div>
            )}
            
            {/* Content Container */}
            <div className={`relative z-10 ${template !== 'patch' ? 'mt-12 shadow-xl border-slate-100' : 'mt-0 shadow-sm border-slate-300 border-2'} ${template === 'custom' ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-white'} rounded-2xl p-8 flex-1 flex flex-col`}>
              <div className={`flex justify-between items-end mb-8 border-b ${template === 'custom' ? 'border-slate-700' : 'border-slate-100'} pb-6`}>
                <div>
                  <h1 className={`text-4xl font-extrabold tracking-tight mb-2 ${template === 'major' ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600' : template === 'custom' ? 'text-white' : 'text-slate-900'}`}>
                    Release Notes
                  </h1>
                  <p className={`text-sm font-medium ${template === 'custom' ? 'text-slate-400' : 'text-slate-500'}`}>{date}</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full font-bold text-lg tracking-wider ${template === 'major' ? 'bg-purple-100 text-purple-700' : template === 'custom' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-100 text-slate-800 border border-slate-300'}`}>
                  {version}
                </div>
              </div>

              <div className={`text-[15px] leading-relaxed mb-10 whitespace-pre-wrap font-medium ${template === 'custom' ? 'text-slate-300' : 'text-slate-600'}`}>
                {intro}
              </div>

              {features.length > 0 && (
                <div className="mb-10">
                  <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${template === 'custom' ? 'text-slate-100' : 'text-slate-800'}`}>
                    {template === 'major' && <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">🚀</span>}
                    {template === 'custom' && <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">✨</span>}
                    New Features
                  </h2>
                  <ul className="space-y-3 pl-2">
                    {features.map(f => (
                      <li key={f.id} className={`flex gap-3 text-[15px] leading-relaxed ${template === 'custom' ? 'text-slate-300' : 'text-slate-600'}`}>
                        <span className={`font-bold ${template === 'patch' ? 'text-slate-400' : template === 'custom' ? 'text-emerald-400' : 'text-emerald-500'}`}>•</span>
                        <span>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {fixes.length > 0 && (
                <div className="mb-10">
                  <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${template === 'custom' ? 'text-slate-100' : 'text-slate-800'}`}>
                    {template === 'major' && <span className="p-1.5 rounded-lg bg-rose-100 text-rose-600">🐛</span>}
                    {template === 'custom' && <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">🔧</span>}
                    Bug Fixes
                  </h2>
                  <ul className="space-y-3 pl-2">
                    {fixes.map(f => (
                      <li key={f.id} className={`flex gap-3 text-[15px] leading-relaxed ${template === 'custom' ? 'text-slate-300' : 'text-slate-600'}`}>
                        <span className={`font-bold ${template === 'patch' ? 'text-slate-400' : template === 'custom' ? 'text-rose-400' : 'text-rose-500'}`}>•</span>
                        <span>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`text-center text-xs pt-6 mt-auto w-full relative z-10 font-medium ${template === 'custom' ? 'text-slate-500' : 'text-slate-400'}`}>
              Changelog Generated by Hephaestus • {docId}
            </div>
          </div>
        </div>
        
        {viewMode === '3d' && (
          <div className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-10">
            {isGenerating3D && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-20 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 bg-surface p-6 rounded-2xl shadow-xl border border-border/50">
                  <span className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <p className="text-sm font-bold text-foreground/70">Rendering 3D Document...</p>
                </div>
              </div>
            )}
            <ThreeDViewer textureUrl={textureUrl} aspect={aspect} />
          </div>
        )}
      </div>
    </div>
  );
}
