'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Eye, AlignLeft, Code, Plus, Trash2, Webhook } from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { ThreeDViewer } from '@/components/core/ThreeDViewer';

interface ApiField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  description: string;
}

const TEMPLATES = {
  custom: {
    name: 'Custom / Manual'
  },
  createUser: {
    name: 'Create User (POST)',
    title: 'Create User',
    method: 'POST',
    url: '/api/v1/users',
    description: 'Creates a new user in the system and dispatches a welcome email. Requires admin or system-level API tokens.',
    requestFields: [
      { id: '1', name: 'email', type: 'string', required: true, description: 'The unique email address for the new user.' },
      { id: '2', name: 'role', type: 'string', required: false, description: 'User role. Defaults to "member". Must be one of ["member", "admin"].' },
      { id: '3', name: 'metadata', type: 'object', required: false, description: 'Optional key-value pairs for additional CRM tracking data.' }
    ],
    responseFields: [
      { id: 'r1', name: 'id', type: 'string', required: true, description: 'The globally unique UUID of the newly created user.' },
      { id: 'r2', name: 'created_at', type: 'timestamp', required: true, description: 'ISO 8601 timestamp of creation.' },
      { id: 'r3', name: 'status', type: 'string', required: true, description: 'Returns "active" or "pending_verification".' }
    ]
  },
  getDashboard: {
    name: 'Fetch Dashboard Metrics (GET)',
    title: 'Fetch Dashboard Metrics',
    method: 'GET',
    url: '/api/v1/dashboard/metrics',
    description: 'Retrieves aggregated metrics for the user dashboard. Data is cached for 5 minutes to reduce database load.',
    requestFields: [
      { id: '1', name: 'start_date', type: 'string', required: false, description: 'ISO 8601 date string. Defaults to 30 days ago.' },
      { id: '2', name: 'end_date', type: 'string', required: false, description: 'ISO 8601 date string. Defaults to current date.' },
      { id: '3', name: 'include_archived', type: 'boolean', required: false, description: 'Whether to include data from archived projects.' }
    ],
    responseFields: [
      { id: 'r1', name: 'total_revenue', type: 'number', required: true, description: 'Total revenue in USD cents for the requested period.' },
      { id: 'r2', name: 'active_users', type: 'number', required: true, description: 'Number of unique active users.' },
      { id: 'r3', name: 'growth_rate', type: 'number', required: true, description: 'Percentage growth compared to previous period.' }
    ]
  },
  deleteAccount: {
    name: 'Delete Account (DELETE)',
    title: 'Delete Account',
    method: 'DELETE',
    url: '/api/v1/accounts/:id',
    description: 'Permanently deletes an account and all associated data. This action cannot be undone. Triggers background cleanup jobs.',
    requestFields: [
      { id: '1', name: 'reason', type: 'string', required: false, description: 'Optional reason provided by the user for leaving.' },
      { id: '2', name: 'confirmation_code', type: 'string', required: true, description: '6-digit OTP code sent to user email to confirm deletion.' }
    ],
    responseFields: [
      { id: 'r1', name: 'success', type: 'boolean', required: true, description: 'Returns true if deletion was queued successfully.' },
      { id: 'r2', name: 'job_id', type: 'string', required: true, description: 'Background job ID to track cleanup progress.' }
    ]
  }
};

