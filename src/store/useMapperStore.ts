import { create } from 'zustand';

// --- Types ---
export interface PCBComponent {
  id: string;
  type: 'rect' | 'circle';
  compType: string; // ic, pad, testpoint, connector, gnd, positive
  name: string;
  net: string;
  side?: 'front' | 'back';
  metadata: { 
    desc: string;
    voltage?: string;
    resistance?: string;
    isGnd?: boolean;
    gndCorner?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'center' | 'centerLeft' | 'centerRight';
    pinCount?: number;
    pinStartCorner?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
    pinNumbering?: 'sequential' | 'alternating';
    pinsInfo?: Record<number, { name?: string; voltage?: string; resistance?: string; desc?: string; net?: string; }>;
  };
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  cx?: number;
  cy?: number;
  r?: number;
}

export interface WirePoint { x: number; y: number; }

export interface Wire {
  id: string;
  points: WirePoint[];
  sourceCompId: string;
  targetCompId?: string;
  net: string;
  side?: 'front' | 'back';
  // Branch wire: first point is anchored to a node on another wire
  sourceNodeWireId?: string;
  sourceNodeIndex?: number;
}

export interface AnchorInfo extends WirePoint { comp: PCBComponent; }
export interface NodeInfo extends WirePoint { wire: Wire; index: number; }

// Color mapping per component type
export const COMP_TYPE_COLORS: Record<string, { fill: string; stroke: string; label: string }> = {
  ic:        { fill: 'rgba(0,229,255,0.08)',  stroke: '#00e5ff', label: 'CI / Microchip' },
  pad:       { fill: 'rgba(255,193,7,0.08)',  stroke: '#ffc107', label: 'Pad de Solda' },
  testpoint: { fill: 'rgba(156,39,176,0.08)', stroke: '#9c27b0', label: 'Ponto de Teste' },
  connector: { fill: 'rgba(76,175,80,0.08)',  stroke: '#4caf50', label: 'Conector' },
  gnd:       { fill: 'rgba(46,125,50,0.08)',  stroke: '#2e7d32', label: 'GND - Terra' },
  positive:  { fill: 'rgba(244,67,54,0.08)',  stroke: '#f44336', label: 'VCC - Positivo' },
};

export const COMP_TYPE_OPTIONS = Object.entries(COMP_TYPE_COLORS).map(([k, v]) => ({ value: k, label: v.label }));

// --- Undo/Redo Snapshot ---
interface Snapshot {
  components: PCBComponent[];
  wires: Wire[];
}

interface MapperState {
  currentTool: 'select' | 'rect' | 'circle';
  components: PCBComponent[];
  selectedId: string | null;
  selectedPin: number | null;
  wires: Wire[];
  searchQuery: string;
  activeSide: 'front' | 'back';

  // Undo/Redo
  undoStack: Snapshot[];
  redoStack: Snapshot[];

  // Drawing state
  isDrawing: boolean;
  startX: number;
  startY: number;

  // Preview
  isPreviewing: boolean;
  isMovingPreview: boolean;
  previewComp: Partial<PCBComponent> | null;
  shiftX: number;
  shiftY: number;

  // Wiring
  isWiring: boolean;
  isRoutingMode: boolean;
  activeWire: Wire | null;
  hoveredAnchor: AnchorInfo | null;
  hoveredNode: NodeInfo | null;
  selectedWireId: string | null;
  wireClickPos: WirePoint | null;

  // Dragging existing component
  isDraggingComp: boolean;
  dragCompId: string | null;
  dragOffsetX: number;
  dragOffsetY: number;

  // Dragging wire node
  isDraggingNode: boolean;
  dragNodeWireId: string | null;
  dragNodeIndex: number;

  // Wire hover (for showing nodes on hover)
  hoveredWireId: string | null;

  // Actions
  setTool: (tool: 'select' | 'rect' | 'circle') => void;
  selectItem: (id: string | null) => void;
  selectWire: (id: string | null, pos?: WirePoint) => void;
  setSearchQuery: (q: string) => void;
  setHoveredAnchor: (anchor: AnchorInfo | null) => void;
  setHoveredNode: (node: NodeInfo | null) => void;
  setHoveredWireId: (wireId: string | null) => void;
  setActiveSide: (side: 'front' | 'back') => void;
  setSelectedPin: (pin: number | null) => void;

