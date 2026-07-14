import ReactMarkdown from 'react-markdown';
import { Download, Copy, Check, Palette, Printer, Eye, View } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/core/Button';
import { ThreeDViewer } from '@/components/core/ThreeDViewer';
import { toPng } from 'html-to-image';

interface DocPreviewProps {
  content: string;
  isGenerating: boolean;
}

const THEMES = {
  modern: 'prose-slate dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-600 font-sans',
  corporate: 'prose-stone dark:prose-invert prose-headings:font-serif prose-headings:text-stone-800 dark:prose-headings:text-stone-200 prose-p:font-serif prose-p:leading-relaxed bg-stone-50 dark:bg-stone-900 p-8 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm',
  terminal: 'prose-green dark:prose-invert prose-headings:font-mono prose-headings:text-green-400 prose-p:font-mono prose-p:text-green-500 bg-gray-950 p-8 rounded-xl border border-green-900/50 shadow-[inset_0_0_20px_rgba(0,255,0,0.05)] prose-a:text-green-300',
  notion: 'prose-zinc dark:prose-invert font-sans prose-headings:font-semibold prose-headings:text-zinc-900 dark:prose-headings:text-zinc-100 prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-blockquote:border-l-4 prose-blockquote:border-zinc-800 dark:prose-blockquote:border-zinc-200 prose-blockquote:bg-zinc-100 dark:prose-blockquote:bg-zinc-800/50 prose-blockquote:px-4 prose-blockquote:py-1 prose-blockquote:not-italic prose-blockquote:rounded-r',
};

