'use client';

import { useState, useRef, useEffect } from 'react';
import { InvoiceForm } from './InvoiceForm';
import { InvoicePreview } from './InvoicePreview';
import { ThreeDViewer } from '@/components/core/ThreeDViewer';
import { Button } from '@/components/core/Button';
import { Printer, Download, Eye, View } from 'lucide-react';
import { toPng } from 'html-to-image';
import { useInvoiceStore } from '@/store/useInvoiceStore';

export function InvoiceGeneratorClient() {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [textureUrl, setTextureUrl] = useState<string>('');
  const [aspect, setAspect] = useState(1.414);
  const previewRef = useRef<HTMLDivElement>(null);
  
  // We subscribe to store changes to regenerate texture if in 3D mode
  const store = useInvoiceStore();

  const handlePrint = () => {
    window.print();
  };

  const generateTexture = async () => {
    if (!previewRef.current) return;
    try {
      const dataUrl = await toPng(previewRef.current, { 
        quality: 1.0, 
        pixelRatio: 2, // High resolution for texture
        backgroundColor: '#ffffff'
      });
      setTextureUrl(dataUrl);
      
      // Calculate exact aspect ratio of the rendered DOM node
      const rect = previewRef.current.getBoundingClientRect();
      if (rect.width && rect.height) {
        setAspect(rect.height / rect.width);
      }
    } catch (err) {
      console.error('Failed to generate 3D texture', err);
    }
  };

  // Generate texture whenever the user switches to 3D, or when store changes while in 3D
  useEffect(() => {
    if (viewMode === '3d') {
      // Small timeout to allow DOM to settle before snapshot
      const timer = setTimeout(generateTexture, 100);
      return () => clearTimeout(timer);
    }
  }, [viewMode, store]);

  return (
    <div className="flex flex-col md:flex-row md:h-screen md:overflow-hidden">
      {/* Form Column - Left */}
      <div className="w-full md:w-[45%] lg:w-[40%] xl:w-[35%] border-b md:border-b-0 md:border-r border-border/50 bg-background overflow-y-auto p-6 pb-24 print:hidden">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Invoice Generator</h1>
            <p className="text-sm text-foreground/60 mt-1">Create and configure your invoice</p>
          </div>
          <div className="flex items-center gap-2">
             <Button
                variant="secondary"
                onClick={() => setViewMode(prev => prev === '2d' ? '3d' : '2d')}
                title="Toggle 3D View"
              >
                {viewMode === '2d' ? <View className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
             </Button>
          </div>
        </div>
        
        <InvoiceForm />
      </div>

      {/* Preview Column - Right */}
      <div className="w-full md:flex-1 bg-surface/30 relative flex flex-col print:block print:w-full print:bg-white overflow-hidden">
        {/* Preview Header (Hidden in Print) */}
        <div className="absolute top-0 inset-x-0 h-16 border-b border-border/50 bg-background/80 backdrop-blur-md flex items-center justify-between px-6 z-20 print:hidden">
          <div className="flex items-center gap-3">
             <span className="text-sm font-medium">Preview Mode: {viewMode.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handlePrint} className="gap-2 rounded-xl">
              <Printer className="w-4 h-4" />
              Download PDF / Print
            </Button>
          </div>
        </div>

        {/* 2D Preview Container (Hidden off-screen when in 3D mode to allow capturing) */}
        <div 
          className={`flex-1 overflow-y-auto pt-24 pb-12 px-6 flex items-start justify-center print:p-0 print:pt-0 print:block ${viewMode === '3d' ? 'absolute opacity-0 pointer-events-none -z-10' : 'relative z-10'}`}
        >
           <div 
             ref={previewRef}
             className="w-full max-w-[800px] shadow-2xl bg-white text-black min-h-[1056px] print:shadow-none print:w-full print:min-h-0 print:max-w-none origin-top"
           >
             <InvoicePreview />
           </div>
        </div>

        {/* 3D Preview Container */}
        {viewMode === '3d' && (
          <div className="absolute inset-0 pt-16 z-10">
             <div className="w-full h-full rounded-2xl overflow-hidden shadow-inner border border-border/10 bg-gradient-to-b from-surface/40 to-surface/10">
                <ThreeDViewer textureUrl={textureUrl} aspect={aspect} />
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
