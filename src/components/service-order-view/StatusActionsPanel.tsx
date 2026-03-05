import { OS_STATUS_CONFIG, type ServiceOrder, type OSStatus } from '@/lib/types';
import { ArrowRight, Ban, Clock } from '@/lib/icons';

const STATUS_FLOW: OSStatus[] = [
  'aguardando', 'em_analise', 'orcamento_enviado', 'aprovado', 
  'em_reparo', 'concluido', 'entregue'
];

interface StatusActionsPanelProps {
  order: ServiceOrder;
  onAdvance: () => void;
  onCancel: () => void;
}

export default function StatusActionsPanel({ order, onAdvance, onCancel }: StatusActionsPanelProps) {
  const isFinished = ['entregue', 'cancelado'].includes(order.status);
  const currentIndex = STATUS_FLOW.indexOf(order.status);
  const nextStatus = STATUS_FLOW[currentIndex + 1];
  const nextConfig = nextStatus ? OS_STATUS_CONFIG[nextStatus] : null;

  return (
    <div className="bg-[#161921] border border-[#1e2030] rounded-2xl p-6 mb-6">
      
      {/* Botões de Ação (Balcão) */}
      {!isFinished && (
        <div className="flex gap-3 mb-6 pb-6 border-b border-[#1e2030]">
          {nextConfig && (
            <button 
              onClick={onAdvance} 
              className="flex-1 group relative flex items-center justify-center gap-2.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold tracking-wide py-3 px-4 rounded-xl transition-all shadow-[0_4px_20px_rgba(59,130,246,0.2)] overflow-hidden cursor-pointer"
            >
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              <span className="relative z-10 text-[13px] uppercase">Avançar para: {nextConfig.label}</span>
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </button>
          )}

          <button 
            onClick={onCancel} 
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-bold text-[#ef4444] border border-[#ef4444]/20 bg-[#ef4444]/5 hover:bg-[#ef4444]/15 cursor-pointer transition-colors uppercase tracking-wide"
          >
            <Ban className="w-4 h-4" /> Cancelar OS
          </button>
        </div>
      )}

      {/* Timeline Visual (Progresso) */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-[#5c5f77]" />
          <p className="text-[11px] font-bold text-[#5c5f77] uppercase tracking-wider">Progresso da OS</p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
          {STATUS_FLOW.map((statusKey, i) => { 
            const config = OS_STATUS_CONFIG[statusKey]; 
            const isActive = STATUS_FLOW.indexOf(order.status) >= i; 
            const isCurrent = order.status === statusKey; 
            
            return (
              <div key={statusKey} className="flex items-center gap-1.5 shrink-0">
                <div 
                  className={`px-3 py-1.5 rounded-lg text-[11px] uppercase tracking-wide transition-all border
                    ${isCurrent ? 'font-bold scale-105 shadow-sm' : 'font-medium'}
                    ${isActive && !isCurrent ? 'opacity-70' : ''}
                    ${!isActive ? 'opacity-30 grayscale' : ''}
                  `} 
                  style={{ 
                    color: config.color, 
                    backgroundColor: isCurrent ? config.color + '15' : 'transparent',
                    borderColor: isCurrent ? config.color + '40' : (isActive ? config.color + '20' : '#1e2030')
                  }}
                >
                  {config.label}
                </div>
                {i < STATUS_FLOW.length - 1 && (
                  <ArrowRight className={`w-3.5 h-3.5 ${isActive ? 'text-[#3b82f6]' : 'text-[#1e2030]'}`} />
                )}
              </div>
            ); 
          })}
        </div>
      </div>

      {isFinished && order.status === 'cancelado' && (
        <div className="mt-4 p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-[13px] font-medium text-center">
          Esta Ordem de Serviço foi cancelada e encerrada.
        </div>
      )}
    </div>
  );
}
