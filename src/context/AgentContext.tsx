'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type AgentContextType = {
  activePageName: string | null;
  activeSchema: string | null;
  onFill: ((data: any) => void) | null;
  registerPage: (name: string, schema: string, onFillCallback: (data: any) => void) => void;
  unregisterPage: () => void;
};

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [activePageName, setActivePageName] = useState<string | null>(null);
  const [activeSchema, setActiveSchema] = useState<string | null>(null);
  const [onFill, setOnFill] = useState<((data: any) => void) | null>(null);

  const registerPage = React.useCallback((name: string, schema: string, onFillCallback: (data: any) => void) => {
    setActivePageName(name);
    setActiveSchema(schema);
    setOnFill(() => onFillCallback);
  }, []);

  const unregisterPage = React.useCallback(() => {
    setActivePageName(null);
    setActiveSchema(null);
    setOnFill(null);
  }, []);

  const contextValue = React.useMemo(() => ({
    activePageName,
    activeSchema,
    onFill,
    registerPage,
    unregisterPage
  }), [activePageName, activeSchema, onFill, registerPage, unregisterPage]);

  return (
    <AgentContext.Provider value={contextValue}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
}
