'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import * as db from '@/lib/db';
import { EMPLOYEE_ROLES, type Employee, type EmployeeRole } from '@/lib/types';
import { Plus, Pencil, Trash2, UserCog, Wrench, Users as UsersIcon, Phone, Percent } from '@/lib/icons';

const ROLE_ICONS: Record<EmployeeRole, typeof Wrench> = { admin: UserCog, tecnico: Wrench, atendente: UsersIcon };

export default function EmployeesScreen() {
  const [items, setItems] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [edit, setEdit] = useState<Employee | null>(null);
  const [f, setF] = useState({ name: '', role: 'tecnico' as EmployeeRole, phone: '', email: '', commission: 0 });

  const reload = () => setItems(db.getEmployees());
  useEffect(() => { const t = setTimeout(reload, 0); return () => clearTimeout(t); }, []);
  const openCreate = () => { setEdit(null); setF({ name: '', role: 'tecnico', phone: '', email: '', commission: 0 }); setShowForm(true); };
  const openEdit = (e: Employee) => { setEdit(e); setF({ name: e.name, role: e.role, phone: e.phone, email: e.email, commission: e.commission }); setShowForm(true); };
  const handleSave = () => { if (!f.name.trim()) return; db.saveEmployee({ id: edit?.id, ...f, name: f.name.trim() }); setShowForm(false); reload(); };
  const handleDelete = (e: Employee) => { if (!confirm(`Excluir "${e.name}"?`)) return; db.deleteEmployee(e.id); reload(); };
  const getRoleName = (r: EmployeeRole) => EMPLOYEE_ROLES.find(x => x.value === r)?.label || r;
  const inputCls = "w-full px-3 py-2.5 rounded-lg bg-[#12141d] border border-[#1e2030] text-[13px] text-[#e1e2e8] placeholder-[#3f4257] focus:border-[#3b82f6] focus:outline-none";

  return (
    <AppShell>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-xl font-semibold text-[#e1e2e8] mb-1">Funcionários</h1><p className="text-[13px] text-[#5c5f77]">{items.length} cadastrados</p></div>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3b82f6] text-white text-[13px] font-medium hover:bg-[#2563eb] transition-colors cursor-pointer"><Plus className="w-4 h-4" /> Novo Funcionário</button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20"><UserCog className="w-10 h-10 text-[#2e3148] mx-auto mb-3" /><p className="text-[15px] font-medium text-[#5c5f77]">Nenhum funcionário cadastrado</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map(e => { const Icon = ROLE_ICONS[e.role] || Wrench; return (
              <div key={e.id} className="group relative bg-[#161921] border border-[#1e2030] rounded-xl p-4 hover:border-[#2e3148] transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-[#3b82f6]/10 flex items-center justify-center"><Icon className="w-4 h-4 text-[#3b82f6]" /></div>
                  <div><p className="text-[13px] font-medium text-[#e1e2e8]">{e.name}</p><p className="text-[11px] text-[#5c5f77]">{getRoleName(e.role)}</p></div>
                </div>
                <div className="space-y-1 text-[12px] text-[#5c5f77]">
                  {e.phone && <div className="flex items-center gap-2"><Phone className="w-3 h-3" />{e.phone}</div>}
                  {e.commission > 0 && <div className="flex items-center gap-2"><Percent className="w-3 h-3" />Comissão: {e.commission}%</div>}
                </div>
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(e)} className="w-7 h-7 rounded-md bg-[#1e2030] flex items-center justify-center hover:bg-[#2e3148] cursor-pointer"><Pencil className="w-3.5 h-3.5 text-[#8b8fa3]" /></button>
                  <button onClick={() => handleDelete(e)} className="w-7 h-7 rounded-md bg-[#1e2030] flex items-center justify-center hover:bg-[#ef4444]/20 cursor-pointer"><Trash2 className="w-3.5 h-3.5 text-[#8b8fa3]" /></button>
                </div>
              </div>
            ); })}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
            <div className="bg-[#1a1d28] border border-[#2e3148] rounded-xl p-6 w-[420px] shadow-2xl" onClick={e => e.stopPropagation()}>
              <h2 className="text-[15px] font-semibold text-[#e1e2e8] mb-5">{edit ? 'Editar' : 'Novo'} Funcionário</h2>
              <div className="space-y-3">
                <div><label className="block text-[11px] font-medium text-[#5c5f77] uppercase tracking-wider mb-1.5">Nome *</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className={inputCls} autoFocus /></div>
                <div><label className="block text-[11px] font-medium text-[#5c5f77] uppercase tracking-wider mb-1.5">Função</label>
                <select value={f.role} onChange={e => setF({ ...f, role: e.target.value as EmployeeRole })} className={inputCls}>{EMPLOYEE_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}</select></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-[11px] font-medium text-[#5c5f77] uppercase tracking-wider mb-1.5">Telefone</label><input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} className={inputCls} /></div>
                  <div><label className="block text-[11px] font-medium text-[#5c5f77] uppercase tracking-wider mb-1.5">Comissão %</label><input type="number" value={f.commission} onChange={e => setF({ ...f, commission: Number(e.target.value) })} className={inputCls} /></div>
                </div>
                <div><label className="block text-[11px] font-medium text-[#5c5f77] uppercase tracking-wider mb-1.5">Email</label><input value={f.email} onChange={e => setF({ ...f, email: e.target.value })} className={inputCls} /></div>
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
