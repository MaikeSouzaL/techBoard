'use client';

import { RefObject, useEffect, useRef, useCallback } from 'react';
import { useMapperStore } from '../store/useMapperStore';

interface Props {
  svgRef: RefObject<SVGSVGElement | null>;
  pzRef: RefObject<any>;
}

export default function FloatingControls({ svgRef, pzRef }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isPreviewing, previewComp, confirmPreview, cancelPreview } = useMapperStore();

  const updatePosition = useCallback(() => {
    const c = containerRef.current, svg = svgRef.current;
    if (!c || !svg || !isPreviewing || !previewComp) { if (c) c.style.display = 'none'; return; }
    const vp = svg.querySelector('.svg-pan-zoom_viewport') as SVGGraphicsElement;
    if (!vp) return;
    const ctm = vp.getScreenCTM();
    if (!ctm) return;
    const pt = svg.createSVGPoint();
    pt.x = previewComp.type === 'rect' ? (previewComp.x||0) + (previewComp.w||0)/2 : (previewComp.cx||0);
    pt.y = previewComp.type === 'rect' ? (previewComp.y||0) : (previewComp.cy||0) - (previewComp.r||0);
    const sp = pt.matrixTransform(ctm);
    c.style.left = (sp.x - 40) + 'px';
    c.style.top = (sp.y - 50) + 'px';
    c.style.display = 'flex';
  }, [isPreviewing, previewComp, svgRef]);

  useEffect(() => updatePosition(), [updatePosition]);
  useEffect(() => useMapperStore.subscribe(() => updatePosition()), [updatePosition]);

  if (!isPreviewing) return null;

  return (
    <div ref={containerRef}
      className="absolute z-[2000] glass px-3 py-1.5 rounded-full flex items-center gap-2 shadow-2xl"
      style={{ display: 'none' }}>
      <button onClick={confirmPreview} title="Confirmar"
        className="w-8 h-8 rounded-full bg-success text-white flex items-center justify-center cursor-pointer hover:scale-110 transition-all shadow-md text-sm">
        ✓
      </button>
      <button onClick={() => { cancelPreview(); document.getElementById('layer-drawing')!.innerHTML = ''; }} title="Cancelar"
        className="w-8 h-8 rounded-full bg-danger text-white flex items-center justify-center cursor-pointer hover:scale-110 transition-all shadow-md text-sm">
        ✕
      </button>
    </div>
  );
}