export function DocPreview({ content, isGenerating }: DocPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<keyof typeof THEMES>('modern');
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  
  const [textureUrl, setTextureUrl] = useState<string>('');
  const [aspect, setAspect] = useState(1.414);
  const previewRef = useRef<HTMLDivElement>(null);

  const generateTexture = async () => {
    if (!previewRef.current) return;
    try {
      const dataUrl = await toPng(previewRef.current, { 
        quality: 1.0, 
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });
      setTextureUrl(dataUrl);
      
      const rect = previewRef.current.getBoundingClientRect();
      if (rect.width && rect.height) {
        setAspect(rect.height / rect.width);
      }
    } catch (err) {
      console.error('Failed to generate 3D texture', err);
    }
  };

  useEffect(() => {
    if (viewMode === '3d') {
      const timer = setTimeout(generateTexture, 100);
      return () => clearTimeout(timer);
    }
  }, [viewMode, content, theme, isGenerating]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-document.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const contentHtml = document.getElementById('print-content-area')?.innerHTML || '';
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Generated Document</title>
          <style>
            body { font-family: system-ui, sans-serif; line-height: 1.6; padding: 2rem; max-width: 800px; margin: 0 auto; color: #333; }
            h1, h2, h3 { color: #111; border-bottom: 1px solid #eaeaea; padding-bottom: 0.3em; margin-top: 1.5em; }
            code { background: #f4f4f4; padding: 0.2em 0.4em; border-radius: 3px; font-family: monospace; font-size: 0.9em; }
            pre { background: #f4f4f4; padding: 1rem; overflow-x: auto; border-radius: 5px; }
            blockquote { border-left: 4px solid #ddd; margin-left: 0; padding-left: 1rem; color: #666; }
            table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
            th, td { border: 1px solid #ddd; padding: 12px 8px; text-align: left; }
            th { background-color: #f9f9f9; font-weight: 600; }
            a { color: #2563eb; text-decoration: none; }
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

  const InnerContent = () => (
    <>
      {!content && !isGenerating && (
        <div className="h-full flex flex-col items-center justify-center text-center opacity-50 min-h-[400px]">
          <svg className="w-12 h-12 mb-4 text-foreground/30 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm">No document generated yet.<br/>Provide commit details and click generate.</p>
        </div>
      )}
      
      {(content || isGenerating) && (
        <div id="print-content-area" className={`prose max-w-none prose-headings:font-semibold transition-colors duration-300 ${THEMES[theme]}`}>
          <ReactMarkdown>{content}</ReactMarkdown>
          {isGenerating && (
            <span className="inline-block w-2 h-5 ml-1 align-middle bg-primary/60 animate-pulse" />
          )}
        </div>
      )}
    </>
  );

  return (
    <div className="flex flex-col h-full glass rounded-2xl overflow-hidden border border-border/50 shadow-sm relative">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 border-b border-border/50 bg-surface/50 backdrop-blur-md sticky top-0 z-20">

        {/* Left group: title + 3D toggle + theme picker */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h3 className="text-xs font-bold text-foreground/50 tracking-widest uppercase shrink-0">Preview</h3>

          <div className="w-px h-4 bg-border/60 shrink-0" />

          {/* 3D / 2D toggle */}
          <Button
            variant="secondary"
            className="!py-1.5 !px-2 !min-h-0 text-xs shrink-0"
            onClick={() => setViewMode(prev => prev === '2d' ? '3d' : '2d')}
            title={viewMode === '2d' ? 'Switch to 3D view' : 'Switch to 2D view'}
          >
            {viewMode === '2d'
              ? <><View className="w-3.5 h-3.5" /><span className="ml-1.5 hidden sm:inline">3D</span></>
              : <><Eye className="w-3.5 h-3.5" /><span className="ml-1.5 hidden sm:inline">2D</span></>
            }
          </Button>

          <div className="w-px h-4 bg-border/60 shrink-0" />

          {/* Theme picker */}
          <div className="flex items-center gap-1.5 min-w-0">
            <Palette className="w-3.5 h-3.5 text-foreground/40 shrink-0" />
            <select name="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value as keyof typeof THEMES)}
              className="text-xs bg-transparent border-none outline-none cursor-pointer text-foreground/70 font-medium truncate max-w-[120px] lg:max-w-[150px]"
              aria-label="Select preview theme"
            >
              <option value="modern">Modern Minimal</option>
              <option value="corporate">Classic Corporate</option>
              <option value="terminal">Cyberpunk Terminal</option>
              <option value="notion">Notion Style</option>
            </select>
          </div>
        </div>

        {/* Right group: action buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Print */}
          <Button
            variant="secondary"
            onClick={handlePrint}
            disabled={!content || isGenerating}
            className="!py-1.5 !px-2.5 !min-h-0 text-xs"
            title="Print document"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="ml-1.5 hidden lg:inline">Print</span>
          </Button>

          {/* Copy */}
          <Button
            variant="secondary"
            onClick={handleCopy}
            disabled={!content || isGenerating}
            className="!py-1.5 !px-2.5 !min-h-0 text-xs"
            title="Copy to clipboard"
          >
            {copied
              ? <Check className="w-3.5 h-3.5 text-emerald-500" />
              : <Copy className="w-3.5 h-3.5" />
            }
            <span className="ml-1.5 hidden lg:inline">{copied ? 'Copied' : 'Copy'}</span>
          </Button>

          {/* Download */}
          <Button
            variant="primary"
            onClick={handleDownload}
            disabled={!content || isGenerating}
            className="!py-1.5 !px-2.5 !min-h-0 text-xs"
            title="Download as Markdown"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="ml-1.5 hidden lg:inline">Download .md</span>
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden bg-surface/30 relative">
        <div 
          className={`h-full overflow-y-auto p-6 md:p-10 ${viewMode === '3d' ? 'absolute opacity-0 pointer-events-none -z-10 w-full' : 'relative z-10'}`}
        >
          <div ref={previewRef} className="w-full max-w-[800px] mx-auto bg-white text-black min-h-[1056px] shadow-sm select-none p-12 text-left origin-top">
            <InnerContent />
          </div>
        </div>
        
        {viewMode === '3d' && (
          <div className="absolute inset-0 z-10">
             <ThreeDViewer textureUrl={textureUrl} aspect={aspect} />
          </div>
        )}
      </div>
    </div>
  );
}

