import { ServiceOrder, Customer, Brand, DeviceModel, Employee } from '@/lib/types';
import { User, Smartphone, AlertTriangle, FileText, Wrench } from '@/lib/icons';

interface CustomerDevicePanelProps {
  order: ServiceOrder;
  customer?: Customer;
  brand?: Brand;
  model?: DeviceModel;
  tech?: Employee;
}

export default function CustomerDevicePanel({ order, customer, brand, model, tech }: CustomerDevicePanelProps) {
  return (
    <div className="bg-[#161921] border border-[#1e2030] rounded-2xl p-6 shadow-sm mb-6">
      
      {/* Grid de Informações Básicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        
        {/* Cliente */}
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center shrink-0 border border-[#8b5cf6]/20">
            <User className="w-5 h-5 text-[#8b5cf6]" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#5c5f77] uppercase tracking-wider mb-0.5">Cliente</p>
            <p className="text-[14px] font-semibold text-[#e1e2e8] truncate">{customer?.name || '—'}</p>
            {customer?.phone && <p className="text-[12px] text-[#8b8fa3] mt-0.5">{customer.phone}</p>}
          </div>
        </div>

        {/* Dispositivo */}
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#06b6d4]/10 flex items-center justify-center shrink-0 border border-[#06b6d4]/20">
            <Smartphone className="w-5 h-5 text-[#06b6d4]" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#5c5f77] uppercase tracking-wider mb-0.5">Dispositivo</p>
            <p className="text-[14px] font-semibold text-[#e1e2e8] truncate">{brand?.name} {model?.name}</p>
            <p className="text-[12px] text-[#8b8fa3] mt-0.5">{order.deviceColor ? `Cor: ${order.deviceColor}` : 'Sem cor'}</p>
          </div>
        </div>

        {/* Identificação */}
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center shrink-0 border border-[#f59e0b]/20">
            <FileText className="w-5 h-5 text-[#f59e0b]" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#5c5f77] uppercase tracking-wider mb-0.5">IMEI / Serial</p>
            <p className="text-[14px] font-semibold text-[#e1e2e8] font-mono tracking-wide">{order.deviceSerial || '—'}</p>
          </div>
        </div>

        {/* Técnico */}
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3b82f6]/10 flex items-center justify-center shrink-0 border border-[#3b82f6]/20">
            <Wrench className="w-5 h-5 text-[#3b82f6]" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#5c5f77] uppercase tracking-wider mb-0.5">Técnico Dst.</p>
            <p className="text-[14px] font-semibold text-[#e1e2e8]">{tech?.name || 'Não atribuído'}</p>
          </div>
        </div>
        
      </div>

      {/* Seção de Relatos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#1e2030]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-[#ef4444]" />
            <span className="text-[12px] font-bold text-[#e1e2e8] uppercase tracking-wider">Defeito Relatado</span>
          </div>
          <p className="text-[13px] text-[#8b8fa3] bg-[#0a0b10] border border-[#1e2030] p-3 rounded-xl leading-relaxed min-h-[60px]">
            {order.defectReported || 'Nenhum defeito detalhado foi relatado pelo cliente.'}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-[#3b82f6]" />
            <span className="text-[12px] font-bold text-[#e1e2e8] uppercase tracking-wider">Observações de Balcão</span>
          </div>
          <p className="text-[13px] text-[#8b8fa3] bg-[#0a0b10] border border-[#1e2030] p-3 rounded-xl leading-relaxed min-h-[60px]">
            {order.notes || 'Sem observações adicionais gravadas na entrada.'}
          </p>
        </div>
      </div>
      
    </div>
  );
}
