'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { guideService } from '@/services/guides';
import { modelService } from '@/services/models';
import { categoryService } from '@/services/categories';
import { useMapperStore } from '@/store/useMapperStore';
import { useAppStore } from '@/store/useAppStore';
import Toolbar from '@/components/Toolbar';
import Sidebar from '@/components/Sidebar';
import dynamic from 'next/dynamic';
import { 
  ArrowLeft, Save, 
  Eye, Edit3, Activity, AlertCircle,
  ChevronUp, ChevronDown
} from 'lucide-react';
import { type RepairGuide, type DeviceModel, type RepairStep, type Category, DIFFICULTY_CONFIG } from '@/lib/types';
import RepairStepsPanel from '@/components/guides/RepairStepsPanel';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SvgCanvas = dynamic(() => import('@/components/SvgCanvas'), { ssr: false }) as any;

interface PinMarker {
  id: string;
  /** Native SVG coordinate — same space as SvgCanvas components/wires */
  svgX: number;
  svgY: number;
  stepIndex: number;
  label: string;
}

type ViewMode = 'edit' | 'preview';

export default function PcbEditorScreen() {
  const params = useParams();
  const router = useRouter();
  const brandId = params.brandId as string;
  const modelId = params.modelId as string;
  const guideId = params.guideId as string;
  const store = useMapperStore;

  const [guide, setGuide] = useState<RepairGuide | null>(null);
  const [model, setModel] = useState<DeviceModel | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [steps, setSteps] = useState<RepairStep[]>([]);
  const [pins, setPins] = useState<PinMarker[]>([]);
  const [saving, setSaving] = useState(false);
  const [saving2, setSaving2] = useState(false);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState('');
  const [classicSymptoms, setClassicSymptoms] = useState('');
  const [circuitAnalysis, setCircuitAnalysis] = useState('');
  const [identifiedCause, setIdentifiedCause] = useState('');
  const [appliedSolution, setAppliedSolution] = useState('');
  const [observations, setObservations] = useState('');
  const [showOverview, setShowOverview] = useState(true);
  const [isPlacingPin, setIsPlacingPin] = useState(false);
  const [placingForStep, setPlacingForStep] = useState<number | null>(null);
  const { userMode } = useAppStore();
  const [viewMode, setViewMode] = useState<ViewMode>(userMode === 'admin' ? 'edit' : 'preview');
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const { selectedId, selectItem } = store();

  // Handle pin placement — SvgCanvas calls this with native SVG coords
  const handleBoardPinPlaced = useCallback((svgX: number, svgY: number) => {
    if (placingForStep === null) return;
    const stepNum = placingForStep + 1;
    const newPin: PinMarker = {
      id: `pin_${Date.now()}`,
      svgX, svgY,
      stepIndex: placingForStep,
      label: `${stepNum}`,
    };
    setPins(p => [...p.filter(pin => pin.stepIndex !== placingForStep), newPin]);
    setIsPlacingPin(false);
    setPlacingForStep(null);
  }, [placingForStep]);

  const handlePinMove = useCallback((pinId: string, svgX: number, svgY: number) => {
    setPins(prev => prev.map(p => p.id === pinId ? { ...p, svgX, svgY } : p));
  }, []);

  const handlePinDelete = useCallback((pinId: string) => {
    setPins(prev => prev.filter(p => p.id !== pinId));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const g = await guideService.getById(guideId);
      const m = await modelService.getById(modelId);
      const cats = await categoryService.getAll();
      
      setGuide(g);
      setModel(m);
      setSteps(g.steps || []);
      setDescription(g.description || '');
      setClassicSymptoms(g.classicSymptoms || '');
      setCircuitAnalysis(g.circuitAnalysis || '');
      setIdentifiedCause(g.identifiedCause || '');
      setAppliedSolution(g.appliedSolution || '');
      setObservations(g.observations || '');
      
      setPins(g.pins || []);
      
      const cat = cats.find(c => c.id === g.categoryId);
      if (cat) setCategory(cat);

      // Populate the store with Guide-specific PCB Diagram Data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = (g.boardDiagramData as any) || {};
      store.setState({ 
        components: data.components || [], 
        wires: data.wires || [], 
        selectedId: null 
      });
    } catch (err) {
      console.error('Failed to load guide:', err);
      setGuide(null);
    } finally {
      setLoading(false);
    }
  }, [guideId, modelId, store]);

  // Save PCB component map to the specific guide
  const handleSavePcbMap = useCallback(async () => {
    const { components, wires } = store.getState();
    setSaving2(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await guideService.update(guideId, { boardDiagramData: { components, wires } } as any);
    } catch (err) {
      console.error('Failed to save PCB data:', err);
    } finally {
      setSaving2(false);
    }
  }, [guideId, store]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0a0b10] text-[#e1e2e8]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#3b82f6] border-t-transparent" />
          <p className="text-[14px] font-medium animate-pulse">Carregando painel interativo...</p>
        </div>
      </div>
    );
  }

  if (!guide || !model) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#0a0b10] text-[#e1e2e8] p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-xl font-bold mb-2">Guia nao encontrado</h1>
        <p className="text-[#5c5f77] text-[14px] max-w-md mb-8">
          Nao foi possivel localizar as informacoes deste guia de reparo ou do modelo do dispositivo.
        </p>
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1e2030] text-white text-[14px] font-bold hover:bg-[#2e3148] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
      </div>
    );
  }

  const frontImage = model?.pcbImageFrontClean || model?.pcbImageFront;
  const backImage = model?.pcbImageBackClean || model?.pcbImageBack;

  const handleSaveGuide = async () => {
    if (!guide) return;
    setSaving(true);
    try {
      const payload = { 
        steps, 
        description,
        classicSymptoms,
        circuitAnalysis,
        identifiedCause,
        appliedSolution,
        observations,
        pins 
      };
      console.log('📦 Salvando guia — payload completo:', JSON.stringify(payload, null, 2));
      console.log('📌 Pins:', pins.map(p => ({ id: p.id, svgX: p.svgX, svgY: p.svgY, step: p.stepIndex })));
      console.log('📋 Steps:', steps.map(s => ({ title: s.title, risk: s.riskLevel, tools: s.tools?.length, checklist: s.checklist?.length })));
      await guideService.update(guideId, payload);
    } catch (err) {
      console.error('Failed to save guide:', err);
    } finally {
      setSaving(false);
    }
  };


  const addStep = () => setSteps(prev => [...prev, { order: prev.length + 1, title: '', description: '' }]);
  const updateStep = (i: number, field: keyof RepairStep, value: unknown) =>
    setSteps(prev => prev.map((s, j) => j === i ? { ...s, [field]: value } : s));
  const removeStep = (i: number) => {
    setSteps(prev => prev.filter((_, j) => j !== i).map((s, j) => ({ ...s, order: j + 1 })));
    setPins(prev => prev.filter(p => p.stepIndex !== i).map(p =>
      p.stepIndex > i ? { ...p, stepIndex: p.stepIndex - 1, label: `${p.stepIndex}` } : p
    ));
  };
  const moveStep = (i: number, dir: -1 | 1) => {
    const ni = i + dir;
    if (ni < 0 || ni >= steps.length) return;
    setSteps(prev => {
      const arr = [...prev];
      [arr[i], arr[ni]] = [arr[ni], arr[i]];
      return arr.map((s, j) => ({ ...s, order: j + 1 }));
    });
  };
  const handleStepImg = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => updateStep(i, 'image', r.result as string);
    r.readAsDataURL(f);
  };

  const difficultyKey = guide.difficulty || 'facil';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const di = (DIFFICULTY_CONFIG as any)[difficultyKey] || DIFFICULTY_CONFIG.facil;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0c0e15] text-[#e1e2e8]">
      
      {/* Top Bar */}
      <div className="shrink-0 h-12 bg-[#161921]/95 backdrop-blur-xl border-b border-[#1e2030] flex items-center px-4 gap-3 z-50">
        <button
          onClick={() => router.push(`/brands/${brandId}/models/${modelId}/guides`)}
          className="flex items-center gap-1.5 text-[12px] text-[#8b8fa3] hover:text-[#3b82f6] transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar
        </button>
        <div className="w-px h-5 bg-[#1e2030] shrink-0" />

        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {category && <span className="text-[11px] text-[#3b82f6] font-bold uppercase tracking-wider shrink-0">{category.name}</span>}
          <span className="text-[14px] font-semibold text-[#e1e2e8] truncate">{guide.problemTitle}</span>
          <span
            className="text-[11px] px-2 py-0.5 rounded-md border shrink-0"
            style={{ borderColor: di.color + '40', color: di.color, backgroundColor: di.color + '10' }}
          >
            {di.label}
          </span>
        </div>

        {userMode === 'admin' && (
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex bg-[#0c0e15] border border-[#1e2030] rounded-lg p-0.5">
              <button onClick={() => setViewMode('edit')} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${viewMode === 'edit' ? 'bg-[#1e2030] text-white' : 'text-[#5c5f77]'}`}>
                <Edit3 className="w-3 h-3" /> Editar
              </button>
              <button onClick={() => setViewMode('preview')} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${viewMode === 'preview' ? 'bg-[#1e2030] text-white' : 'text-[#5c5f77]'}`}>
                <Eye className="w-3 h-3" /> Preview
              </button>
            </div>
            
            <button 
              onClick={async () => {
                await handleSaveGuide();
                await handleSavePcbMap();
              }} 
              disabled={saving || saving2}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#3b82f6] text-white text-[12px] font-bold hover:bg-[#2563eb] disabled:opacity-60 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.2)] shrink-0"
            >
              <Save className="w-3.5 h-3.5" /> {(saving || saving2) ? 'Gravando...' : 'Salvar Tudo'}
            </button>
          </div>
        )}
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 min-h-0 bg-[#0c0e15] relative overflow-hidden">
        
        {viewMode === 'edit' && userMode === 'admin' && <Toolbar />}

        <div className="flex-1 flex flex-col min-w-0 relative bg-[#0a0b10] border-r border-[#1e2030]/50">
          
          {isPlacingPin && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-[#3b82f6] text-white text-[12px] font-black px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-3 animate-bounce border border-white/20">
              CLIQUE NA PLACA PARA MARCAR O PASSO {(placingForStep ?? 0) + 1}
              <button onClick={() => { setIsPlacingPin(false); setPlacingForStep(null); }} className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/40 transition-colors">X</button>
            </div>
          )}

          <div className="flex-1 relative overflow-hidden flex flex-col">
             {viewMode === 'edit' && userMode === 'admin' ? (
                /* ── EDIT MODE: Full SvgCanvas with pin management ── */
                <SvgCanvas
                  bgImage={frontImage}
                  bgImage2={backImage}
                  pins={pins}
                  activeStepIndex={activeStepIndex}
                  isPlacingPin={isPlacingPin}
                  onPinPlaced={handleBoardPinPlaced}
                  onPinMove={handlePinMove}
                  onPinDelete={handlePinDelete}
                  onPinClick={setActiveStepIndex}
                />
             ) : (
                /* ── PREVIEW / USER MODE: Same SvgCanvas read-only ── */
                <SvgCanvas
                  bgImage={frontImage}
                  bgImage2={backImage}
                  pins={pins}
                  activeStepIndex={activeStepIndex}
                  onPinClick={setActiveStepIndex}
                  readOnly
                />
             )}
          </div>
        </div>

        {/* RIGHT: Sidebar */}
        <div className="w-[380px] shrink-0 bg-[#0f1117] flex flex-col border-l border-[#1e2030] overflow-hidden">
          
          {selectedId ? (
             <div className="flex flex-1 flex-col overflow-hidden">
                <div className="shrink-0 p-4 border-b border-[#1e2030] flex items-center justify-between bg-[#161921]">
                  <h3 className="text-[13px] font-bold text-accent uppercase tracking-wider">Mapeamento de Hardware</h3>
                  <button onClick={() => selectItem(null)} className="text-[11px] text-[#5c5f77] hover:text-[#e1e2e8] transition-colors font-bold">FECHAR</button>
                </div>
                <Sidebar />
             </div>
          ) : (
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Panel Header — only for admin */}
              {userMode === 'admin' && (
                <div className="shrink-0 p-4 border-b border-[#1e2030] flex items-center justify-between">
                  <div>
                    <h3 className="text-[13px] font-bold text-[#e1e2e8]">Fluxo de Reparo</h3>
                    <p className="text-[10px] text-[#5c5f77] mt-0.5">{steps.length} passo{steps.length !== 1 ? 's' : ''} registrados</p>
                  </div>
                </div>
              )}

              {/* Technical Overview (admin only) */}
              {viewMode === 'edit' && userMode === 'admin' && (
                <div className="shrink-0 px-4 py-3 border-b border-[#1e2030]">
                  <div className={`rounded-xl border transition-all overflow-hidden ${showOverview ? 'border-[#3b82f6]/30 bg-[#161921]' : 'border-[#1e2030] bg-[#0c0e15]'}`}>
                    <button onClick={() => setShowOverview(!showOverview)} className="w-full flex items-center justify-between p-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${showOverview ? 'bg-[#3b82f6] text-white' : 'bg-[#1e2030] text-[#5c5f77]'}`}>
                          <Activity className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[12px] font-bold text-[#e1e2e8] uppercase tracking-tight">Análise Técnica</span>
                      </div>
                      {showOverview ? <ChevronUp className="w-3.5 h-3.5 text-[#5c5f77]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#5c5f77]" />}
                    </button>
                    {showOverview && (
                      <div className="px-3 pb-3 space-y-3 border-t border-[#1e2030]/50 pt-3">
                        <div>
                          <label className="text-[9px] font-black text-[#5c5f77] uppercase tracking-wider block mb-1">Descrição do Problema</label>
                          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full bg-[#0c0e15] border border-[#1e2030] rounded-lg px-2 py-1.5 text-[11px] text-[#e1e2e8] resize-none focus:border-[#3b82f6] outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-[#ef4444]/60 uppercase tracking-wider block mb-1">Sintomas Observados</label>
                          <textarea value={classicSymptoms} onChange={e => setClassicSymptoms(e.target.value)} rows={2} className="w-full bg-[#0c0e15] border border-[#1e2030] rounded-lg px-2 py-1.5 text-[11px] text-[#e1e2e8] resize-none focus:border-[#3b82f6] outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-[#f59e0b]/60 uppercase tracking-wider block mb-1">Causa Provável</label>
                          <textarea value={identifiedCause} onChange={e => setIdentifiedCause(e.target.value)} rows={2} className="w-full bg-[#0c0e15] border border-[#1e2030] rounded-lg px-2 py-1.5 text-[11px] text-[#e1e2e8] resize-none focus:border-[#3b82f6] outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-[#22c55e]/60 uppercase tracking-wider block mb-1">Solução Técnica</label>
                          <textarea value={appliedSolution} onChange={e => setAppliedSolution(e.target.value)} rows={2} className="w-full bg-[#0c0e15] border border-[#1e2030] rounded-lg px-2 py-1.5 text-[11px] text-[#e1e2e8] resize-none focus:border-[#3b82f6] outline-none" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Overview read-only for subscriber */}
              {userMode === 'subscriber' && (description || classicSymptoms || identifiedCause || appliedSolution) && (
                <div className="shrink-0 px-4 py-3 border-b border-[#1e2030] space-y-2">
                  {description && <p className="text-[12px] text-[#8b8fa3] leading-relaxed">{description}</p>}
                  <div className="grid grid-cols-2 gap-2">
                    {identifiedCause && (
                      <div className="bg-[#f59e0b]/5 border border-[#f59e0b]/15 rounded-lg p-2">
                        <p className="text-[9px] font-black text-[#f59e0b]/70 uppercase mb-0.5">Causa</p>
                        <p className="text-[11px] text-[#e1e2e8]">{identifiedCause}</p>
                      </div>
                    )}
                    {appliedSolution && (
                      <div className="bg-[#22c55e]/5 border border-[#22c55e]/15 rounded-lg p-2">
                        <p className="text-[9px] font-black text-[#22c55e]/70 uppercase mb-0.5">Solução</p>
                        <p className="text-[11px] text-[#22c55e] font-bold">{appliedSolution}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Steps Panel */}
              <RepairStepsPanel
                steps={steps}
                activeStepIndex={activeStepIndex}
                setActiveStepIndex={setActiveStepIndex}
                pins={pins}
                isAdmin={userMode === 'admin' && viewMode === 'edit'}
                onAdd={addStep}
                onRemove={removeStep}
                onMove={moveStep}
                onUpdate={updateStep}
                onImg={handleStepImg}
                onPlacePin={(i) => { setIsPlacingPin(true); setPlacingForStep(i); }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
