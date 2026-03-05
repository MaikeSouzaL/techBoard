'use client';
import React from 'react';
import { X, AlertCircle, Zap, Activity, CheckCircle2, Info, Maximize2 } from 'lucide-react';
import Image from 'next/image';
import { RepairGuide, Category, DIFFICULTY_CONFIG } from '@/lib/types';
import { getCategoryIcon } from '@/lib/icons';

interface QuickViewModalProps {
  guide: RepairGuide;
  category?: Category;
  onClose: () => void;
  onFullView?: () => void;
}

export default function QuickViewModal({ guide, category, onClose, onFullView }: QuickViewModalProps) {
  const di = DIFFICULTY_CONFIG[guide.difficulty];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-[#161921] border border-[#2e3148] rounded-2xl w-[900px] max-h-[90vh] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 p-5 border-b border-[#1e2030] flex items-center justify-between bg-[#1c1f2b]">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center border"
              style={{ 
                backgroundColor: (category?.color || '#78909c') + '15',
                borderColor: (category?.color || '#78909c') + '30'
              }}
            >
              {React.createElement(category ? getCategoryIcon(category.icon) : AlertCircle, {
                className: "w-5 h-5",
                style: { color: category?.color || '#78909c' }
              })}
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-[#e1e2e8] tracking-tight">{guide.problemTitle}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] uppercase font-bold text-[#5c5f77]">{category?.name}</span>
                <span className="w-1 h-1 rounded-full bg-[#3f4257]" />
                <span className="text-[10px] font-bold" style={{ color: di.color }}>{di.label}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onFullView && (
              <button 
                onClick={onFullView}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3b82f6] text-white text-[13px] font-bold hover:bg-[#2563eb] transition-all shadow-lg shadow-[#3b82f6]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Abrir painel interativo</span>
              </button>
            )}
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-[#12141d] border border-[#1e2030] flex items-center justify-center text-[#5c5f77] hover:text-[#e1e2e8] hover:border-[#2e3148] transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="grid grid-cols-1 gap-8">
            
            {/* Short Description */}
            {guide.description && (
              <section className="bg-[#12141d] border border-[#1e2030] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-4 h-4 text-[#3b82f6]" />
                  <h3 className="text-[11px] font-bold text-[#5c5f77] uppercase tracking-widest">Descrição Geral</h3>
                </div>
                <p className="text-[14px] text-[#e1e2e8] leading-relaxed">{guide.description}</p>
              </section>
            )}

            {/* Structured Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Symptoms */}
              <section className="bg-[#1c1f2b] border border-[#1e2030] rounded-2xl p-6 hover:border-[#3b82f6]/30 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-4 h-4 text-[#ef4444]" />
                  <h3 className="text-[11px] font-bold text-[#5c5f77] uppercase tracking-widest">Sintomas Clássicos</h3>
                </div>
                <p className="text-[13px] text-[#8b8fa3] leading-relaxed italic">
                  {guide.classicSymptoms || "Nenhum sintoma cadastrado."}
                </p>
              </section>

              {/* Analysis */}
              <section className="bg-[#1c1f2b] border border-[#1e2030] rounded-2xl p-6 hover:border-[#8b5cf6]/30 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4 text-[#8b5cf6]" />
                  <h3 className="text-[11px] font-bold text-[#5c5f77] uppercase tracking-widest">Análise do Circuito</h3>
                </div>
                <p className="text-[13px] text-[#8b8fa3] leading-relaxed">
                  {guide.circuitAnalysis || "Nenhuma análise detalhada."}
                </p>
              </section>

              {/* Cause */}
              <section className="bg-[#1c1f2b] border border-[#1e2030] rounded-2xl p-6 hover:border-[#f59e0b]/30 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-4 h-4 text-[#f59e0b]" />
                  <h3 className="text-[11px] font-bold text-[#5c5f77] uppercase tracking-widest">Causa Identificada</h3>
                </div>
                <p className="text-[13px] text-[#8b8fa3] leading-relaxed">
                  {guide.identifiedCause || "Aguardando identificação da causa."}
                </p>
              </section>

              {/* Solution */}
              <section className="bg-[#1c1f2b] border border-[#1e2030] rounded-2xl p-6 hover:border-[#22c55e]/30 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                  <h3 className="text-[11px] font-bold text-[#5c5f77] uppercase tracking-widest">Solução Aplicada</h3>
                </div>
                <p className="text-[13px] text-[#8b8fa3] leading-relaxed font-medium">
                  {guide.appliedSolution || "Aguardando solução definitiva."}
                </p>
              </section>
            </div>

            {/* Observations */}
            {guide.observations && (
              <section className="bg-[#22c55e]/5 border border-[#22c55e]/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-[#22c55e]" />
                  <h3 className="text-[11px] font-bold text-[#5c5f77] uppercase tracking-widest">Observações Importantes</h3>
                </div>
                <p className="text-[13px] text-[#22c55e] leading-relaxed">{guide.observations}</p>
              </section>
            )}

            {/* Images Gallery */}
            <section>
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-[11px] font-bold text-[#5c5f77] uppercase tracking-widest">Imagens do Reparo ({guide.steps.filter(s => s.image).length})</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {guide.steps.filter(s => s.image).map((step, idx) => (
                  <div key={idx} className="group relative aspect-square rounded-2xl overflow-hidden border border-[#1e2030] bg-[#12141d]">
                    <Image unoptimized fill src={step.image!} alt="" className="object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">{step.title || `Foto ${idx+1}`}</span>
                    </div>
                  </div>
                ))}
                {guide.steps.filter(s => s.image).length === 0 && (
                  <div className="col-span-full py-12 border-2 border-dashed border-[#1e2030] rounded-2xl flex flex-col items-center justify-center text-[#3f4257]">
                    <Info className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-[12px]">Nenhuma imagem anexada a este guia.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 p-4 border-t border-[#1e2030] bg-[#12141d]/80 text-center">
          <p className="text-[11px] text-[#3f4257]">TechBoard — Reparo Avançado de Dispositivos</p>
        </div>
      </div>
    </div>
  );
}
