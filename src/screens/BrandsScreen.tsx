'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import Image from 'next/image';
import { useAppStore } from '@/store/useAppStore';
import { brandService } from '@/services/brands';
import type { Brand } from '@/lib/types';
import { Plus, Pencil, Trash2, Smartphone, ChevronRight } from '@/lib/icons';
import ImageCropper from '@/components/common/ImageCropper';

export default function BrandsScreen() {
  const { userMode } = useAppStore();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Brand | null>(null);
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    try {
      const data = await brandService.getAll();
      setBrands(data);
    } catch (err) { console.error('Failed to load brands', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { reload(); }, []);

  const openCreate = () => { setEditItem(null); setName(''); setLogo(''); setShowForm(true); };
  
  const openEdit = (b: Brand) => { setEditItem(b); setName(b.name); setLogo(b.logo || ''); setShowForm(true); };
  
  const handleSave = async () => { 
    if (!name.trim()) return; 
    setLoading(true);
    try {
      if (editItem?.id) await brandService.update(editItem.id, { name: name.trim(), logo: logo || undefined });
      else await brandService.create({ name: name.trim(), logo: logo || undefined });
      setShowForm(false);
      reload();
    } catch (err) { console.error(err); setLoading(false); }
  };
  
  const handleDelete = async (b: Brand) => { 
    if (!confirm(`Excluir "${b.name}" e todos seus modelos/guias?`)) return; 
    setLoading(true);
    try {
      await brandService.delete(b.id);
      reload();
    } catch (err) { console.error(err); setLoading(false); }
  };
  
  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => { 
    const f = e.target.files?.[0]; 
    if (!f) return; 
    const r = new FileReader(); 
    r.onload = () => setCropImageSrc(r.result as string); 
    r.readAsDataURL(f); 
    e.target.value = ''; // Reset input to allow opening the same file again
  };
  
  const handleCropComplete = (croppedDataUrl: string) => {
    setLogo(croppedDataUrl);
    setCropImageSrc(null);
  };
  
  const inputCls = "w-full px-3 py-2.5 rounded-lg bg-[#12141d] border border-[#1e2030] text-[13px] text-[#e1e2e8] placeholder-[#3f4257] focus:border-[#3b82f6] focus:outline-none";

  return (
    <AppShell>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-xl font-semibold text-[#e1e2e8] mb-1">Soluções</h1><p className="text-[13px] text-[#5c5f77]">Gerencie as marcas e guias de reparo</p></div>
          {userMode === 'admin' && <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3b82f6] text-white text-[13px] font-medium hover:bg-[#2563eb] transition-colors cursor-pointer"><Plus className="w-4 h-4" /> Nova Solução</button>}
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#5c5f77] font-medium animate-pulse">Carregando marcas...</div>
        ) : brands.length === 0 ? (
          <div className="text-center py-20"><Smartphone className="w-10 h-10 text-[#2e3148] mx-auto mb-3" /><p className="text-[15px] font-medium text-[#5c5f77] mb-1">Nenhuma marca cadastrada</p><p className="text-[12px] text-[#3f4257]">Comece cadastrando uma marca de dispositivo</p></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {brands.map(b => (
              <Link key={b.id} href={`/brands/${b.id}/models`} className="group relative bg-[#161921] border border-[#1e2030] rounded-xl overflow-hidden hover:border-[#2e3148] transition-all">
                <div className="w-full h-24 bg-[#12141d] flex items-center justify-center border-b border-[#1e2030] p-4 text-[#e1e2e8] text-[20px] font-bold relative overflow-hidden">
                  {b.logo ? <Image unoptimized fill src={b.logo} alt={b.name} className="object-contain p-4 drop-shadow-lg" /> : b.name.charAt(0)}
                </div>
                <div className="p-4 flex items-center gap-3"><div className="flex-1"><p className="text-[14px] font-medium text-[#e1e2e8] group-hover:text-[#3b82f6] transition-colors">{b.name}</p></div><ChevronRight className="w-4 h-4 text-[#5c5f77] group-hover:text-[#3b82f6] transition-colors" /></div>
                {userMode === 'admin' && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={e => { e.preventDefault(); e.stopPropagation(); openEdit(b); }} className="w-7 h-7 rounded-md bg-[#1e2030] flex items-center justify-center hover:bg-[#2e3148] cursor-pointer"><Pencil className="w-3.5 h-3.5 text-[#8b8fa3]" /></button>
                    <button onClick={e => { e.preventDefault(); e.stopPropagation(); handleDelete(b); }} className="w-7 h-7 rounded-md bg-[#1e2030] flex items-center justify-center hover:bg-[#ef4444]/20 cursor-pointer"><Trash2 className="w-3.5 h-3.5 text-[#8b8fa3]" /></button>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
            <div className="bg-[#1a1d28] border border-[#2e3148] rounded-xl p-6 w-[400px] shadow-2xl" onClick={e => e.stopPropagation()}>
              <h2 className="text-[15px] font-semibold text-[#e1e2e8] mb-5">{editItem ? 'Editar' : 'Nova'} Marca</h2>
              <label className="block text-[11px] font-medium text-[#5c5f77] uppercase tracking-wider mb-1.5">Nome *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Xiaomi, Apple, Samsung…" className={inputCls + " mb-4"} autoFocus />
              
              <label className="block text-[11px] font-medium text-[#5c5f77] uppercase tracking-wider mb-1.5">Imagem da Logo (opcional)</label>
              <input type="file" accept="image/*" onChange={handleLogo} className="text-[12px] text-[#5c5f77] mb-2 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:bg-[#1e2030] file:text-[#8b8fa3] file:cursor-pointer" />
              
              {logo && (
                <div className="relative w-full h-24 mb-4 mt-2 bg-[#0c0e15] rounded-xl border border-[#1e2030] flex items-center justify-center overflow-hidden">
                  <Image unoptimized fill src={logo} alt="" className="object-contain p-2" />
                </div>
              )}
              
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-lg text-[13px] text-[#8b8fa3] border border-[#1e2030] hover:bg-[#1e2030] cursor-pointer">Cancelar</button>
                <button onClick={handleSave} className="flex-1 px-4 py-2.5 rounded-lg text-[13px] font-medium bg-[#3b82f6] text-white hover:bg-[#2563eb] cursor-pointer">Salvar</button>
              </div>
            </div>
          </div>
        )}

        {/* Global Cropper Overlay */}
        {cropImageSrc && (
          <ImageCropper 
            imageSrc={cropImageSrc} 
            aspectRatio={1} // Square for logos
            onCropComplete={handleCropComplete} 
            onCancel={() => setCropImageSrc(null)} 
          />
        )}
      </div>
    </AppShell>
  );
}
