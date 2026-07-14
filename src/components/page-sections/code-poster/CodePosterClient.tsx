'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { Download, Eye, AlignLeft, Code, Layout } from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { ThreeDViewer } from '@/components/core/ThreeDViewer';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

const THEMES = {
  macDark: { name: 'macOS Dark Frame', bg: 'bg-slate-900', border: 'border-slate-800' },
  macLight: { name: 'macOS Light Frame', bg: 'bg-white', border: 'border-slate-200' },
  polaroid: { name: 'Polaroid Style', bg: 'bg-[#fafafa]', border: 'border-[#eaeaea]' }
};

const LANGUAGES = [
  'typescript', 'javascript', 'python', 'rust', 'go', 'java', 'cpp', 'css', 'html', 'sql', 'bash', 'json'
];

export function CodePosterClient() {
  const docId = useId().replace(/:/g, '').toUpperCase().slice(0, 6);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  
  const [theme, setTheme] = useState<keyof typeof THEMES>('macDark');
  const [language, setLanguage] = useState('typescript');
  const [title, setTitle] = useState('useDebounce.ts');
  const [subtitle, setSubtitle] = useState('@hephaestus/hooks');
  const [padding, setPadding] = useState('p-12');
  const [background, setBackground] = useState('bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500');
  
  const [code, setCode] = useState(
    'import { useState, useEffect } from "react";\n\n' +
    'export function useDebounce<T>(value: T, delay: number): T {\n' +
    '  const [debouncedValue, setDebouncedValue] = useState<T>(value);\n\n' +
    '  useEffect(() => {\n' +
    '    const handler = setTimeout(() => {\n' +
    '      setDebouncedValue(value);\n' +
    '    }, delay);\n\n' +
    '    return () => {\n' +
    '      clearTimeout(handler);\n' +
    '    };\n' +
    '  }, [value, delay]);\n\n' +
    '  return debouncedValue;\n' +
    '}'
  );

  const previewRef = useRef<HTMLDivElement>(null);
  const [textureUrl, setTextureUrl] = useState<string>('');
  const [isGenerating3D, setIsGenerating3D] = useState(false);
  const [aspect, setAspect] = useState<number>(1.0); // usually snippets look good square or slightly tall

  const generateTexture = async () => {
    if (!previewRef.current) return;
    setIsGenerating3D(true);
    try {
      const dataUrl = await toJpeg(previewRef.current, { 
        quality: 0.9, 
        pixelRatio: 2.0, // High quality for code readability
        skipAutoScale: true
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
  }, [viewMode, theme, language, title, subtitle, padding, background, code]);

  const handlePrint = async () => {
    if (!previewRef.current) return;
    try {
      const dataUrl = await toJpeg(previewRef.current, { quality: 1.0, pixelRatio: 3.0, skipAutoScale: true });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `code-snippet-${docId}.jpg`;
      a.click();
    } catch (e) {
      console.error("Export failed", e);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:h-screen md:overflow-hidden bg-background">
      {/* Left Sidebar */}
      <div className="w-full md:w-[320px] lg:w-[400px] xl:w-[460px] border-b md:border-b-0 md:border-r border-border/50 bg-surface/30 backdrop-blur-md flex flex-col md:h-full z-10 overflow-y-auto custom-scrollbar shrink-0">
        <div className="p-6 border-b border-border/50 sticky top-0 bg-surface/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-3 mb-6">
            <Code className="w-6 h-6 text-orange-500 shrink-0" />
            <div>
              <h2 className="text-lg font-bold tracking-tight">Code Snippet Poster</h2>
              <p className="text-xs text-foreground/60">Generate beautiful code images</p>
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
              <Layout className="w-3 h-3" /> Poster Config
            </label>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input name="title"
                  type="text"
                  placeholder="Filename (e.g. main.tsx)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-orange-500"
                />
                <input name="subtitle"
                  type="text"
                  placeholder="@handle or subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground/80"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={language}
                  name="language"
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
                <select
                  value={theme}
                  name="theme"
                  onChange={(e) => setTheme(e.target.value as keyof typeof THEMES)}
                  className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                >
                  {Object.entries(THEMES).map(([k, v]) => (
                    <option key={k} value={k}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={background}
                  name="background"
                  onChange={(e) => setBackground(e.target.value)}
                  className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                >
                  <option value="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">Galaxy Gradient</option>
                  <option value="bg-gradient-to-br from-emerald-400 to-cyan-400">Emerald Ocean</option>
                  <option value="bg-gradient-to-tr from-amber-200 via-orange-400 to-rose-500">Sunset</option>
                  <option value="bg-slate-900">Solid Dark</option>
                  <option value="bg-white">Solid White</option>
                </select>
                <select
                  value={padding}
                  name="padding"
                  onChange={(e) => setPadding(e.target.value)}
                  className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                >
                  <option value="p-8">Padding: Small</option>
                  <option value="p-12">Padding: Medium</option>
                  <option value="p-20">Padding: Large</option>
                </select>
              </div>
            </div>
          </div>

          <div className="h-px bg-border/50 w-full" />

          {/* Code Input */}
          <div className="space-y-4 pb-8 flex-1 flex flex-col">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 flex items-center gap-2">
              <Code className="w-3 h-3" /> Raw Code
            </label>
            <textarea
              value={code}
              name="code"
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
              className="w-full flex-1 min-h-[300px] bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all resize-y custom-scrollbar font-mono text-foreground/80 leading-relaxed"
              spellCheck={false}
            />
          </div>
        </div>
      </div>

      {/* Right Content - Preview */}
      <div className="flex-1 relative bg-foreground/5 overflow-hidden flex flex-col min-h-[500px] md:h-screen">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-surface/50 backdrop-blur-md sticky top-0 z-20">
          <h3 className="text-sm font-semibold text-foreground/80 tracking-wide uppercase">Poster Preview</h3>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-1.5 bg-background border border-border/50 hover:bg-surface/80 rounded-lg text-sm font-medium transition-all shadow-sm"
          >
            <Download className="w-4 h-4" /> Export High-Res Image
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto p-8 flex justify-center items-start custom-scrollbar ${viewMode === '3d' ? 'absolute opacity-0 pointer-events-none -z-10 w-full h-full' : 'relative z-10'}`}>
          <div
            ref={previewRef}
            className={`w-full max-w-[800px] h-fit shadow-2xl origin-top flex flex-col ${padding} ${background} relative overflow-hidden`}
            style={{ minHeight: '800px' }}
          >
            {/* The Code Window Frame */}
            <div className={`w-full h-full flex-1 flex flex-col rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] border overflow-hidden ${THEMES[theme].bg} ${THEMES[theme].border}`}>
              
              {/* Window Header */}
              {theme !== 'polaroid' && (
                <div className={`flex items-center px-4 py-3 border-b ${THEMES[theme].border}`}>
                  <div className="flex items-center gap-2 mr-4">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  </div>
                  <div className="flex-1 text-center font-mono text-sm font-semibold opacity-70 flex items-center justify-center gap-2 text-current">
                    {title}
                  </div>
                  <div className="w-16"></div> {/* Spacer for centering */}
                </div>
              )}

              {/* Polaroid Header */}
              {theme === 'polaroid' && (
                <div className="flex items-end justify-between px-8 pt-8 pb-4">
                  <div className="font-mono text-xl font-bold text-slate-800">{title}</div>
                  {subtitle && <div className="text-sm font-medium text-slate-400">{subtitle}</div>}
                </div>
              )}

              {/* Code Content */}
              <div className="flex-1 p-6 text-[15px] overflow-hidden">
                <SyntaxHighlighter
                  language={language}
                  style={theme === 'macDark' ? vscDarkPlus : vs}
                  customStyle={{
                    margin: 0,
                    padding: 0,
                    background: 'transparent',
                    fontSize: '15px',
                    lineHeight: '1.5',
                  }}
                  wrapLines={true}
                >
                  {code || '// Paste code to begin'}
                </SyntaxHighlighter>
              </div>

              {/* Watermark/Footer for non-polaroid */}
              {theme !== 'polaroid' && subtitle && (
                <div className={`px-6 py-4 text-right font-mono text-sm font-bold opacity-50 ${THEMES[theme].bg === 'bg-white' ? 'text-slate-900' : 'text-white'}`}>
                  {subtitle}
                </div>
              )}
              
              {theme === 'polaroid' && (
                <div className="h-16"></div> // Extra bottom space for polaroid style
              )}
            </div>
            
            {/* Very faint background watermark */}
            <div className="absolute bottom-4 right-6 text-white/40 text-[10px] font-bold tracking-widest uppercase pointer-events-none">
              Generated via Hephaestus IDE
            </div>
          </div>
        </div>
        
        {viewMode === '3d' && (
          <div className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-10">
            {isGenerating3D && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-20 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 bg-surface p-6 rounded-2xl shadow-xl border border-border/50">
                  <span className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <p className="text-sm font-bold text-foreground/70">Rendering 3D Poster...</p>
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
