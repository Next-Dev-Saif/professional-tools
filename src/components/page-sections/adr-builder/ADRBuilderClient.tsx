'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { Download, Eye, AlignLeft, BookOpen, Layers } from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { ThreeDViewer } from '@/components/core/ThreeDViewer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAgent } from '@/context/AgentContext';

export function ADRBuilderClient() {
  const adrId = useId().replace(/:/g, '').toUpperCase().slice(0, 6);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  
  const [title, setTitle] = useState('Adopt Next.js App Router for Frontend');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Accepted');
  
  const [context, setContext] = useState('We need a robust frontend framework to handle SSR, static site generation, and seamless API routing. Our current SPA approach in pure React is causing SEO and initial load time issues.');
  const [decision, setDecision] = useState('We will migrate the frontend to Next.js using the new App Router architecture. This will allow us to utilize React Server Components for improved performance.');
  const [consequences, setConsequences] = useState('**Positive:**\n- Better SEO and page load speeds.\n- Unified routing and API logic.\n\n**Negative:**\n- Learning curve for the team regarding Server Components vs Client Components.\n- Slightly more complex deployment requirements compared to static hosting.');
  
  const { registerPage, unregisterPage } = useAgent();

  useEffect(() => {
    registerPage(
      'ADR Builder',
      `{
        "title": "string",
        "date": "YYYY-MM-DD",
        "status": "Proposed | Accepted | Rejected | Deprecated | Superseded",
        "context": "string (markdown)",
        "decision": "string (markdown)",
        "consequences": "string (markdown)"
      }`,
      (data: any) => {
        if (data.title) setTitle(data.title);
        if (data.date) setDate(data.date);
        if (data.status) setStatus(data.status);
        if (data.context) setContext(data.context);
        if (data.decision) setDecision(data.decision);
        if (data.consequences) setConsequences(data.consequences);
      }
    );
    return () => unregisterPage();
  }, [registerPage, unregisterPage]);

  const previewRef = useRef<HTMLDivElement>(null);
  const [textureUrl, setTextureUrl] = useState<string>('');
  const [isGenerating3D, setIsGenerating3D] = useState(false);
  const [aspect, setAspect] = useState<number>(1.414);

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

  useEffect(() => {
    if (viewMode === '3d') {
      const timer = setTimeout(generateTexture, 800);
      return () => clearTimeout(timer);
    }
  }, [viewMode, title, date, status, context, decision, consequences]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !previewRef.current) return;
    const contentHtml = previewRef.current.innerHTML;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>ADR: ${title}</title>
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
            <Layers className="w-6 h-6 text-blue-500 shrink-0" />
            <div>
              <h2 className="text-lg font-bold tracking-tight">ADR Builder</h2>
              <p className="text-xs text-foreground/60">Architecture Decision Records</p>
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
        </div>

        <div className="p-6 space-y-8">
          {/* Metadata */}
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 flex items-center gap-2">
              <BookOpen className="w-3 h-3" /> Record Details
            </label>
            <div className="space-y-3">
              <input name="title"
                type="text"
                placeholder="Decision Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <div className="grid grid-cols-2 gap-3">
                <input name="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground/80"
                />
                <select name="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={`w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold 
                    ${status === 'Accepted' ? 'text-green-500' : 
                      status === 'Proposed' ? 'text-blue-500' : 
                      status === 'Rejected' ? 'text-red-500' : 
                      'text-orange-500'}`}
                >
                  <option value="Proposed">Proposed</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Deprecated">Deprecated</option>
                  <option value="Superseded">Superseded</option>
                </select>
              </div>
            </div>
          </div>

          <div className="h-px bg-border/50 w-full" />

          {/* Content */}
          <div className="space-y-6 pb-8">
            <div className="space-y-3">
              <label className="text-[11px] font-semibold text-foreground/50 uppercase tracking-wider block">Context (Markdown)</label>
              <textarea name="context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={4}
                className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-y custom-scrollbar font-mono"
              />
            </div>
            
            <div className="space-y-3">
              <label className="text-[11px] font-semibold text-foreground/50 uppercase tracking-wider block">Decision (Markdown)</label>
              <textarea name="decision"
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                rows={4}
                className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-y custom-scrollbar font-mono"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-semibold text-foreground/50 uppercase tracking-wider block">Consequences (Markdown)</label>
              <textarea name="consequences"
                value={consequences}
                onChange={(e) => setConsequences(e.target.value)}
                rows={5}
                className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-y custom-scrollbar font-mono"
              />
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
            className="bg-white w-full max-w-[800px] h-fit shadow-2xl origin-top rounded-sm flex flex-col p-12 relative text-slate-900"
            style={{ minHeight: '1131px', fontFamily: 'Georgia, serif' }}
          >
            {/* Header */}
            <div className="mb-10 text-center border-b-[3px] border-slate-900 pb-8">
              <div className="text-sm font-bold tracking-widest text-slate-500 uppercase mb-4">Architecture Decision Record</div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-6">{title || 'Untitled Decision'}</h1>
              
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex flex-col">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Date</span>
                  <span className="font-medium">{date}</span>
                </div>
                <div className="w-px h-8 bg-slate-200"></div>
                <div className="flex flex-col">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Status</span>
                  <span className={`font-bold ${
                    status === 'Accepted' ? 'text-green-600' : 
                    status === 'Proposed' ? 'text-blue-600' : 
                    status === 'Rejected' ? 'text-red-600' : 
                    'text-orange-600'
                  }`}>{status}</span>
                </div>
                <div className="w-px h-8 bg-slate-200"></div>
                <div className="flex flex-col">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Record ID</span>
                  <span className="font-mono text-slate-700 font-semibold">ADR-{adrId}</span>
                </div>
              </div>
            </div>

            {/* Markdown Content */}
            <div className="space-y-10 flex-1 mb-12 max-w-[650px] mx-auto w-full">
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">1. Context</h2>
                <div className="prose prose-slate prose-sm md:prose-base max-w-none text-justify">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{context}</ReactMarkdown>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">2. Decision</h2>
                <div className="prose prose-slate prose-sm md:prose-base max-w-none text-justify">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{decision}</ReactMarkdown>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">3. Consequences</h2>
                <div className="prose prose-slate prose-sm md:prose-base max-w-none text-justify">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{consequences}</ReactMarkdown>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-slate-400 border-t border-slate-200 pt-4 mt-auto w-full font-sans">
              Generated securely by Hephaestus Code-to-ADR
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
