'use client';

import { useDocumentStore } from '@/store/documentStore';
import { MouseEvent } from 'react';
import { Rnd } from 'react-rnd';
import QRCode from 'react-qr-code';

export function HTMLCanvas() {
  const { elements, selectedElementId, setSelectedElement, updateElement, globalSettings } = useDocumentStore();

  const handleCanvasClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) setSelectedElement(null);
  };

  return (
    <div 
      className="flex-1 overflow-auto bg-foreground/5 relative flex items-start justify-center p-8 lg:p-12 print:p-0 print:bg-white"
      onClick={handleCanvasClick}
    >
      <div 
        className="w-full max-w-[794px] min-h-[1123px] bg-white shadow-xl rounded-sm relative origin-top print:shadow-none print:min-h-0"
        style={{ 
          aspectRatio: '1 / 1.414',
          backgroundColor: globalSettings.backgroundColor,
          fontFamily: globalSettings.fontFamily,
          color: '#1a1a1a',
        }}
        onClick={handleCanvasClick}
      >
        {elements.map((el) => {
          const isSelected = el.id === selectedElementId;
          return (
            <Rnd
              key={el.id}
              size={{ width: el.width, height: el.height }}
              position={{ x: el.x, y: el.y }}
              onDragStop={(e, d) => updateElement(el.id, { x: d.x, y: d.y })}
              onResizeStop={(e, direction, ref, delta, position) => {
                updateElement(el.id, {
                  width: parseInt(ref.style.width, 10),
                  height: parseInt(ref.style.height, 10),
                  ...position,
                });
              }}
              onClick={(e: any) => {
                e.stopPropagation();
                setSelectedElement(el.id);
              }}
              className={`absolute group ${isSelected ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-primary/50'}`}
              style={{ zIndex: el.zIndex, ...el.style }}
              bounds="parent"
            >
              <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
                {el.type === 'text' && (
                  <div className="w-full h-full p-2 whitespace-pre-wrap outline-none" style={{ color: globalSettings.primaryColor }}>
                    {el.content}
                  </div>
                )}
                {el.type === 'qr' && (
                  <div className="w-full h-full bg-white p-2">
                    <QRCode value={el.content || 'https://hephaestus.com'} size={256} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
                  </div>
                )}
                {el.type === 'stamp' && (
                  <div className="w-full h-full border-4 border-red-600 rounded-lg flex items-center justify-center p-2 opacity-80" style={{ transform: 'rotate(-5deg)' }}>
                    <span className="text-red-600 font-black text-2xl tracking-widest uppercase text-center">{el.content}</span>
                  </div>
                )}
                {el.type === 'image' && (
                  <img src={el.content} alt="custom element" className="w-full h-full object-cover pointer-events-none" />
                )}
                {el.type === 'shape' && (
                  <div className="w-full h-full bg-primary/20 border-2 border-primary/50 rounded-lg" />
                )}
                {el.type === 'html' && (
                  <div 
                    className="w-full h-full text-foreground/90 overflow-hidden" 
                    dangerouslySetInnerHTML={{ __html: el.content || '' }} 
                  />
                )}
              </div>
            </Rnd>
          );
        })}
      </div>
    </div>
  );
}
