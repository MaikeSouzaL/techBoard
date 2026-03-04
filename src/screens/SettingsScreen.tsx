'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import * as db from '@/lib/db';
import type { ShopSettings } from '@/lib/types';
import { Save, Check } from '@/lib/icons';

export default function SettingsScreen() {
  const [f, setF] = useState<ShopSettings>({ shopName: '', phone: '', address: '', cnpj: '', defaultWarrantyDays: 90 });
  const [saved, setSaved] = useState(false);
  useEffect(() => { const t = setTimeout(() => setF(db.getSettings()), 0); return () => clearTimeout(t); }, []);
  const handleSave = () => { db.saveSettings(f); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const inputCls = "w-full px-3 py-2.5 rounded-lg bg-[#12141d] border border-[#1e2030] text-[13px] text-[#e1e2e8] placeholder-[#3f4257] focus:border-[#3b82f6] focus:outline-none";

  return (
    <AppShell>
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-[#e1e2e8] mb-1">Configurações</h1>
        <p className="text-[13px] text-[#5c5f77] mb-6">Dados da assistência técnica</p>
        <div className="bg-[#161921] border border-[#1e2030] rounded-xl p-5 space-y-4">
          <div><label className="block text-[11px] font-medium text-[#5c5f77] uppercase tracking-wider mb-1.5">Nome da Loja</label><input value={f.shopName} onChange={e => setF({ ...f, shopName: e.target.value })} className={inputCls} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-[11px] font-medium text-[#5c5f77] uppercase tracking-wider mb-1.5">Telefone</label><input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} className={inputCls} /></div>
            <div><label className="block text-[11px] font-medium text-[#5c5f77] uppercase tracking-wider mb-1.5">CNPJ</label><input value={f.cnpj} onChange={e => setF({ ...f, cnpj: e.target.value })} className={inputCls} /></div>
          </div>
          <div><label className="block text-[11px] font-medium text-[#5c5f77] uppercase tracking-wider mb-1.5">Endereço</label><input value={f.address} onChange={e => setF({ ...f, address: e.target.value })} className={inputCls} /></div>
          <div><label className="block text-[11px] font-medium text-[#5c5f77] uppercase tracking-wider mb-1.5">Garantia Padrão (dias)</label><input type="number" value={f.defaultWarrantyDays} onChange={e => setF({ ...f, defaultWarrantyDays: Number(e.target.value) })} className={"w-32 " + inputCls} /></div>
          <button onClick={handleSave} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer transition-all ${saved ? 'bg-[#22c55e] text-white' : 'bg-[#3b82f6] text-white hover:bg-[#2563eb]'}`}>
            {saved ? <><Check className="w-4 h-4" /> Salvo!</> : <><Save className="w-4 h-4" /> Salvar</>}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
