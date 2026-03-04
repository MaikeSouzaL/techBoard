'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import {
  LayoutDashboard, ClipboardList, Users, UserCog, Package,
  Tag, FolderTree, Settings, Wrench, LogOut
} from '@/lib/icons';

const NAV_SECTIONS = [
  {
    title: 'LOJA',
    items: [
      { href: '/service-orders', label: 'Ordens de Serviço', Icon: ClipboardList },
      { href: '/customers', label: 'Clientes', Icon: Users },
      { href: '/employees', label: 'Funcionários', Icon: UserCog },
      { href: '/parts', label: 'Peças / Estoque', Icon: Package },
      { href: '/categories', label: 'Categoria de defeitos', Icon: FolderTree },
    ],
  },
  {
    title: 'GUIAS',
    items: [
      { href: '/brands', label: 'Soluções', Icon: Tag },
    ],
  },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { userMode, toggleUserMode } = useAppStore();

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('logiclens_token');
      if (router) router.push('/');
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0f1117] text-[#e1e2e8]">
      {/* Sidebar */}
      <aside className="w-[250px] min-w-[250px] bg-[#161921] border-r border-[#1e2030] flex flex-col">
        {/* Logo */}
        <div className="px-5 py-4 flex items-center gap-3 border-b border-[#1e2030]">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#2563eb] flex items-center justify-center shadow-md">
            <Wrench className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-[14px] font-bold text-[#e1e2e8] tracking-tight">TechBoard</h1>
            <p className="text-[10px] text-[#5c5f77] font-medium tracking-wide">Workspace Cloud</p>
          </div>
        </div>

        {/* Dashboard */}
        <nav className="px-3 pt-3 pb-1">
          <Link href="/dashboard" className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-150 ${isActive('/dashboard') ? 'bg-[#3b82f6]/10 text-[#3b82f6]' : 'text-[#8b8fa3] hover:text-[#e1e2e8] hover:bg-[#1e2030]'}`}>
            <LayoutDashboard className="w-4 h-4" />
            <span className="font-medium">Dashboard</span>
          </Link>
        </nav>

        {/* Sections */}
        <nav className="flex-1 px-3 py-1 overflow-y-auto">
          {NAV_SECTIONS.map(section => (
            <div key={section.title}>
              <p className="text-[10px] font-semibold text-[#3f4257] uppercase tracking-[0.1em] px-3 pt-5 pb-1.5">{section.title}</p>
              <div className="flex flex-col gap-0.5">
                {section.items.map(item => (
                  <Link key={item.href} href={item.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-150 ${isActive(item.href) ? 'bg-[#3b82f6]/10 text-[#3b82f6]' : 'text-[#8b8fa3] hover:text-[#e1e2e8] hover:bg-[#1e2030]'}`}>
                    <item.Icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-[#1e2030] pb-3">
          {/* Settings */}
          <div className="px-3 py-2">
            <Link href="/settings" className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-150 ${isActive('/settings') ? 'bg-[#3b82f6]/10 text-[#3b82f6]' : 'text-[#8b8fa3] hover:text-[#e1e2e8] hover:bg-[#1e2030]'}`}>
              <Settings className="w-4 h-4" />
              <span className="font-medium">Configurações</span>
            </Link>
          </div>

          {/* Mode Toggle */}
          <div className="px-3 pb-2">
            <button onClick={toggleUserMode} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] transition-all duration-150 border border-[#1e2030] hover:border-[#2e3148] bg-[#12141d] cursor-pointer">
              {userMode === 'admin' ? <Wrench className="w-4 h-4 text-[#3b82f6]" /> : <Users className="w-4 h-4 text-[#22c55e]" />}
              <div className="flex-1 text-left">
                <p className="text-[12px] font-medium text-[#e1e2e8]">{userMode === 'admin' ? 'Administrador' : 'Assinante'}</p>
                <p className="text-[10px] text-[#5c5f77]">Alternar modo</p>
              </div>
              <span className={`w-1.5 h-1.5 rounded-full ${userMode === 'admin' ? 'bg-[#3b82f6]' : 'bg-[#22c55e]'}`} />
            </button>
          </div>

          {/* Logout Button */}
          <div className="px-3">
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-[#ef4444] hover:bg-[#ef4444]/10 transition-all duration-150 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Sair da Conta</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[#0f1117]">{children}</main>
    </div>
  );
}