  // Undo/Redo
  pushUndo: () => void;
  undo: () => void;
  redo: () => void;

  // Drawing
  startDrawing: (x: number, y: number) => void;
  stopDrawing: () => void;
  startPreview: (comp: Partial<PCBComponent>) => void;
  startMovingPreview: (sx: number, sy: number) => void;
  stopMovingPreview: () => void;
  updatePreviewPosition: (x: number, y: number) => void;
  confirmPreview: () => void;
  cancelPreview: () => void;

  // Wiring
  toggleRoutingMode: () => void;
  startWire: (wire: Wire) => void;
  addWirePoint: (point: WirePoint) => void;
  finalizeWire: (targetComp?: PCBComponent) => void;
  cancelWire: () => void;
  deleteWire: (wireId: string) => void;

  // Dragging component
  startDraggingComp: (id: string, offX: number, offY: number) => void;
  updateDraggingComp: (x: number, y: number) => void;
  stopDraggingComp: () => void;

  // Dragging wire node
  startDraggingNode: (wireId: string, index: number) => void;
  updateDraggingNode: (x: number, y: number) => void;
  stopDraggingNode: () => void;

  // CRUD
  saveProperties: (name: string, compType: string, net: string, desc: string, voltage?: string, resistance?: string, isGnd?: boolean, gndCorner?: string, pinCount?: number, pinStartCorner?: string, pinNumbering?: string) => void;
  savePinProperties: (pin: number, name: string, net: string, desc: string, voltage?: string, resistance?: string) => void;
  deleteSelected: () => void;
  clearAll: () => void;
  exportData: () => void;
  importData: (json: string) => void;
}

