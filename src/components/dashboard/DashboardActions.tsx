import Link from 'next/link';
import { Plus, Users, Tag } from '@/lib/icons';

export default function DashboardActions() {
  const actions = [
    { href: '/service-orders', Icon: Plus, title: 'Nova OS', desc: 'Criar ordem de serviço' },
    { href: '/customers', Icon: Users, title: 'Novo Cliente', desc: 'Cadastrar cliente' },
    { href: '/brands', Icon: Tag, title: 'Guias', desc: 'Gerenciar guias de reparo' },
  ];

  return (
    <div className="mb-8">
      <p className="text-[11px] font-semibold text-[#3f4257] uppercase tracking-[0.1em] mb-3">Ações Rápidas</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {actions.map(a => (
          <Link key={a.href} href={a.href} className="flex items-center gap-3.5 p-4 rounded-xl bg-[#161921] border border-[#1e2030] hover:border-[#3b82f6]/50 hover:bg-[#12141d] transition-all group shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-[#3b82f6]/10 flex items-center justify-center shrink-0 group-hover:bg-[#3b82f6]/20 transition-colors">
              <a.Icon className="w-4 h-4 text-[#3b82f6]" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-[#e1e2e8] group-hover:text-[#3b82f6] transition-colors">{a.title}</p>
              <p className="text-[11px] text-[#5c5f77]">{a.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
