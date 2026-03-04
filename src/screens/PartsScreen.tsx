'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import * as db from '@/lib/db';
import type { Part } from '@/lib/types';
import { Plus, Pencil, Trash2, Package, Search } from '@/lib/icons';

export default function PartsScreen() {
  const [items, setItems] = useState<Part[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [edit, setEdit] = useState<Part | null>(null);
  const [search, setSearch] = useState('');
  const [f, setF] = useState({ name: '', code: '', costPrice: 0, sellPrice: 0, stock: 0 });

  const reload = () => setItems(db.getParts());
  useEffect(() => { const t = setTimeout(reload, 0); return () => clearTimeout(t); }, []);
  const openCreate = () => { setEdit(null); setF({ name: '', code: '', costPrice: 0, sellPrice: 0, stock: 0 }); setShowForm(true); };
  const openEdit = (p: Part) => { setEdit(p); setF({ name: p.name, code: p.code, costPrice: p.costPrice, sellPrice: p.sellPrice, stock: p.stock }); setShowForm(true); };
  const handleSave = () => { if (!f.name.trim()) return; db.savePart({ id: edit?.id, ...f, name: f.name.trim(), brandIds: edit?.brandIds || [] }); setShowForm(false); reload(); };
  const handleDelete = (p: Part) => { if (!confirm(`Excluir "${p.name}"?`)) return; db.deletePart(p.id); reload(); };
  const filtered = items.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase()));
  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const inputCls = "w-full px-3 py-2.5 rounded-lg bg-[#12141d] border border-[#1e2030] text-[13px] text-[#e1e2e8] placeholder-[#3f4257] focus:border-[#3b82f6] focus:outline-none";

  return (
    <AppShell>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-xl font-semibold text-[#e1e2e8] mb-1">Peças / Estoque</h1><p className="text-[13px] text-[#5c5f77]">{items.length} peças | {items.reduce((s, p) => s + p.stock, 0)} unidades</p></div>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3b82f6] text-white text-[13px] font-medium hover:bg-[#2563eb] transition-colors cursor-pointer"><Plus className="w-4 h-4" /> Nova Peça</button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3f4257]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome ou código…" className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#161921] border border-[#1e2030] text-[13px] text-[#e1e2e8] placeholder-[#3f4257] focus:border-[#3b82f6] focus:outline-none" />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20"><Package className="w-10 h-10 text-[#2e3148] mx-auto mb-3" /><p className="text-[15px] font-medium text-[#5c5f77]">{search ? 'Nenhum resultado' : 'Nenhuma peça cadastrada'}</p></div>
        ) : (
          <div className="bg-[#161921] border border-[#1e2030] rounded-xl overflow-hidden">
            <table className="w-full text-[13px]">
              <thead><tr className="border-b border-[#1e2030] text-[#3f4257] text-[11px] uppercase tracking-wider">
                <th className="text-left p-3 pl-4 font-medium">Peça</th><th className="text-left p-3 font-medium">Código</th><th className="text-right p-3 font-medium">Custo</th><th className="text-right p-3 font-medium">Venda</th><th className="text-right p-3 font-medium">Estoque</th><th className="text-right p-3 pr-4 font-medium">Ações</th>
              </tr></thead>
              <tbody>{filtered.map(p => (
                <tr key={p.id} className="border-b border-[#1e2030]/50 hover:bg-[#1e2030]/30 transition-colors">
                  <td className="p-3 pl-4 font-medium text-[#e1e2e8]">{p.name}</td>
                  <td className="p-3 text-[#8b8fa3] font-mono text-[12px]">{p.code || '—'}</td>
                  <td className="p-3 text-right text-[#8b8fa3]">{fmt(p.costPrice)}</td>
                  <td className="p-3 text-right text-[#e1e2e8]">{fmt(p.sellPrice)}</td>
                  <td className="p-3 text-right"><span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${p.stock <= 0 ? 'text-[#ef4444] bg-[#ef4444]/10' : p.stock <= 5 ? 'text-[#f59e0b] bg-[#f59e0b]/10' : 'text-[#22c55e] bg-[#22c55e]/10'}`}>{p.stock}</span></td>
                  <td className="p-3 pr-4 text-right">
                    <button onClick={() => openEdit(p)} className="w-7 h-7 rounded-md inline-flex items-center justify-center hover:bg-[#1e2030] cursor-pointer mr-1"><Pencil className="w-3.5 h-3.5 text-[#8b8fa3]" /></button>
                    <button onClick={() => handleDelete(p)} className="w-7 h-7 rounded-md inline-flex items-center justify-center hover:bg-[#ef4444]/10 cursor-pointer"><Trash2 className="w-3.5 h-3.5 text-[#8b8fa3]" /></button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
            <div className="bg-[#1a1d28] border border-[#2e3148] rounded-xl p-6 w-[420px] shadow-2xl" onClick={e => e.stopPropagation()}>
              <h2 className="text-[15px] font-semibold text-[#e1e2e8] mb-5">{edit ? 'Editar' : 'Nova'} Peça</h2>
              <div className="space-y-3">
                <div><label className="block text-[11px] font-medium text-[#5c5f77] uppercase tracking-wider mb-1.5">Nome *</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className={inputCls} autoFocus /></div>
                <div><label className="block text-[11px] font-medium text-[#5c5f77] uppercase tracking-wider mb-1.5">Código</label><input value={f.code} onChange={e => setF({ ...f, code: e.target.value })} className={inputCls} /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="block text-[11px] font-medium text-[#5c5f77] uppercase tracking-wider mb-1.5">Custo R$</label><input type="number" step="0.01" value={f.costPrice} onChange={e => setF({ ...f, costPrice: Number(e.target.value) })} className={inputCls} /></div>
                  <div><label className="block text-[11px] font-medium text-[#5c5f77] uppercase tracking-wider mb-1.5">Venda R$</label><input type="number" step="0.01" value={f.sellPrice} onChange={e => setF({ ...f, sellPrice: Number(e.target.value) })} className={inputCls} /></div>
                  <div><label className="block text-[11px] font-medium text-[#5c5f77] uppercase tracking-wider mb-1.5">Estoque</label><input type="number" value={f.stock} onChange={e => setF({ ...f, stock: Number(e.target.value) })} className={inputCls} /></div>
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-lg text-[13px] text-[#8b8fa3] border border-[#1e2030] hover:bg-[#1e2030] cursor-pointer">Cancelar</button>
                <button onClick={handleSave} className="flex-1 px-4 py-2.5 rounded-lg text-[13px] font-medium bg-[#3b82f6] text-white hover:bg-[#2563eb] cursor-pointer">Salvar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
