'use client';

import { Toolbar } from '@/components/page-sections/visual-builder/Toolbar';
import { PropertySidebar } from '@/components/page-sections/visual-builder/PropertySidebar';
import { HTMLCanvas } from '@/components/page-sections/visual-builder/HTMLCanvas';

export default function VisualBuilder() {
  return (
    <div className="h-screen flex flex-col bg-background/50 overflow-hidden">
      <Toolbar />

      <div className="flex-1 flex overflow-hidden">
        <HTMLCanvas />
        <PropertySidebar />
      </div>
    </div>
  );
}
