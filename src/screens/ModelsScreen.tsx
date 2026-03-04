'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import Image from 'next/image';
import { useAppStore } from '@/store/useAppStore';
import { modelService } from '@/services/models';
import { brandService } from '@/services/brands';
import type { Brand, DeviceModel } from '@/lib/types';
import { Plus, Pencil, Trash2, ChevronRight, Smartphone } from '@/lib/icons';

export default function ModelsScreen() {
  const params = useParams(); const brandId = params.brandId as string;
  const { userMode } = useAppStore();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [models, setModels] = useState<DeviceModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<DeviceModel | null>(null);
  const [name, setName] = useState(''); const [image, setImage] = useState('');

  const reload = async () => { 
    setLoading(true);
    try {
      const [b, mData] = await Promise.all([
        brandService.getById(brandId).catch(() => null),
        modelService.getAll(brandId)
      ]);
      setBrand(b);
      setModels(mData);
    } catch (err) { console.error('Failed to load models', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { reload(); }, [brandId]);

  const openCreate = () => { setEditItem(null); setName(''); setImage(''); setShowForm(true); };
  
  const openEdit = (m: DeviceModel) => { setEditItem(m); setName(m.name); setImage(m.image || ''); setShowForm(true); };
  
  const handleSave = async () => { 
    if (!name.trim()) return; 
    setLoading(true);
    try {
      if (editItem?.id) await modelService.update(editItem.id, { name: name.trim(), image: image || undefined });
      else await modelService.create({ brandId, name: name.trim(), image: image || undefined });
      setShowForm(false); 
      reload();
    } catch (err) { console.error(err); setLoading(false); }
  };
  
  const handleDelete = async (m: DeviceModel) => { 
    if (!confirm(`Excluir "${m.name}"?`)) return; 
    setLoading(true);
    try {
      await modelService.delete(m.id);
      reload();
    } catch (err) { console.error(err); setLoading(false); }
  };
  
  const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => setImage(r.result as string); r.readAsDataURL(f); };
  const inputCls = "w-full px-3 py-2.5 rounded-lg bg-[#12141d] border border-[#1e2030] text-[13px] text-[#e1e2e8] placeholder-[#3f4257] focus:border-[#3b82f6] focus:outline-none";

  return (
    <AppShell>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-1.5 text-[13px] text-[#5c5f77] mb-6">
          <Link href="/brands" className="hover:text-[#3b82f6] transition-colors">Marcas</Link><ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#e1e2e8] font-medium">{brand?.name || '...'}</span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {brand?.logo && <div className="relative w-9 h-9"><Image unoptimized fill src={brand.logo} alt={brand.name} className="rounded-lg object-contain border border-[#1e2030]" /></div>}
            <div><h1 className="text-xl font-semibold text-[#e1e2e8] mb-1">Modelos — {brand?.name}</h1><p className="text-[13px] text-[#5c5f77]">Dispositivos desta marca</p></div>
          </div>
          {userMode === 'admin' && <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3b82f6] text-white text-[13px] font-medium hover:bg-[#2563eb] transition-colors cursor-pointer"><Plus className="w-4 h-4" /> Novo Modelo</button>}
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#5c5f77] font-medium animate-pulse">Carregando modelos...</div>
        ) : models.length === 0 ? (
          <div className="text-center py-20"><Smartphone className="w-10 h-10 text-[#2e3148] mx-auto mb-3" /><p className="text-[15px] font-medium text-[#5c5f77]">Nenhum modelo cadastrado</p></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {models.map(m => (
              <Link key={m.id} href={`/brands/${brandId}/models/${m.id}/guides`} className="group relative bg-[#161921] border border-[#1e2030] rounded-xl overflow-hidden hover:border-[#2e3148] transition-all">
                <div className="w-full h-56 bg-[#12141d] p-4 flex items-center justify-center overflow-hidden relative">
                  {m.image ? <Image unoptimized fill src={m.image} alt={m.name} className="object-contain drop-shadow-lg" /> : <Smartphone className="w-10 h-10 text-[#1e2030]" />}
                </div>
                <div className="p-3"><p className="text-[13px] font-medium text-[#e1e2e8] group-hover:text-[#3b82f6] transition-colors">{m.name}</p></div>
                {userMode === 'admin' && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={e => { e.preventDefault(); e.stopPropagation(); openEdit(m); }} className="w-7 h-7 rounded-md bg-[#12141d]/90 flex items-center justify-center hover:bg-[#2e3148] cursor-pointer"><Pencil className="w-3.5 h-3.5 text-[#8b8fa3]" /></button>
                    <button onClick={e => { e.preventDefault(); e.stopPropagation(); handleDelete(m); }} className="w-7 h-7 rounded-md bg-[#12141d]/90 flex items-center justify-center hover:bg-[#ef4444]/20 cursor-pointer"><Trash2 className="w-3.5 h-3.5 text-[#8b8fa3]" /></button>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
            <div className="bg-[#1a1d28] border border-[#2e3148] rounded-xl p-6 w-[400px] shadow-2xl" onClick={e => e.stopPropagation()}>
              <h2 className="text-[15px] font-semibold text-[#e1e2e8] mb-5">{editItem ? 'Editar' : 'Novo'} Modelo</h2>
              <label className="block text-[11px] font-medium text-[#5c5f77] uppercase tracking-wider mb-1.5">Nome *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: iPhone 15 Pro…" className={inputCls + " mb-4"} autoFocus />
              <label className="block text-[11px] font-medium text-[#5c5f77] uppercase tracking-wider mb-1.5">Imagem (opcional)</label>
              <input type="file" accept="image/*" onChange={handleImg} className="text-[12px] text-[#5c5f77] mb-2 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:bg-[#1e2030] file:text-[#8b8fa3] file:cursor-pointer" />
              {image && <div className="relative w-full h-20 mb-4 mt-2"><Image unoptimized fill src={image} alt="" className="rounded-lg object-contain border border-[#1e2030]" /></div>}
              <div className="flex gap-2 mt-4">
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