export function APIDocumenterClient() {
  const docId = useId().replace(/:/g, '').toUpperCase().slice(0, 6);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [template, setTemplate] = useState<keyof typeof TEMPLATES>('custom');
  
  const [title, setTitle] = useState('Create User');
  const [method, setMethod] = useState('POST');
  const [url, setUrl] = useState('/api/v1/users');
  const [description, setDescription] = useState('Creates a new user in the system and dispatches a welcome email. Requires admin or system-level API tokens.');
  
  const [requestFields, setRequestFields] = useState<ApiField[]>([
    { id: '1', name: 'email', type: 'string', required: true, description: 'The unique email address for the new user.' },
    { id: '2', name: 'role', type: 'string', required: false, description: 'User role. Defaults to "member". Must be one of ["member", "admin"].' },
    { id: '3', name: 'metadata', type: 'object', required: false, description: 'Optional key-value pairs for additional CRM tracking data.' }
  ]);
  
  const [responseFields, setResponseFields] = useState<ApiField[]>([
    { id: 'r1', name: 'id', type: 'string', required: true, description: 'The globally unique UUID of the newly created user.' },
    { id: 'r2', name: 'created_at', type: 'timestamp', required: true, description: 'ISO 8601 timestamp of creation.' },
    { id: 'r3', name: 'status', type: 'string', required: true, description: 'Returns "active" or "pending_verification".' }
  ]);

  const previewRef = useRef<HTMLDivElement>(null);
  const [textureUrl, setTextureUrl] = useState<string>('');
  const [isGenerating3D, setIsGenerating3D] = useState(false);
  const [aspect, setAspect] = useState<number>(1.414);

  const addField = (setter: React.Dispatch<React.SetStateAction<ApiField[]>>, list: ApiField[]) => {
    setter([...list, { id: Math.random().toString(36).substring(7), name: '', type: 'string', required: false, description: '' }]);
  };

  const updateField = (setter: React.Dispatch<React.SetStateAction<ApiField[]>>, list: ApiField[], id: string, field: keyof ApiField, value: any) => {
    setter(list.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeField = (setter: React.Dispatch<React.SetStateAction<ApiField[]>>, list: ApiField[], id: string) => {
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
      setTitle(t.title);
      setMethod(t.method);
      setUrl(t.url);
      setDescription(t.description);
      setRequestFields(t.requestFields);
      setResponseFields(t.responseFields);
    }
  };

  useEffect(() => {
    if (viewMode === '3d') {
      const timer = setTimeout(generateTexture, 800);
      return () => clearTimeout(timer);
    }
  }, [viewMode, title, method, url, description, requestFields, responseFields]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !previewRef.current) return;
    const contentHtml = previewRef.current.innerHTML;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>API Doc: ${title}</title>
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
      <div className="w-full md:w-[340px] lg:w-[420px] xl:w-[500px] border-b md:border-b-0 md:border-r border-border/50 bg-surface/30 backdrop-blur-md flex flex-col md:h-full z-10 overflow-y-auto custom-scrollbar shrink-0">
        <div className="p-6 border-b border-border/50 sticky top-0 bg-surface/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-3 mb-6">
            <Webhook className="w-6 h-6 text-cyan-500 shrink-0" />
            <div>
              <h2 className="text-lg font-bold tracking-tight">API Documenter</h2>
              <p className="text-xs text-foreground/60">Generate payload contracts</p>
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
              <Webhook className="w-3 h-3" /> Endpoint Config
            </label>
            <div className="space-y-3">
              <input name="title"
                type="text"
                placeholder="Endpoint Title (e.g. Create User)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-cyan-500"
              />
              <div className="flex gap-2">
                <select name="method"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className={`w-32 bg-foreground/5 border border-border/50 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all
                    ${method === 'GET' ? 'text-blue-500' : 
                      method === 'POST' ? 'text-emerald-500' : 
                      method === 'PUT' ? 'text-orange-500' : 
                      method === 'DELETE' ? 'text-rose-500' : 
                      'text-foreground'}`}
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                </select>
                <input name="url"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="/api/v1/..."
                  className="flex-1 bg-foreground/5 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                />
              </div>
              <textarea name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Endpoint description..."
                rows={3}
                className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-y custom-scrollbar"
              />
            </div>
          </div>

          <div className="h-px bg-border/50 w-full" />

          {/* Request Fields */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 flex items-center gap-2">
                <Code className="w-3 h-3 text-emerald-500" /> Request Payload
              </label>
              <button 
                onClick={() => addField(setRequestFields, requestFields)}
                className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 hover:bg-emerald-500/10 px-2 py-1 rounded-md transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Field
              </button>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {requestFields.map((field) => (
                  <motion.div 
                    key={field.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col gap-2 relative group p-3 bg-foreground/5 border border-border/50 rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                      <input name="field.name"
                        type="text"
                        value={field.name}
                        onChange={(e) => updateField(setRequestFields, requestFields, field.id, 'name', e.target.value)}
                        className="flex-1 bg-background border border-border/50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500 transition-all font-mono font-bold text-foreground/80"
                        placeholder="field_name"
                      />
                      <input name="field.type"
                        type="text"
                        value={field.type}
                        onChange={(e) => updateField(setRequestFields, requestFields, field.id, 'type', e.target.value)}
                        className="w-24 bg-background border border-border/50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500 transition-all font-mono text-emerald-500/80"
                        placeholder="type"
                      />
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground/60 uppercase cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateField(setRequestFields, requestFields, field.id, 'required', e.target.checked)}
                          className="rounded border-border/50 text-emerald-500 focus:ring-emerald-500/20"
                        />
                        Req
                      </label>
                      <button 
                        onClick={() => removeField(setRequestFields, requestFields, field.id)}
                        className="p-1.5 text-foreground/30 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input name="field.description"
                      type="text"
                      value={field.description}
                      onChange={(e) => updateField(setRequestFields, requestFields, field.id, 'description', e.target.value)}
                      className="w-full bg-background border border-border/50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500 transition-all text-foreground/70"
                      placeholder="Description..."
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="h-px bg-border/50 w-full" />

          {/* Response Fields */}
          <div className="space-y-4 pb-8">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 flex items-center gap-2">
                <Code className="w-3 h-3 text-blue-500" /> Response Payload
              </label>
              <button 
                onClick={() => addField(setResponseFields, responseFields)}
                className="flex items-center gap-1 text-[11px] font-bold text-blue-500 hover:bg-blue-500/10 px-2 py-1 rounded-md transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Field
              </button>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {responseFields.map((field) => (
                  <motion.div 
                    key={field.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col gap-2 relative group p-3 bg-foreground/5 border border-border/50 rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                      <input name="field.name"
                        type="text"
                        value={field.name}
                        onChange={(e) => updateField(setResponseFields, responseFields, field.id, 'name', e.target.value)}
                        className="flex-1 bg-background border border-border/50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 transition-all font-mono font-bold text-foreground/80"
                        placeholder="field_name"
                      />
                      <input name="field.type"
                        type="text"
                        value={field.type}
                        onChange={(e) => updateField(setResponseFields, responseFields, field.id, 'type', e.target.value)}
                        className="w-24 bg-background border border-border/50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 transition-all font-mono text-blue-500/80"
                        placeholder="type"
                      />
                      <button 
                        onClick={() => removeField(setResponseFields, responseFields, field.id)}
                        className="p-1.5 text-foreground/30 hover:text-rose-500 transition-colors ml-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input name="field.description"
                      type="text"
                      value={field.description}
                      onChange={(e) => updateField(setResponseFields, responseFields, field.id, 'description', e.target.value)}
                      className="w-full bg-background border border-border/50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 transition-all text-foreground/70"
                      placeholder="Description..."
                    />
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
            className="bg-white w-full max-w-[800px] h-fit shadow-2xl origin-top rounded-sm flex flex-col p-12 relative text-slate-800"
            style={{ minHeight: '1131px', fontFamily: '"Inter", sans-serif' }}
          >
            {/* Header */}
            <div className="border-b border-slate-200 pb-8 mb-10">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-6">{title || 'Untitled Endpoint'}</h1>
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className={`px-3 py-1 rounded-md text-sm font-bold tracking-wider 
                  ${method === 'GET' ? 'bg-blue-100 text-blue-700' : 
                    method === 'POST' ? 'bg-emerald-100 text-emerald-700' : 
                    method === 'PUT' ? 'bg-orange-100 text-orange-700' : 
                    method === 'DELETE' ? 'bg-rose-100 text-rose-700' : 
                    'bg-slate-200 text-slate-700'}`}
                >
                  {method}
                </span>
                <span className="font-mono text-slate-600 font-semibold tracking-tight">{url}</span>
              </div>
              
              {description && (
                <div className="mt-6 text-slate-600 text-[15px] leading-relaxed">
                  {description}
                </div>
              )}
            </div>

            {/* Content Container */}
            <div className="flex-1 space-y-12 mb-12">
              {/* Request */}
              {requestFields.length > 0 && (
                <section>
                  <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
                    Request Payload
                  </h2>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-[14px]">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4 font-semibold text-slate-700 w-[35%]">Field</th>
                          <th className="py-3 px-4 font-semibold text-slate-700 w-[15%]">Type</th>
                          <th className="py-3 px-4 font-semibold text-slate-700 w-[50%]">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {requestFields.map((f, i) => (
                          <tr key={i} className="bg-white">
                            <td className="py-3 px-4">
                              <span className="font-mono font-semibold text-slate-800">{f.name}</span>
                              {f.required && <span className="ml-2 text-[10px] uppercase font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">Required</span>}
                            </td>
                            <td className="py-3 px-4 text-emerald-600 font-mono text-[13px]">{f.type}</td>
                            <td className="py-3 px-4 text-slate-600 leading-relaxed">{f.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Response */}
              {responseFields.length > 0 && (
                <section>
                  <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
                    Response Payload
                  </h2>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-[14px]">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4 font-semibold text-slate-700 w-[35%]">Field</th>
                          <th className="py-3 px-4 font-semibold text-slate-700 w-[15%]">Type</th>
                          <th className="py-3 px-4 font-semibold text-slate-700 w-[50%]">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {responseFields.map((f, i) => (
                          <tr key={i} className="bg-white">
                            <td className="py-3 px-4">
                              <span className="font-mono font-semibold text-slate-800">{f.name}</span>
                            </td>
                            <td className="py-3 px-4 text-blue-600 font-mono text-[13px]">{f.type}</td>
                            <td className="py-3 px-4 text-slate-600 leading-relaxed">{f.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-slate-400 border-t border-slate-200 pt-4 mt-auto w-full font-medium">
              API Documenter by Hephaestus • {docId}
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
