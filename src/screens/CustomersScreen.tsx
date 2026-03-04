'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import * as db from '@/lib/db';
import type { Customer } from '@/lib/types';
import { Plus, Pencil, Trash2, User, Users, Search } from 'lucide-react';

export default function CustomersScreen() {
  const [items, setItems] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [edit, setEdit] = useState<Customer | null>(null);
  const [search, setSearch] = useState('');
  const [f, setF] = useState({ name: '', phone: '', email: '', cpfCnpj: '', address: '', notes: '' });

  const reload = () => setItems(db.getCustomers());
  useEffect(() => { const t = setTimeout(reload, 0); return () => clearTimeout(t); }, []);
  const openCreate = () => { setEdit(null); setF({ name: '', phone: '', email: '', cpfCnpj: '', address: '', notes: '' }); setShowForm(true); };
  const openEdit = (c: Customer) => { setEdit(c); setF({ name: c.name, phone: c.phone, email: c.email, cpfCnpj: c.cpfCnpj, address: c.address, notes: c.notes }); setShowForm(true); };
  const handleSave = () => { if (!f.name.trim()) return; db.saveCustomer({ id: edit?.id, ...f, name: f.name.trim() }); setShowForm(false); reload(); };
  const handleDelete = (c: Customer) => { if (!confirm(`Excluir "${c.name}"?`)) return; db.deleteCustomer(c.id); reload(); };
  const filtered = items.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search) || c.cpfCnpj.includes(search));

  const inputCls = "w-full px-3 py-2.5 rounded-lg bg-[#12141d] border border-[#1e2030] text-[13px] text-[#e1e2e8] placeholder-[#3f4257] focus:border-[#3b82f6] focus:outline-none";

  return (
    <AppShell>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-[#e1e2e8] mb-1">Clientes</h1>
            <p className="text-[13px] text-[#5c5f77]">{items.length} clientes cadastrados</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3b82f6] text-white text-[13px] font-medium hover:bg-[#2563eb] transition-colors cursor-pointer">
            <Plus className="w-4 h-4" /> Novo Cliente
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3f4257]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome, telefone ou CPF…" className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#161921] border border-[#1e2030] text-[13px] text-[#e1e2e8] placeholder-[#3f4257] focus:border-[#3b82f6] focus:outline-none" />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-10 h-10 text-[#2e3148] mx-auto mb-3" />
            <p className="text-[15px] font-medium text-[#5c5f77] mb-1">{search ? 'Nenhum resultado' : 'Nenhum cliente cadastrado'}</p>
          </div>
        ) : (
          <div className="bg-[#161921] border border-[#1e2030] rounded-xl overflow-hidden">
            <table className="w-full text-[13px]">
              <thead><tr className="border-b border-[#1e2030] text-[#3f4257] text-[11px] uppercase tracking-wider">
                <th className="text-left p-3 pl-4 font-medium">Nome</th><th className="text-left p-3 font-medium">Telefone</th><th className="text-left p-3 font-medium">Email</th><th className="text-left p-3 font-medium">CPF/CNPJ</th><th className="text-right p-3 pr-4 font-medium">Ações</th>
              </tr></thead>
              <tbody>{filtered.map(c => (
                <tr key={c.id} className="border-b border-[#1e2030]/50 hover:bg-[#1e2030]/30 transition-colors">
                  <td className="p-3 pl-4 font-medium text-[#e1e2e8]">{c.name}</td>
                  <td className="p-3 text-[#8b8fa3]">{c.phone || '—'}</td>
                  <td className="p-3 text-[#8b8fa3]">{c.email || '—'}</td>
                  <td className="p-3 text-[#8b8fa3] font-mono text-[12px]">{c.cpfCnpj || '—'}</td>
                  <td className="p-3 pr-4 text-right">
                    <button onClick={() => openEdit(c)} className="w-7 h-7 rounded-md inline-flex items-center justify-center hover:bg-[#1e2030] cursor-pointer mr-1"><Pencil className="w-3.5 h-3.5 text-[#8b8fa3]" /></button>
                    <button onClick={() => handleDelete(c)} className="w-7 h-7 rounded-md inline-flex items-center justify-center hover:bg-[#ef4444]/10 cursor-pointer"><Trash2 className="w-3.5 h-3.5 text-[#8b8fa3]" /></button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
            <div className="bg-[#1a1d28] border border-[#2e3148] rounded-xl p-6 w-[480px] shadow-2xl" onClick={e => e.stopPropagation()}>
              <h2 className="text-[15px] font-semibold text-[#e1e2e8] mb-5">{edit ? 'Editar' : 'Novo'} Cliente</h2>
              <div className="space-y-3">
                <div><label className="block text-[11px] font-medium text-[#5c5f77] uppercase tracking-wider mb-1.5">Nome *</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className={inputCls} autoFocus /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-[11px] font-medium text-[#5c5f77] uppercase tracking-wider mb-1.5">Telefone</label><input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} className={inputCls} /></div>
                  <div><label className="block text-[11px] font-medium text-[#5c5f77] uppercase tracking-wider mb-1.5">CPF/CNPJ</label><input value={f.cpfCnpj} onChange={e => setF({ ...f, cpfCnpj: e.target.value })} className={inputCls} /></div>
                </div>
                <div><label className="block text-[11px] font-medium text-[#5c5f77] uppercase tracking-wider mb-1.5">Email</label><input value={f.email} onChange={e => setF({ ...f, email: e.target.value })} className={inputCls} /></div>
                <div><label className="block text-[11px] font-medium text-[#5c5f77] uppercase tracking-wider mb-1.5">Endereço</label><input value={f.address} onChange={e => setF({ ...f, address: e.target.value })} className={inputCls} /></div>
                <div><label className="block text-[11px] font-medium text-[#5c5f77] uppercase tracking-wider mb-1.5">Observações</label><textarea value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} rows={2} className={inputCls + " resize-none"} /></div>
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-lg text-[13px] text-[#8b8fa3] border border-[#1e2030] hover:bg-[#1e2030] cursor-pointer transition-colors">Cancelar</button>
                <button onClick={handleSave} className="flex-1 px-4 py-2.5 rounded-lg text-[13px] font-medium bg-[#3b82f6] text-white hover:bg-[#2563eb] cursor-pointer transition-colors">Salvar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
