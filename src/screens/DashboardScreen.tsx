'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import * as db from '@/lib/db';
import DashboardStats from '@/components/dashboard/DashboardStats';
import DashboardActions from '@/components/dashboard/DashboardActions';
import DashboardWelcome from '@/components/dashboard/DashboardWelcome';

export default function DashboardScreen() {
  const [stats, setStats] = useState({ 
    totalBrands: 0, totalModels: 0, totalGuides: 0, totalCustomers: 0, 
    totalEmployees: 0, totalParts: 0, totalOrders: 0, openOrders: 0, completedToday: 0 
  });
  
  useEffect(() => { 
    const t = setTimeout(() => setStats(db.getStats()), 0); 
    return () => clearTimeout(t); 
  }, []);

  return (
    <AppShell>
      <div className="p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
        <div className="mb-8">
          <h1 className="text-[22px] font-bold text-[#e1e2e8] tracking-tight mb-1">Dashboard</h1>
          <p className="text-[13px] text-[#8b8fa3] font-medium tracking-wide">Visão geral do sistema</p>
        </div>

        {/* Modularized Stats Architecture */}
        <DashboardStats stats={stats} />

        {/* Modularized Quick Actions */}
        <DashboardActions />

        {/* Modularized Welcome Banner */}
        <DashboardWelcome />
      </div>
    </AppShell>
  );
}
