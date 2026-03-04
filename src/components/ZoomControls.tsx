'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { RefObject } from 'react';
import { RotateCw, FlipHorizontal2 } from 'lucide-react';

interface Props {
  pzRef: RefObject<any>;
  svgRef?: RefObject<SVGSVGElement | null>;
  onRotate?: () => void;
  onFlip?: () => void;
}

export default function ZoomControls({ pzRef, onRotate, onFlip }: Props) {
  const zoomIn = () => pzRef.current?.zoomIn();
  const zoomOut = () => pzRef.current?.zoomOut();
  const fit = () => { pzRef.current?.fit(); pzRef.current?.center(); };

  return (
    <div className="absolute bottom-5 right-5 flex flex-col gap-1.5 z-[1000]">
      <button onClick={zoomIn} title="Zoom In"
        className="w-9 h-9 rounded-lg glass flex items-center justify-center text-text-dim hover:text-accent text-sm cursor-pointer transition-all hover:border-accent/30">
        +
      </button>
      <button onClick={zoomOut} title="Zoom Out"
        className="w-9 h-9 rounded-lg glass flex items-center justify-center text-text-dim hover:text-accent text-sm cursor-pointer transition-all hover:border-accent/30">
        −
      </button>
      <button onClick={fit} title="Fit to Screen"
        className="w-9 h-9 rounded-lg glass flex items-center justify-center text-text-dim hover:text-accent text-[10px] cursor-pointer transition-all hover:border-accent/30">
        ⊞
      </button>
      {onRotate && (
        <button onClick={onRotate} title="Rotacionar 90°"
          className="w-9 h-9 rounded-lg glass flex items-center justify-center text-text-dim hover:text-accent cursor-pointer transition-all hover:border-accent/30">
          <RotateCw className="w-4 h-4" />
        </button>
      )}
      {onFlip && (
        <button onClick={onFlip} title="Espelhar horizontal"
          className="w-9 h-9 rounded-lg glass flex items-center justify-center text-text-dim hover:text-accent cursor-pointer transition-all hover:border-accent/30">
          <FlipHorizontal2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
