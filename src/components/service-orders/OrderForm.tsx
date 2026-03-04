import { OS_PRIORITY_CONFIG, type OSPriority, type Customer, type Brand, type DeviceModel, type Defect, type Employee } from '@/lib/types';

interface OrderFormProps {
  formData: any;
  setFormData: (data: any) => void;
  customers: Customer[];
  brands: Brand[];
  models: DeviceModel[];
  defects: Defect[];
  technicians: Employee[];
  onClose: () => void;
  onSave: () => void;
}

export default function OrderForm({ 
  formData: f, setFormData: setF, customers, brands, models, defects, technicians, onClose, onSave 
}: OrderFormProps) {
  const inputCls = "w-full px-3 py-2.5 rounded-lg bg-[#12141d] border border-[#1e2030] text-[13px] text-[#e1e2e8] placeholder-[#3f4257] focus:border-[#3b82f6] focus:outline-none transition-colors";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-[#161921] border border-[#2e3148] rounded-2xl p-7 w-[560px] max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <h2 className="text-[18px] font-bold text-[#e1e2e8] mb-6 tracking-tight">Nova Ordem de Serviço</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-[#5c5f77] uppercase tracking-wider mb-2">Cliente *</label>
            <select value={f.customerId} onChange={e => setF({ ...f, customerId: e.target.value })} className={inputCls}>
              <option value="">Selecione…</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#5c5f77] uppercase tracking-wider mb-2">Marca</label>
              <select value={f.brandId} onChange={e => setF({ ...f, brandId: e.target.value, modelId: '' })} className={inputCls}>
                <option value="">Selecione…</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#5c5f77] uppercase tracking-wider mb-2">Modelo</label>
              <select value={f.modelId} onChange={e => setF({ ...f, modelId: e.target.value })} className={inputCls} disabled={!f.brandId}>
                <option value="">Selecione…</option>
                {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#5c5f77] uppercase tracking-wider mb-2">IMEI / Serial</label>
              <input value={f.deviceSerial} onChange={e => setF({ ...f, deviceSerial: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#5c5f77] uppercase tracking-wider mb-2">Cor</label>
              <input value={f.deviceColor} onChange={e => setF({ ...f, deviceColor: e.target.value })} className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#5c5f77] uppercase tracking-wider mb-2">Condição</label>
            <input value={f.deviceCondition} onChange={e => setF({ ...f, deviceCondition: e.target.value })} placeholder="Ex: Tela trincada…" className={inputCls} />
          </div>
          
          <div>
            <label className="block text-[11px] font-bold text-[#5c5f77] uppercase tracking-wider mb-2">Defeito Relatado</label>
            <textarea value={f.defectReported} onChange={e => setF({ ...f, defectReported: e.target.value })} rows={2} placeholder="Descreva o problema…" className={inputCls + " resize-none"} />
          </div>

          {defects.length > 0 && (
            <div>
              <label className="block text-[11px] font-bold text-[#5c5f77] uppercase tracking-wider mb-2">Defeitos Reconhecidos</label>
              <div className="flex flex-wrap gap-2">
                {defects.map(d => (
                  <button 
                    key={d.id} 
                    type="button" 
                    onClick={() => setF({ ...f, defectIds: f.defectIds.includes(d.id) ? f.defectIds.filter((x: string) => x !== d.id) : [...f.defectIds, d.id] })}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-medium cursor-pointer transition-all border ${
                      f.defectIds.includes(d.id) 
                        ? 'bg-[#3b82f6]/20 text-[#3b82f6] border-[#3b82f6]/40' 
                        : 'text-[#8b8fa3] bg-[#12141d] border-[#1e2030] hover:border-[#3b82f6]/50'
                    }`}
                  >
                    {d.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#5c5f77] uppercase tracking-wider mb-2">Técnico Atribuído</label>
              <select value={f.technicianId} onChange={e => setF({ ...f, technicianId: e.target.value })} className={inputCls}>
                <option value="">Não atribuído</option>
                {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#5c5f77] uppercase tracking-wider mb-2">Prioridade</label>
              <select value={f.priority} onChange={e => setF({ ...f, priority: e.target.value as OSPriority })} className={inputCls}>
                {(Object.entries(OS_PRIORITY_CONFIG) as [OSPriority, typeof OS_PRIORITY_CONFIG.normal][]).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#5c5f77] uppercase tracking-wider mb-2">Observações Internas</label>
            <textarea value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} rows={2} className={inputCls + " resize-none"} />
          </div>
        </div>
        
        <div className="flex gap-3 mt-8">
          <button 
            onClick={onClose} 
            className="flex-1 px-4 py-3 rounded-xl text-[13px] font-semibold text-[#8b8fa3] bg-[#12141d] border border-[#1e2030] hover:bg-[#1e2030] hover:text-[#e1e2e8] transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button 
            onClick={onSave} 
            className="flex-1 px-4 py-3 rounded-xl text-[13px] font-semibold bg-[#3b82f6] text-white hover:bg-[#2563eb] transition-colors shadow-lg shadow-[#3b82f6]/20 cursor-pointer"
          >
            Criar OS
          </button>
        </div>
      </div>
    </div>
  );
}
