'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
 

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useMapperStore, PCBComponent, Wire, WirePoint, AnchorInfo, NodeInfo, COMP_TYPE_COLORS } from '../store/useMapperStore';
import FloatingControls from './FloatingControls';
import StatusBar from './StatusBar';
import ZoomControls from './ZoomControls';

// --- Utility functions ---
function getAnchorsFor(c: PCBComponent): WirePoint[] {
  if (c.x !== undefined && c.w !== undefined && c.y !== undefined && c.h !== undefined) {
    if (c.metadata?.pinCount && c.metadata.pinCount > 0) {
      const pinCount = c.metadata.pinCount;
      const startCorner = c.metadata.pinStartCorner || 'topLeft';
      const pinsPerSide = Math.ceil(pinCount / 2);
      const pinLen = Math.min(c.w, c.h) * 0.15;
      const margin = c.h * 0.08;
      const usableH = c.h - 2 * margin;
      const pinSpacing = pinsPerSide > 1 ? usableH / (pinsPerSide - 1) : 0;
      const leftGoesDown = startCorner === 'topLeft' || startCorner === 'bottomRight';
      const startsLeft = startCorner === 'topLeft' || startCorner === 'bottomLeft';
      
      const pinNumbering = c.metadata.pinNumbering || 'sequential';
      
      const anchors: WirePoint[] = [];
      for (let i = 0; i < pinCount; i++) {
        let isLeft: boolean;
        let idx: number;

        if (pinNumbering === 'alternating') {
           isLeft = startsLeft ? (i % 2 === 0) : (i % 2 !== 0);
           idx = Math.floor(i / 2);
           idx = leftGoesDown ? idx : (pinsPerSide - 1 - idx);
        } else {
           const isFirstHalf = i < pinsPerSide;
           isLeft = startsLeft ? isFirstHalf : !isFirstHalf;
           const sideIndex = isFirstHalf ? i : (i - pinsPerSide);
           idx = isLeft
             ? (leftGoesDown ? sideIndex : pinsPerSide - 1 - sideIndex)
             : (leftGoesDown ? pinsPerSide - 1 - sideIndex : sideIndex);
        }

        const py = c.y + margin + (pinsPerSide > 1 ? idx * pinSpacing : usableH / 2);
        const px = isLeft ? c.x : c.x + c.w;
        const dir = isLeft ? -1 : 1;
        anchors.push({ x: px + dir * pinLen, y: py });
      }
      return anchors;
    }

    // Default rectangle anchors
    return [
      { x: c.x + c.w / 2, y: c.y },
      { x: c.x + c.w / 2, y: c.y + c.h },
      { x: c.x, y: c.y + c.h / 2 },
      { x: c.x + c.w, y: c.y + c.h / 2 },
    ];
  } else if (c.cx !== undefined && c.cy !== undefined && c.r !== undefined) {
    return [
      { x: c.cx, y: c.cy - c.r },
      { x: c.cx, y: c.cy + c.r },
      { x: c.cx - c.r, y: c.cy },
      { x: c.cx + c.r, y: c.cy },
    ];
  }
  return [];
}

function getConnectedPinNum(pt: WirePoint, comp: PCBComponent): number | undefined {
  if (comp.type !== 'rect' || !comp.metadata?.pinCount) return undefined;
  const anchors = getAnchorsFor(comp);
  for (let i = 0; i < comp.metadata.pinCount; i++) {
    if (Math.hypot(pt.x - anchors[i].x, pt.y - anchors[i].y) < 2) return i + 1;
  }
  return undefined;
}

function getConnectedNetwork(startWire: Wire, allWires: Wire[], allComps: PCBComponent[]): { comp: PCBComponent, pin?: number }[] {
   const visitedWires = new Set<string>();
   const queue = [startWire];
   const results: { comp: PCBComponent, pin?: number }[] = [];
   const connectedEndpoints = new Set<string>();

   const ptDistSq = (a: WirePoint, b: WirePoint) => (a.x - b.x)**2 + (a.y - b.y)**2;

   while (queue.length > 0) {
     const w = queue.shift()!;
     if (visitedWires.has(w.id)) continue;
     visitedWires.add(w.id);

     const checkEndpoint = (pt: WirePoint) => {
         for (const c of allComps) {
             const anchors = getAnchorsFor(c);
             for (let i=0; i<anchors.length; i++) {
                 if (ptDistSq(pt, anchors[i]) < 4) { 
                     const pin = c.metadata?.pinCount ? i + 1 : undefined;
                     const key = `${c.id}:${pin ?? ''}`;
                     if (!connectedEndpoints.has(key)) {
                         connectedEndpoints.add(key);
                         results.push({ comp: c, pin });
                     }
                 }
             }
         }
     };

     checkEndpoint(w.points[0]);
     checkEndpoint(w.points[w.points.length - 1]);

     // Find connected wires sharing any node
     for (const otherWire of allWires) {
         if (visitedWires.has(otherWire.id)) continue;
         let shared = false;
         for (const p1 of w.points) {
             for (const p2 of otherWire.points) {
                 if (ptDistSq(p1, p2) < 4) {
                     shared = true;
                     break;
                 }
             }
             if (shared) break;
         }
         if (shared) queue.push(otherWire);
     }
   }
   return results;
}

function findAnchorAt(pt: WirePoint, components: PCBComponent[], zoom: number, isRoutingMode: boolean): AnchorInfo | null {
  if (!isRoutingMode) return null;
  for (const c of components) {
    for (const a of getAnchorsFor(c)) {
      if (Math.hypot(pt.x - a.x, pt.y - a.y) < 20 / zoom) return { ...a, comp: c };
    }
  }
  return null;
}

function findNodeAt(pt: WirePoint, wires: Wire[], zoom: number): NodeInfo | null {
  // Node detection works in all modes for dragging support
  for (const w of wires) {
    for (let i = 0; i < w.points.length; i++) {
      if (Math.hypot(pt.x - w.points[i].x, pt.y - w.points[i].y) < 18 / zoom)
        return { ...w.points[i], wire: w, index: i };
    }
  }
  return null;
}

// Find nearest anchor on a DIFFERENT component (for magnetic snap)
function findSnapAnchor(pt: WirePoint, components: PCBComponent[], zoom: number, excludeCompId?: string): { x: number; y: number; comp: PCBComponent; dist: number } | null {
  let best: { x: number; y: number; comp: PCBComponent; dist: number } | null = null;
  const snapRadius = 50 / zoom;
  for (const c of components) {
    if (c.id === excludeCompId) continue;
    for (const a of getAnchorsFor(c)) {
      const d = Math.hypot(pt.x - a.x, pt.y - a.y);
      if (d < snapRadius && (!best || d < best.dist)) {
        best = { x: a.x, y: a.y, comp: c, dist: d };
      }
    }
  }
  return best;
}

// Find nearest node on a DIFFERENT wire (for magnetic snap to wire nodes)
function findSnapNode(pt: WirePoint, wires: Wire[], zoom: number, excludeWireId?: string): { x: number; y: number; wire: Wire; index: number; dist: number } | null {
  let best: { x: number; y: number; wire: Wire; index: number; dist: number } | null = null;
  const snapRadius = 40 / zoom;
  for (const w of wires) {
    if (w.id === excludeWireId) continue;
    for (let i = 0; i < w.points.length; i++) {
      const p = w.points[i];
      const d = Math.hypot(pt.x - p.x, pt.y - p.y);
      if (d < snapRadius && (!best || d < best.dist)) {
        best = { x: p.x, y: p.y, wire: w, index: i, dist: d };
      }
    }
  }
  return best;
}

function findCompAt(pt: WirePoint, components: PCBComponent[]): PCBComponent | undefined {
  return components.find(c => {
    if (c.x !== undefined && c.w !== undefined && c.y !== undefined && c.h !== undefined)
      return pt.x >= c.x && pt.x <= c.x + c.w && pt.y >= c.y && pt.y <= c.y + c.h;
    if (c.cx !== undefined && c.cy !== undefined && c.r !== undefined)
      return Math.hypot(pt.x - c.cx, pt.y - c.cy) <= c.r;
    return false;
  });
}

interface PinMarker {
  id: string;
  svgX: number;
  svgY: number;
  stepIndex: number;
  label: string;
}

interface SvgCanvasProps {
  bgImage?: string;
  bgImage2?: string;
  side?: 'front' | 'back';
  /** When true: hides editing controls and disables all editing interactions. 
   *  Zoom/pan via svg-pan-zoom remains active. Use for subscriber/view-only mode. */
  readOnly?: boolean;
  // ─── Pin management — pass these for step-linked board markers ───────────────
  pins?: PinMarker[];
  activeStepIndex?: number | null;
  isPlacingPin?: boolean;
  onPinPlaced?: (svgX: number, svgY: number) => void;
  onPinMove?: (pinId: string, svgX: number, svgY: number) => void;
  onPinDelete?: (pinId: string) => void;
  onPinClick?: (stepIndex: number) => void;
}

