'use client';

import { useState, useRef, useEffect } from 'react';
import { useAgent } from '@/context/AgentContext';
import { Download, Printer, Eye, AlignLeft, FileSearch } from 'lucide-react';
import { ThreeDViewer } from '@/components/core/ThreeDViewer';
import * as htmlToImage from 'html-to-image';

export function BugFormatterClient() {
  const [title, setTitle] = useState('');
  const [environment, setEnvironment] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [actualBehavior, setActualBehavior] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState<string[]>(['']);

  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [textureUrl, setTextureUrl] = useState<string>('');
  const [isGenerating3D, setIsGenerating3D] = useState(false);
  const [aspect, setAspect] = useState<number>(1.414);
  const previewRef = useRef<HTMLDivElement>(null);

  const { registerPage, unregisterPage } = useAgent();

  useEffect(() => {
    registerPage(
      'Bug Report Formatter',
      `{
        "title": "string",
        "environment": "string",
        "expectedBehavior": "string",
        "actualBehavior": "string",
        "stepsToReproduce": "["string"]"
      }`,
      (data: any) => {
        if (data.title) setTitle(data.title);
        if (data.environment) setEnvironment(data.environment);
        if (data.expectedBehavior) setExpectedBehavior(data.expectedBehavior);
        if (data.actualBehavior) setActualBehavior(data.actualBehavior);
        if (Array.isArray(data.stepsToReproduce)) setStepsToReproduce(data.stepsToReproduce);
      }
    );

    return () => unregisterPage();
  }, [registerPage, unregisterPage]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !previewRef.current) return;
    
    const contentHtml = previewRef.current.innerHTML;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Bug Report Formatter</title>
          <style>
            body { font-family: "Inter", sans-serif; line-height: 1.6; padding: 2rem; max-width: 800px; margin: 0 auto; color: #1f2937; }
            h1 { font-size: 2.5rem; font-weight: 800; border-bottom: 2px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 2rem; }
            h2 { font-size: 1.25rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; color: #111827; }
            p { margin-bottom: 1rem; }
            ul { margin-left: 1.5rem; margin-bottom: 1rem; }
            li { margin-bottom: 0.5rem; }
            @media print {
              body { padding: 0; }
            }
          </style>
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
    }, 250);
  };

  useEffect(() => {
    if (viewMode === '3d' && previewRef.current) {
      const generateTexture = async () => {
        setIsGenerating3D(true);
        try {
          const el = previewRef.current;
          if (el) {
            const dataUrl = await htmlToImage.toPng(el, { 
              quality: 1, 
              pixelRatio: 1.0,
              skipAutoScale: true,
              backgroundColor: '#ffffff'
            });
            setTextureUrl(dataUrl);
            setAspect(el.offsetHeight / el.offsetWidth);
          }
        } catch (err) {
          console.error("Failed to generate 3D texture:", err);
        } finally {
          setIsGenerating3D(false);
        }
      };
      
      const timeoutId = setTimeout(generateTexture, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [viewMode, title, environment, expectedBehavior, actualBehavior, stepsToReproduce]);

  return (
    <div className="flex flex-col md:flex-row md:h-screen md:overflow-hidden bg-background">
      
      {/* Editor Side */}
      <div className="w-full md:w-[320px] lg:w-[400px] xl:w-[460px] h-full flex flex-col border-b md:border-b-0 md:border-r border-border/50 bg-surface/30 backdrop-blur-md relative z-10">
        
        {/* Header */}
        <div className="flex-none p-6 border-b border-border/50 bg-background/80 sticky top-0 z-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <FileSearch className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Bug Report Formatter</h1>
              <p className="text-sm text-foreground/60">Format crisp and reproducible bug reports.</p>
            </div>
          </div>
        
          <div className="flex bg-foreground/5 p-1 rounded-xl mb-3">
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
          <button onClick={handlePrint} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 text-primary font-bold text-sm rounded-xl hover:bg-primary/20 transition-colors">
            <Printer className="w-4 h-4" /> Print Document
          </button>
</div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar pb-32">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-foreground/70 mb-1.5">Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          <div className="h-px bg-border/50 w-full" />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-foreground/70 mb-1.5">Environment</label>
            <input 
              type="text" 
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          <div className="h-px bg-border/50 w-full" />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-foreground/70 mb-1.5">Expected Behavior</label>
            <textarea 
              value={expectedBehavior}
              onChange={(e) => setExpectedBehavior(e.target.value)}
              rows={4}
              className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-y custom-scrollbar"
            />
          </div>

          <div className="h-px bg-border/50 w-full" />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-foreground/70 mb-1.5">Actual Behavior</label>
            <textarea 
              value={actualBehavior}
              onChange={(e) => setActualBehavior(e.target.value)}
              rows={4}
              className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-y custom-scrollbar"
            />
          </div>

          <div className="h-px bg-border/50 w-full" />

          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Steps to Reproduce</h3>
            {stepsToReproduce.map((item, i) => (
              <input 
                key={i}
                type="text" 
                value={item}
                onChange={(e) => {
                  const newArr = [...stepsToReproduce];
                  newArr[i] = e.target.value;
                  setStepsToReproduce(newArr);
                }}
                className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all mb-2"
              />
            ))}
            <button onClick={() => setStepsToReproduce([...stepsToReproduce, ''])} className="text-xs text-primary font-bold bg-primary/10 px-3 py-1.5 rounded-lg">+ Add Item</button>
          </div>
        </div>
      </div>

      {/* Preview Side */}
      <div className="flex-1 min-w-0 h-[50vh] md:h-screen bg-zinc-100 dark:bg-zinc-950/50 flex flex-col relative">
        <div className="flex-1 overflow-hidden relative">
          {/* Always render 2D view for html2canvas to capture */}
          <div className={`absolute inset-0 overflow-y-auto p-4 md:p-12 flex justify-center items-start custom-scrollbar bg-zinc-100 dark:bg-zinc-900/50 ${viewMode === '3d' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <div 
                ref={previewRef}
                className="bg-white shadow-2xl p-8 md:p-16 min-h-[1056px] w-full max-w-[816px] h-fit text-zinc-900 text-[15px] leading-relaxed rounded-sm flex flex-col"
                style={{ fontFamily: '"Inter", sans-serif' }}
              >
                <div className="max-w-3xl mx-auto">
                  <h1 className="text-4xl font-extrabold tracking-tight mb-12 text-zinc-900 border-b-2 border-zinc-200 pb-6">
                    {title || 'Bug Report'}
                  </h1>

                  <div className="space-y-10">
                    <section>
                      <h2 className="text-xl font-bold text-zinc-900 mb-4 border-b pb-2">Title</h2>
                      <div className="text-zinc-700 whitespace-pre-wrap">{title}</div>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold text-zinc-900 mb-4 border-b pb-2">Environment</h2>
                      <div className="text-zinc-700 whitespace-pre-wrap">{environment}</div>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold text-zinc-900 mb-4 border-b pb-2">Expected Behavior</h2>
                      <div className="text-zinc-700 whitespace-pre-wrap">{expectedBehavior}</div>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold text-zinc-900 mb-4 border-b pb-2">Actual Behavior</h2>
                      <div className="text-zinc-700 whitespace-pre-wrap">{actualBehavior}</div>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold text-zinc-900 mb-4 border-b pb-2">Steps to Reproduce</h2>
                      <ul className="list-disc pl-5 space-y-2 text-zinc-700">
                        {stepsToReproduce.map((item, i) => item && <li key={i}>{item}</li>)}
                      </ul>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          
          {/* Overlay 3D view on top when active */}
          {viewMode === '3d' && (
            <div className="absolute inset-0 z-10 bg-zinc-100 dark:bg-zinc-950/50 cursor-grab active:cursor-grabbing">
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
    </div>
  );
}
