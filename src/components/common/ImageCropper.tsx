'use client';

import React, { useState, useRef, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from 'react';
import { ZoomIn, ZoomOut, Check, X } from 'lucide-react';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedDataUrl: string) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

export default function ImageCropper({ imageSrc, onCropComplete, onCancel, aspectRatio = 1 }: ImageCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handlePointerDown = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    setPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handlePointerUp = () => setIsDragging(false);

  // Mouse Handlers
  const onMouseDown = (e: ReactMouseEvent) => handlePointerDown(e.clientX, e.clientY);
  const onMouseMove = (e: ReactMouseEvent) => handlePointerMove(e.clientX, e.clientY);
  const onMouseUp = () => handlePointerUp();
  const onMouseLeave = () => handlePointerUp();

  // Touch Handlers
  const onTouchStart = (e: ReactTouchEvent) => handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchMove = (e: ReactTouchEvent) => handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchEnd = () => handlePointerUp();

  // Scroll to Zoom
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newZoom = Math.max(0.2, Math.min(zoom - e.deltaY * 0.005, 5));
    setZoom(newZoom);
  };

  // The Cropping logic
  const handleCrop = async () => {
    if (!imageRef.current || !containerRef.current) return;
    
    // Create an off-screen canvas to draw the cropped image
    const canvas = document.createElement('canvas');
    // Using a fixed max output size for the cropped image
    const TARGET_SIZE = 512;
    canvas.width = TARGET_SIZE;
    canvas.height = TARGET_SIZE / aspectRatio;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Calculate the crop from DOM layout constraints to natural image sizes
    const imgEl = imageRef.current;
    const container = containerRef.current;
    
    // Size of the visual container doing the masking
    const cW = container.clientWidth;
    const cH = container.clientHeight;
    
    // Image natural dimensions
    const scaleX = imgEl.naturalWidth / imgEl.width;
    const scaleY = imgEl.naturalHeight / imgEl.height;
    
    // Calculate final scale factoring in the state zoom
    const totalScaleX = scaleX / zoom;
    const totalScaleY = scaleY / zoom;

    // Because object-contain centers the image, we need to find bounding offsets
    const visibleWidth = imgEl.width * zoom;
    const visibleHeight = imgEl.height * zoom;
    
    // Calculate crop origin considering CSS positioning + user dragging
    // Center is 0,0 for my drag math
    const cropX = ((visibleWidth - cW) / 2 - position.x) * totalScaleX;
    const cropY = ((visibleHeight - cH) / 2 - position.y) * totalScaleY;
    
    // Draw
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
      imgEl,
      cropX, // source X
      cropY, // source Y
      cW * totalScaleX, // source Width
      cH * totalScaleY, // source Height
      0, 0, // dest X, Y
      canvas.width, canvas.height // dest Width, Height
    );
    
    // Export 
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    onCropComplete(dataUrl);
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      <div className="bg-[#1a1d28] border border-[#2e3148] rounded-2xl w-full max-w-lg p-6 shadow-2xl">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[16px] font-semibold text-[#e1e2e8]">Ajustar Imagem</h2>
          <button onClick={onCancel} className="text-[#8b8fa3] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropper Area */}
        <div className="w-full bg-[#0c0e15] rounded-xl overflow-hidden relative shadow-inner flex flex-col items-center border border-[#1e2030]/50" style={{ height: '350px' }}>
            
          {/* Mask Container (Drag context) */}
          <div 
            ref={containerRef}
            className="w-full h-full relative cursor-move overflow-hidden flex items-center justify-center border-2 border-dashed border-[#3b82f6]/50"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onWheel={onWheel}
          >
            {/* The actual image being transformed */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              ref={imageRef}
              src={imageSrc} 
              alt="Crop Source" 
              draggable={false}
              style={{
                transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${zoom})`,
                transition: isDragging ? 'none' : 'transform 0.1s',
                maxHeight: '100%',
                maxWidth: '100%',
                pointerEvents: 'none',
                objectFit: 'contain'
              }}
            />
            {/* Overlay grid to show what fits */}
            <div className="absolute inset-0 pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
          </div>
        </div>
        
        <p className="text-[#5c5f77] text-center text-[12px] mt-4 mb-2">
          Role o mouse para dar zoom, arraste para reposicionar.
        </p>

        {/* Zoom Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button onClick={() => setZoom(Math.max(0.2, zoom - 0.2))} className="p-2 rounded-lg bg-[#12141d] border border-[#1e2030] text-[#8b8fa3] hover:text-white transition-colors">
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <input 
            type="range" 
            min="0.2" max="5" step="0.1" 
            value={zoom} 
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-48 accent-[#3b82f6]"
          />
          
          <button onClick={() => setZoom(Math.min(5, zoom + 0.2))} className="p-2 rounded-lg bg-[#12141d] border border-[#1e2030] text-[#8b8fa3] hover:text-white transition-colors">
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl border border-[#2e3148] text-[#8b8fa3] hover:bg-[#2e3148] hover:text-white transition-colors font-medium text-[13px]"
          >
            Cancelar
          </button>
          <button 
            onClick={handleCrop}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#3b82f6] text-white hover:bg-[#2563eb] shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-colors font-medium text-[13px]"
          >
            <Check className="w-4 h-4" />
            Aplicar Corte
          </button>
        </div>

      </div>
    </div>
  );
}
