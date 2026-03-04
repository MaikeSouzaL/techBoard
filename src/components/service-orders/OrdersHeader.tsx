import { Plus } from '@/lib/icons';

interface OrdersHeaderProps {
  totalOrders: number;
  openOrders: number;
  onOpenCreate: () => void;
}

export default function OrdersHeader({ totalOrders, openOrders, onOpenCreate }: OrdersHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-[22px] font-bold text-[#e1e2e8] tracking-tight mb-1">Ordens de Serviço</h1>
        <p className="text-[13px] text-[#8b8fa3] font-medium tracking-wide">
          {totalOrders} OS | {openOrders} abertas
        </p>
      </div>
      <button 
        onClick={onOpenCreate} 
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3b82f6] text-white text-[13px] font-medium hover:bg-[#2563eb] transition-all shadow-md shadow-[#3b82f6]/20 cursor-pointer"
      >
        <Plus className="w-4 h-4" /> Nova OS
      </button>
    </div>
  );
}
