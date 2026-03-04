'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { categoryService } from '@/services/categories';
import { getCategoryIcon, Plus, Pencil, Trash2 } from '@/lib/icons';
import { CATEGORY_ICON_OPTIONS, type Category, type CategoryIconName } from '@/lib/types';

const COLOR_OPTIONS = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#78909c', '#f97316', '#14b8a6'];

export default function CategoriesScreen() {
  const [items, setItems] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [edit, setEdit] = useState<Category | null>(null);
  const [f, setF] = useState({ name: '', icon: 'clipboard' as CategoryIconName, color: '#3b82f6' });

  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAll();
      setItems(data);
    } catch (error) {
      console.error('Failed to load categories', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  const openCreate = () => { setEdit(null); setF({ name: '', icon: 'clipboard', color: '#3b82f6' }); setShowForm(true); };
  
  const openEdit = (c: Category) => { setEdit(c); setF({ name: c.name, icon: c.icon, color: c.color }); setShowForm(true); };
  
  const handleSave = async () => { 
    if (!f.name.trim()) return; 
    setLoading(true);
    try {
      if (edit?.id) {
        await categoryService.update(edit.id, { name: f.name.trim(), icon: f.icon, color: f.color });
      } else {
        await categoryService.create({ name: f.name.trim(), icon: f.icon, color: f.color });
      }
      setShowForm(false); 
      reload(); 
    } catch (error) {
      console.error('Failed to save category', error);
      setLoading(false);
    }
  };
  
  const handleDelete = async (c: Category) => { 
    if (!confirm(`Excluir categoria "${c.name}"?`)) return; 
    setLoading(true);
    try {
      await categoryService.delete(c.id); 
      reload(); 
    } catch (error) {
      console.error('Failed to delete category', error);
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-[#e1e2e8] mb-1">Categoria de defeitos</h1>
            <p className="text-[13px] text-[#5c5f77]">Gerencie categorias de problemas e defeitos</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3b82f6] text-white text-[13px] font-medium hover:bg-[#2563eb] transition-colors cursor-pointer">
            <Plus className="w-4 h-4" /> Nova Categoria
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#5c5f77] font-medium animate-pulse">Carregando categorias...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-[#5c5f77]">
            <p className="text-[15px] font-medium mb-1">Nenhuma categoria cadastrada</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map(c => {
              const Icon = getCategoryIcon(c.icon);
              return (
                <div key={c.id} className="group flex items-center gap-3.5 p-4 bg-[#161921] border border-[#1e2030] rounded-xl hover:border-[#2e3148] transition-all">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: c.color + '15' }}>
                    <Icon className="w-5 h-5" style={{ color: c.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#e1e2e8]">{c.name}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => openEdit(c)} className="w-7 h-7 rounded-md bg-[#1e2030] flex items-center justify-center hover:bg-[#2e3148] cursor-pointer transition-colors"><Pencil className="w-3.5 h-3.5 text-[#8b8fa3]" /></button>
                    <button onClick={() => handleDelete(c)} className="w-7 h-7 rounded-md bg-[#1e2030] flex items-center justify-center hover:bg-[#ef4444]/20 cursor-pointer transition-colors"><Trash2 className="w-3.5 h-3.5 text-[#8b8fa3]" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
            <div className="bg-[#1a1d28] border border-[#2e3148] rounded-xl p-6 w-[440px] shadow-2xl" onClick={e => e.stopPropagation()}>
              <h2 className="text-[15px] font-semibold text-[#e1e2e8] mb-5">{edit ? 'Editar' : 'Nova'} Categoria</h2>

              <label className="block text-[11px] font-medium text-[#5c5f77] uppercase tracking-wider mb-1.5">Nome</label>
              <input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="Ex: Bateria, Display…" className="w-full px-3 py-2.5 rounded-lg bg-[#12141d] border border-[#1e2030] text-[13px] text-[#e1e2e8] placeholder-[#3f4257] focus:border-[#3b82f6] focus:outline-none mb-4" autoFocus />

              <label className="block text-[11px] font-medium text-[#5c5f77] uppercase tracking-wider mb-1.5">Ícone</label>
              <div className="grid grid-cols-8 gap-1.5 mb-4">
                {CATEGORY_ICON_OPTIONS.map(iconName => {
                  const I = getCategoryIcon(iconName);
                  return (
                    <button key={iconName} type="button" onClick={() => setF({ ...f, icon: iconName })} className={`w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-all ${f.icon === iconName ? 'bg-[#3b82f6]/20 border border-[#3b82f6]/50' : 'bg-[#12141d] border border-[#1e2030] hover:border-[#2e3148]'}`}>
                      <I className="w-4 h-4" style={{ color: f.icon === iconName ? '#3b82f6' : '#5c5f77' }} />
                    </button>
                  );
                })}
              </div>

              <label className="block text-[11px] font-medium text-[#5c5f77] uppercase tracking-wider mb-1.5">Cor</label>
              <div className="flex gap-2 mb-5">
                {COLOR_OPTIONS.map(color => (
                  <button key={color} type="button" onClick={() => setF({ ...f, color })} className={`w-7 h-7 rounded-full cursor-pointer transition-all ${f.color === color ? 'ring-2 ring-offset-2 ring-offset-[#1a1d28]' : 'hover:scale-110'}`} style={{ backgroundColor: color }} />
                ))}
              </div>

              {/* Preview */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#12141d] border border-[#1e2030] mb-5">
                {(() => { const I = getCategoryIcon(f.icon); return <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: f.color + '15' }}><I className="w-4 h-4" style={{ color: f.color }} /></div>; })()}
                <span className="text-[13px] text-[#e1e2e8]">{f.name || 'Pré-visualização'}</span>
              </div>

              <div className="flex gap-2">
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
