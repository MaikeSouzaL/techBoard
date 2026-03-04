import { OS_STATUS_CONFIG, OS_PRIORITY_CONFIG, type ServiceOrder } from '@/lib/types';

interface OrderHeaderPanelProps {
  order: ServiceOrder;
}

export default function OrderHeaderPanel({ order }: OrderHeaderPanelProps) {
  const statusCfg = OS_STATUS_CONFIG[order.status];
  const priorityCfg = OS_PRIORITY_CONFIG[order.priority];
  
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { 
    day: '2-digit', month: '2-digit', year: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  });

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-[22px] font-bold text-[#e1e2e8] tracking-tight mb-1">OS #{order.osNumber}</h1>
        <p className="text-[13px] text-[#5c5f77] font-medium tracking-wide">
          Aberto em {fmtDate(order.createdAt)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span 
          className="text-[12px] px-3 py-1.5 rounded-lg font-bold shadow-sm border uppercase tracking-wide" 
          style={{ 
            color: statusCfg.color, 
            backgroundColor: statusCfg.color + '15', 
            borderColor: statusCfg.color + '30' 
          }}
        >
          {statusCfg.label}
        </span>
        <span 
          className="text-[12px] px-3 py-1.5 rounded-lg font-bold shadow-sm border uppercase tracking-wide bg-[#161921]" 
          style={{ 
            color: priorityCfg.color,
            borderColor: priorityCfg.color + '30' 
          }}
        >
          {priorityCfg.label}
        </span>
      </div>
    </div>
  );
}
