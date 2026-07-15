'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Eye, AlignLeft, Plus, Trash2, Clock, AlertTriangle, CheckSquare } from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { ThreeDViewer } from '@/components/core/ThreeDViewer';
import { useAgent } from '@/context/AgentContext';

interface TimelineEvent {
  id: string;
  time: string;
  description: string;
}

interface ActionItem {
  id: string;
  owner: string;
  task: string;
}

export function PostMortemClient() {
  const docId = useId().replace(/:/g, '').toUpperCase();
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  const [incidentName, setIncidentName] = useState('Production Database Outage');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [severity, setSeverity] = useState('SEV-1');
  const [summary, setSummary] = useState('A brief outage occurred in the primary database cluster, causing 500 errors across the main application for approximately 45 minutes.');
  const [rootCause, setRootCause] = useState('A rogue migration script locked the users table, causing connection pooling exhaustion in the API tier.');

  const [timeline, setTimeline] = useState<TimelineEvent[]>([
    { id: '1', time: '14:00', description: 'Migration script deployed.' },
    { id: '2', time: '14:05', description: 'Alerts triggered for high connection count.' },
    { id: '3', time: '14:15', description: 'Engineering team begins investigation.' },
    { id: '4', time: '14:45', description: 'Migration rolled back. System recovers.' }
  ]);

  const [actionItems, setActionItems] = useState<ActionItem[]>([
    { id: '1', owner: 'Alice', task: 'Implement connection timeout limits.' },
    { id: '2', owner: 'Bob', task: 'Review migration scripts for table locks before deployment.' }
  ]);

  const previewRef = useRef<HTMLDivElement>(null);
  const [textureUrl, setTextureUrl] = useState<string>('');
  const [isGenerating3D, setIsGenerating3D] = useState(false);
  const [aspect, setAspect] = useState<number>(1.414);

  const addTimelineEvent = () => {
    setTimeline([...timeline, { id: Math.random().toString(36).substring(7), time: '00:00', description: '' }]);
  };

  const updateTimelineEvent = (id: string, field: keyof TimelineEvent, value: string) => {
    setTimeline(timeline.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const removeTimelineEvent = (id: string) => setTimeline(timeline.filter(t => t.id !== id));

  const addActionItem = () => {
    setActionItems([...actionItems, { id: Math.random().toString(36).substring(7), owner: '', task: '' }]);
  };

  const updateActionItem = (id: string, field: keyof ActionItem, value: string) => {
    setActionItems(actionItems.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const removeActionItem = (id: string) => setActionItems(actionItems.filter(a => a.id !== id));

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
  }, [viewMode, incidentName, date, severity, summary, rootCause, timeline, actionItems]);

  const { registerPage, unregisterPage } = useAgent();

  useEffect(() => {
    registerPage(
      'Post Mortem Builder',
      `{
        "incidentName": "string",
        "date": "YYYY-MM-DD",
        "severity": "SEV-1 | SEV-2 | SEV-3 | SEV-4",
        "summary": "string",
        "rootCause": "string",
        "timeline": [{"time": "HH:MM", "description": "string"}],
        "actionItems": [{"owner": "string", "task": "string"}]
      }`,
      (data: any) => {
        if (data.incidentName) setIncidentName(data.incidentName);
        if (data.date) setDate(data.date);
        if (data.severity) setSeverity(data.severity);
        if (data.summary) setSummary(data.summary);
        if (data.rootCause) setRootCause(data.rootCause);

        if (Array.isArray(data.timeline)) {
          setTimeline(data.timeline.map((t: any, i: number) => ({
            id: `agent-time-${i}`,
            time: t.time || '00:00',
            description: t.description || ''
          })));
        }

        if (Array.isArray(data.actionItems)) {
          setActionItems(data.actionItems.map((a: any, i: number) => ({
            id: `agent-action-${i}`,
            owner: a.owner || '',
            task: a.task || ''
          })));
        }
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
          <title>Post-Mortem: ${incidentName}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; padding: 2rem; max-width: 800px; margin: 0 auto; color: #1a1a1a; }
            h1 { font-size: 2rem; font-weight: 800; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; margin-bottom: 2rem; }
            h2 { font-size: 1.25rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.25rem; }
            .badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-weight: bold; font-size: 0.875rem; background: #fee2e2; color: #b91c1c; }
            .timeline-grid { display: grid; grid-template-columns: 80px 1fr; gap: 1rem; margin-bottom: 0.5rem; }
            .time { font-family: monospace; font-weight: bold; color: #6b7280; }
            table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
            th, td { border: 1px solid #e5e7eb; padding: 0.75rem; text-align: left; }
            th { background-color: #f9fafb; font-weight: 600; color: #374151; }
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

  return (
    <div className="flex flex-col md:flex-row md:h-screen md:overflow-hidden bg-background">
      {/* Left Sidebar */}
      <div className="w-full md:w-[320px] lg:w-[400px] xl:w-[460px] border-b md:border-b-0 md:border-r border-border/50 bg-surface/30 backdrop-blur-md flex flex-col md:h-full z-10 overflow-y-auto custom-scrollbar">
        <div className="p-6 border-b border-border/50 sticky top-0 bg-surface/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
            <div>
              <h2 className="text-lg font-bold tracking-tight">Post-Mortem</h2>
              <p className="text-xs text-foreground/60">Incident RCA Generator</p>
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
              <AlertTriangle className="w-3 h-3" /> Incident Details
            </label>
            <div className="space-y-3">
              <input name="incidentName"
                type="text"
                placeholder="Incident Name"
                value={incidentName}
                onChange={(e) => setIncidentName(e.target.value)}
                className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <div className="grid grid-cols-2 gap-3">
                <input name="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground/80"
                />
                <select name="severity"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold text-red-500"
                >
                  <option value="SEV-1">SEV-1 (Critical)</option>
                  <option value="SEV-2">SEV-2 (Major)</option>
                  <option value="SEV-3">SEV-3 (Minor)</option>
                  <option value="SEV-4">SEV-4 (Low)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="h-px bg-border/50 w-full" />

          {/* Analysis */}
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 flex items-center gap-2">
              <AlignLeft className="w-3 h-3" /> Analysis
            </label>
            <div className="space-y-3">
              <label className="text-[11px] font-semibold text-foreground/50 uppercase tracking-wider block">Executive Summary</label>
              <textarea name="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-y custom-scrollbar"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-semibold text-foreground/50 uppercase tracking-wider block">Root Cause</label>
              <textarea name="rootCause"
                value={rootCause}
                onChange={(e) => setRootCause(e.target.value)}
                rows={3}
                className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-y custom-scrollbar"
              />
            </div>
          </div>

          <div className="h-px bg-border/50 w-full" />

          {/* Timeline */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 flex items-center gap-2">
                <Clock className="w-3 h-3" /> Timeline
              </label>
              <button
                onClick={addTimelineEvent}
                className="flex items-center gap-1 text-[11px] font-bold text-primary hover:bg-primary/10 px-2 py-1 rounded-md transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Event
              </button>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {timeline.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-2 relative group"
                  >
                    <input name="event.time"
                      type="text"
                      value={event.time}
                      onChange={(e) => updateTimelineEvent(event.id, 'time', e.target.value)}
                      className="w-20 bg-foreground/5 border border-border/50 rounded-lg px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-primary transition-all"
                    />
                    <input name="event.description"
                      type="text"
                      value={event.description}
                      onChange={(e) => updateTimelineEvent(event.id, 'description', e.target.value)}
                      className="flex-1 bg-foreground/5 border border-border/50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary transition-all"
                      placeholder="Event description..."
                    />
                    <button
                      onClick={() => removeTimelineEvent(event.id)}
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

          {/* Action Items */}
          <div className="space-y-4 pb-8">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 flex items-center gap-2">
                <CheckSquare className="w-3 h-3" /> Action Items
              </label>
              <button
                onClick={addActionItem}
                className="flex items-center gap-1 text-[11px] font-bold text-primary hover:bg-primary/10 px-2 py-1 rounded-md transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {actionItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-2 relative group"
                  >
                    <input name="item.owner"
                      type="text"
                      value={item.owner}
                      onChange={(e) => updateActionItem(item.id, 'owner', e.target.value)}
                      className="w-24 bg-foreground/5 border border-border/50 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-primary transition-all"
                      placeholder="Owner"
                    />
                    <input name="item.task"
                      type="text"
                      value={item.task}
                      onChange={(e) => updateActionItem(item.id, 'task', e.target.value)}
                      className="flex-1 bg-foreground/5 border border-border/50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary transition-all"
                      placeholder="Task description..."
                    />
                    <button
                      onClick={() => removeActionItem(item.id)}
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
            className="bg-white w-full max-w-[800px] h-fit shadow-2xl origin-top rounded-sm flex flex-col p-12 relative text-slate-900"
            style={{ minHeight: '1131px', fontFamily: '"Inter", sans-serif' }}
          >
            {/* Header */}
            <div className="border-b-2 border-slate-200 pb-6 mb-8 flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-slate-900">{incidentName || 'Untitled Incident'}</h1>
                <p className="text-sm font-medium text-slate-500">Date: {date}</p>
              </div>
              <div className={`px-3 py-1 rounded-full font-bold text-sm tracking-wider uppercase border ${severity.includes('1') ? 'bg-red-50 text-red-700 border-red-200' : severity.includes('2') ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                {severity}
              </div>
            </div>

            {/* Summary & Root Cause */}
            <div className="space-y-8 flex-1 mb-12">
              <section>
                <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">Executive Summary</h2>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{summary}</p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">Root Cause Analysis</h2>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{rootCause}</p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Timeline</h2>
                <div className="space-y-4">
                  {timeline.map((event, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-16 text-sm font-mono font-bold text-slate-500 shrink-0">{event.time}</div>
                      <div className="text-sm text-slate-700 border-l-2 border-slate-200 pl-4 pb-4">{event.description}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">Action Items</h2>
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-200">
                      <th className="py-2 px-3 font-semibold text-slate-700 w-1/4">Owner</th>
                      <th className="py-2 px-3 font-semibold text-slate-700">Task</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actionItems.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-100">
                        <td className="py-2 px-3 text-slate-600 font-medium">{item.owner}</td>
                        <td className="py-2 px-3 text-slate-600">{item.task}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-slate-400 border-t border-slate-200 pt-4 mt-auto w-full">
              Post-Mortem Document • Hephaestus Engineering • {docId}
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
