import Link from 'next/link';
import { ClipboardList } from '@/lib/icons';
import { OS_STATUS_CONFIG, OS_PRIORITY_CONFIG, type ServiceOrder, type Customer } from '@/lib/types';

interface OrderListProps {
  orders: ServiceOrder[];
  customers: Customer[];
}

export default function OrderList({ orders, customers }: OrderListProps) {
  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || '—';
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');

  if (orders.length === 0) {
    return (
      <div className="text-center py-20 bg-[#161921]/50 border border-[#1e2030] rounded-2xl">
        <ClipboardList className="w-10 h-10 text-[#3f4257] mx-auto mb-4" />
        <p className="text-[14px] font-medium text-[#8b8fa3]">Nenhuma OS encontrada com estes filtros.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {orders.map(order => { 
        const statusCfg = OS_STATUS_CONFIG[order.status]; 
        const priorityCfg = OS_PRIORITY_CONFIG[order.priority]; 
        
        return (
          <Link 
            key={order.id} 
            href={`/service-orders/${order.id}`} 
            className="group flex items-center gap-4 p-4 bg-[#161921] border border-[#1e2030] rounded-xl hover:border-[#3b82f6]/50 hover:bg-[#12141d] transition-all shadow-sm"
          >
            <div className="w-16 text-center shrink-0">
              <p className="text-[12px] font-mono text-[#3b82f6] font-semibold tracking-wider">#{order.osNumber}</p>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-[#e1e2e8] group-hover:text-[#3b82f6] transition-colors truncate">
                {getCustomerName(order.customerId)}
              </p>
              <p className="text-[12px] text-[#5c5f77] font-medium mt-0.5 truncate">
                {order.defectReported || 'Sem defeito relatado'}
              </p>
            </div>
            
            <span 
              className="text-[11px] px-3 py-1.5 rounded-lg font-bold shrink-0 uppercase tracking-wide border" 
              style={{ color: statusCfg.color, backgroundColor: statusCfg.color + '15', borderColor: statusCfg.color + '30' }}
            >
              {statusCfg.label}
            </span>
            
            <span className="text-[12px] shrink-0 font-medium px-2" style={{ color: priorityCfg.color }}>
              {priorityCfg.label}
            </span>
            
            <span className="text-[12px] text-[#8b8fa3] font-medium shrink-0 ml-2">
              {fmtDate(order.entryDate)}
            </span>
          </Link>
        ); 
      })}
    </div>
  );
}