export default function SvgCanvas({
  bgImage, bgImage2, side: propSide, readOnly = false,
  pins = [], activeStepIndex, isPlacingPin = false,
  onPinPlaced, onPinMove, onPinDelete, onPinClick,
}: SvgCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const shapeLayerRef = useRef<SVGGElement>(null);
  const netLayerRef = useRef<SVGGElement>(null);
  const drawLayerRef = useRef<SVGGElement>(null);
  const labelLayerRef = useRef<SVGGElement>(null);
  const pzRef = useRef<any>(null);
  const bgImgRef = useRef<SVGImageElement>(null);
  const bgImg2Ref = useRef<SVGImageElement>(null);
  const store = useMapperStore;
  const currentImage = bgImage || '/background_4k.png';
  const currentImage2 = bgImage2 || null;
  // Per-image rotation state
  const [selectedImg, setSelectedImg] = useState<'front' | 'back'>('front');
  const [rotFront, setRotFront] = useState(0);
  const [rotBack, setRotBack] = useState(0);
  const [flipFront, setFlipFront] = useState(false);
  const [flipBack, setFlipBack] = useState(false);
  const imgDimsRef = useRef<{ w1: number; h1: number; w2: number; h2: number; img2Y: number }>({ w1: 0, h1: 0, w2: 0, h2: 0, img2Y: 0 });
  // Pending drag state (click vs drag threshold)
  const pendingDragRef = useRef<{ id: string; offX: number; offY: number; startX: number; startY: number } | null>(null);
  const pendingNodeDragRef = useRef<{ wireId: string; index: number; startX: number; startY: number } | null>(null);
  // Pin drag state
  const pinDragRef = useRef<{ pinId: string; startX: number; startY: number; origX: number; origY: number } | null>(null);
  // Tooltip state for component/wire hover
  const [tooltip, setTooltip] = useState<{
    x: number; y: number;
    comp?: PCBComponent;
    wire?: Wire;
    pinNum?: number;
    sourceComp?: PCBComponent;
    sourcePinNum?: number;
    targetComp?: PCBComponent;
    targetPinNum?: number;
    connectedNetwork?: { comp: PCBComponent, pin?: number }[];
  } | null>(null);
  const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getSVGCoords = useCallback((e: MouseEvent): WirePoint => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const vp = svg.querySelector('.svg-pan-zoom_viewport') as SVGGraphicsElement;
    if (!vp) return { x: pt.x, y: pt.y };
    const ctm = vp.getScreenCTM();
    if (!ctm) return { x: pt.x, y: pt.y };
    return pt.matrixTransform(ctm.inverse());
  }, []);

  // ── Pin refs and helpers ──────────────────────────────────────────────────
  const pinsRef = useRef(pins);
  pinsRef.current = pins;

  // Dummy renderPins kept for pan-zoom setup compat (pins render via JSX)
  const renderPins = useCallback(() => { /* no-op: pins rendered via JSX in <g id="layer-pins"> */ }, []);


  const handlePinMouseDown = useCallback((e: React.MouseEvent, pin: PinMarker) => {
    if (readOnly || !onPinMove) return;
    e.stopPropagation();
    pinDragRef.current = { 
        pinId: pin.id, 
        startX: e.clientX, 
        startY: e.clientY, 
        origX: pin.svgX, 
        origY: pin.svgY 
    };
  }, [readOnly, onPinMove]);


  // Auto-pan to the active pin when the user clicks a step
  useEffect(() => {
    if (activeStepIndex === null || !pzRef.current) return;
    const pin = pins.find(p => p.stepIndex === activeStepIndex);
    if (!pin) return;

    // Use requestAnimationFrame to ensure svg-pan-zoom has settled
    const raf = requestAnimationFrame(() => {
      try {
        const pz = pzRef.current;
        if (!pz) return;
        const sizes = pz.getSizes();
        if (!sizes) return;
        
        // Use realZoom which represents the actual CSS pixel to SVG unit ratio
        const realZ = sizes.realZoom || 1;
        const newPanX = sizes.width / 2 - pin.svgX * realZ;
        const newPanY = sizes.height / 2 - pin.svgY * realZ;
        
        if (isFinite(newPanX) && isFinite(newPanY)) {
          pz.pan({ x: newPanX, y: newPanY });
        }
      } catch {
        // svg-pan-zoom not ready yet — ignore
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [activeStepIndex, pins]);


  // --- Render ---
  const renderMap = useCallback(() => {
    const sl = shapeLayerRef.current, nl = netLayerRef.current, ll = labelLayerRef.current;
    if (!sl || !nl || !ll) return;
    sl.innerHTML = ''; nl.innerHTML = ''; ll.innerHTML = '';

    const st = store.getState();
    const { selectedId, selectedPin, currentTool, isPreviewing, isRoutingMode, isWiring, activeWire, hoveredAnchor, hoveredNode, activeSide } = st;
    // Filter by this canvas's side (prop) or fall back to activeSide from store
    const filterSide = propSide || activeSide;
    const components = st.components.filter(c => !c.side || c.side === filterSide);
    const wires = st.wires.filter(w => !w.side || w.side === filterSide);
    const selComp = components.find(c => c.id === selectedId);
    const zoom = pzRef.current?.getZoom?.() || 1;

    // Wires
    wires.forEach(w => {
      if (w.points.length < 2) return;
      const netSel = selComp && (
        (selComp.net && w.net === selComp.net) ||           // same net
        (w.sourceCompId === selComp.id) ||                   // wire originates from selected comp
        (w.targetCompId === selComp.id) ||                   // wire targets selected comp
        // Check chain: if another wire in the chain connects to selected comp
        (wires.some(ow => 
          (ow.sourceNodeWireId === w.id || w.sourceNodeWireId === ow.id) &&
          (ow.sourceCompId === selComp.id || ow.targetCompId === selComp.id || (selComp.net && ow.net === selComp.net))
        ))
      );
      const col = netSel ? '#00e5ff' : 'rgba(0,229,255,0.5)';

      // Draw wire lines — uniform thickness
      for (let i = 0; i < w.points.length - 1; i++) {
        const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        l.setAttribute('x1', String(w.points[i].x)); l.setAttribute('y1', String(w.points[i].y));
        l.setAttribute('x2', String(w.points[i+1].x)); l.setAttribute('y2', String(w.points[i+1].y));
        l.setAttribute('style', `stroke:${col};stroke-width:3;stroke-linecap:round;pointer-events:none;`);
        nl.appendChild(l);
      }

      // Hit areas for wire lines (hover detection + right-click delete)
      if (currentTool === 'select' && !isPreviewing) {
        for (let i = 0; i < w.points.length - 1; i++) {
          const hitLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          hitLine.setAttribute('x1', String(w.points[i].x)); hitLine.setAttribute('y1', String(w.points[i].y));
          hitLine.setAttribute('x2', String(w.points[i+1].x)); hitLine.setAttribute('y2', String(w.points[i+1].y));
          hitLine.setAttribute('style', 'stroke:transparent;stroke-width:' + (50/zoom) + ';cursor:pointer;pointer-events:stroke;');
          
          hitLine.addEventListener('mousedown', (ev: Event) => {
            const me = ev as MouseEvent;
            me.stopPropagation();
            if (store.getState().currentTool === 'select') {
              let pt = { x: (w.points[i].x + w.points[i+1].x) / 2, y: (w.points[i].y + w.points[i+1].y) / 2 };
              const svg = document.getElementById('mapping-svg') as object as SVGSVGElement;
              if (svg) {
                const svgPt = svg.createSVGPoint();
                svgPt.x = me.clientX; svgPt.y = me.clientY;
                const vp = svg.querySelector('.svg-pan-zoom_viewport') as SVGGraphicsElement;
                const ctm = vp?.getScreenCTM();
                if (ctm) {
                  const tr = svgPt.matrixTransform(ctm.inverse());
                  pt = { x: tr.x, y: tr.y };
                }
              }
              store.getState().selectWire(w.id, pt);
            }
          });

          if (isRoutingMode) {
            hitLine.addEventListener('contextmenu', (ev: Event) => {
              ev.preventDefault();
              if (confirm(`Excluir fio ${w.id}?`)) store.getState().deleteWire(w.id);
            });
          }
          nl.appendChild(hitLine);
        }
      }

      // Node dots — always visible in select mode
      if (currentTool === 'select' && !isPreviewing) {
        const smallR = 6 / zoom;
        const bigR = 14 / zoom;
        const hitR = 18 / zoom;

        w.points.forEach((p) => {
          // Visible dot (small by default)
          const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          dot.setAttribute('cx', String(p.x)); dot.setAttribute('cy', String(p.y));
          dot.setAttribute('r', String(smallR));
          dot.setAttribute('style', 'fill:white;stroke:#00e5ff;stroke-width:2;pointer-events:none;opacity:0.7;');

          // Invisible hit area (large, captures all interaction)
          const hit = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          hit.setAttribute('cx', String(p.x)); hit.setAttribute('cy', String(p.y));
          hit.setAttribute('r', String(hitR));
          hit.setAttribute('style', `fill:transparent;stroke:none;cursor:${isRoutingMode ? 'crosshair' : 'grab'};pointer-events:all;`);

          hit.addEventListener('mouseenter', () => {
            dot.setAttribute('r', String(bigR));
            dot.setAttribute('style', 'fill:#00e5ff;stroke:white;stroke-width:2.5;pointer-events:none;opacity:1;filter:drop-shadow(0 0 6px #00e5ff);');
            if (pzRef.current) pzRef.current.disablePan();
          });
          hit.addEventListener('mouseleave', () => {
            dot.setAttribute('r', String(smallR));
            dot.setAttribute('style', 'fill:white;stroke:#00e5ff;stroke-width:2;pointer-events:none;opacity:0.7;');
            const s = store.getState();
            if (pzRef.current && s.currentTool === 'select' && !s.isDraggingComp && !s.isDraggingNode && !pendingNodeDragRef.current) {
              pzRef.current.enablePan();
            }
          });

          nl.appendChild(hit);
          nl.appendChild(dot);
        });
      }
    });

    // Components
    components.forEach(c => {
      const colors = COMP_TYPE_COLORS[c.compType] || COMP_TYPE_COLORS.ic;
      let el: SVGElement;
      if (c.x !== undefined) {
        el = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        el.setAttribute('x', String(c.x)); el.setAttribute('y', String(c.y));
        el.setAttribute('width', String(c.w)); el.setAttribute('height', String(c.h));
        el.setAttribute('rx', '3');
      } else {
        el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        el.setAttribute('cx', String(c.cx)); el.setAttribute('cy', String(c.cy));
        el.setAttribute('r', String(c.r));
      }
      el.classList.add('comp');

      const isSelected = c.id === selectedId;
      const isNetLinked = !isSelected && selComp?.net && c.net === selComp.net;

      if (isSelected) {
        el.setAttribute('style', 'fill:rgba(255,68,68,0.15);stroke:#ff4444;stroke-width:4;cursor:pointer;filter:drop-shadow(0 0 12px rgba(255,68,68,0.6));');
      } else if (isNetLinked) {
        el.setAttribute('style', `fill:rgba(255,68,68,0.12);stroke:#ff6666;stroke-width:3;cursor:pointer;filter:drop-shadow(0 0 10px rgba(255,68,68,0.4));`);
      } else {
        el.setAttribute('style', `fill:${colors.fill};stroke:${colors.stroke};stroke-width:1.5;cursor:pointer;transition:0.15s;`);
      }

      // GND marker — only for rects that have isGnd set
      if (c.x !== undefined && c.w !== undefined && c.y !== undefined && c.h !== undefined && c.metadata?.isGnd) {
        const gndCorner = c.metadata.gndCorner || 'topLeft';
        const markerSize = Math.min(c.w, c.h) * 0.35;
        const gndStyle = 'fill:#22c55e;opacity:0.85;pointer-events:none;filter:drop-shadow(0 0 3px #22c55e);';

        if (gndCorner === 'centerLeft' || gndCorner === 'centerRight') {
          // Solid green border on the full side — offset inward so it stays inside the rect
          const sw = 8;
          const borderLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          const bx = c.x + (gndCorner === 'centerRight' ? c.w - sw / 2 : sw / 2);
          borderLine.setAttribute('x1', String(bx)); borderLine.setAttribute('y1', String(c.y));
          borderLine.setAttribute('x2', String(bx)); borderLine.setAttribute('y2', String(c.y + c.h));
          borderLine.setAttribute('style', `fill:none;stroke:#22c55e;stroke-width:${sw};opacity:0.9;pointer-events:none;filter:drop-shadow(0 0 4px #22c55e);`);
          sl.appendChild(borderLine);
        } else if (gndCorner === 'center') {
          // Diamond in the center of the component
          const cx = c.x + c.w / 2, cy = c.y + c.h / 2;
          const s = markerSize * 0.6;
          const diamond = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
          diamond.setAttribute('points', `${cx},${cy-s} ${cx+s},${cy} ${cx},${cy+s} ${cx-s},${cy}`);
          diamond.setAttribute('style', gndStyle);
          sl.appendChild(diamond);
        } else {
          // Corner triangles (original behavior)
          const cX = c.x + (gndCorner === 'topRight' || gndCorner === 'bottomRight' ? c.w : 0);
          const cY = c.y + (gndCorner === 'bottomLeft' || gndCorner === 'bottomRight' ? c.h : 0);
          const gndTri = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
          let pts = '';
          if (gndCorner === 'topLeft')     pts = `${cX},${cY} ${cX+markerSize},${cY} ${cX},${cY+markerSize}`;
          if (gndCorner === 'topRight')    pts = `${cX},${cY} ${cX-markerSize},${cY} ${cX},${cY+markerSize}`;
          if (gndCorner === 'bottomLeft')  pts = `${cX},${cY} ${cX+markerSize},${cY} ${cX},${cY-markerSize}`;
          if (gndCorner === 'bottomRight') pts = `${cX},${cY} ${cX-markerSize},${cY} ${cX},${cY-markerSize}`;
          gndTri.setAttribute('points', pts);
          gndTri.setAttribute('style', gndStyle);
          sl.appendChild(gndTri);
        }

        // GND label
        const gndLbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        let lx: number, ly: number;
        if (gndCorner === 'center') {
          lx = c.x + c.w / 2;
          ly = c.y + c.h / 2 + markerSize * 0.2;
        } else if (gndCorner === 'centerLeft') {
          lx = c.x + markerSize * 0.8;
          ly = c.y + c.h / 2 + markerSize * 0.2;
        } else if (gndCorner === 'centerRight') {
          lx = c.x + c.w - markerSize * 0.8;
          ly = c.y + c.h / 2 + markerSize * 0.2;
        } else {
          lx = c.x + (gndCorner.includes('Right') ? c.w - markerSize*0.7 : markerSize*0.7);
          ly = c.y + (gndCorner.includes('bottom') ? c.h - markerSize*0.3 : markerSize*0.85);
        }
        const fs = Math.max(12, Math.min(24, markerSize * 0.9));
        gndLbl.setAttribute('x', String(lx)); gndLbl.setAttribute('y', String(ly));
        gndLbl.setAttribute('text-anchor', 'middle');
        gndLbl.setAttribute('style', `font-size:${fs}px;font-weight:900;fill:#fff;pointer-events:none;font-family:Inter,sans-serif;`);
        gndLbl.textContent = '⏚';
        sl.appendChild(gndLbl);
      }

      // IC Pin legs — render when pinCount is set
      if (c.x !== undefined && c.w !== undefined && c.y !== undefined && c.h !== undefined && c.metadata?.pinCount && c.metadata.pinCount > 0) {
        const pinCount = c.metadata.pinCount;
        const startCorner = c.metadata.pinStartCorner || 'topLeft';
        const pinsPerSide = Math.ceil(pinCount / 2);
        const pinLen = Math.min(c.w, c.h) * 0.15;     // length of pin leg
        const margin = c.h * 0.08;                      // top/bottom margin
        const usableH = c.h - 2 * margin;
        const pinSpacing = pinsPerSide > 1 ? usableH / (pinsPerSide - 1) : 0;
        const pinColor = colors.stroke;

        // Determine pin layout based on startCorner
        // DIP: pins go down one side, then up the other (counter-clockwise)
        const leftGoesDown = startCorner === 'topLeft' || startCorner === 'bottomRight';
        const startsLeft = startCorner === 'topLeft' || startCorner === 'bottomLeft';

        const pinNumbering = c.metadata.pinNumbering || 'sequential';
        for (let i = 0; i < pinCount; i++) {
          let isLeft: boolean;
          let idx: number;

          if (pinNumbering === 'alternating') {
             isLeft = startsLeft ? (i % 2 === 0) : (i % 2 !== 0);
             idx = Math.floor(i / 2);
             idx = leftGoesDown ? idx : (pinsPerSide - 1 - idx);
          } else {
             const isFirstHalf = i < pinsPerSide;
             isLeft = startsLeft ? isFirstHalf : !isFirstHalf;
             const sideIndex = isFirstHalf ? i : (i - pinsPerSide);
             idx = isLeft
               ? (leftGoesDown ? sideIndex : pinsPerSide - 1 - sideIndex)
               : (leftGoesDown ? pinsPerSide - 1 - sideIndex : sideIndex);
          }

          const py = c.y + margin + (pinsPerSide > 1 ? idx * pinSpacing : usableH / 2);
          const px = isLeft ? c.x : c.x + c.w;
          const dir = isLeft ? -1 : 1;

          // Pin leg — single line with rounded cap
          const leg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          leg.setAttribute('x1', String(px)); leg.setAttribute('y1', String(py));
          leg.setAttribute('x2', String(px + dir * pinLen)); leg.setAttribute('y2', String(py));
          const isSelectedPin = isSelected && selectedPin === i + 1;
          const pinNum = i + 1;
          const pinData = c.metadata.pinsInfo?.[pinNum];
          const isGndPin = pinData?.name?.toLowerCase().includes('gnd') || pinData?.net?.toLowerCase().includes('gnd') || pinData?.desc?.toLowerCase().includes('gnd') || pinData?.name?.toLowerCase() === 'terra';
          const isVccPin = pinData?.name?.toLowerCase().includes('vcc') || pinData?.name?.toLowerCase().includes('vdd') || pinData?.net?.toLowerCase().includes('vcc') || pinData?.voltage;
          const hasNetPin = !!pinData?.net;
          
          let specificPinColor = pinColor;
          if (isGndPin) specificPinColor = '#00ff00'; // Green
          else if (isVccPin) specificPinColor = '#f44336'; // Red
          else if (hasNetPin) specificPinColor = '#9c27b0'; // Purple for logic

          const strokeCol = isSelectedPin ? '#00e5ff' : specificPinColor; // Cyan when selected, else semantic color
          const strokeW = isSelectedPin ? 5 : 3;
          leg.setAttribute('style', `stroke:${strokeCol};stroke-width:${strokeW};stroke-linecap:round;opacity:${isSelectedPin?1:0.8};pointer-events:none;${isSelectedPin?'filter:drop-shadow(0 0 6px #00e5ff);':''}`);
          sl.appendChild(leg);

          // Invisible clickable area for whole pin leg
          const clickArea = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          clickArea.setAttribute('x1', String(px)); clickArea.setAttribute('y1', String(py));
          clickArea.setAttribute('x2', String(px + dir * (pinLen + 10))); clickArea.setAttribute('y2', String(py));
          clickArea.setAttribute('style', `stroke:transparent;stroke-width:12;cursor:pointer;`);
          clickArea.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            const s = store.getState();
            if (s.currentTool !== 'select') s.setTool('select');
            s.selectItem(c.id);
            s.setSelectedPin(pinNum);
          });
          clickArea.addEventListener('mouseenter', (e) => {
            e.stopPropagation();
            if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
            setTooltip({ x: e.clientX, y: e.clientY, comp: c, pinNum });
          });
          clickArea.addEventListener('mousemove', (e) => { e.stopPropagation(); });
          clickArea.addEventListener('mouseleave', () => {
            if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
            tooltipTimeoutRef.current = setTimeout(() => setTooltip(null), 100);
          });
          sl.appendChild(clickArea);

          // Pin number label
          const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          const lblFs = Math.max(6, Math.min(10, pinSpacing * 0.5));
          lbl.setAttribute('x', String(px + dir * (pinLen + 3)));
          lbl.setAttribute('y', String(py + lblFs * 0.35));
          lbl.setAttribute('text-anchor', isLeft ? 'end' : 'start');
          lbl.setAttribute('style', `font-size:${lblFs}px;fill:${specificPinColor};opacity:${isSelectedPin?1:0.7};pointer-events:none;font-family:monospace;font-weight:700;${isSelectedPin?'filter:drop-shadow(0 0 3px '+specificPinColor+');':''}`);
          lbl.textContent = String(pinNum);
          sl.appendChild(lbl);
        }

        // Pin 1 marker — dot placed inside the component corner
        const notchR = Math.min(c.w, c.h) * 0.08;
        let notchX: number, notchY: number;
        if (startCorner === 'topLeft')     { notchX = c.x + notchR*1.8; notchY = c.y + notchR*1.8; }
        else if (startCorner === 'topRight')  { notchX = c.x + c.w - notchR*1.8; notchY = c.y + notchR*1.8; }
        else if (startCorner === 'bottomLeft') { notchX = c.x + notchR*1.8; notchY = c.y + c.h - notchR*1.8; }
        else                                   { notchX = c.x + c.w - notchR*1.8; notchY = c.y + c.h - notchR*1.8; }

        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', String(notchX)); dot.setAttribute('cy', String(notchY));
        dot.setAttribute('r', String(notchR));
        dot.setAttribute('style', `fill:white;opacity:0.9;pointer-events:none;filter:drop-shadow(0 0 3px ${pinColor});`);
        sl.appendChild(dot);
      }

      // Hover style (only for non-highlighted components)
      el.addEventListener('mouseenter', () => {
        if (!isSelected && !isNetLinked) {
          el.setAttribute('style', `fill:rgba(0,229,255,0.2);stroke:${colors.stroke};stroke-width:2.5;cursor:pointer;filter:drop-shadow(0 0 6px ${colors.stroke});`);
        }
      });
      el.addEventListener('mouseleave', () => {
        if (!isSelected && !isNetLinked) {
          el.setAttribute('style', `fill:${colors.fill};stroke:${colors.stroke};stroke-width:1.5;cursor:pointer;transition:0.15s;`);
        }
      });

      el.addEventListener('mousedown', (e: Event) => {
        const me = e as MouseEvent;
        const pt = getSVGCoords(me);
        const s = store.getState();
        if (findAnchorAt(pt, s.components, zoom, s.isRoutingMode)) return;
        me.stopPropagation();
        // Auto-switch to select mode if clicking on an existing component
        if (s.currentTool !== 'select') {
          s.setTool('select');
        }
        s.selectItem(c.id);
        // Store pending drag info — only activate drag if mouse moves > threshold
        const offX = c.x !== undefined ? pt.x - c.x : pt.x - (c.cx || 0);
        const offY = c.y !== undefined ? pt.y - c.y : pt.y - (c.cy || 0);
        pendingDragRef.current = { id: c.id, offX, offY, startX: me.clientX, startY: me.clientY };
      });
      sl.appendChild(el);

      // --- Labels ---
      const labelX = c.x !== undefined ? (c.x! + (c.w || 0) / 2) : (c.cx || 0);
      const labelY = c.x !== undefined ? (c.y! - 10 / zoom) : ((c.cy || 0) - (c.r || 0) - 10 / zoom);
      const fontSize = Math.max(14, 20 / zoom);

      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('x', String(labelX));
      txt.setAttribute('y', String(labelY));
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('style', `font-family:Inter,sans-serif;font-size:${fontSize}px;font-weight:900;fill:${colors.stroke};pointer-events:none;filter:drop-shadow(0 2px 5px rgba(0,0,0,0.95));`);
      txt.textContent = c.name;
      ll.appendChild(txt);

      // Anchors (routing mode only)
      if (currentTool === 'select' && !isPreviewing && isRoutingMode) {
        getAnchorsFor(c).forEach(a => {
          const hov = hoveredAnchor?.comp.id === c.id && hoveredAnchor?.x === a.x && hoveredAnchor?.y === a.y;
          const act = isWiring && activeWire?.sourceCompId === c.id && activeWire.points[0]?.x === a.x;
          const hl = hov || act;
          const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          dot.setAttribute('cx', String(a.x)); dot.setAttribute('cy', String(a.y));
          dot.setAttribute('r', String((hl ? 24 : 12) / zoom));
          if (hl) dot.setAttribute('class', 'anchor-active');
          dot.setAttribute('style', `fill:${hl?'#00e5ff':'white'};stroke:${hl?'white':'#00e5ff'};stroke-width:2.5;cursor:pointer;pointer-events:all;`);
          sl.appendChild(dot);
        });
      }
    });

    if (currentTool === 'select' && !isPreviewing && isRoutingMode) {
      wires.forEach(w => {
        w.points.forEach((p, idx) => {
          const hov = hoveredNode?.wire.id === w.id && hoveredNode?.index === idx;
          const act = isWiring && activeWire?.sourceNodeWireId === w.id && activeWire.sourceNodeIndex === idx;
          const hl = hov || act;
          const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          dot.setAttribute('cx', String(p.x)); dot.setAttribute('cy', String(p.y));
          dot.setAttribute('r', String((hl ? 24 : 10) / zoom));
          if (hl) dot.setAttribute('class', 'anchor-active');
          dot.setAttribute('style', `fill:${hl?'#00e5ff':'white'};stroke:${hl?'white':'#00e5ff'};stroke-width:2.5;cursor:pointer;pointer-events:all;opacity:0.8;`);
          sl.appendChild(dot);
        });
      });
    }
  }, [getSVGCoords, propSide, store]);

  // Pan Zoom Setup — load image(s) and configure viewBox
  useEffect(() => {
    const svg = svgRef.current, bg = bgImgRef.current;
    if (!svg || !bg) return;
    const img = new Image();
    img.onload = () => {
      bg.setAttribute('width', String(img.width));
      bg.setAttribute('height', String(img.height));

      const GAP = 50; // positive gap so images stack vertically (one above, one below)

      // Load second image if provided
      if (currentImage2 && bgImg2Ref.current) {
        const img2 = new Image();
        img2.onload = () => {
          const bg2 = bgImg2Ref.current!;
          const img2Y = img.height + GAP;
          bg2.setAttribute('width', String(img2.width));
          bg2.setAttribute('height', String(img2.height));
          bg2.setAttribute('y', String(img2Y));
          const totalW = Math.max(img.width, img2.width);
          const totalH = img2Y + img2.height;
          svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
          // Store dimensions for rotation
          imgDimsRef.current = { w1: img.width, h1: img.height, w2: img2.width, h2: img2.height, img2Y };

          import('svg-pan-zoom').then(mod => {
            if (pzRef.current) pzRef.current.destroy();
            pzRef.current = mod.default(svg, {
              zoomEnabled: true, controlIconsEnabled: false, fit: true, center: true,
              beforePan: () => { const s = store.getState(); return s.currentTool === 'select' && !s.isPreviewing && !s.isDraggingComp && !s.isDraggingNode && !pendingDragRef.current && !pendingNodeDragRef.current && !pinDragRef.current; },
            });
            renderMap();
            // Pins must be re-rendered AFTER svg-pan-zoom wraps the viewport
            renderPins();
          });
        };
        img2.src = currentImage2;
      } else {
        // Single image
        svg.setAttribute('viewBox', `0 0 ${img.width} ${img.height}`);
        import('svg-pan-zoom').then(mod => {
          if (pzRef.current) pzRef.current.destroy();
          pzRef.current = mod.default(svg, {
            zoomEnabled: true, controlIconsEnabled: false, fit: true, center: true,
            beforePan: () => { const s = store.getState(); return s.currentTool === 'select' && !s.isPreviewing && !s.isDraggingComp && !s.isDraggingNode && !pendingDragRef.current && !pendingNodeDragRef.current && !pinDragRef.current; },
          });
          renderMap();
          // Pins must be re-rendered AFTER svg-pan-zoom wraps the viewport
          renderPins();
        });
      }
    };
    img.src = currentImage;
  }, [renderMap, renderPins, store, currentImage, currentImage2]);

  // Re-render on store change
  useEffect(() => store.subscribe(() => renderMap()), [renderMap, store]);

  // Mouse events
  useEffect(() => {
    const svg = svgRef.current, dl = drawLayerRef.current, bg = bgImgRef.current;
    if (!svg || !dl || !bg) return;

    const onDown = (e: MouseEvent) => {
      const pt = getSVGCoords(e);
      const s = store.getState();
      const z = pzRef.current?.getZoom?.() || 1;

      if (s.isPreviewing) {
        const pc = s.previewComp;
        if (!pc) return;
        let inside = false;
        if (pc.type === 'rect' && pc.x !== undefined && pc.w !== undefined && pc.y !== undefined && pc.h !== undefined)
          inside = pt.x >= pc.x && pt.x <= pc.x + pc.w && pt.y >= pc.y && pt.y <= pc.y + pc.h;
        else if (pc.cx !== undefined && pc.cy !== undefined && pc.r !== undefined)
          inside = Math.hypot(pt.x - pc.cx, pt.y - pc.cy) <= pc.r;
        if (inside) s.startMovingPreview(pc.type === 'rect' ? pt.x - (pc.x||0) : pt.x - (pc.cx||0), pc.type === 'rect' ? pt.y - (pc.y||0) : pt.y - (pc.cy||0));
        return;
      }

      if (s.currentTool === 'select') {
        const anc = findAnchorAt(pt, s.components, z, s.isRoutingMode);
        const nod = findNodeAt(pt, s.wires, z);
        const cmp = findCompAt(pt, s.components);

        if (s.isWiring && s.activeWire) {
          const z2 = pzRef.current?.getZoom?.() || 1;
          const snap = findSnapAnchor(pt, s.components, z2, s.activeWire.sourceCompId);
          const snapN = findSnapNode(pt, s.wires, z2, s.activeWire.id);

          if (snapN && snapN.wire.id !== s.activeWire.id) {
            const tp = { x: snapN.x, y: snapN.y };
            const uw = { ...s.activeWire, points: [...s.activeWire.points, tp], targetCompId: undefined };
            store.setState(st => ({ wires: st.wires.map(w => w.id === uw.id ? uw : w), activeWire: uw }));
            const wnet = snapN.wire.net;
            s.finalizeWire(undefined as any); // we will adjust this later if needed, but the net should be taken from snapN
            store.setState(st => ({
              wires: st.wires.map(w => w.id === uw.id ? { ...w, targetCompId: undefined, net: wnet || uw.net } : w)
            }));
            dl.innerHTML = '';
          } else if (snap && snap.comp.id !== s.activeWire.sourceCompId) {
            const tp = { x: snap.x, y: snap.y };
            const uw = { ...s.activeWire, points: [...s.activeWire.points, tp] };
            store.setState(st => ({ wires: st.wires.map(w => w.id === uw.id ? uw : w), activeWire: uw }));
            s.finalizeWire(snap.comp);
            dl.innerHTML = '';
          } else if (cmp && cmp.id !== s.activeWire.sourceCompId) {
            const tp = anc ? { x: anc.x, y: anc.y } : pt;
            const uw = { ...s.activeWire, points: [...s.activeWire.points, tp] };
            store.setState(st => ({ wires: st.wires.map(w => w.id === uw.id ? uw : w), activeWire: uw }));
            s.finalizeWire(cmp);
            dl.innerHTML = '';
          } else {
            s.addWirePoint({ x: pt.x, y: pt.y });
            dl.innerHTML = '';
          }
          return;
        }

        if (anc) {
          s.startWire({ 
            id: 'W_' + Math.random().toString(36).substr(2, 5).toUpperCase(), 
            points: [{ x: anc.x, y: anc.y }], 
            sourceCompId: anc.comp.id, 
            net: anc.comp.net 
          });
          return;
        }

        if (nod) {
          pendingNodeDragRef.current = { wireId: nod.wire.id, index: nod.index, startX: e.clientX, startY: e.clientY };
          return;
        }

        if (e.target === svg || e.target === bg) s.selectItem(null);
        return;
      }

      s.startDrawing(pt.x, pt.y);
    };

    const onMove = (e: MouseEvent) => {
      const pt = getSVGCoords(e);
      const s = store.getState();
      const z = pzRef.current?.getZoom?.() || 1;

      if (pendingNodeDragRef.current && !s.isDraggingNode) {
        const dx = e.clientX - pendingNodeDragRef.current.startX;
        const dy = e.clientY - pendingNodeDragRef.current.startY;
        if (Math.hypot(dx, dy) > 3) {
          const pnd = pendingNodeDragRef.current;
          s.startDraggingNode(pnd.wireId, pnd.index);
        }
      }
      if (s.isDraggingNode) { s.updateDraggingNode(pt.x, pt.y); return; }

      if (pendingDragRef.current && !s.isDraggingComp) {
        const dx = e.clientX - pendingDragRef.current.startX;
        const dy = e.clientY - pendingDragRef.current.startY;
        if (Math.hypot(dx, dy) > 5) {
          const pd = pendingDragRef.current;
          s.startDraggingComp(pd.id, pd.offX, pd.offY);
        }
      }
      if (s.isDraggingComp) { s.updateDraggingComp(pt.x, pt.y); return; }
      if (s.isMovingPreview) { s.updatePreviewPosition(pt.x, pt.y); renderPreview(); return; }

      if (s.isWiring && s.activeWire) {
        dl.innerHTML = '';
        const lp = s.activeWire.points[s.activeWire.points.length - 1];
        const z2 = pzRef.current?.getZoom?.() || 1;
        const snap = findSnapAnchor(pt, s.components, z2, s.activeWire.sourceCompId);
        const snapN = findSnapNode(pt, s.wires, z2, s.activeWire.id);

        let endX = pt.x, endY = pt.y;
        if (snapN) { endX = snapN.x; endY = snapN.y; }
        else if (snap) { endX = snap.x; endY = snap.y; }

        const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        l.setAttribute('x1', String(lp.x)); l.setAttribute('y1', String(lp.y));
        l.setAttribute('x2', String(endX)); l.setAttribute('y2', String(endY));
        const hasSnap = !!(snap || snapN);
        l.setAttribute('style', `stroke:#00e5ff;stroke-width:${hasSnap ? 4 : 3};stroke-dasharray:8;opacity:${hasSnap ? 1 : 0.7};`);
        dl.appendChild(l);

        if (hasSnap) {
          const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          ring.setAttribute('cx', String(endX)); ring.setAttribute('cy', String(endY));
          ring.setAttribute('r', String(28 / z2));
          ring.setAttribute('class', 'anchor-active');
          ring.setAttribute('style', 'fill:none;stroke:#00e5ff;stroke-width:2.5;opacity:0.8;pointer-events:none;');
          dl.appendChild(ring);

          const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          dot.setAttribute('cx', String(endX)); dot.setAttribute('cy', String(endY));
          dot.setAttribute('r', String(10 / z2));
          dot.setAttribute('style', 'fill:#00e5ff;stroke:white;stroke-width:2;pointer-events:none;filter:drop-shadow(0 0 8px #00e5ff);');
          dl.appendChild(dot);
        }
        if (hasSnap) {
          const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          label.setAttribute('x', String(endX)); label.setAttribute('y', String(endY - 32 / z2));
          label.setAttribute('text-anchor', 'middle');
          label.setAttribute('style', `font-family:Inter,sans-serif;font-size:${Math.max(9, 12/z2)}px;fill:#00e5ff;pointer-events:none;font-weight:600;`);
          label.textContent = snapN ? `🧲 Nó Rota` : `🧲 ${snap?.comp.name}`;
          dl.appendChild(label);
        }
        return;
      }

      if (s.currentTool === 'select' && !s.isPreviewing) {
        const anc = findAnchorAt(pt, s.components, z, s.isRoutingMode);
        const nod = findNodeAt(pt, s.wires, z);
        if (anc !== s.hoveredAnchor || nod !== s.hoveredNode) { s.setHoveredAnchor(anc); s.setHoveredNode(nod); }
        svg.style.cursor = (anc || nod) ? 'crosshair' : (s.isDraggingComp ? 'grabbing' : (pendingNodeDragRef.current ? 'grabbing' : 'default'));
      }

      if (!s.isDrawing) return;
      dl.innerHTML = '';
      if (s.currentTool === 'rect') {
        const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        r.setAttribute('x', String(Math.min(s.startX, pt.x)));
        r.setAttribute('y', String(Math.min(s.startY, pt.y)));
        r.setAttribute('width', String(Math.abs(pt.x - s.startX)));
        r.setAttribute('height', String(Math.abs(pt.y - s.startY)));
        r.setAttribute('rx', '3');
        r.setAttribute('style', 'fill:rgba(0,229,255,0.25);stroke:#00e5ff;stroke-width:2;stroke-dasharray:6;');
        dl.appendChild(r);
      } else if (s.currentTool === 'circle') {
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('cx', String(s.startX)); c.setAttribute('cy', String(s.startY));
        c.setAttribute('r', String(Math.hypot(pt.x - s.startX, pt.y - s.startY)));
        c.setAttribute('style', 'fill:rgba(255,193,7,0.25);stroke:#ffc107;stroke-width:2;stroke-dasharray:6;');
        dl.appendChild(c);
      }
    };

    const onUp = (e: MouseEvent) => {
      const s = store.getState();
      
      if (s.isDraggingNode) { 
        s.stopDraggingNode(); 
        pendingNodeDragRef.current = null;
        return; 
      }
      
      if (pendingNodeDragRef.current && s.isRoutingMode) {
        const pnd = pendingNodeDragRef.current;
        const wire = s.wires.find(w => w.id === pnd.wireId);
        if (wire && pnd.index < wire.points.length) {
          const p = wire.points[pnd.index];
          s.startWire({
            id: 'W_' + Math.random().toString(36).substr(2, 5).toUpperCase(),
            points: [{ x: p.x, y: p.y }],
            sourceCompId: wire.sourceCompId,
            net: wire.net,
            sourceNodeWireId: wire.id,
            sourceNodeIndex: pnd.index,
          });
        }
      }

      pendingDragRef.current = null;
      pendingNodeDragRef.current = null;
      
      if (s.isDraggingComp) { s.stopDraggingComp(); return; }
      if (s.isMovingPreview) { s.stopMovingPreview(); return; }
      if (s.isWiring || !s.isDrawing) return;
      const pt = getSVGCoords(e);
      s.stopDrawing();
      const pv: Partial<PCBComponent> = { type: s.currentTool as any, name: '', net: '', compType: s.currentTool === 'rect' ? 'ic' : 'pad', metadata: { desc: '' } };
      if (s.currentTool === 'rect') {
        pv.x = Math.min(s.startX, pt.x); pv.y = Math.min(s.startY, pt.y);
        pv.w = Math.abs(pt.x - s.startX); pv.h = Math.abs(pt.y - s.startY);
        if ((pv.w||0) < 5 && (pv.h||0) < 5) return;
      } else if (s.currentTool === 'circle') {
        pv.cx = s.startX; pv.cy = s.startY;
        pv.r = Math.hypot(pt.x - s.startX, pt.y - s.startY);
        if ((pv.r||0) < 2) return;
      }
      s.startPreview(pv);
      renderPreview();
    };

    const onKey = (e: KeyboardEvent) => {
      const s = store.getState();
      if (e.key === 'Escape') {
        if (s.isWiring) { s.cancelWire(); dl.innerHTML = ''; }
        else if (s.isRoutingMode) s.toggleRoutingMode();
        else if (s.isPreviewing) { s.cancelPreview(); dl.innerHTML = ''; }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); s.undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) { e.preventDefault(); s.redo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); s.redo(); }
      if (e.key === 'v' || e.key === 'V') { if (!e.ctrlKey && !e.metaKey) s.setTool('select'); }
      if (e.key === 'r' || e.key === 'R') { if (!e.ctrlKey && !e.metaKey) s.setTool('rect'); }
      if (e.key === 'c' || e.key === 'C') { if (!e.ctrlKey && !e.metaKey) s.setTool('circle'); }
      if (e.key === 'Delete' || e.key === 'Backspace') { if (s.selectedId && !s.isPreviewing && !(document.activeElement instanceof HTMLInputElement) && !(document.activeElement instanceof HTMLTextAreaElement)) s.deleteSelected(); }
    };

    function renderPreview() {
      const d = drawLayerRef.current; if (!d) return;
      d.innerHTML = '';
      const pc = store.getState().previewComp; if (!pc) return;
      let el: SVGElement;
      if (pc.type === 'rect') {
        el = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        el.setAttribute('x', String(pc.x)); el.setAttribute('y', String(pc.y));
        el.setAttribute('width', String(pc.w)); el.setAttribute('height', String(pc.h));
        el.setAttribute('rx', '3');
      } else {
        el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        el.setAttribute('cx', String(pc.cx)); el.setAttribute('cy', String(pc.cy));
        el.setAttribute('r', String(pc.r));
      }
      el.setAttribute('style', 'fill:rgba(0,229,255,0.1);stroke:#00e5ff;stroke-width:2;cursor:move;opacity:0.8;');
      d.appendChild(el);
    }

    svg.addEventListener('mousedown', onDown);
    svg.addEventListener('mousemove', onMove);
    svg.addEventListener('mouseup', onUp);
    window.addEventListener('keydown', onKey);
    // In readOnly mode: remove all editing listeners immediately after adding
    if (readOnly) {
      svg.removeEventListener('mousedown', onDown);
      svg.removeEventListener('mousemove', onMove);
      svg.removeEventListener('mouseup', onUp);
      window.removeEventListener('keydown', onKey);
      return () => {};
    }
    return () => { svg.removeEventListener('mousedown', onDown); svg.removeEventListener('mousemove', onMove); svg.removeEventListener('mouseup', onUp); window.removeEventListener('keydown', onKey); };
  }, [getSVGCoords, renderMap, store, readOnly]);

  // ── Pin placement click + pin drag move/up ───────────────────────────────────
  const isPlacingPinRef = useRef(isPlacingPin);
  isPlacingPinRef.current = isPlacingPin;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const onClick = (e: MouseEvent) => {
      if (!isPlacingPinRef.current || !onPinPlaced) return;
      e.stopPropagation();
      e.preventDefault();
      const pt = getSVGCoords(e);
      onPinPlaced(pt.x, pt.y);
    };

    const onPinMouseMove = (e: MouseEvent) => {
      const drag = pinDragRef.current;
      if (!drag || !onPinMove) return;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      
      const realZ = pzRef.current?.getSizes?.()?.realZoom || 1;
      
      onPinMove(drag.pinId, drag.origX + dx / realZ, drag.origY + dy / realZ);
    };

    const onPinMouseUp = () => { pinDragRef.current = null; };

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && onPinDelete) {
        // Delete pin for active step
        const active = pinsRef.current.find(p => p.stepIndex === activeStepIndex);
        if (active) onPinDelete(active.id);
      }
    };

    svg.addEventListener('click', onClick);
    window.addEventListener('mousemove', onPinMouseMove);
    window.addEventListener('mouseup', onPinMouseUp);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      svg.removeEventListener('click', onClick);
      window.removeEventListener('mousemove', onPinMouseMove);
      window.removeEventListener('mouseup', onPinMouseUp);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [getSVGCoords, onPinPlaced, onPinMove, onPinDelete, activeStepIndex]);

  // Pan control
  useEffect(() => store.subscribe(s => {
    if (!pzRef.current) return;
    const canPan = s.currentTool === 'select' && !s.isPreviewing && !s.isDraggingComp && !s.isDraggingNode;
    if (canPan) {
      pzRef.current.enablePan();
    } else {
      pzRef.current.disablePan();
    }
  }), [store]);

  // Rotate selected image
  const handleRotate = useCallback(() => {
    const applyRotation = (imgEl: SVGImageElement, deg: number, cx: number, cy: number) => {
      imgEl.setAttribute('transform', `rotate(${deg} ${cx} ${cy})`);
    };
    if (selectedImg === 'front') {
      const newRot = (rotFront + 90) % 360;
      setRotFront(newRot);
      const d = imgDimsRef.current;
      if (bgImgRef.current && d.w1) {
        applyRotation(bgImgRef.current, newRot, d.w1 / 2, d.h1 / 2);
      }
    } else {
      const newRot = (rotBack + 90) % 360;
      setRotBack(newRot);
      const d = imgDimsRef.current;
      if (bgImg2Ref.current && d.w2) {
        const cy = d.img2Y + d.h2 / 2;
        applyRotation(bgImg2Ref.current, newRot, d.w2 / 2, cy);
      }
    }
  }, [selectedImg, rotFront, rotBack]);

  // Flip/mirror selected image horizontally
  const handleFlip = useCallback(() => {
    const applyTransform = (imgEl: SVGImageElement, rot: number, cx: number, cy: number, flipped: boolean) => {
      const parts: string[] = [];
      if (rot) parts.push(`rotate(${rot} ${cx} ${cy})`);
      if (flipped) parts.push(`translate(${cx * 2}, 0) scale(-1, 1)`);
      imgEl.setAttribute('transform', parts.join(' ') || '');
    };
    if (selectedImg === 'front') {
      const newFlip = !flipFront;
      setFlipFront(newFlip);
      const d = imgDimsRef.current;
      if (bgImgRef.current && d.w1) {
        applyTransform(bgImgRef.current, rotFront, d.w1 / 2, d.h1 / 2, newFlip);
      }
    } else {
      const newFlip = !flipBack;
      setFlipBack(newFlip);
      const d = imgDimsRef.current;
      if (bgImg2Ref.current && d.w2) {
        const cy = d.img2Y + d.h2 / 2;
        applyTransform(bgImg2Ref.current, rotBack, d.w2 / 2, cy, newFlip);
      }
    }
  }, [selectedImg, flipFront, flipBack, rotFront, rotBack]);

  // Warp to a specific side and set it as active
  const handleWarpToSide = useCallback((side: 'front' | 'back') => {
    setSelectedImg(side);
    useMapperStore.getState().setActiveSide(side);
    
    if (pzRef.current && imgDimsRef.current) {
      const pz = pzRef.current;
      const d = imgDimsRef.current;
      const sizes = pz.getSizes();
      const zoom = pz.getZoom();
      
      const targetY = side === 'front' ? d.h1 / 2 : d.img2Y + d.h2 / 2;
      const targetX = side === 'front' ? d.w1 / 2 : d.w2 / 2;
      
      // Compute required pan (in css pixels) to hit target center
      const scaleX = (sizes.width / sizes.viewBox.width) * zoom;
      const scaleY = (sizes.height / sizes.viewBox.height) * zoom;
      
      const newPanX = sizes.width / 2 - targetX * scaleX;
      const newPanY = sizes.height / 2 - targetY * scaleY;
      
      pz.pan({ x: newPanX, y: newPanY });
    }
  }, []);

  // Click handler — detect which image was clicked based on SVG Y coordinate
  const handleImageSelect = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!currentImage2) return; // only one image, no need to select
    const svg = svgRef.current;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const vp = svg.querySelector('.svg-pan-zoom_viewport') as SVGGraphicsElement;
    if (!vp) return;
    const ctm = vp.getScreenCTM();
    if (!ctm) return;
    const svgPt = pt.matrixTransform(ctm.inverse());
    const boundary = imgDimsRef.current.img2Y;
    const side = svgPt.y < boundary ? 'front' : 'back';
    setSelectedImg(side);
    useMapperStore.getState().setActiveSide(side);
  }, [currentImage2]);

  // ── Tooltip: detect component/wire under mouse ─────────────────────────────
  const handleSvgMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const vp = svg.querySelector('.svg-pan-zoom_viewport') as SVGGraphicsElement;
    if (!vp) return;
    const ctm = vp.getScreenCTM();
    if (!ctm) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const svgPt = pt.matrixTransform(ctm.inverse());
    const { components, wires } = store.getState();

    // Check components
    for (const c of components) {
      if (c.type === 'rect' && c.x !== undefined && c.y !== undefined && c.w !== undefined && c.h !== undefined) {
        if (svgPt.x >= c.x && svgPt.x <= c.x + c.w && svgPt.y >= c.y && svgPt.y <= c.y + c.h) {
          if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
          setTooltip({ x: e.clientX, y: e.clientY, comp: c });
          return;
        }
      } else if (c.type === 'circle' && c.cx !== undefined && c.cy !== undefined && c.r !== undefined) {
        if (Math.hypot(svgPt.x - c.cx, svgPt.y - c.cy) <= c.r) {
          if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
          setTooltip({ x: e.clientX, y: e.clientY, comp: c });
          return;
        }
      }
    }

    // Check wires (tolerance of 8 SVG units)
    const WIRE_TOL = 8;
    for (const w of wires) {
      for (let i = 0; i < w.points.length - 1; i++) {
        const a = w.points[i], b = w.points[i + 1];
        const dx = b.x - a.x, dy = b.y - a.y;
        const len = Math.hypot(dx, dy);
        if (len === 0) continue;
        const t = Math.max(0, Math.min(1, ((svgPt.x - a.x) * dx + (svgPt.y - a.y) * dy) / (len * len)));
        const dist = Math.hypot(svgPt.x - (a.x + t * dx), svgPt.y - (a.y + t * dy));
        if (dist < WIRE_TOL) {
          if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
          const src = components.find(c => c.id === w.sourceCompId);
          // Find target: follow wire chain if this wire has no targetCompId
          let tgt: PCBComponent | undefined;
          let resolvedNet = w.net;
          const chainWire = wires.find(ow => ow.id !== w.id && (
            (ow.sourceNodeWireId === w.id) || // wire branching from this one
            (w.sourceNodeWireId === ow.id) ||  // this wire branches from ow
            (ow.sourceCompId === w.sourceCompId && ow.targetCompId) // same source, has target
          ));
          if (w.targetCompId) {
            tgt = components.find(c => c.id === w.targetCompId);
          } else if (chainWire?.targetCompId) {
            tgt = components.find(c => c.id === chainWire.targetCompId);
          }
          // Inherit net from chain if this wire has no net
          if (!resolvedNet && chainWire?.net) resolvedNet = chainWire.net;
          const tooltipWire = resolvedNet !== w.net ? { ...w, net: resolvedNet } : w;
          
          let srcPinNum: number | undefined;
          let tgtPinNum: number | undefined;
          if (src) srcPinNum = getConnectedPinNum(w.points[0], src);
          if (tgt) tgtPinNum = getConnectedPinNum(w.points[w.points.length - 1], tgt);
          
          const network = getConnectedNetwork(tooltipWire, wires, components);
          
          setTooltip({ 
              x: e.clientX, 
              y: e.clientY, 
              wire: tooltipWire, 
              sourceComp: src, 
              sourcePinNum: srcPinNum, 
              targetComp: tgt, 
              targetPinNum: tgtPinNum,
              connectedNetwork: network
          });
          return;
        }
      }
    }

    // Nothing under mouse — hide after small delay
    if (tooltip) {
      if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = setTimeout(() => setTooltip(null), 150);
    }
  }, [store, tooltip]);

  return (
    <div className="w-full h-full relative bg-[#050508] flex flex-col">
      {/* FloatingControls only visible in edit mode */}
      {!readOnly && <FloatingControls svgRef={svgRef} pzRef={pzRef} />}
      {/* Selected image indicator (always visible) */}
      {currentImage2 && (
        <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 bg-[#161921]/90 backdrop-blur-md rounded-lg border border-[#1e2030] px-3 py-1.5">
          <span className="text-[10px] font-black text-[#5c5f77] uppercase">Selecionada:</span>
          <button onClick={() => handleWarpToSide('front')} className={`px-2 py-0.5 rounded text-[10px] font-black transition-all ${selectedImg === 'front' ? 'bg-[#3b82f6] text-white' : 'text-[#5c5f77] hover:text-white'}`}>FRENTE</button>
          <button onClick={() => handleWarpToSide('back')} className={`px-2 py-0.5 rounded text-[10px] font-black transition-all ${selectedImg === 'back' ? 'bg-[#f59e0b] text-white' : 'text-[#5c5f77] hover:text-white'}`}>VERSO</button>
        </div>
      )}
      <svg ref={svgRef} id="mapping-svg" className="w-full h-full"
        onClick={!readOnly && !isPlacingPin ? handleImageSelect : undefined}
        onMouseMove={handleSvgMouseMove}
        onMouseLeave={() => { if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current); setTooltip(null); }}
        style={readOnly || isPlacingPin ? { cursor: isPlacingPin ? 'crosshair' : 'default' } : undefined}
      >
        <image ref={bgImgRef} href={currentImage} x="0" y="0" />
        {currentImage2 && <image ref={bgImg2Ref} href={currentImage2} x="0" y="0" />}
        <g ref={shapeLayerRef} id="layer-shapes" />
        <g ref={netLayerRef} id="layer-nets" />
        <g ref={labelLayerRef} id="layer-labels" />
        <g ref={drawLayerRef} id="layer-drawing" />
        {/* Pin layer — declarative React JSX for reliable rendering with svg-pan-zoom */}
        <g id="layer-pins">
          {pins.map(pin => {
            const svgX = typeof pin.svgX === 'number' && isFinite(pin.svgX) ? pin.svgX : null;
            const svgY = typeof pin.svgY === 'number' && isFinite(pin.svgY) ? pin.svgY : null;
            if (svgX === null || svgY === null) return null; // old-format pin — skip
            const isActive = pin.stepIndex === activeStepIndex;
            const R = 18;
            return (
              <g
                key={pin.id}
                style={{ cursor: 'pointer' }}
                onClick={e => { e.stopPropagation(); onPinClick?.(pin.stepIndex); }}
                onMouseDown={e => handlePinMouseDown(e, pin)}
              >
                {/* Pulse ring for active pin */}
                {isActive && (
                  <circle cx={svgX} cy={svgY} r={R + 8} fill="none" stroke="#3b82f6" strokeWidth={2} opacity={0.5} />
                )}
                {/* Drop line */}
                <line x1={svgX} y1={svgY + R} x2={svgX} y2={svgY + R + 20} stroke={isActive ? '#3b82f6' : '#93c5fd'} strokeWidth={2} />
                {/* Dot at base */}
                <circle cx={svgX} cy={svgY + R + 20} r={4} fill={isActive ? '#3b82f6' : '#93c5fd'} />
                {/* Main pin circle */}
                <circle
                  cx={svgX} cy={svgY} r={R}
                  fill={isActive ? '#3b82f6' : '#1e2030'}
                  stroke={isActive ? '#ffffff' : '#3b82f6'}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                {/* Step number label */}
                <text
                  x={svgX} y={svgY + 5}
                  textAnchor="middle"
                  fontSize={14} fontWeight={900} fontFamily="monospace"
                  fill="white"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {pin.label}
                </text>
                {/* Delete button for admin */}
                {!readOnly && onPinDelete && isActive && (
                  <g
                    transform={`translate(${svgX + R - 4}, ${svgY - R + 4})`}
                    onClick={e => { e.stopPropagation(); onPinDelete(pin.id); }}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle cx={0} cy={0} r={8} fill="#ef4444" stroke="white" strokeWidth={1} />
                    <text x={0} y={4} textAnchor="middle" fontSize={10} fontWeight={900} fill="white" style={{ pointerEvents: 'none' }}>×</text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
      <ZoomControls pzRef={pzRef} svgRef={svgRef} onRotate={!readOnly && currentImage2 ? handleRotate : undefined} onFlip={!readOnly && currentImage2 ? handleFlip : undefined} />

      {/* ── Component/Wire Tooltip ── */}
      {tooltip && (
        <div
          className="absolute z-[9999]"
          style={{
            left: Math.min(tooltip.x + 16, (svgRef.current?.getBoundingClientRect()?.right ?? window.innerWidth) - 280),
            top: Math.max(tooltip.y - 10, 0),
            transform: 'translateY(-100%)',
          }}
          onMouseEnter={(e) => {
            e.stopPropagation();
            if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
          }}
          onMouseLeave={() => {
            if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
            setTooltip(null);
          }}
        >
          <div className="bg-[#0d0f17]/95 backdrop-blur-md border border-[#2a2d3e] rounded-xl px-4 py-3 shadow-2xl min-w-[200px] max-w-[280px]">
            {tooltip.comp && tooltip.pinNum !== undefined && (() => {
              const c = tooltip.comp;
              const pn = tooltip.pinNum;
              const pData = c.metadata?.pinsInfo?.[pn] || {};
              
              const isGndPin = pData?.name?.toLowerCase().includes('gnd') || pData?.net?.toLowerCase().includes('gnd') || pData?.desc?.toLowerCase().includes('gnd') || pData?.name?.toLowerCase() === 'terra';
              const isVccPin = pData?.name?.toLowerCase().includes('vcc') || pData?.name?.toLowerCase().includes('vdd') || pData?.net?.toLowerCase().includes('vcc') || pData?.voltage;
              const hasNetPin = !!pData?.net;
              
              let pColor = '#ffffff'; // default
              let pBg = 'rgba(255,255,255,0.1)';
              if (isGndPin) { pColor = '#00ff00'; pBg = 'rgba(0,255,0,0.15)'; } // Green
              else if (isVccPin) { pColor = '#f44336'; pBg = 'rgba(244,67,54,0.15)'; } // Red
              else if (hasNetPin) { pColor = '#9c27b0'; pBg = 'rgba(156,39,176,0.15)'; } // Purple
              else { pColor = '#00e5ff'; pBg = 'rgba(0,229,255,0.15)'; } // Cyan unassigned

              return (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-md border flex items-center justify-center text-[11px] font-bold shrink-0"
                      style={{ color: pColor, borderColor: pColor, backgroundColor: pBg }}>{pn}</span>
                    <span className="text-white font-black text-[14px]">{pData.name || `Pino ${pn}`}</span>
                  </div>
                  <div className="text-[10px] font-bold text-[#5c5f77] uppercase mb-2">{c.name}</div>
                  {pData.net && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-cyan-400">NET ID</span>
                      <span className="text-white text-[12px] font-mono font-bold">{pData.net}</span>
                    </div>
                  )}
                  {pData.voltage && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-yellow-400">⚡ VOLTAGEM</span>
                      <span className="text-white text-[12px] font-mono font-bold">{pData.voltage}</span>
                    </div>
                  )}
                  {pData.resistance && (
                     <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-orange-400">Ω RESISTÊNCIA</span>
                      <span className="text-white text-[12px] font-mono font-bold">{pData.resistance}</span>
                    </div>
                  )}
                </>
              );
            })()}
            {tooltip.comp && tooltip.pinNum === undefined && (() => {
              const c = tooltip.comp;
              const typeColor = COMP_TYPE_COLORS[c.compType] || COMP_TYPE_COLORS.ic;
              return (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: typeColor.stroke }} />
                    <span className="text-white font-black text-[13px]">{c.name || 'Componente'}</span>
                  </div>
                  <div className="text-[10px] font-bold text-[#5c5f77] uppercase mb-2">{typeColor.label}</div>
                  {c.metadata?.voltage && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-yellow-400">⚡ VOLTAGEM</span>
                      <span className="text-white text-[12px] font-mono font-bold">{c.metadata.voltage}</span>
                    </div>
                  )}
                  {c.metadata?.resistance && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-orange-400">Ω RESISTÊNCIA</span>
                      <span className="text-white text-[12px] font-mono font-bold">{c.metadata.resistance}</span>
                    </div>
                  )}
                  {c.net && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-cyan-400">🔗 NET</span>
                      <span className="text-cyan-300 text-[11px] font-mono">{c.net}</span>
                    </div>
                  )}
                  {c.metadata?.desc && (
                    <div className="mt-2 pt-2 border-t border-[#2a2d3e]">
                      <p className="text-[11px] text-[#8b8fa3] leading-tight">{c.metadata.desc}</p>
                    </div>
                  )}
                  {c.metadata?.isGnd && (
                    <div className="mt-1">
                      <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded">⏚ GND</span>
                    </div>
                  )}
                  {c.metadata?.pinCount && c.metadata.pinCount > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-blue-400">📌 PINOS</span>
                      <span className="text-white text-[12px] font-mono font-bold">{c.metadata.pinCount}</span>
                    </div>
                  )}
                </>
              );
            })()}
            {tooltip.wire && (() => {
              const w = tooltip.wire;
              
              const renderEndpoint = (prefix: string, comp: PCBComponent, pNum?: number) => {
                let pinName = '';
                let pinColor = '#ffffff';
                let bColor = 'rgba(255,255,255,0.1)';
                if (pNum && comp.metadata?.pinsInfo?.[pNum]) {
                  const pData = comp.metadata.pinsInfo[pNum];
                  pinName = pData.name || '';
                  const isGndPin = pData.name?.toLowerCase().includes('gnd') || pData.net?.toLowerCase().includes('gnd') || pData.name?.toLowerCase() === 'terra';
                  const isVccPin = pData.name?.toLowerCase().includes('vcc') || pData.name?.toLowerCase().includes('vdd') || pData.net?.toLowerCase().includes('vcc') || pData.voltage;
                  if (isGndPin) { pinColor = '#00ff00'; bColor = 'rgba(0,255,0,0.15)'; }
                  else if (isVccPin) { pinColor = '#f44336'; bColor = 'rgba(244,67,54,0.15)'; }
                  else if (pData.net) { pinColor = '#9c27b0'; bColor = 'rgba(156,39,176,0.15)'; }
                  else { pinColor = '#00e5ff'; bColor = 'rgba(0,229,255,0.15)'; }
                }

                return (
                  <div className="flex flex-col gap-1 mb-2 bg-[#0a0c12] p-2 rounded-lg border border-[#1e1f2b]">
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] font-black text-[#8b8fa3] uppercase">{prefix}</span>
                       <span className="text-white text-[12px] font-bold">{comp.name}</span>
                       {comp.metadata?.voltage && !pNum && (
                          <span className="text-yellow-400 text-[10px] font-mono whitespace-nowrap">({comp.metadata.voltage})</span>
                       )}
                    </div>
                    {pNum !== undefined && (
                      <div className="flex items-center gap-2 mt-1 ml-4">
                        <span className="w-4 h-4 rounded border flex items-center justify-center text-[9px] font-bold shrink-0"
                          style={{ color: pinColor, borderColor: pinColor, backgroundColor: bColor }}>{pNum}</span>
                        {pinName && <span className="text-[#d7dcf0] font-semibold text-[11px]">{pinName}</span>}
                        {comp.metadata?.pinsInfo?.[pNum]?.voltage && (
                          <span className="text-yellow-400 text-[10px] font-mono ml-auto">{comp.metadata.pinsInfo[pNum].voltage}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              };

              return (
                <>
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#2a2d3e] justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-0.5 bg-cyan-400" />
                      <span className="text-white font-black text-[13px]">Conexão</span>
                    </div>
                    {!readOnly && (
                       <button
                         onClick={(e) => {
                           e.stopPropagation();
                           if (confirm(`Excluir fio ${w.id}?`)) {
                             store.getState().deleteWire(w.id);
                             if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
                             setTooltip(null);
                           }
                         }}
                         className="flex items-center gap-1 text-[10px] bg-red-500/10 text-red-500 hover:bg-red-500/20 px-2 py-1 rounded transition-colors"
                       >
                         ✕ Excluir
                       </button>
                    )}
                  </div>
                  {w.net && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold text-cyan-400">🔗 NET</span>
                      <span className="text-cyan-300 text-[11px] font-mono">{w.net}</span>
                    </div>
                  )}
                  {tooltip.connectedNetwork && tooltip.connectedNetwork.length > 0 ? (
                    <div className="flex flex-col gap-1 mt-2">
                       <span className="text-[10px] font-bold text-[#8b8fa3] uppercase mb-2">📌 COMPONENTES NESTA ROTA:</span>
                       <div className="max-h-[220px] overflow-y-auto pr-1">
                       {tooltip.connectedNetwork.map((node, idx) => (
                           <React.Fragment key={idx}>
                               {renderEndpoint(idx === 0 ? 'Terminal Principal' : 'Conectado a:', node.comp, node.pin)}
                           </React.Fragment>
                       ))}
                       </div>
                    </div>
                  ) : (
                    <>
                      {tooltip.sourceComp && renderEndpoint('Saída ➔', tooltip.sourceComp, tooltip.sourcePinNum)}
                      {tooltip.targetComp && renderEndpoint('➔ Entrada', tooltip.targetComp, tooltip.targetPinNum)}
                    </>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
      {/* StatusBar only visible in edit mode */}
      {!readOnly && <StatusBar />}
    </div>
  );
}