export const useMapperStore = create<MapperState>((set, get) => ({
  currentTool: 'select',
  components: [],
  selectedId: null,
  selectedPin: null,
  wires: [],
  searchQuery: '',
  activeSide: 'front',
  undoStack: [],
  redoStack: [],
  isDrawing: false,
  startX: 0,
  startY: 0,
  isPreviewing: false,
  isMovingPreview: false,
  previewComp: null,
  shiftX: 0,
  shiftY: 0,
  isWiring: false,
  isRoutingMode: false,
  activeWire: null,
  hoveredAnchor: null,
  hoveredNode: null,
  isDraggingComp: false,
  dragCompId: null,
  dragOffsetX: 0,
  dragOffsetY: 0,
  isDraggingNode: false,
  dragNodeWireId: null,
  dragNodeIndex: 0,
  hoveredWireId: null,
  selectedWireId: null,
  wireClickPos: null,

  setTool: (tool) => {
    if (get().isPreviewing) return;
    set({ currentTool: tool });
  },

  selectItem: (id) => set({
    selectedId: id,
    selectedPin: null, // Clear selected pin when changing component
    selectedWireId: null,
    wireClickPos: null,
    isRoutingMode: false,
    hoveredAnchor: null,
    hoveredNode: null,
  }),

  selectWire: (id, pos) => set({
    selectedWireId: id,
    wireClickPos: pos || null,
    selectedId: null,
    selectedPin: null,
    isRoutingMode: false,
    hoveredAnchor: null,
    hoveredNode: null,
  }),

  setSelectedPin: (pin) => set({ selectedPin: pin }),

  setSearchQuery: (q) => set({ searchQuery: q }),
  setHoveredAnchor: (a) => set({ hoveredAnchor: a }),
  setHoveredNode: (n) => set({ hoveredNode: n }),
  setHoveredWireId: (wireId) => set({ hoveredWireId: wireId }),
  setActiveSide: (side) => set({ activeSide: side }),

  // --- Undo/Redo ---
  pushUndo: () => {
    const { components, wires, undoStack } = get();
    const snap: Snapshot = {
      components: JSON.parse(JSON.stringify(components)),
      wires: JSON.parse(JSON.stringify(wires)),
    };
    set({ undoStack: [...undoStack.slice(-29), snap], redoStack: [] });
  },

  undo: () => {
    const { undoStack, components, wires } = get();
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    const redoSnap: Snapshot = {
      components: JSON.parse(JSON.stringify(components)),
      wires: JSON.parse(JSON.stringify(wires)),
    };
    set({
      components: prev.components,
      wires: prev.wires,
      undoStack: undoStack.slice(0, -1),
      redoStack: [...get().redoStack, redoSnap],
      selectedId: null,
    });
  },

  redo: () => {
    const { redoStack, components, wires } = get();
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    const undoSnap: Snapshot = {
      components: JSON.parse(JSON.stringify(components)),
      wires: JSON.parse(JSON.stringify(wires)),
    };
    set({
      components: next.components,
      wires: next.wires,
      redoStack: redoStack.slice(0, -1),
      undoStack: [...get().undoStack, undoSnap],
      selectedId: null,
    });
  },

  // --- Drawing ---
  startDrawing: (x, y) => set({ isDrawing: true, startX: x, startY: y }),
  stopDrawing: () => set({ isDrawing: false }),
  startPreview: (comp) => set({ isPreviewing: true, previewComp: comp, isDrawing: false }),
  startMovingPreview: (sx, sy) => set({ isMovingPreview: true, shiftX: sx, shiftY: sy }),
  stopMovingPreview: () => set({ isMovingPreview: false }),

  updatePreviewPosition: (x, y) => {
    const { previewComp, shiftX, shiftY } = get();
    if (!previewComp) return;
    if (previewComp.type === 'rect') {
      set({ previewComp: { ...previewComp, x: x - shiftX, y: y - shiftY } });
    } else {
      set({ previewComp: { ...previewComp, cx: x - shiftX, cy: y - shiftY } });
    }
  },

  confirmPreview: () => {
    const { previewComp, components, activeSide } = get();
    if (!previewComp) return;
    get().pushUndo();
    const newComp: PCBComponent = {
      ...previewComp as PCBComponent,
      id: 'ID_' + Math.random().toString(36).substr(2, 9),
      name: previewComp.name || (previewComp.type === 'rect' ? 'Square' : 'Circle') + '_' + components.length,
      compType: previewComp.type === 'rect' ? 'ic' : 'pad',
      net: previewComp.net || '',
      metadata: previewComp.metadata || { desc: '' },
      side: activeSide,
    };
    set({
      components: [...components, newComp],
      selectedId: newComp.id,
      isPreviewing: false,
      previewComp: null,
      currentTool: 'select',
    });
  },

  cancelPreview: () => set({ isPreviewing: false, previewComp: null, currentTool: 'select' }),

  // --- Wiring ---
  toggleRoutingMode: () => {
    const { selectedId, isRoutingMode, isWiring, activeWire, wires } = get();
    if (!selectedId) return;
    if (!isRoutingMode) {
      set({ isRoutingMode: true });
    } else {
      if (isWiring) {
        set({ isRoutingMode: false, isWiring: false, activeWire: null, wires: wires.filter(w => w !== activeWire) });
      } else {
        set({ isRoutingMode: false });
      }
    }
  },

  startWire: (wire) => {
    get().pushUndo();
    const taggedWire = { ...wire, side: get().activeSide };
    set(s => ({ isWiring: true, activeWire: taggedWire, wires: [...s.wires, taggedWire] }));
  },

  addWirePoint: (point) => {
    const { activeWire } = get();
    if (!activeWire) return;
    const updated = { ...activeWire, points: [...activeWire.points, point] };
    set(s => ({ activeWire: updated, isWiring: false, wires: s.wires.map(w => w.id === updated.id ? updated : w) }));
  },

  finalizeWire: (targetComp) => {
    const { activeWire, components, wires } = get();
    if (!activeWire) return;
    
    // If we have a targetComp, we propagate nets from src and target
    if (targetComp) {
      const src = components.find(c => c.id === activeWire.sourceCompId);
      const oldNet = src?.net || activeWire.net;
      const newNet = targetComp.net || oldNet || ('NET_' + Math.random().toString(36).substr(2, 5).toUpperCase());
      const finalW = { ...activeWire, targetCompId: targetComp.id, net: newNet };
      
      set({
        components: components.map(c => {
          if (c.id === targetComp.id || (src && c.id === src.id)) return { ...c, net: newNet };
          if (oldNet && c.net === oldNet) return { ...c, net: newNet };
          return c;
        }),
        wires: wires.map(w => {
          if (w.id === finalW.id) return finalW;
          if (oldNet && w.net === oldNet) return { ...w, net: newNet };
          return w;
        }),
        activeWire: null,
        isWiring: false,
      });
    } else {
      // Finalizing wire to a node (targetComp is undefined)
      // activeWire has already been updated with correct 'net' inside SvgCanvas
      const src = components.find(c => c.id === activeWire.sourceCompId);
      const newNet = activeWire.net;
      const oldNet = src?.net || activeWire.net;
      
      set({
        activeWire: null,
        isWiring: false,
        components: components.map(c => {
           if (src && c.id === src.id) return { ...c, net: newNet };
           if (oldNet && c.net === oldNet) return { ...c, net: newNet };
           return c;
        }),
        wires: wires.map(w => {
           if (w.id === activeWire.id) return activeWire;
           if (oldNet && w.net === oldNet) return { ...w, net: newNet };
           return w;
        })
      });
    }
  },

  cancelWire: () => {
    const { activeWire, wires } = get();
    set({ isWiring: false, activeWire: null, wires: wires.filter(w => w !== activeWire) });
  },

  deleteWire: (wireId: string) => {
    const { wires } = get();
    get().pushUndo();
    set({ wires: wires.filter(w => w.id !== wireId), isWiring: false, activeWire: null });
  },

  // --- Dragging ---
  startDraggingComp: (id, offX, offY) => {
    get().pushUndo();
    set({ isDraggingComp: true, dragCompId: id, dragOffsetX: offX, dragOffsetY: offY, selectedId: id });
  },

  updateDraggingComp: (x, y) => {
    const { dragCompId, dragOffsetX, dragOffsetY, components, wires } = get();
    if (!dragCompId) return;

    // Find current component to calculate movement delta
    const comp = components.find(c => c.id === dragCompId);
    if (!comp) return;

    const newX = x - dragOffsetX;
    const newY = y - dragOffsetY;

    let deltaX: number, deltaY: number;
    if (comp.x !== undefined && comp.y !== undefined) {
      deltaX = newX - comp.x;
      deltaY = newY - comp.y;
    } else {
      deltaX = newX - (comp.cx || 0);
      deltaY = newY - (comp.cy || 0);
    }

    // Update component position
    const updatedComponents = components.map(c => {
      if (c.id !== dragCompId) return c;
      if (c.x !== undefined) return { ...c, x: newX, y: newY };
      return { ...c, cx: newX, cy: newY };
    });

    // Step 1: Update wire endpoints DIRECTLY connected to this component
    // (skip branch wires whose first point is anchored to a node on another wire)
    let updatedWires = wires.map(w => {
      let changed = false;
      const newPoints = [...w.points];

      // If this component is the source AND it's not a branch wire, move the first point
      if (w.sourceCompId === dragCompId && !w.sourceNodeWireId) {
        newPoints[0] = { x: newPoints[0].x + deltaX, y: newPoints[0].y + deltaY };
        changed = true;
      }

      // If this component is the target, move the last point
      if (w.targetCompId === dragCompId && newPoints.length > 1) {
        const lastIdx = newPoints.length - 1;
        newPoints[lastIdx] = { x: newPoints[lastIdx].x + deltaX, y: newPoints[lastIdx].y + deltaY };
        changed = true;
      }

      return changed ? { ...w, points: newPoints } : w;
    });

    // Step 2: Cascade — update branch wires whose parent wire node has moved
    updatedWires = updatedWires.map(w => {
      if (!w.sourceNodeWireId) return w;
      const parentWire = updatedWires.find(pw => pw.id === w.sourceNodeWireId);
      if (!parentWire) return w;
      const idx = w.sourceNodeIndex ?? 0;
      if (idx >= parentWire.points.length) return w;
      const parentPoint = parentWire.points[idx];
      // Check if the parent node actually moved
      if (parentPoint.x === w.points[0].x && parentPoint.y === w.points[0].y) return w;
      const newPoints = [...w.points];
      newPoints[0] = { x: parentPoint.x, y: parentPoint.y };
      return { ...w, points: newPoints };
    });

    set({
      components: updatedComponents,
      wires: updatedWires,
    });
  },

  stopDraggingComp: () => set({ isDraggingComp: false, dragCompId: null }),

  // --- Dragging wire node ---
  startDraggingNode: (wireId, index) => {
    get().pushUndo();
    set({ isDraggingNode: true, dragNodeWireId: wireId, dragNodeIndex: index });
  },

  updateDraggingNode: (x, y) => {
    const { dragNodeWireId, dragNodeIndex, wires } = get();
    if (!dragNodeWireId) return;

    // Step 1: Move the specific node point
    let updatedWires = wires.map(w => {
      if (w.id !== dragNodeWireId) return w;
      const newPoints = [...w.points];
      newPoints[dragNodeIndex] = { x, y };
      return { ...w, points: newPoints };
    });

    // Step 2: Cascade — update branch wires whose parent node was moved
    updatedWires = updatedWires.map(w => {
      if (!w.sourceNodeWireId) return w;
      const parentWire = updatedWires.find(pw => pw.id === w.sourceNodeWireId);
      if (!parentWire) return w;
      const idx = w.sourceNodeIndex ?? 0;
      if (idx >= parentWire.points.length) return w;
      const parentPoint = parentWire.points[idx];
      if (parentPoint.x === w.points[0].x && parentPoint.y === w.points[0].y) return w;
      const newPoints = [...w.points];
      newPoints[0] = { x: parentPoint.x, y: parentPoint.y };
      return { ...w, points: newPoints };
    });

    set({ wires: updatedWires });
  },

  stopDraggingNode: () => set({ isDraggingNode: false, dragNodeWireId: null }),

  // --- CRUD ---
  saveProperties: (name, compType, net, desc, voltage, resistance, isGnd, gndCorner, pinCount, pinStartCorner, pinNumbering) => {
    const { selectedId, components } = get();
    if (!selectedId) return;
    get().pushUndo();
    
    const updatedComponents = components.map(c =>
      c.id === selectedId 
        ? { 
            ...c, 
            name, 
            compType, 
            net, 
            metadata: { 
              ...c.metadata, 
              desc: desc || '', 
              voltage: voltage || '', 
              resistance: resistance || '', 
              isGnd: !!isGnd,
              gndCorner: (gndCorner || c.metadata.gndCorner || 'topLeft') as Exclude<PCBComponent['metadata']['gndCorner'], undefined>,
              pinCount: pinCount || undefined,
              pinStartCorner: (pinStartCorner || c.metadata.pinStartCorner || 'topLeft') as Exclude<PCBComponent['metadata']['pinStartCorner'], undefined>,
              pinNumbering: (pinNumbering || c.metadata.pinNumbering || 'sequential') as Exclude<PCBComponent['metadata']['pinNumbering'], undefined>,
            } 
          } 
        : c
    );

    set({
      components: updatedComponents,
      hoveredAnchor: null,
      hoveredNode: null,
    });
  },

  savePinProperties: (pin, name, net, desc, voltage, resistance) => {
    const { selectedId, components } = get();
    if (!selectedId) return;
    get().pushUndo();
    
    const updatedComponents = components.map(c => {
      if (c.id !== selectedId) return c;
      const currentPinsInfo = c.metadata.pinsInfo || {};
      return {
        ...c,
        metadata: {
          ...c.metadata,
          pinsInfo: {
            ...currentPinsInfo,
            [pin]: { name, net, desc, voltage, resistance }
          }
        }
      };
    });

    set({ components: updatedComponents });
  },

  deleteSelected: () => {
    const { selectedId, components, wires } = get();
    if (!selectedId) return;
    get().pushUndo();
    set({
      components: components.filter(c => c.id !== selectedId),
      wires: wires.filter(w => w.sourceCompId !== selectedId && w.targetCompId !== selectedId),
      selectedId: null,
    });
  },

  clearAll: () => {
    get().pushUndo();
    set({ components: [], wires: [], selectedId: null });
  },

  exportData: () => {
    const { components, wires } = get();
    const blob = new Blob([JSON.stringify({ components, wires }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pcb_mapping_pro.json';
    a.click();
    URL.revokeObjectURL(url);
  },

  importData: (json: string) => {
    try {
      const data = JSON.parse(json);
      if (data.components) {
        get().pushUndo();
        set({ components: data.components, wires: data.wires || [], selectedId: null });
      }
    } catch { /* ignore bad JSON */ }
  },
}));
