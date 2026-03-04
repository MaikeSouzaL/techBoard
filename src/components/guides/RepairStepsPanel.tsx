'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import {
  Plus, Trash2, ChevronUp, ChevronDown, Layers, MapPin,
  AlertTriangle, Wrench, CheckSquare, Square, ChevronRight,
  ChevronLeft, Activity, Check, X,
} from 'lucide-react';
import {
  type RepairStep, type StepTool, type StepChecklistItem,
  STEP_RISK_CONFIG, STEP_TOOL_OPTIONS, type StepRiskLevel,
} from '@/lib/types';

// ─── Admin: Step Editor ─────────────────────────────────────────────────────

interface AdminStepEditorProps {
  steps: RepairStep[];
  activeStepIndex: number | null;
  setActiveStepIndex: (i: number | null) => void;
  pins: { stepIndex: number }[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  onMove: (i: number, dir: -1 | 1) => void;
  onUpdate: (i: number, field: keyof RepairStep, value: unknown) => void;
  onImg: (i: number, e: React.ChangeEvent<HTMLInputElement>) => void;
  onPlacePin: (i: number) => void;
}

function RiskBadge({ level }: { level?: StepRiskLevel }) {
  if (!level || level === 'low') return null;
  const cfg = STEP_RISK_CONFIG[level];
  return (
    <span
      className="flex items-center gap-1 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md border"
      style={{ color: cfg.color, borderColor: cfg.color + '40', background: cfg.bg }}
    >
      <AlertTriangle size={9} />
      {cfg.label}
    </span>
  );
}

function AdminStepEditor({
  steps, activeStepIndex, setActiveStepIndex, pins,
  onAdd, onRemove, onMove, onUpdate, onImg, onPlacePin,
}: AdminStepEditorProps) {

  const addChecklistItem = (stepIdx: number) => {
    const step = steps[stepIdx];
    const current = step.checklist || [];
    onUpdate(stepIdx, 'checklist', [
      ...current,
      { id: `cl_${Date.now()}`, text: '' } as StepChecklistItem,
    ]);
  };

  const updateChecklistItem = (stepIdx: number, clIdx: number, text: string) => {
    const step = steps[stepIdx];
    const updated = (step.checklist || []).map((c, j) => j === clIdx ? { ...c, text } : c);
    onUpdate(stepIdx, 'checklist', updated);
  };

  const removeChecklistItem = (stepIdx: number, clIdx: number) => {
    const step = steps[stepIdx];
    onUpdate(stepIdx, 'checklist', (step.checklist || []).filter((_, j) => j !== clIdx));
  };

  const toggleTool = (stepIdx: number, tool: StepTool) => {
    const step = steps[stepIdx];
    const current = (step.tools || []) as StepTool[];
    const next = current.includes(tool) ? current.filter(t => t !== tool) : [...current, tool];
    onUpdate(stepIdx, 'tools', next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-[#5c5f77] uppercase font-bold tracking-wider">
          {steps.length} passo{steps.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/30 text-[#3b82f6] text-[11px] font-bold hover:bg-[#3b82f6]/20 transition-colors"
        >
          <Plus size={12} /> Passo
        </button>
      </div>

      {steps.map((step, i) => {
        const isActive = activeStepIndex === i;
        const pinForStep = pins.find(p => p.stepIndex === i);

        return (
          <div key={i}
            className={`rounded-xl border transition-all ${isActive
              ? 'border-[#3b82f6]/50 bg-[#3b82f6]/5'
              : 'border-[#1e2030] bg-[#161921] hover:border-[#2e3148]'}`}
          >
            {/* Step Header */}
            <div
              className="flex items-center gap-2.5 p-3 cursor-pointer"
              onClick={() => setActiveStepIndex(isActive ? null : i)}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-black shrink-0 ${isActive ? 'bg-[#3b82f6] text-white' : 'bg-[#1e2030] text-[#5c5f77]'}`}>
                {i + 1}
              </div>
              <input
                value={step.title}
                onClick={e => e.stopPropagation()}
                onChange={e => onUpdate(i, 'title', e.target.value)}
                placeholder="Título do passo…"
                className="flex-1 min-w-0 bg-transparent text-[12px] font-bold text-[#e1e2e8] placeholder-[#3f4257] outline-none"
              />
              <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                {pinForStep && <MapPin size={12} className="text-[#3b82f6]" />}
                <RiskBadge level={step.riskLevel} />
                <button onClick={() => onMove(i, -1)} disabled={i === 0} className="w-6 h-6 flex items-center justify-center text-[#5c5f77] hover:text-white disabled:opacity-20 hover:bg-white/5 rounded transition-colors">
                  <ChevronUp size={13} />
                </button>
                <button onClick={() => onMove(i, 1)} disabled={i === steps.length - 1} className="w-6 h-6 flex items-center justify-center text-[#5c5f77] hover:text-white disabled:opacity-20 hover:bg-white/5 rounded transition-colors">
                  <ChevronDown size={13} />
                </button>
                <button onClick={() => onRemove(i)} className="w-6 h-6 flex items-center justify-center text-[#5c5f77] hover:text-red-500 hover:bg-red-500/10 rounded transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            {/* Step Body (expanded) */}
            {isActive && (
              <div className="px-3 pb-3 space-y-3 border-t border-[#1e2030]/60 pt-3 animate-in fade-in slide-in-from-top-1">

                {/* Description */}
                <textarea
                  value={step.description}
                  onClick={e => e.stopPropagation()}
                  onChange={e => onUpdate(i, 'description', e.target.value)}
                  rows={3}
                  placeholder="Descreva detalhadamente o que o técnico deve fazer…"
                  className="w-full bg-[#0c0e15] border border-[#1e2030] rounded-lg px-3 py-2 text-[12px] text-[#e1e2e8] resize-none outline-none focus:border-[#3b82f6] placeholder-[#3f4257]"
                />

                {/* Risk Level */}
                <div>
                  <p className="text-[9px] font-black text-[#5c5f77] uppercase tracking-wider mb-1.5">Nível de Risco</p>
                  <div className="flex gap-1.5">
                    {(Object.entries(STEP_RISK_CONFIG) as [StepRiskLevel, typeof STEP_RISK_CONFIG[StepRiskLevel]][]).map(([key, cfg]) => (
                      <button
                        key={key}
                        onClick={() => onUpdate(i, 'riskLevel', step.riskLevel === key ? undefined : key)}
                        className="flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all"
                        style={step.riskLevel === key
                          ? { color: cfg.color, borderColor: cfg.color + '60', background: cfg.bg }
                          : { color: '#5c5f77', borderColor: '#1e2030', background: 'transparent' }
                        }
                      >
                        {cfg.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tools */}
                <div>
                  <p className="text-[9px] font-black text-[#5c5f77] uppercase tracking-wider mb-1.5">Ferramentas Necessárias</p>
                  <div className="flex flex-wrap gap-1">
                    {STEP_TOOL_OPTIONS.map(tool => {
                      const sel = (step.tools || []).includes(tool);
                      return (
                        <button
                          key={tool}
                          onClick={() => toggleTool(i, tool as StepTool)}
                          className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-all ${sel
                            ? 'bg-[#3b82f6]/15 border-[#3b82f6]/40 text-[#3b82f6]'
                            : 'bg-transparent border-[#1e2030] text-[#5c5f77] hover:border-[#3b82f6]/30 hover:text-[#8b8fa3]'}`}
                        >
                          {tool}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Checklist */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[9px] font-black text-[#5c5f77] uppercase tracking-wider">Checklist do Passo</p>
                    <button onClick={() => addChecklistItem(i)} className="flex items-center gap-1 text-[10px] text-[#3b82f6] hover:text-white transition-colors">
                      <Plus size={10} /> Adicionar
                    </button>
                  </div>
                  {(step.checklist || []).map((item, ci) => (
                    <div key={item.id} className="flex items-center gap-2 mb-1">
                      <Square size={12} className="text-[#3f4257] shrink-0" />
                      <input
                        value={item.text}
                        onChange={e => updateChecklistItem(i, ci, e.target.value)}
                        placeholder="Descreva a etapa…"
                        className="flex-1 bg-transparent text-[11px] text-[#e1e2e8] outline-none border-b border-[#1e2030] focus:border-[#3b82f6] pb-0.5 placeholder-[#3f4257]"
                      />
                      <button onClick={() => removeChecklistItem(i, ci)} className="text-[#3f4257] hover:text-red-400 transition-colors shrink-0">
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                  {(step.checklist || []).length === 0 && (
                    <p className="text-[10px] text-[#3f4257] italic">Nenhuma etapa. Clique em &quot;Adicionar&quot;.</p>
                  )}
                </div>

                {/* Actions Row */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => onPlacePin(i)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black border transition-all ${pinForStep
                      ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                      : 'bg-[#3b82f6]/10 border-[#3b82f6]/30 text-[#3b82f6]'}`}
                  >
                    <MapPin size={11} />
                    {pinForStep ? 'Reposicionar Pin' : 'Vincular à Placa'}
                  </button>
                  <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-[#1e2030] border border-[#2e3148] text-[#8b8fa3] cursor-pointer hover:text-white transition-colors">
                    <Layers size={11} /> Foto
                    <input type="file" accept="image/*" className="hidden" onChange={e => onImg(i, e)} />
                  </label>
                </div>

                {step.image && (
                  <div className="relative h-36 w-full overflow-hidden rounded-lg border border-[#1e2030]">
                    <Image unoptimized fill src={step.image} alt="" className="object-cover" />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {steps.length === 0 && (
        <div className="text-center py-10 border border-dashed border-[#1e2030] rounded-xl">
          <Wrench size={28} className="mx-auto text-[#3f4257] mb-2" />
          <p className="text-[12px] text-[#5c5f77]">Nenhum passo criado</p>
          <p className="text-[10px] text-[#3f4257] mt-1">Clique em &quot;+ Passo&quot; para começar</p>
        </div>
      )}
    </div>
  );
}

// ─── User: Execution Mode ─────────────────────────────────────────────────────

interface UserExecutionProps {
  steps: RepairStep[];
  activeStepIndex: number | null;
  setActiveStepIndex: (i: number | null) => void;
}

export function UserExecutionPanel({ steps, activeStepIndex, setActiveStepIndex }: UserExecutionProps) {
  // Local checklist state (purely in memory, not persisted)
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));

  const current = activeStepIndex !== null ? steps[activeStepIndex] : null;
  const total = steps.length;

  const goNext = () => {
    if (activeStepIndex === null) { setActiveStepIndex(0); return; }
    if (activeStepIndex < total - 1) setActiveStepIndex(activeStepIndex + 1);
  };
  const goPrev = () => {
    if (activeStepIndex !== null && activeStepIndex > 0) setActiveStepIndex(activeStepIndex - 1);
  };

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
        <Wrench size={36} className="text-[#3f4257] mb-3" />
        <p className="text-[14px] text-[#5c5f77] font-medium">Nenhum passo cadastrado</p>
        <p className="text-[11px] text-[#3f4257] mt-1">Este guia ainda não possui passos de reparo.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Progress bar */}
      <div className="shrink-0 px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-[#5c5f77] font-bold uppercase tracking-wider">
            Progresso do Reparo
          </span>
          <span className="text-[10px] text-[#3b82f6] font-black">
            {activeStepIndex !== null ? activeStepIndex + 1 : 0}/{total}
          </span>
        </div>
        <div className="h-1.5 bg-[#1e2030] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#3b82f6] to-[#2563eb] rounded-full transition-all duration-500"
            style={{ width: `${activeStepIndex !== null ? ((activeStepIndex + 1) / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Step list (mini pills) */}
      <div className="shrink-0 px-4 pb-3 flex gap-1.5 overflow-x-auto">
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => setActiveStepIndex(i)}
            className={`shrink-0 w-7 h-7 rounded-lg text-[11px] font-black transition-all border ${activeStepIndex === i
              ? 'bg-[#3b82f6] text-white border-[#3b82f6] shadow-[0_0_10px_rgba(59,130,246,0.4)]'
              : 'bg-[#161921] border-[#1e2030] text-[#5c5f77] hover:border-[#3b82f6]/30 hover:text-[#e1e2e8]'}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="h-px bg-[#1e2030]" />

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar space-y-4">
        {activeStepIndex === null ? (
          /* Start screen */
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <div className="w-16 h-16 rounded-2xl bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center mb-4">
              <Activity size={28} className="text-[#3b82f6]" />
            </div>
            <h3 className="text-[16px] font-bold text-[#e1e2e8] mb-1">Pronto para começar?</h3>
            <p className="text-[12px] text-[#5c5f77] mb-6 max-w-[220px]">
              Este guia tem {total} passo{total !== 1 ? 's' : ''}. Siga cada etapa cuidadosamente.
            </p>
            <button
              onClick={goNext}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#3b82f6] text-white text-[13px] font-bold hover:bg-[#2563eb] transition-all shadow-lg shadow-[#3b82f6]/20"
            >
              Iniciar Reparo <ChevronRight size={16} />
            </button>
          </div>
        ) : current ? (
          <>
            {/* Step header */}
            <div className={`rounded-xl p-4 border ${current.riskLevel && current.riskLevel !== 'low'
              ? `border-[${STEP_RISK_CONFIG[current.riskLevel].color}]/30 bg-[${STEP_RISK_CONFIG[current.riskLevel].color}]/5`
              : 'border-[#1e2030] bg-[#161921]'}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#3b82f6] text-white flex items-center justify-center text-[14px] font-black shrink-0">
                  {activeStepIndex + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-[15px] font-bold text-[#e1e2e8]">
                      {current.title || `Passo ${activeStepIndex + 1}`}
                    </h3>
                    {current.riskLevel && current.riskLevel !== 'low' && (
                      <span
                        className="flex items-center gap-1 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md border"
                        style={{
                          color: STEP_RISK_CONFIG[current.riskLevel].color,
                          borderColor: STEP_RISK_CONFIG[current.riskLevel].color + '40',
                          background: STEP_RISK_CONFIG[current.riskLevel].bg,
                        }}
                      >
                        <AlertTriangle size={9} />
                        {STEP_RISK_CONFIG[current.riskLevel].label}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-[#8b8fa3] leading-relaxed">
                    {current.description || 'Sem descrição detalhada.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Tools needed */}
            {(current.tools || []).length > 0 && (
              <div className="rounded-xl border border-[#1e2030] bg-[#0c0e15] p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Wrench size={12} className="text-[#f59e0b]" />
                  <p className="text-[10px] font-black text-[#f59e0b] uppercase tracking-wider">Ferramentas Necessárias</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(current.tools || []).map(tool => (
                    <span key={tool} className="px-2 py-1 rounded-md bg-[#161921] border border-[#2e3148] text-[#e1e2e8] text-[11px] font-medium">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Checklist */}
            {(current.checklist || []).length > 0 && (
              <div className="rounded-xl border border-[#1e2030] bg-[#0c0e15] p-3">
                <div className="flex items-center gap-1.5 mb-3">
                  <CheckSquare size={12} className="text-[#3b82f6]" />
                  <p className="text-[10px] font-black text-[#3b82f6] uppercase tracking-wider">Checklist</p>
                  <span className="ml-auto text-[10px] text-[#5c5f77]">
                    {(current.checklist || []).filter(c => checked[c.id]).length}/{(current.checklist || []).length} concluídos
                  </span>
                </div>
                <div className="space-y-2">
                  {(current.checklist || []).map(item => {
                    const done = !!checked[item.id];
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleCheck(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${done
                          ? 'border-[#22c55e]/30 bg-[#22c55e]/5'
                          : 'border-[#1e2030] bg-[#161921] hover:border-[#3b82f6]/30'}`}
                      >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${done
                          ? 'bg-[#22c55e] border-[#22c55e]'
                          : 'border-[#3f4257]'}`}
                        >
                          {done && <Check size={12} className="text-white" />}
                        </div>
                        <span className={`text-[12px] transition-all ${done ? 'line-through text-[#5c5f77]' : 'text-[#e1e2e8]'}`}>
                          {item.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step image */}
            {current.image && (
              <div className="relative h-44 w-full overflow-hidden rounded-xl border border-[#1e2030]">
                <Image unoptimized fill src={current.image} alt="" className="object-cover" />
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Navigation footer */}
      {activeStepIndex !== null && (
        <div className="shrink-0 border-t border-[#1e2030] p-3 flex items-center gap-2">
          <button
            onClick={goPrev}
            disabled={activeStepIndex === 0}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#1e2030] text-[12px] font-bold text-[#5c5f77] hover:text-white hover:border-[#2e3148] disabled:opacity-30 transition-all"
          >
            <ChevronLeft size={14} /> Anterior
          </button>
          <div className="flex-1" />
          {activeStepIndex < total - 1 ? (
            <button
              onClick={goNext}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#3b82f6] text-white text-[12px] font-bold hover:bg-[#2563eb] transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            >
              Próximo <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={() => setActiveStepIndex(null)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#22c55e] text-white text-[12px] font-bold hover:bg-[#16a34a] transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)]"
            >
              <Check size={14} /> Reparo Concluído!
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

interface RepairStepsPanelProps {
  steps: RepairStep[];
  activeStepIndex: number | null;
  setActiveStepIndex: (i: number | null) => void;
  pins: { stepIndex: number }[];
  isAdmin: boolean;
  onAdd: () => void;
  onRemove: (i: number) => void;
  onMove: (i: number, dir: -1 | 1) => void;
  onUpdate: (i: number, field: keyof RepairStep, value: unknown) => void;
  onImg: (i: number, e: React.ChangeEvent<HTMLInputElement>) => void;
  onPlacePin: (i: number) => void;
}

export default function RepairStepsPanel(props: RepairStepsPanelProps) {
  if (!props.isAdmin) {
    return (
      <UserExecutionPanel
        steps={props.steps}
        activeStepIndex={props.activeStepIndex}
        setActiveStepIndex={props.setActiveStepIndex}
      />
    );
  }

  return (
    <div className="px-4 py-3 overflow-y-auto flex-1 custom-scrollbar">
      <AdminStepEditor
        steps={props.steps}
        activeStepIndex={props.activeStepIndex}
        setActiveStepIndex={props.setActiveStepIndex}
        pins={props.pins}
        onAdd={props.onAdd}
        onRemove={props.onRemove}
        onMove={props.onMove}
        onUpdate={props.onUpdate}
        onImg={props.onImg}
        onPlacePin={props.onPlacePin}
      />
    </div>
  );
}
