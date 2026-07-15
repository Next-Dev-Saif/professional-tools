'use client';

import { useState, useRef, useEffect } from 'react';
import { useAgent } from '@/context/AgentContext';
import { Download, Printer, Eye, AlignLeft, Layout, FileSearch } from 'lucide-react';
import { ThreeDViewer } from '@/components/core/ThreeDViewer';
import * as htmlToImage from 'html-to-image';

export function RFCGeneratorClient() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [background, setBackground] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [proposedSolution, setProposedSolution] = useState('');
  const [alternativesConsidered, setAlternativesConsidered] = useState<string[]>(['']);
  const [securityImplications, setSecurityImplications] = useState('');

  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [textureUrl, setTextureUrl] = useState<string>('');
  const [isGenerating3D, setIsGenerating3D] = useState(false);
  const [aspect, setAspect] = useState<number>(1.414);
  const previewRef = useRef<HTMLDivElement>(null);

  const { registerPage, unregisterPage } = useAgent();

  useEffect(() => {
    registerPage(
      'RFC Generator',
      `{
        "title": "string",
        "author": "string",
        "date": "YYYY-MM-DD",
        "background": "string",
        "problemStatement": "string",
        "proposedSolution": "string",
        "alternativesConsidered": ["string"],
        "securityImplications": "string"
      }`,
      (data: any) => {
        if (data.title) setTitle(data.title);
        if (data.author) setAuthor(data.author);
        if (data.date) setDate(data.date);
        if (data.background) setBackground(data.background);
        if (data.problemStatement) setProblemStatement(data.problemStatement);
        if (data.proposedSolution) setProposedSolution(data.proposedSolution);
        if (Array.isArray(data.alternativesConsidered)) setAlternativesConsidered(data.alternativesConsidered);
        if (data.securityImplications) setSecurityImplications(data.securityImplications);
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
          <title>\${title || 'RFC'}</title>
          <style>
            body { font-family: "Inter", sans-serif; line-height: 1.6; padding: 2rem; max-width: 800px; margin: 0 auto; color: #1f2937; }
            h1 { font-size: 2rem; font-weight: 800; border-bottom: 2px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 2rem; }
            h2 { font-size: 1.25rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; color: #111827; }
            p { margin-bottom: 1rem; }
            .header-info { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 2rem; color: #4b5563; font-size: 0.9rem; }
            .header-info strong { color: #111827; }
            ul { margin-left: 1.5rem; margin-bottom: 1rem; }
            li { margin-bottom: 0.5rem; }
            .section { margin-bottom: 2rem; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          \${contentHtml}
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
  }, [
    viewMode, title, author, date, background, 
    problemStatement, proposedSolution, alternativesConsidered, securityImplications
  ]);

  const updateAlternative = (index: number, value: string) => {
    const newAlts = [...alternativesConsidered];
    newAlts[index] = value;
    setAlternativesConsidered(newAlts);
  };

  const addAlternative = () => setAlternativesConsidered([...alternativesConsidered, '']);
  const removeAlternative = (index: number) => {
    if (alternativesConsidered.length > 1) {
      setAlternativesConsidered(alternativesConsidered.filter((_, i) => i !== index));
    }
  };

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
              <h1 className="text-xl font-bold tracking-tight">RFC Generator</h1>
              <p className="text-sm text-foreground/60">Propose architectures & features</p>
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
          
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/50 flex items-center gap-2">
              <Layout className="w-4 h-4" /> Header Info
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground/70 mb-1.5 uppercase tracking-wide">RFC Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="E.g. Migrating to Next.js App Router"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground/70 mb-1.5 uppercase tracking-wide">Author</label>
                  <input 
                    type="text" 
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/70 mb-1.5 uppercase tracking-wide">Date</label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-border/50 w-full" />

          {/* Core Content */}
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1.5 uppercase tracking-wide">Background</label>
              <textarea 
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                rows={3}
                placeholder="What is the current state of the world?"
                className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-y custom-scrollbar"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1.5 uppercase tracking-wide">Problem Statement</label>
              <textarea 
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                rows={3}
                placeholder="What problem are we trying to solve?"
                className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-y custom-scrollbar"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1.5 uppercase tracking-wide">Proposed Solution</label>
              <textarea 
                value={proposedSolution}
                onChange={(e) => setProposedSolution(e.target.value)}
                rows={5}
                placeholder="Describe the proposed technical solution..."
                className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-y custom-scrollbar"
              />
            </div>
          </div>

          <div className="h-px bg-border/50 w-full" />

          {/* Alternatives */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wide">Alternatives Considered</label>
              <button 
                onClick={addAlternative}
                className="text-xs font-bold text-primary hover:text-primary/80 transition-colors bg-primary/10 px-3 py-1.5 rounded-lg"
              >
                + Add Alternative
              </button>
            </div>
            
            <div className="space-y-3">
              {alternativesConsidered.map((alt, i) => (
                <div key={i} className="flex gap-2 group">
                  <textarea
                    value={alt}
                    onChange={(e) => updateAlternative(i, e.target.value)}
                    rows={2}
                    placeholder={`Alternative \${i + 1}...`}
                    className="flex-1 bg-foreground/5 border border-border/50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-y custom-scrollbar"
                  />
                  {alternativesConsidered.length > 1 && (
                    <button 
                      onClick={() => removeAlternative(i)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-foreground/40 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all self-start mt-1"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Security */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1.5 uppercase tracking-wide">Security Implications</label>
              <textarea 
                value={securityImplications}
                onChange={(e) => setSecurityImplications(e.target.value)}
                rows={2}
                placeholder="Any security, privacy, or compliance concerns?"
                className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-y custom-scrollbar"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Preview Side */}
      <div className="flex-1 min-w-0 h-[50vh] md:h-screen bg-zinc-100 dark:bg-zinc-950/50 flex flex-col relative">
        {/* Controls Overlay */}
        <div className="flex-1 overflow-hidden relative">
          {/* Always render 2D view for html2canvas to capture */}
          <div className={`absolute inset-0 overflow-y-auto p-4 md:p-12 flex justify-center items-start custom-scrollbar bg-zinc-100 dark:bg-zinc-900/50 ${viewMode === '3d' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <div 
                ref={previewRef}
                className="bg-white shadow-2xl p-8 md:p-16 min-h-[1056px] w-full max-w-[816px] h-fit text-zinc-900 text-[15px] leading-relaxed rounded-sm flex flex-col"
                style={{ fontFamily: '"Inter", sans-serif' }}
              >
                <div className="max-w-3xl mx-auto">
                  <h1 className="text-4xl font-extrabold tracking-tight mb-8 text-zinc-900 border-b-2 border-zinc-200 pb-6">
                    {title || 'Request for Comments (RFC)'}
                  </h1>

                  <div className="grid grid-cols-2 gap-4 mb-12 text-sm">
                    <div>
                      <span className="font-bold text-zinc-400 uppercase tracking-wider block mb-1">Author</span>
                      <span className="font-medium">{author || '[Author Name]'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-zinc-400 uppercase tracking-wider block mb-1">Date</span>
                      <span className="font-medium">{date}</span>
                    </div>
                    <div>
                      <span className="font-bold text-zinc-400 uppercase tracking-wider block mb-1">Status</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Proposed
                      </span>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <section>
                      <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
                        <span className="text-primary">1.</span> Background
                      </h2>
                      <div className="text-zinc-700 whitespace-pre-wrap">
                        {background || 'Provide context on the current state of the world.'}
                      </div>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
                        <span className="text-primary">2.</span> Problem Statement
                      </h2>
                      <div className="text-zinc-700 whitespace-pre-wrap bg-rose-50 border border-rose-100 p-4 rounded-xl">
                        {problemStatement || 'Clearly define the problem you are trying to solve.'}
                      </div>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
                        <span className="text-primary">3.</span> Proposed Solution
                      </h2>
                      <div className="text-zinc-700 whitespace-pre-wrap">
                        {proposedSolution || 'Detail the technical design, architecture, and rollout plan for the proposed solution.'}
                      </div>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
                        <span className="text-primary">4.</span> Alternatives Considered
                      </h2>
                      {alternativesConsidered.length > 0 && alternativesConsidered[0] !== '' ? (
                        <ul className="list-disc pl-5 space-y-3 text-zinc-700">
                          {alternativesConsidered.map((alt, i) => (
                            alt && <li key={i} className="whitespace-pre-wrap">{alt}</li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-zinc-500 italic">No alternatives documented.</div>
                      )}
                    </section>

                    <section>
                      <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
                        <span className="text-primary">5.</span> Security Implications
                      </h2>
                      <div className="text-zinc-700 whitespace-pre-wrap">
                        {securityImplications || 'Outline any security risks and how they will be mitigated.'}
                      </div>
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
