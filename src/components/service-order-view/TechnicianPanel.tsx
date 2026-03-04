import { Wrench, MonitorDot, AlertCircle } from '@/lib/icons';
import { ServiceOrder } from '@/lib/types';
import Link from 'next/link';

interface TechnicianPanelProps {
  order: ServiceOrder;
}

export default function TechnicianPanel({ order }: TechnicianPanelProps) {
  // If the device has a brand/model, we could link directly to its boardview guide.
  // For now, we link to the general guides screen with a pre-filled search.
  const guideHref = `/brands?search=${order.brandId}`;

  return (
    <div className="bg-[#12141d] border border-[#1e2030] rounded-2xl overflow-hidden mb-6">
      
      {/* Header do Painel */}
      <div className="px-5 py-4 bg-[#161921] border-b border-[#1e2030] flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#f59e0b]/10 flex items-center justify-center border border-[#f59e0b]/20">
          <Wrench className="w-4 h-4 text-[#f59e0b]" />
        </div>
        <div>
          <h2 className="text-[14px] font-bold text-[#e1e2e8] tracking-tight">Área Técnica & Bancada</h2>
          <p className="text-[11px] text-[#5c5f77] font-medium tracking-wide">Ferramentas exclusivas para o Laboratório</p>
        </div>
      </div>

      {/* Ações da Bancada */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <Link 
          href={guideHref}
          className="group flex flex-col gap-2 p-4 rounded-xl border border-[#1e2030] bg-[#0a0b10] hover:border-[#3b82f6]/50 hover:bg-[#161921] transition-all"
        >
          <div className="flex items-center gap-2 mb-1">
            <MonitorDot className="w-4 h-4 text-[#3b82f6] group-hover:scale-110 transition-transform" />
            <span className="text-[13px] font-bold text-[#e1e2e8]">Abrir BoardViewer</span>
          </div>
          <p className="text-[12px] text-[#8b8fa3] leading-relaxed">
            Busca esquemas elétricos e guias de mapeamento de PCB vinculados a este modelo.
          </p>
        </Link>

        <button 
          className="group flex flex-col gap-2 p-4 rounded-xl border border-[#1e2030] bg-[#0a0b10] hover:border-[#22c55e]/50 hover:bg-[#161921] transition-all text-left cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-[#22c55e] group-hover:scale-110 transition-transform" />
            <span className="text-[13px] font-bold text-[#e1e2e8]">Adicionar Laudo Técnico</span>
          </div>
          <p className="text-[12px] text-[#8b8fa3] leading-relaxed">
            Escreva o diagnóstico interno e peças necessárias antes de passar para o balcão orçar.
          </p>
        </button>

      </div>
    </div>
  );
}
