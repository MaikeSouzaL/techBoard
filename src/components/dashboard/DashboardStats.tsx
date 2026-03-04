import { ClipboardList, Users, Package, Tag, Smartphone, Wrench, CircleCheck } from '@/lib/icons';

interface StatsProps {
  stats: {
    totalBrands: number;
    totalModels: number;
    totalGuides: number;
    totalCustomers: number;
    totalEmployees: number;
    totalParts: number;
    totalOrders: number;
    openOrders: number;
    completedToday: number;
  };
}

export default function DashboardStats({ stats }: StatsProps) {
  const mainStats = [
    { icon: ClipboardList, label: 'OS Abertas', value: stats.openOrders, color: '#3b82f6' },
    { icon: CircleCheck, label: 'Concluídas Hoje', value: stats.completedToday, color: '#22c55e' },
    { icon: Users, label: 'Clientes', value: stats.totalCustomers, color: '#8b5cf6' },
    { icon: Package, label: 'Peças', value: stats.totalParts, color: '#f59e0b' },
  ];

  const secondaryStats = [
    { icon: Tag, label: 'Marcas', value: stats.totalBrands, color: '#06b6d4' },
    { icon: Smartphone, label: 'Modelos', value: stats.totalModels, color: '#f59e0b' },
    { icon: Wrench, label: 'Guias de Reparo', value: stats.totalGuides, color: '#22c55e' },
  ];

  return (
    <div className="flex flex-col gap-6 mb-8">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {mainStats.map((s, i) => (
          <div key={i} className="bg-[#161921] border border-[#1e2030] rounded-xl p-4 flex items-center gap-3.5 hover:border-[#2e3148] transition-colors">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: s.color + '15' }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xl font-semibold text-[#e1e2e8]">{s.value}</p>
              <p className="text-[11px] text-[#5c5f77] font-medium tracking-wide uppercase">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {secondaryStats.map((s, i) => (
          <div key={i} className="bg-[#161921] border border-[#1e2030] rounded-xl p-4 flex items-center gap-3.5 hover:border-[#2e3148] transition-colors">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: s.color + '15' }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xl font-semibold text-[#e1e2e8]">{s.value}</p>
              <p className="text-[11px] text-[#5c5f77] font-medium tracking-wide uppercase">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
