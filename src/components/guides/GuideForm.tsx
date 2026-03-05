import { Category, Difficulty, DIFFICULTY_CONFIG, RepairGuide } from '@/lib/types';

interface GuideFormProps {
  editItem: RepairGuide | null;
  title: string;          setTitle: (v: string) => void;
  categoryId: string;     setCategoryId: (v: string) => void;
  difficulty: Difficulty; setDifficulty: (v: Difficulty) => void;
  description: string;    setDescription: (v: string) => void;
  classicSymptoms: string; setClassicSymptoms: (v: string) => void;
  circuitAnalysis: string; setCircuitAnalysis: (v: string) => void;
  identifiedCause: string; setIdentifiedCause: (v: string) => void;
  appliedSolution: string; setAppliedSolution: (v: string) => void;
  observations: string;    setObservations: (v: string) => void;
  categories: Category[];
  onClose: () => void;
  onSave: () => void;
}

export default function GuideForm({
  editItem, title, setTitle, categoryId, setCategoryId, 
  difficulty, setDifficulty, description, setDescription, 
  classicSymptoms, setClassicSymptoms, circuitAnalysis, setCircuitAnalysis,
  identifiedCause, setIdentifiedCause, appliedSolution, setAppliedSolution,
  observations, setObservations,
  categories, onClose, onSave
}: GuideFormProps) {
  
  const inputCls = "w-full px-3 py-2.5 rounded-xl bg-[#12141d] border border-[#1e2030] text-[13px] text-[#e1e2e8] placeholder-[#3f4257] focus:border-[#3b82f6] focus:outline-none transition-colors";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-[#161921] border border-[#2e3148] rounded-2xl p-7 w-[520px] shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        
        <h2 className="text-[18px] font-bold text-[#e1e2e8] tracking-tight mb-6">
          {editItem ? 'Editar Guia de Reparo' : 'Novo Guia de Reparo'}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-[#5c5f77] uppercase tracking-wider mb-2">Título do Problema *</label>
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="Ex: Não carrega | Curto no VDD_MAIN…" 
              className={inputCls} 
              autoFocus 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#5c5f77] uppercase tracking-wider mb-2">Categoria</label>
              <select 
                value={categoryId} 
                onChange={e => setCategoryId(e.target.value)} 
                className={inputCls}
              >
                <option value="">Selecione…</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-[#5c5f77] uppercase tracking-wider mb-2">Dificuldade</label>
              <select 
                value={difficulty} 
                onChange={e => setDifficulty(e.target.value as Difficulty)} 
                className={inputCls}
              >
                {Object.entries(DIFFICULTY_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-[11px] font-bold text-[#5c5f77] uppercase tracking-wider mb-2">Descrição Curta</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Um resumo rápido do guia…" 
              rows={2} 
              className={inputCls + " resize-none"} 
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#5c5f77] uppercase tracking-wider mb-2">Sintomas Clássicos</label>
              <textarea 
                value={classicSymptoms} 
                onChange={e => setClassicSymptoms(e.target.value)} 
                placeholder="Ex: Aparelho não liga, consumo de 20mA…" 
                rows={2} 
                className={inputCls + " resize-none"} 
              />
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-[#5c5f77] uppercase tracking-wider mb-2">Análise do Circuito</label>
              <textarea 
                value={circuitAnalysis} 
                onChange={e => setCircuitAnalysis(e.target.value)} 
                placeholder="Ex: Tensão VPH_PWR normal, mas sem saída no PMIC…" 
                rows={2} 
                className={inputCls + " resize-none"} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#5c5f77] uppercase tracking-wider mb-2">Causa Identificada</label>
                <textarea 
                  value={identifiedCause} 
                  onChange={e => setIdentifiedCause(e.target.value)} 
                  placeholder="Ex: Capacitor C4006 em curto…" 
                  rows={2} 
                  className={inputCls + " resize-none"} 
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#5c5f77] uppercase tracking-wider mb-2">Solução Aplicada</label>
                <textarea 
                  value={appliedSolution} 
                  onChange={e => setAppliedSolution(e.target.value)} 
                  placeholder="Ex: Substituição do componente C4006…" 
                  rows={2} 
                  className={inputCls + " resize-none"} 
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#5c5f77] uppercase tracking-wider mb-2">Observações Adicionais</label>
              <textarea 
                value={observations} 
                onChange={e => setObservations(e.target.value)} 
                placeholder="Alguma nota extra importante…" 
                rows={2} 
                className={inputCls + " resize-none"} 
              />
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 mt-8">
          <button 
            onClick={onClose} 
            className="flex-1 px-4 py-3 rounded-xl text-[13px] font-bold text-[#8b8fa3] bg-[#12141d] border border-[#1e2030] hover:bg-[#1e2030] hover:text-[#e1e2e8] transition-colors cursor-pointer uppercase tracking-wide"
          >
            Cancelar
          </button>
          <button 
            onClick={onSave} 
            className="flex-1 px-4 py-3 rounded-xl text-[13px] font-bold bg-[#3b82f6] text-white hover:bg-[#2563eb] transition-colors shadow-lg shadow-[#3b82f6]/20 cursor-pointer uppercase tracking-wide"
          >
            {editItem ? 'Salvar Edição' : 'Criar Guia'}
          </button>
        </div>
        
      </div>
    </div>
  );
}
