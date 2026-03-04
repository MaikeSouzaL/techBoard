import { OS_STATUS_CONFIG, type OSStatus } from '@/lib/types';

interface OrdersFilterProps {
  currentFilter: OSStatus | 'all';
  onFilterChange: (status: OSStatus | 'all') => void;
}

export default function OrdersFilter({ currentFilter, onFilterChange }: OrdersFilterProps) {
  return (
    <div className="flex gap-2 mb-6 flex-wrap">
      <button 
        onClick={() => onFilterChange('all')} 
        className={`px-3.5 py-2 rounded-lg text-[12px] font-medium cursor-pointer transition-all border border-transparent
          ${currentFilter === 'all' 
            ? 'bg-[#3b82f6]/15 text-[#3b82f6] border-[#3b82f6]/30' 
            : 'text-[#8b8fa3] hover:text-[#e1e2e8] hover:bg-[#1e2030] bg-[#161921]'}`}
      >
        Todas
      </button>
      
      {(Object.entries(OS_STATUS_CONFIG) as [OSStatus, typeof OS_STATUS_CONFIG.aguardando][]).map(([key, config]) => {
        const isActive = currentFilter === key;
        return (
          <button 
            key={key} 
            onClick={() => onFilterChange(key)} 
            className={`px-3.5 py-2 rounded-lg text-[12px] font-medium cursor-pointer transition-all border border-transparent
              ${!isActive ? 'bg-[#161921] hover:bg-[#1e2030]' : ''}`}
            style={{ 
              color: config.color, 
              backgroundColor: isActive ? config.color + '15' : undefined,
              borderColor: isActive ? config.color + '40' : undefined 
            }}
          >
            {config.label}
          </button>
        );
      })}
    </div>
  );
}
