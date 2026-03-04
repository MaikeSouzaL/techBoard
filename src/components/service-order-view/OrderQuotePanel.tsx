import { useState } from 'react';
import { ServiceOrder, QuotePart, Part } from '@/lib/types';
import { Pencil, Save, Trash2, Plus, DollarSign } from '@/lib/icons';

interface OrderQuotePanelProps {
  order: ServiceOrder;
  parts: Part[];
  onSaveQuote: (qParts: QuotePart[], labor: number, discount: number, total: number) => void;
}

export default function OrderQuotePanel({ order, parts, onSaveQuote }: OrderQuotePanelProps) {
  const [editQuote, setEditQuote] = useState(false);
  const [qParts, setQParts] = useState<QuotePart[]>(order.quoteParts || []);
  const [laborCost, setLaborCost] = useState(order.laborCost || 0);
  const [discount, setDiscount] = useState(order.discount || 0);

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const addQuotePart = () => { 
    if (parts.length === 0) return alert('Cadastre peças no estoque primeiro.'); 
    setQParts([...qParts, { partId: parts[0].id, partName: parts[0].name, qty: 1, unitPrice: parts[0].sellPrice }]); 
  };
  
  const updateQP = (i: number, field: keyof QuotePart, val: string | number) => 
    setQParts(qParts.map((p, j) => j === i ? { ...p, [field]: val } : p));
  
  const removeQP = (i: number) => 
    setQParts(qParts.filter((_, j) => j !== i));
  
  const selectPart = (i: number, partId: string) => { 
    const p = parts.find(x => x.id === partId); 
    if (p) setQParts(qParts.map((q, j) => j === i ? { ...q, partId: p.id, partName: p.name, unitPrice: p.sellPrice } : q)); 
  };
  
  const partsTotal = qParts.reduce((s, p) => s + p.qty * p.unitPrice, 0);
  const total = partsTotal + laborCost - discount;

  const handleSave = () => {
    onSaveQuote(qParts, laborCost, discount, total);
    setEditQuote(false);
  };

  const cancelEdit = () => {
    setQParts(order.quoteParts || []);
    setLaborCost(order.laborCost || 0);
    setDiscount(order.discount || 0);
    setEditQuote(false);
  };

  return (
    <div className="bg-[#161921] border border-[#1e2030] rounded-2xl p-6">
      
      {/* Cabeçalho do Orçamento */}
      <div className="flex items-center justify-between mb-4 border-b border-[#1e2030] pb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-[#22c55e]" />
          <h2 className="text-[15px] font-bold text-[#e1e2e8] tracking-tight">Financeiro & Orçamento</h2>
        </div>
        {!editQuote && !['entregue', 'cancelado'].includes(order.status) && (
          <button 
            onClick={() => setEditQuote(true)} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold text-[#3b82f6] bg-[#3b82f6]/10 hover:bg-[#3b82f6]/20 transition-colors uppercase tracking-wide cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" /> Editar
          </button>
        )}
      </div>

      {/* Modo de Edição */}
      {editQuote ? (
        <div className="space-y-4">
          
          {/* Tabela de Peças */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-[#5c5f77] uppercase tracking-wider mb-2">Peças Utilizadas</p>
            {qParts.map((q, i) => (
              <div key={i} className="flex flex-wrap md:flex-nowrap items-center gap-2 bg-[#12141d] p-2 rounded-xl border border-[#1e2030]">
                <select 
                  value={q.partId} 
                  onChange={e => selectPart(i, e.target.value)} 
                  className="flex-1 px-3 py-2 rounded-lg bg-[#0a0b10] border border-[#1e2030] text-[13px] text-[#e1e2e8] focus:outline-none"
                >
                  {parts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                
                <input 
                  type="number" 
                  value={q.qty} 
                  onChange={e => updateQP(i, 'qty', Number(e.target.value))} 
                  className="w-16 px-3 py-2 rounded-lg bg-[#0a0b10] border border-[#1e2030] text-[13px] text-[#e1e2e8] text-center focus:outline-none" 
                  min={1} 
                />
                
                <input 
                  type="number" 
                  step="0.01" 
                  value={q.unitPrice} 
                  onChange={e => updateQP(i, 'unitPrice', Number(e.target.value))} 
                  className="w-24 px-3 py-2 rounded-lg bg-[#0a0b10] border border-[#1e2030] text-[13px] text-[#e1e2e8] focus:outline-none" 
                />
                
                <div className="w-20 text-right px-2">
                  <span className="text-[13px] font-medium text-[#e1e2e8]">{fmt(q.qty * q.unitPrice)}</span>
                </div>
                
                <button 
                  onClick={() => removeQP(i)} 
                  className="w-9 h-9 rounded-lg bg-[#ef4444]/10 hover:bg-[#ef4444]/20 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-[#ef4444]" />
                </button>
              </div>
            ))}
            
            <button 
              onClick={addQuotePart} 
              className="mt-2 text-[12px] font-bold text-[#3b82f6] hover:text-[#2563eb] cursor-pointer inline-flex items-center gap-1.5 uppercase tracking-wide bg-[#3b82f6]/10 px-3 py-2 rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar Peça do Estoque
            </button>
          </div>

          <div className="pt-4 border-t border-[#1e2030]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-[#5c5f77] uppercase tracking-wider">Mão de Obra</span>
                  <input 
                    type="number" step="0.01" 
                    value={laborCost} 
                    onChange={e => setLaborCost(Number(e.target.value))} 
                    className="w-32 px-3 py-2 rounded-lg bg-[#0a0b10] border border-[#1e2030] text-[13px] text-[#e1e2e8] font-medium text-right focus:outline-none" 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-[#ef4444] uppercase tracking-wider">Desconto (-)</span>
                  <input 
                    type="number" step="0.01" 
                    value={discount} 
                    onChange={e => setDiscount(Number(e.target.value))} 
                    className="w-32 px-3 py-2 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20 text-[13px] text-[#ef4444] font-bold text-right focus:outline-none" 
                  />
                </div>
              </div>

              <div className="bg-[#0a0b10] border border-[#1e2030] rounded-xl p-4 flex flex-col justify-center">
                <span className="text-[11px] font-bold text-[#5c5f77] uppercase tracking-wider mb-1 text-right">Total Final</span>
                <span className="text-[26px] font-bold text-[#22c55e] text-right tracking-tight">{fmt(total)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[#1e2030]">
            <button 
              onClick={cancelEdit} 
              className="px-6 py-2.5 rounded-xl text-[13px] font-bold text-[#8b8fa3] border border-[#1e2030] hover:bg-[#1e2030] hover:text-[#e1e2e8] transition-colors cursor-pointer uppercase tracking-wide"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave} 
              className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold bg-[#3b82f6] text-white hover:bg-[#2563eb] transition-colors shadow-lg shadow-[#3b82f6]/20 cursor-pointer uppercase tracking-wide"
            >
              <Save className="w-4 h-4" /> Salvar Orçamento
            </button>
          </div>
          
        </div>

      ) : (
        
        /* Modo de Visualização (Read-Only) */
        <div>
          {order.quoteParts.length === 0 && order.laborCost === 0 ? (
            <div className="text-center py-8 bg-[#12141d] rounded-xl border border-[#1e2030] border-dashed">
              <DollarSign className="w-8 h-8 text-[#2e3148] mx-auto mb-3" />
              <p className="text-[13px] font-medium text-[#5c5f77]">Orçamento ainda não inicializado.</p>
              <p className="text-[12px] text-[#3f4257] mt-1">Apenas o Balcão/Admins podem adicionar valores.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {order.quoteParts.map((q, i) => (
                <div key={i} className="flex justify-between items-center text-[13px] py-1.5 px-3 bg-[#12141d] rounded-lg">
                  <span className="text-[#8b8fa3] font-medium">{q.qty}x <span className="text-[#e1e2e8] ml-1">{q.partName}</span></span>
                  <span className="text-[#5c5f77] font-semibold">{fmt(q.qty * q.unitPrice)}</span>
                </div>
              ))}
              
              {order.laborCost > 0 && (
                <div className="flex justify-between items-center text-[13px] py-1.5 px-3 bg-[#12141d] rounded-lg mt-2">
                  <span className="text-[#8b8fa3] font-medium uppercase text-[11px] tracking-wider">Mão de Obra</span>
                  <span className="text-[#5c5f77] font-semibold">{fmt(order.laborCost)}</span>
                </div>
              )}

              {order.discount > 0 && (
                <div className="flex justify-between items-center text-[13px] py-1.5 px-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg">
                  <span className="text-[#ef4444] font-bold uppercase text-[11px] tracking-wider">Desconto Aplicado</span>
                  <span className="text-[#ef4444] font-bold">-{fmt(order.discount)}</span>
                </div>
              )}
              
              <div className="bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-xl p-4 flex justify-between items-center mt-4">
                <span className="text-[12px] font-bold text-[#22c55e] uppercase tracking-wider">Total</span>
                <span className="text-[20px] font-bold text-[#22c55e]">{fmt(order.quoteTotal)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
