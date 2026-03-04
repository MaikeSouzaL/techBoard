'use client';
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, X, Zap, Activity, Link2 } from 'lucide-react';
import type { PCBComponent, Wire } from '@/store/useMapperStore';
import { COMP_TYPE_COLORS } from '@/store/useMapperStore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PinMarker {
  id: string;
  x: number;
  y: number;
  label: string;
  stepIndex: number;
}

interface ZoomablePcbViewerProps {
  src: string;
  src2?: string;
  pins?: PinMarker[];
  activeStepIndex?: number | null;
  onPinClick?: (stepIndex: number) => void;
  isPlacingPin?: boolean;
  onBoardClick?: (x: number, y: number) => void;
  // PCB data from mapper store
  components?: PCBComponent[];
  wires?: Wire[];
  onComponentClick?: (comp: PCBComponent) => void;
  selectedComponentId?: string | null;
  highlightedComponentIds?: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_SCALE = 0.3;
const MAX_SCALE = 8;

// ─── Unified SVG Overlay ─────────────────────────────────────────────────────
// Uses the same coordinate system as SvgCanvas: viewBox = natural image dimensions
// This guarantees perfect position alignment regardless of display size.

function PcbSvgOverlay({
  components,
  wires,
  naturalW,
  naturalH,
  selectedComponentId,
  highlightedIds,
  onComponentClick,
}: {
  components: PCBComponent[];
  wires: Wire[];
  naturalW: number;
  naturalH: number;
  selectedComponentId?: string | null;
  highlightedIds?: string[];
  onComponentClick?: (comp: PCBComponent) => void;
}) {
  if (naturalW === 0 || naturalH === 0) return null;

  const isActive = (id: string) =>
    !selectedComponentId && (!highlightedIds?.length) ? true
    : id === selectedComponentId || !!highlightedIds?.includes(id);

  const isWireActive = (w: Wire) =>
    !selectedComponentId && (!highlightedIds?.length) ? true
    : w.sourceCompId === selectedComponentId || w.targetCompId === selectedComponentId
    || !!highlightedIds?.includes(w.sourceCompId) || !!highlightedIds?.includes(w.targetCompId ?? '');

  return (
    <svg
      viewBox={`0 0 ${naturalW} ${naturalH}`}
      preserveAspectRatio="xMidYMid meet"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      <defs>
        <filter id="pcb-glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="pcb-glow-sel">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <marker id="pcb-arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0,0 L0,8 L8,4 z" fill="#3b82f6" />
        </marker>
      </defs>

      {/* ── Wires ──────────────────────────────────────────────────────────── */}
      {wires.map(wire => {
        if (wire.points.length < 2) return null;
        const active = isWireActive(wire);
        if (!active) return null;
        const srcComp = components.find(c => c.id === wire.sourceCompId);
        const color = srcComp ? (COMP_TYPE_COLORS[srcComp.compType]?.stroke ?? '#3b82f6') : '#3b82f6';
        const d = 'M' + wire.points.map(p => `${p.x},${p.y}`).join(' L');
        return (
          <g key={wire.id}>
            {/* Glow halo */}
            <path d={d} stroke={color} strokeWidth={8} fill="none" strokeOpacity={0.15} filter="url(#pcb-glow)" />
            {/* Animated dash */}
            <path d={d} stroke={color} strokeWidth={2} fill="none" strokeDasharray="10 6" strokeOpacity={0.9}>
              <animate attributeName="stroke-dashoffset" from="0" to="-32" dur="1s" repeatCount="indefinite" />
            </path>
            {/* Arrow cap */}
            <path d={d} stroke={color} strokeWidth={1.5} fill="none" markerEnd="url(#pcb-arrow)" />
          </g>
        );
      })}

      {/* ── Components ─────────────────────────────────────────────────────── */}
      {components.map(comp => {
        const colors = COMP_TYPE_COLORS[comp.compType] ?? { fill: 'rgba(59,130,246,0.08)', stroke: '#3b82f6', label: comp.compType };
        const selected = comp.id === selectedComponentId;
        const active = isActive(comp.id);
        const opacity = (!selectedComponentId && !highlightedIds?.length) ? 1 : active ? 1 : 0.15;

        const strokeW = selected ? 2.5 : 1.5;
        const stroke = selected ? '#ffffff' : colors.stroke;
        const fill = selected ? colors.stroke + '30' : colors.fill;
        const filter = selected ? 'url(#pcb-glow-sel)' : active ? 'url(#pcb-glow)' : undefined;

        if (comp.type === 'rect' && comp.x !== undefined && comp.y !== undefined) {
          return (
            <rect
              key={comp.id}
              x={comp.x} y={comp.y}
              width={comp.w ?? 20} height={comp.h ?? 20}
              fill={fill} stroke={stroke} strokeWidth={strokeW}
              rx={3} opacity={opacity}
              filter={filter}
              style={{ cursor: 'pointer', pointerEvents: 'all', transition: 'opacity 0.2s' }}
              onClick={e => { e.stopPropagation(); onComponentClick?.(comp); }}
            >
              <title>{comp.name}{comp.metadata?.voltage ? ` — ${comp.metadata.voltage}` : ''}{comp.metadata?.resistance ? ` / ${comp.metadata.resistance}` : ''}</title>
            </rect>
          );
        }

        if (comp.type === 'circle' && comp.cx !== undefined && comp.cy !== undefined) {
          return (
            <circle
              key={comp.id}
              cx={comp.cx} cy={comp.cy} r={comp.r ?? 10}
              fill={fill} stroke={stroke} strokeWidth={strokeW}
              opacity={opacity}
              filter={filter}
              style={{ cursor: 'pointer', pointerEvents: 'all', transition: 'opacity 0.2s' }}
              onClick={e => { e.stopPropagation(); onComponentClick?.(comp); }}
            >
              <title>{comp.name}{comp.metadata?.voltage ? ` — ${comp.metadata.voltage}` : ''}</title>
            </circle>
          );
        }
        return null;
      })}
    </svg>
  );
}

// ─── Component Tooltip ────────────────────────────────────────────────────────

function ComponentTooltip({
  comp,
  onClose,
}: {
  comp: PCBComponent;
  onClose: () => void;
}) {
  const colors = COMP_TYPE_COLORS[comp.compType] ?? { stroke: '#3b82f6', label: comp.compType };

  return (
    <div
      className="absolute bottom-4 left-4 z-50 w-72 rounded-2xl border shadow-2xl overflow-hidden"
      style={{ borderColor: colors.stroke + '40', background: '#0f1117' }}
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ background: colors.stroke + '15', borderBottom: `1px solid ${colors.stroke}30` }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: colors.stroke, boxShadow: `0 0 8px ${colors.stroke}` }}
          />
          <div>
            <p className="text-[13px] font-black text-[#e1e2e8] leading-none">{comp.name}</p>
            <p className="text-[10px] mt-0.5" style={{ color: colors.stroke }}>{colors.label}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-[#5c5f77] hover:text-white transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* NET */}
        {comp.net && (
          <div className="flex items-center gap-2">
            <Link2 size={12} className="text-[#5c5f77] shrink-0" />
            <span className="text-[10px] text-[#5c5f77] uppercase font-bold">NET:</span>
            <span className="text-[11px] font-mono text-[#3b82f6]">{comp.net}</span>
          </div>
        )}

        {/* Voltage */}
        {comp.metadata?.voltage && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg border"
            style={{ borderColor: '#f59e0b30', background: '#f59e0b08' }}
          >
            <Zap size={13} className="text-[#f59e0b] shrink-0" />
            <div>
              <p className="text-[9px] text-[#f59e0b]/60 font-black uppercase">Tensão Esperada</p>
              <p className="text-[15px] font-black text-[#f59e0b]">{comp.metadata.voltage}</p>
            </div>
          </div>
        )}

        {/* Resistance */}
        {comp.metadata?.resistance && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg border"
            style={{ borderColor: '#8b5cf630', background: '#8b5cf608' }}
          >
            <Activity size={13} className="text-[#8b5cf6] shrink-0" />
            <div>
              <p className="text-[9px] text-[#8b5cf6]/60 font-black uppercase">Resistência / Valor</p>
              <p className="text-[15px] font-black text-[#8b5cf6]">{comp.metadata.resistance}</p>
            </div>
          </div>
        )}

        {/* Description */}
        {comp.metadata?.desc && (
          <div>
            <p className="text-[9px] text-[#5c5f77] uppercase font-bold mb-1">Descrição Técnica</p>
            <p className="text-[11px] text-[#8b8fa3] leading-relaxed">{comp.metadata.desc}</p>
          </div>
        )}

        {/* GND label */}
        {comp.metadata?.isGnd && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#2e7d32]/10 border border-[#2e7d32]/30">
            <div className="w-2 h-2 rounded-full bg-[#4caf50]" />
            <span className="text-[10px] font-bold text-[#4caf50]">Pino de Terra / GND</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ZoomablePcbViewer({
  src,
  src2,
  pins = [],
  activeStepIndex,
  onPinClick,
  isPlacingPin = false,
  onBoardClick,
  components = [],
  wires = [],
  onComponentClick,
  selectedComponentId,
  highlightedComponentIds,
}: ZoomablePcbViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  // Single atomic transform state — prevents stale-closure bugs when updating
  // scale and offset together inside wheel events
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  // Mirror of transform kept in a ref so event handlers can read without stale closures
  const transformRef = useRef({ scale: 1, x: 0, y: 0 });
  const updateTransform = useCallback((updater: (prev: { scale: number; x: number; y: number }) => { scale: number; x: number; y: number }) => {
    setTransform(prev => {
      const next = updater(prev);
      transformRef.current = next;
      return next;
    });
  }, []);
  const [isPanning, setIsPanning] = useState(false);
  // Natural (pixel) dimensions of the PCB image — needed for SVG viewBox to match SvgCanvas coord system
  const [naturalW, setNaturalW] = useState(0);
  const [naturalH, setNaturalH] = useState(0);
  const panStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });
  const [tooltip, setTooltip] = useState<PCBComponent | null>(null);

  // Read natural image dimensions on load
  const handleImgLoad = useCallback(() => {
    if (imgRef.current) {
      setNaturalW(imgRef.current.naturalWidth);
      setNaturalH(imgRef.current.naturalHeight);
    }
  }, []);

  // ── Wheel zoom — zoom toward mouse cursor ─────────────────────────────────
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    updateTransform(prev => {
      const factor = e.deltaY < 0 ? 1.12 : 0.88;
      const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale * factor));
      const ratio = nextScale / prev.scale;
      return {
        scale: nextScale,
        // Keep point under cursor at same screen position
        x: mouseX - ratio * (mouseX - prev.x),
        y: mouseY - ratio * (mouseY - prev.y),
      };
    });
  }, [updateTransform]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // ── Pan ────────────────────────────────────────────────────────────────────
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isPlacingPin) return;
    if (e.button !== 0) return;
    setIsPanning(true);
    // Read current transform from ref (no stale closure)
    panStart.current = { mx: e.clientX, my: e.clientY, ox: transformRef.current.x, oy: transformRef.current.y };
  }, [isPlacingPin]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - panStart.current.mx;
    const dy = e.clientY - panStart.current.my;
    updateTransform(prev => ({ ...prev, x: panStart.current.ox + dx, y: panStart.current.oy + dy }));
  }, [isPanning, updateTransform]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  // ── Click (place pin or close tooltip) ────────────────────────────────────
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setTooltip(null);
    if (!isPlacingPin || !onBoardClick || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const imgX = (screenX - transform.x) / transform.scale;
    const imgY = (screenY - transform.y) / transform.scale;
    const container = containerRef.current;
    onBoardClick((imgX / container.offsetWidth) * 100, (imgY / container.offsetHeight) * 100);
  }, [isPlacingPin, onBoardClick, transform]);

  // ── Zoom controls ──────────────────────────────────────────────────────────
  const zoomIn = () => updateTransform(p => ({ ...p, scale: Math.min(MAX_SCALE, +(p.scale * 1.25).toFixed(2)) }));
  const zoomOut = () => updateTransform(p => ({ ...p, scale: Math.max(MIN_SCALE, +(p.scale / 1.25).toFixed(2)) }));
  const resetView = () => updateTransform(() => ({ scale: 1, x: 0, y: 0 }));

  const handleCompClick = useCallback((comp: PCBComponent) => {
    setTooltip(prev => prev?.id === comp.id ? null : comp);
    onComponentClick?.(comp);
  }, [onComponentClick]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0a0b10]">
      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-30 flex flex-col gap-1.5">
        <button onClick={zoomIn} title="Zoom In"
          className="w-8 h-8 rounded-lg bg-[#161921]/90 border border-[#2e3148] text-[#8b8fa3] hover:text-white hover:border-[#3b82f6]/50 flex items-center justify-center transition-all backdrop-blur-sm">
          <ZoomIn size={14} />
        </button>
        <button onClick={zoomOut} title="Zoom Out"
          className="w-8 h-8 rounded-lg bg-[#161921]/90 border border-[#2e3148] text-[#8b8fa3] hover:text-white hover:border-[#3b82f6]/50 flex items-center justify-center transition-all backdrop-blur-sm">
          <ZoomOut size={14} />
        </button>
        <button onClick={resetView} title="Resetar Vista"
          className="w-8 h-8 rounded-lg bg-[#161921]/90 border border-[#2e3148] text-[#8b8fa3] hover:text-white hover:border-[#3b82f6]/50 flex items-center justify-center transition-all backdrop-blur-sm">
          <Maximize2 size={13} />
        </button>
      {/* Zoom % badge */}
        <div className="w-8 py-1 rounded-lg bg-[#161921]/90 border border-[#1e2030] text-center backdrop-blur-sm">
          <span className="text-[9px] font-black text-[#5c5f77]">{Math.round(transform.scale * 100)}%</span>
        </div>
      </div>

      {/* Hint */}
      {transform.scale <= 1.05 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-[#161921]/80 backdrop-blur-sm border border-[#2e3148] rounded-full px-3 py-1 pointer-events-none">
          <span className="text-[10px] text-[#5c5f77]">Scroll para zoom · Arraste para navegar · Clique no componente para detalhes</span>
        </div>
      )}

      {/* Component tooltip popup */}
      {tooltip && (
        <ComponentTooltip
          comp={tooltip}
          onClose={() => setTooltip(null)}
        />
      )}

      {/* Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ cursor: isPlacingPin ? 'crosshair' : isPanning ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
      >
        {/* Transformed layer */}
        <div
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: '0 0',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            userSelect: 'none',
          }}
        >
          {/* Front PCB image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={src}
            alt="PCB Frente"
            className="w-full object-contain"
            draggable={false}
            style={{ display: 'block', pointerEvents: 'none' }}
            onLoad={handleImgLoad}
          />

          {/* Unified SVG overlay: wires + components at natural-image coordinate system */}
          {(components.length > 0 || wires.length > 0) && naturalW > 0 && (
            <PcbSvgOverlay
              components={components}
              wires={wires}
              naturalW={naturalW}
              naturalH={naturalH}
              selectedComponentId={selectedComponentId ?? tooltip?.id}
              highlightedIds={highlightedComponentIds}
              onComponentClick={handleCompClick}
            />
          )}

          {/* Back image stacked below with gap (mirrors SvgCanvas GAP=50) */}
          {src2 && (
            <>
              <div style={{ height: 50 }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src2}
                alt="PCB Verso"
                className="w-full object-contain"
                draggable={false}
                style={{ display: 'block', pointerEvents: 'none' }}
              />
            </>
          )}

          {/* Repair step pins */}
          {pins.map(pin => {
            const isActive = pin.stepIndex === activeStepIndex;
            return (
              <div
                key={pin.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                style={{ left: `${pin.x}%`, top: `${pin.y}%`, pointerEvents: 'auto', zIndex: 20 }}
                onClick={e => { e.stopPropagation(); onPinClick?.(pin.stepIndex); }}
              >
                <div className={`
                  rounded-full border-2 flex items-center justify-center font-black shadow-lg transition-all
                  ${isActive
                    ? 'w-10 h-10 text-[14px] bg-[#3b82f6] border-white text-white shadow-[0_0_24px_rgba(59,130,246,0.8)]'
                    : 'w-7 h-7 text-[11px] bg-[#161921] border-[#3b82f6] text-[#3b82f6] hover:border-white hover:text-white cursor-pointer'
                  }
                `}>
                  {pin.label}
                </div>
                <div className={`w-0.5 h-3 ${isActive ? 'bg-[#3b82f6]' : 'bg-[#3b82f6]/50'}`} />
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#3b82f6]' : 'bg-[#3b82f6]/50'}`} />
                {isActive && (
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 animate-ping w-10 h-10 rounded-full border-2 border-[#3b82f6] opacity-40 pointer-events-none"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
