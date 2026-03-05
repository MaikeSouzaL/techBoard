import Link from 'next/link';
import { ChevronRight, Plus } from '@/lib/icons';
import { Brand, DeviceModel } from '@/lib/types';

interface GuidesHeaderProps {
  brand: Brand | null;
  model: DeviceModel | null;
  userMode: string;
  brandId: string;
  modelId: string;
  onOpenCreate: () => void;
}

export default function GuidesHeader({ brand, model, userMode, onOpenCreate }: GuidesHeaderProps) {
  return (
    <div className="mb-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-[13px] text-[#5c5f77] mb-6">
        <Link href="/brands" className="hover:text-[#3b82f6] transition-colors">Marcas</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/brands/${brand?.id}/models`} className="hover:text-[#3b82f6] transition-colors">
          {brand?.name || '...'}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#e1e2e8] font-medium">{model?.name || '...'}</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#e1e2e8] tracking-tight mb-1">Guias de Reparo</h1>
          <p className="text-[13px] text-[#8b8fa3] font-medium tracking-wide">
            {brand?.name} {model?.name}
          </p>
        </div>
        {userMode === 'admin' && (
          <button 
            onClick={onOpenCreate} 
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3b82f6] text-white text-[13px] font-medium hover:bg-[#2563eb] transition-colors shadow-md shadow-[#3b82f6]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Novo Guia
          </button>
        )}
      </div>
    </div>
  );
}

