'use client';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { guideService } from '@/services/guides';
import { modelService } from '@/services/models';
import { categoryService } from '@/services/categories';
import { useMapperStore } from '@/store/useMapperStore';
import { useAppStore } from '@/store/useAppStore';
import type { PCBComponent, Wire } from '@/store/useMapperStore';
import Toolbar from '@/components/Toolbar';
import Sidebar from '@/components/Sidebar';
import dynamic from 'next/dynamic';
import { 
  ArrowLeft, Save, Plus, Trash2, ChevronUp, ChevronDown, 
  Cpu, Eye, Edit3, Layers, Activity, AlertCircle
} from 'lucide-react';
import { type RepairGuide, type DeviceModel, type RepairStep, type Category, DIFFICULTY_CONFIG } from '@/lib/types';

const SvgCanvas = dynamic(() => import('@/components/SvgCanvas'), { ssr: false });

interface PinMarker {
  id: string;
  x: number; // percentage
  y: number; // percentage
  stepIndex: number;
  label: string;
}

type ViewMode = 'edit' | 'preview';

export default function GuideViewScreen() {
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
  const [activePcbSide, setActivePcbSide] = useState<'front' | 'back'>('front');
  const [isPlacingPin, setIsPlacingPin] = useState(false);
  const [placingForStep, setPlacingForStep] = useState<number | null>(null);
  const { userMode } = useAppStore();
  const [viewMode, setViewMode] = useState<ViewMode>(userMode === 'admin' ? 'edit' : 'preview');
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const { selectedId, selectItem } = store();

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
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setPins((g as any).pins || []);
      
      const cat = cats.find(c => c.id === g.categoryId);
      if (cat) setCategory(cat);

      // Normalize components to ensure they have the metadata structure
      const dbComponents = (m.pcbData?.components as PCBComponent[]) || [];
      const normalizedComponents = dbComponents.map(c => ({
        ...c,
        metadata: c.metadata || { desc: (c as any).desc || '' }
      }));

      // For initial load, or if components are empty, populate the store
      const currentComps = store.getState().components;
      if (currentComps.length === 0) {
        store.setState({
          components: normalizedComponents,
          wires: (m.pcbData?.wires as Wire[]) || [],
        });
      }
    } catch (err) {
      console.error('Failed to load guide:', err);
      setGuide(null);
    } finally {
      setLoading(false);
    }
  }, [guideId, modelId, store]);

  // Save PCB component map to model
  const handleSavePcbMap = useCallback(async () => {
    const { components, wires } = store.getState();
    setSaving2(true);
    try {
      await modelService.update(modelId, { pcbData: { components, wires } });
    } catch (err) {
      console.error('Failed to save PCB data:', err);
    } finally {
      setSaving2(false);
    }
  }, [modelId, store]);

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
        <h1 className="text-xl font-bold mb-2">Guia não encontrado</h1>
        <p className="text-[#5c5f77] text-[14px] max-w-md mb-8">
          Não foi possível localizar as informações deste guia de reparo ou do modelo do dispositivo. Verifique se o link está correto.
        </p>
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1e2030] text-white text-[14px] font-bold hover:bg-[#2e3148] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Soluções
        </button>
      </div>
    );
  }

  const pcbImage = activePcbSide === 'front'
    ? (model?.pcbImageFrontClean || model?.pcbImageFront)
    : (model?.pcbImageBackClean || model?.pcbImageBack);

  // Save guide steps + pins
  const handleSaveGuide = async () => {
    if (!guide) return;
    setSaving(true);
    try {
      await guideService.update(guideId, { 
        steps, 
        description,
        classicSymptoms,
        circuitAnalysis,
        identifiedCause,
        appliedSolution,
        observations,
        pins 
      } as any);
    } catch (err) {
      console.error('Failed to save guide:', err);
    } finally {
      setSaving(false);
    }
  };

  // Add pin by clicking on the board image
  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlacingPin || placingForStep === null || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const stepNum = placingForStep + 1;
    const newPin: PinMarker = {
      id: `pin_${Date.now()}`,
      x, y,
      stepIndex: placingForStep,
      label: `${stepNum}`
    };
    setPins(p => [...p.filter(pin => pin.stepIndex !== placingForStep), newPin]);
    setIsPlacingPin(false);
    setPlacingForStep(null);
  };

  // Step management
  const addStep = () => setSteps(prev => [...prev, { order: prev.length + 1, title: '', description: '' }]);
  const updateStep = (i: number, field: keyof RepairStep, value: string) =>
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
      
      {/* ─── Top Bar ───────────────────────────────────────────── */}
      <div className="shrink-0 h-12 bg-[#161921]/95 backdrop-blur-xl border-b border-[#1e2030] flex items-center px-4 gap-3 z-50">
        <button
          onClick={() => router.push(`/brands/${brandId}/models/${modelId}/guides`)}
          className="flex items-center gap-1.5 text-[12px] text-[#8b8fa3] hover:text-[#3b82f6] transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar
        </button>
        <div className="w-px h-5 bg-[#1e2030] shrink-0" />

        {/* Guide meta */}
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

        {/* Unified Save and Mode controls */}
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

      {/* ─── Unified Main Workspace ────────────────────────────── */}
      <div className="flex flex-1 min-h-0 bg-[#0c0e15] relative overflow-hidden">
        
        {/* LEFT: Toolbar (Only in Edit Mode) */}
        {viewMode === 'edit' && userMode === 'admin' && <Toolbar />}

        {/* CENTER: PCB Viewer/Editor */}
        <div className="flex-1 flex flex-col min-w-0 relative bg-[#0a0b10] border-r border-[#1e2030]/50">
          
          {/* Side Switcher (A/B side) */}
          {(model?.pcbImageFront || model?.pcbImageBack) && (
            <div className="absolute top-4 left-4 z-40 flex bg-[#161921]/90 backdrop-blur-md rounded-xl border border-[#1e2030] p-1 shadow-2xl">
              {model?.pcbImageFront && (
                <button onClick={() => setActivePcbSide('front')}
                  className={`px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${activePcbSide === 'front' ? 'bg-[#3b82f6] text-white shadow-lg' : 'text-[#5c5f77] hover:text-[#e1e2e8]'}`}>
                  FRENTE (A)
                </button>
              )}
              {model?.pcbImageBack && (
                <button onClick={() => setActivePcbSide('back')}
                  className={`px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${activePcbSide === 'back' ? 'bg-[#f59e0b] text-white shadow-lg' : 'text-[#5c5f77] hover:text-[#e1e2e8]'}`}>
                  VERSO (B)
                </button>
              )}
            </div>
          )}

          {isPlacingPin && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-[#3b82f6] text-white text-[12px] font-black px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-3 animate-bounce border border-white/20">
              📍 CLIQUE NA PLACA PARA MARCAR O PASSO {(placingForStep ?? 0) + 1}
              <button onClick={() => { setIsPlacingPin(false); setPlacingForStep(null); }} className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/40 transition-colors">✕</button>
            </div>
          )}

          {/* Integrated View: SvgCanvas for Cataloging or Simple Pins for Guide */}
          <div className="flex-1 relative overflow-hidden flex flex-col">
             {viewMode === 'edit' && userMode === 'admin' ? (
                <SvgCanvas bgImage={pcbImage} />
             ) : (
                <div ref={boardRef} onClick={handleBoardClick}
                  className={`w-full h-full flex items-center justify-center relative ${isPlacingPin ? 'cursor-crosshair' : 'cursor-default'}`}>
                  {pcbImage ? (
                    <div className="relative w-full h-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={pcbImage} alt="PCB Board" className="w-full h-full object-contain" draggable={false} />
                      {pins.map(pin => {
                        const isActive = pin.stepIndex === activeStepIndex;
                        return (
                          <div key={pin.id}
                            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto transition-transform hover:scale-110"
                            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                            onClick={(e) => { e.stopPropagation(); setActiveStepIndex(pin.stepIndex); }}>
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[12px] font-black shadow-lg transition-all ${isActive ? 'bg-[#3b82f6] border-white text-white scale-125 shadow-[0_0_20px_rgba(59,130,246,0.7)]' : 'bg-[#161921] border-[#3b82f6] text-[#3b82f6] hover:border-white hover:text-white'}`}>
                              {pin.label}
                            </div>
                            <div className={`w-0.5 h-3 ${isActive ? 'bg-[#3b82f6]' : 'bg-[#3b82f6]/50'}`} />
                            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#3b82f6]' : 'bg-[#3b82f6]/50'}`} />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 opacity-30">
                      <Cpu className="w-16 h-16" />
                      <p>Sem imagem da placa</p>
                    </div>
                  )}
                </div>
             )}
          </div>
        </div>

        {/* RIGHT: Combined Sidebar (Analysis + Steps + Component Details) */}
        <div className="w-[380px] shrink-0 bg-[#0f1117] flex flex-col border-l border-[#1e2030] overflow-hidden">
          
          {/* Dynamic Content Switch: Component Details OR Guide Steps */}
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
              <div className="shrink-0 p-5 border-b border-[#1e2030] flex items-center justify-between">
                <div>
                  <h3 className="text-[14px] font-bold text-[#e1e2e8]">Fluxo de Reparo</h3>
                  <p className="text-[11px] text-[#5c5f77] mt-0.5">{steps.length} passo{steps.length !== 1 ? 's' : ''} registrados</p>
                </div>
                {viewMode === 'edit' && userMode === 'admin' && (
                  <button onClick={addStep}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/30 text-[#3b82f6] text-[12px] font-semibold hover:bg-[#3b82f6]/20 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Passo
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {/* Technical Overview Section */}
                <div className={`rounded-xl border transition-all overflow-hidden ${showOverview ? 'border-[#3b82f6]/30 bg-[#161921]' : 'border-[#1e2030] bg-[#0c0e15] hover:border-[#1e2030]/80'}`}>
                  <button onClick={() => setShowOverview(!showOverview)} className="w-full flex items-center justify-between p-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${showOverview ? 'bg-[#3b82f6] text-white shadow-lg shadow-[#3b82f6]/20' : 'bg-[#1e2030] text-[#5c5f77]'}`}>
                        <Activity className="w-4 h-4" />
                      </div>
                      <span className="text-[13px] font-black text-[#e1e2e8] uppercase tracking-tight">Análise Técnica</span>
                    </div>
                    {showOverview ? <ChevronUp className="w-4 h-4 text-[#5c5f77]" /> : <ChevronDown className="w-4 h-4 text-[#5c5f77]" />}
                  </button>

                  {showOverview && (
                    <div className="px-4 pb-4 space-y-4 animate-in slide-in-from-top-1 duration-200">
                      {/* Description */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#5c5f77] uppercase tracking-wider block">Descrição do Problema</label>
                        {viewMode === 'edit' ? (
                          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full bg-[#0c0e15] border border-[#1e2030] rounded-lg px-3 py-2 text-[12px] text-[#e1e2e8] resize-none focus:border-[#3b82f6] outline-none transition-colors" />
                        ) : (
                          <p className="text-[12px] text-[#8b8fa3] leading-relaxed bg-[#0c0e15] p-2.5 rounded-lg border border-[#1e2030]/50">{description || 'Sem descrição.'}</p>
                        )}
                      </div>

                      {/* Symptoms */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#ef4444]/60 uppercase tracking-wider block">Sintomas Observados</label>
                        {viewMode === 'edit' ? (
                          <textarea value={classicSymptoms} onChange={e => setClassicSymptoms(e.target.value)} rows={2} className="w-full bg-[#0c0e15] border border-[#1e2030] rounded-lg px-3 py-2 text-[12px] text-[#e1e2e8] resize-none focus:border-[#3b82f6] outline-none" />
                        ) : (
                          <p className="text-[12px] text-[#8b8fa3] italic bg-[#0c0e15] p-2.5 rounded-lg border border-[#ef4444]/10">{classicSymptoms || 'Não informados.'}</p>
                        )}
                      </div>

                      <div className="h-px bg-[#1e2030]/50" />

                      {/* Cause & Solution */}
                      <div className="grid grid-cols-2 gap-3">
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-[#f59e0b]/60 uppercase tracking-wider block">Causa Provável</label>
                            {viewMode === 'edit' ? (
                              <input value={identifiedCause} onChange={e => setIdentifiedCause(e.target.value)} className="w-full bg-[#0c0e15] border border-[#1e2030] rounded-lg px-2 py-2 text-[11px] text-[#e1e2e8] outline-none" />
                            ) : (
                              <p className="text-[11px] text-[#e1e2e8] bg-[#0c0e15] p-2 rounded-lg border border-[#f59e0b]/10">{identifiedCause || '-'}</p>
                            )}
                         </div>
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-[#22c55e]/60 uppercase tracking-wider block">Solução Técnica</label>
                            {viewMode === 'edit' ? (
                              <input value={appliedSolution} onChange={e => setAppliedSolution(e.target.value)} className="w-full bg-[#0c0e15] border border-[#1e2030] rounded-lg px-2 py-2 text-[11px] text-[#e1e2e8] outline-none" />
                            ) : (
                              <p className="text-[11px] text-[#22c55e] font-bold bg-[#0c0e15] p-2 rounded-lg border border-[#22c55e]/10">{appliedSolution || '-'}</p>
                            )}
                         </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Steps Section */}
                <div className="space-y-2.5">
                  {steps.map((step, i) => {
                    const pinForStep = pins.find(p => p.stepIndex === i);
                    const isActive = activeStepIndex === i;
                    return (
                      <div key={i} onClick={() => setActiveStepIndex(isActive ? null : i)}
                        className={`relative rounded-xl border transition-all cursor-pointer ${isActive ? 'border-[#3b82f6]/60 bg-[#3b82f6]/5 shadow-[0_4px_15px_-4px_rgba(59,130,246,0.3)]' : 'border-[#1e2030] bg-[#161921] hover:border-[#2e3148]'}`}>
                        <div className="flex items-center gap-3 p-3.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-black shrink-0 ${isActive ? 'bg-[#3b82f6] text-white' : 'bg-[#1e2030] text-[#5c5f77]'}`}>{i + 1}</div>
                          <div className="flex-1 min-w-0">
                            {viewMode === 'edit' ? (
                              <input value={step.title} onClick={e => e.stopPropagation()} onChange={e => updateStep(i, 'title', e.target.value)} placeholder={`Título…`} className="w-full bg-transparent text-[13px] font-bold text-[#e1e2e8] placeholder-[#3f4257] outline-none" />
                            ) : (
                              <p className="text-[13px] font-bold text-[#e1e2e8] truncate">{step.title || `Passo ${i + 1}`}</p>
                            )}
                          </div>
                          {pinForStep && <div className="w-6 h-6 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/30 flex items-center justify-center shrink-0">📍</div>}
                          {viewMode === 'edit' && userMode === 'admin' && (
                            <div className="flex gap-1 shrink-0 px-2 border-l border-[#1e2030]/50 ml-1" onClick={e => e.stopPropagation()}>
                              <button onClick={() => moveStep(i, -1)} disabled={i === 0} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#5c5f77] hover:text-[#e1e2e8] disabled:opacity-20 hover:bg-white/5 transition-colors cursor-pointer">
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button onClick={() => moveStep(i, 1)} disabled={i === steps.length - 1} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#5c5f77] hover:text-[#e1e2e8] disabled:opacity-20 hover:bg-white/5 transition-colors cursor-pointer">
                                <ChevronDown className="w-4 h-4" />
                              </button>
                              <button onClick={() => removeStep(i)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#5c5f77] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                        {isActive && (
                          <div className="px-3.5 pb-4 space-y-3 animate-in fade-in slide-in-from-top-1">
                            {viewMode === 'edit' ? (
                              <>
                                <textarea value={step.description} onClick={e => e.stopPropagation()} onChange={e => updateStep(i, 'description', e.target.value)} rows={3} className="w-full bg-[#0c0e15] border border-[#1e2030] rounded-lg px-3 py-2 text-[12px] text-[#e1e2e8] resize-none outline-none focus:border-[#3b82f6]" />
                                <div className="flex gap-2">
                                  <button onClick={e => { e.stopPropagation(); setIsPlacingPin(true); setPlacingForStep(i); }} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-black transition-all ${pinForStep ? 'bg-orange-500/10 border border-orange-500/30 text-orange-500' : 'bg-[#3b82f6]/10 border border-[#3b82f6]/30 text-[#3b82f6]'}`}>
                                    {pinForStep ? 'REPOSICIONAR PIN' : 'VINCULAR À PLACA'}
                                  </button>
                                  <label className="flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold bg-[#1e2030] border border-[#2e3148] text-[#8b8fa3] cursor-pointer">
                                    <Layers className="w-3.5 h-3.5" /> FOTO
                                    <input type="file" accept="image/*" className="hidden" onChange={e => handleStepImg(i, e)} />
                                  </label>
                                </div>
                              </>
                            ) : (
                              <p className="text-[12px] text-[#8b8fa3] leading-relaxed italic">{step.description || 'Sem detalhes.'}</p>
                            )}
                            {step.image && (
                              <div className="relative h-40 w-full overflow-hidden rounded-lg border border-[#1e2030]">
                                <Image unoptimized fill src={step.image} alt="" className="object-cover" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
