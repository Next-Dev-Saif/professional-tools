'use client';

import { useState } from 'react';
import { Textarea } from '@/components/core/Textarea';
import { Select } from '@/components/core/Select';
import { Button } from '@/components/core/Button';
import { Input } from '@/components/core/Input';
import { DocPreview } from '@/components/page-sections/generator/DocPreview';
import { Sparkles, FileText, UserCircle, Building2, Briefcase, User, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAgent } from '@/context/AgentContext';
import { useEffect } from 'react';

export default function Home() {
  const [commitText, setCommitText] = useState('');
  const [docType, setDocType] = useState('Technical Documentation');
  
  // Context fields
  const [userName, setUserName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [clientName, setClientName] = useState('');

  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const { registerPage, unregisterPage } = useAgent();

  useEffect(() => {
    registerPage(
      'Commit to Document',
      `{
        "docType": "Technical Documentation | Project Update Report | Client Facing Release Notes | API Reference | Legal / Developer Agreement",
        "userName": "string",
        "companyName": "string",
        "clientName": "string",
        "commitText": "string"
      }`,
      (data: any) => {
        if (data.docType) setDocType(data.docType);
        if (data.userName) setUserName(data.userName);
        if (data.companyName) setCompanyName(data.companyName);
        if (data.clientName) setClientName(data.clientName);
        if (data.commitText) setCommitText(data.commitText);
      }
    );
    return () => unregisterPage();
  }, [registerPage, unregisterPage]);

  const docTypes = [
    { value: 'Technical Documentation', label: 'Technical Documentation' },
    { value: 'Project Update Report', label: 'Project Update Report' },
    { value: 'Client Facing Release Notes', label: 'Client Release Notes' },
    { value: 'API Reference', label: 'API Reference' },
    { value: 'Legal / Developer Agreement', label: 'Developer Agreement' },
  ];

  const handleGenerate = async () => {
    if (!commitText.trim()) return;
    
    setIsGenerating(true);
    setContent('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          commitText, 
          docType,
          userName,
          companyName,
          clientName
        }),
      });

      if (!res.ok) throw new Error('Failed to generate document');
      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setContent((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (error) {
      console.error(error);
      setContent('An error occurred while generating the document. Please ensure your API key is valid.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 md:mb-10"
      >
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-6 h-6 text-primary shrink-0" />
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">Hephaestus Docs</h1>
        </div>
        <p className="text-foreground/60 max-w-2xl text-[14px] md:text-[15px]">
          Transform raw commits and PR descriptions into beautifully crafted, professional documentation instantly.
        </p>
      </motion.header>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* Input Form Column */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4 flex flex-col gap-6"
        >
          <div className="glass p-6 md:p-8 rounded-2xl flex flex-col gap-6 shadow-sm border border-border/50">
            <div>
              <h2 className="text-lg font-semibold mb-1">Configuration</h2>
              <p className="text-sm text-foreground/60">Provide the core context below.</p>
            </div>

            <Select 
              label="Document Type" 
              options={docTypes} 
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              disabled={isGenerating}
              leftIcon={<BookOpen className="w-4 h-4" />}
            />

            <div className="space-y-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 mb-2 text-foreground/80">
                <UserCircle className="w-4 h-4" />
                <h3 className="text-sm font-medium">Author & Client Context (Optional)</h3>
              </div>
              <Input 
                label="Your Name / Role" 
                placeholder="e.g. John Doe, Lead Engineer"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                disabled={isGenerating}
                leftIcon={<User className="w-4 h-4" />}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Company Name" 
                  placeholder="e.g. Acme Corp"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={isGenerating}
                  leftIcon={<Building2 className="w-4 h-4" />}
                />
                <Input 
                  label="Client Name" 
                  placeholder="e.g. Globex Inc"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  disabled={isGenerating}
                  leftIcon={<Briefcase className="w-4 h-4" />}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border/50">
              <Textarea 
                label="Commit / PR Description" 
                placeholder="e.g. feat: implemented dynamic JWT authentication, fixed cache invalidation bugs in redis layer..."
                value={commitText}
                onChange={(e) => setCommitText(e.target.value)}
                className="min-h-[160px]"
                disabled={isGenerating}
              />
            </div>

            <Button 
              className="w-full mt-2" 
              onClick={handleGenerate} 
              isLoading={isGenerating}
              disabled={!commitText.trim()}
            >
              {!isGenerating && <Sparkles className="w-4 h-4 mr-2" />}
              Generate Document
            </Button>
          </div>
        </motion.div>

        {/* Preview Column */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-8 min-h-[500px] lg:h-auto"
        >
          <DocPreview content={content} isGenerating={isGenerating} />
        </motion.div>

      </div>
    </div>
  );
}
