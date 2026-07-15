'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Eye, FileText, AlignLeft, Users, Calendar, Type } from 'lucide-react';
import { toPng } from 'html-to-image';
import { ThreeDViewer } from '@/components/core/ThreeDViewer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAgent } from '@/context/AgentContext';

const TEMPLATES = {
  executive: 'Executive Summary',
  minutes: 'Meeting Minutes',
  adr: 'Architecture Decision Record'
};

export default function NotesClient() {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [textureUrl, setTextureUrl] = useState<string>('');
  const [aspect, setAspect] = useState<number>(1.414);
  const [template, setTemplate] = useState<keyof typeof TEMPLATES>('minutes');
  const [title, setTitle] = useState('Weekly Sync');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendees, setAttendees] = useState('Alice, Bob, Charlie');
  const [notes, setNotes] = useState('# Discussion Points\n\n- Discussed Q3 roadmap\n- Reviewed architecture for new microservices\n- Allocated budget for cloud resources\n\n## Action Items\n\n1. **Alice**: Draft the API spec by Tuesday\n2. **Bob**: Provision AWS staging environment\n3. **Charlie**: Schedule follow-up sync');

  const previewRef = useRef<HTMLDivElement>(null);


  const generateTexture = async () => {
    if (!previewRef.current) return;
    try {
      const dataUrl = await toPng(previewRef.current, {
        quality: 0.9,
        pixelRatio: 1.5,
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
    }
  };

  useEffect(() => {
    if (viewMode === '3d') {
      const timer = setTimeout(generateTexture, 800);
      return () => clearTimeout(timer);
    }
  }, [viewMode, title, date, attendees, notes, template]);

  const { registerPage, unregisterPage } = useAgent();

  useEffect(() => {
    registerPage(
      'Meeting Notes',
      `{
        "template": "executive | minutes | adr",
        "title": "string",
        "date": "YYYY-MM-DD",
        "attendees": "string",
        "notes": "string (markdown)"
      }`,
      (data: any) => {
        if (data.template && Object.keys(TEMPLATES).includes(data.template)) {
          setTemplate(data.template as keyof typeof TEMPLATES);
        }
        if (data.title) setTitle(data.title);
        if (data.date) setDate(data.date);
        if (data.attendees) setAttendees(data.attendees);
        if (data.notes) setNotes(data.notes);
      }
    );
    return () => unregisterPage();
  }, [registerPage, unregisterPage]);

  return (
    <div className="flex flex-col md:flex-row md:h-screen md:overflow-hidden bg-background">
      {/* Left Sidebar - Form Editor */}
      <div className="w-full md:w-[320px] lg:w-[380px] xl:w-[420px] border-b md:border-b-0 md:border-r border-border/50 bg-surface/30 backdrop-blur-md flex flex-col md:h-full z-10 overflow-y-auto">
        <div className="p-6 border-b border-border/50 sticky top-0 bg-surface/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6 text-primary shrink-0" />
            <div>
              <h2 className="text-lg font-bold tracking-tight">Meeting to Report</h2>
              <p className="text-xs text-foreground/60">Generate structured notes</p>
            </div>
          </div>

          {/* View Toggle */}
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

        <div className="p-6 space-y-6">
          {/* Metadata */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <input name="title"
                  type="text"
                  placeholder="Meeting Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-foreground/5 border border-border/50 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <input name="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-foreground/5 border border-border/50 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground/80"
                />
              </div>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <input name="attendees"
                  type="text"
                  placeholder="Attendees (comma separated)"
                  value={attendees}
                  onChange={(e) => setAttendees(e.target.value)}
                  className="w-full bg-foreground/5 border border-border/50 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-foreground/30"
                />
              </div>
            </div>
          </div>

          {/* Markdown Input */}
          <div className="space-y-3 flex-1 flex flex-col min-h-[300px]">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 flex items-center gap-2">
              <AlignLeft className="w-3 h-3" /> Raw Notes (Markdown)
            </label>
            <textarea name="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex-1 w-full bg-foreground/5 border border-border/50 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono resize-none custom-scrollbar"
              placeholder="Type your notes here..."
            />
          </div>
        </div>
      </div>

      {/* Right Content - Document Preview */}
      <div className="flex-1 relative bg-foreground/5 overflow-hidden flex flex-col min-h-[500px] md:h-screen">
        <div className={`flex-1 overflow-y-auto p-8 flex justify-center items-start custom-scrollbar ${viewMode === '3d' ? 'absolute opacity-0 pointer-events-none -z-10 w-full h-full' : 'relative z-10'}`}>
          {/* The Document */}
          <div
            ref={previewRef}
            className="bg-white w-full max-w-[800px] h-fit shadow-2xl origin-top rounded-sm flex flex-col p-12 relative"
            style={{ minHeight: '1131px', color: '#1a1a1a', fontFamily: '"Inter", sans-serif' }}
          >
            {/* Header */}
            <div className="border-b-2 border-gray-900 pb-6 mb-8">
              <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">
                {TEMPLATES[template]}
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight mb-4">{title || 'Untitled Document'}</h1>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-500 w-24 inline-block">Date:</span>
                  {date}
                </div>
                <div>
                  <span className="font-semibold text-gray-500 w-24 inline-block">Attendees:</span>
                  {attendees || 'None specified'}
                </div>
              </div>
            </div>

            {/* Document Content */}
            <div className="prose prose-sm md:prose-base prose-slate max-w-full break-words mb-12 flex-1">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {notes}
              </ReactMarkdown>
            </div>
            
            {/* Footer */}
            <div className="text-center text-xs text-gray-400 border-t border-gray-100 pt-4 mt-auto w-full">
              Generated by Hephaestus Meeting-to-Report
            </div>
          </div>
        </div>

        {viewMode === '3d' && (
          <div className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-10">
            <ThreeDViewer textureUrl={textureUrl} aspect={aspect} />
          </div>
        )}
      </div>
    </div>
  );
}
