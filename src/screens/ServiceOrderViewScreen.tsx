'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import * as db from '@/lib/db';
import { type ServiceOrder, type Part, type QuotePart } from '@/lib/types';
import { ChevronRight } from '@/lib/icons';

// UI Modules
import OrderHeaderPanel from '@/components/service-order-view/OrderHeaderPanel';
import CustomerDevicePanel from '@/components/service-order-view/CustomerDevicePanel';
import TechnicianPanel from '@/components/service-order-view/TechnicianPanel';
import StatusActionsPanel from '@/components/service-order-view/StatusActionsPanel';
import OrderQuotePanel from '@/components/service-order-view/OrderQuotePanel';

const STATUS_FLOW = ['aguardando', 'em_analise', 'orcamento_enviado', 'aprovado', 'em_reparo', 'concluido', 'entregue'];

export default function ServiceOrderViewScreen() {
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [parts, setParts] = useState<Part[]>([]);

  const reloadData = useCallback(() => {
    const o = db.getServiceOrderById(orderId);
    setOrder(o || null);
    setParts(db.getParts());
  }, [orderId]);
  
  useEffect(() => { 
    const t = setTimeout(reloadData, 0); 
    return () => clearTimeout(t); 
  }, [reloadData]);

  if (!order) {
    return (
      <AppShell>
        <div className="p-8 flex items-center justify-center h-full text-[#5c5f77] text-sm animate-pulse">
          Carregando Ordem de Serviço…
        </div>
      </AppShell>
    );
  }

  // Related DB Models
  const customer = db.getCustomerById(order.customerId);
  const brand = db.getBrandById(order.brandId);
  const model = db.getModelById(order.modelId);
  const tech = db.getEmployeeById(order.technicianId);

  // Business Logic
  const handleAdvanceStatus = () => {
    const idx = STATUS_FLOW.indexOf(order.status);
    if (idx < 0 || idx >= STATUS_FLOW.length - 1) return;
    
    const next = STATUS_FLOW[idx + 1] as ServiceOrder['status'];
    const updates: Partial<ServiceOrder> = { ...order, status: next };
    
    if (next === 'concluido') updates.completedDate = new Date().toISOString();
    if (next === 'entregue') { 
      updates.deliveredDate = new Date().toISOString(); 
      updates.warrantyExpiresAt = new Date(Date.now() + (order.warrantyDays || 90) * 86400000).toISOString(); 
    }
    if (next === 'orcamento_enviado') updates.quoteSentAt = new Date().toISOString();
    if (next === 'aprovado') updates.quoteApprovedAt = new Date().toISOString();
    
    db.saveServiceOrder(updates as ServiceOrder);
    reloadData();
  };

  const handleCancelOrder = () => {
    if (!confirm('Deseja realmente cancelar esta Ordem de Serviço? Ela será encerrada permanentemente.')) return;
    db.saveServiceOrder({ ...order, status: 'cancelado' });
    reloadData();
  };

  const handleSaveQuote = (qParts: QuotePart[], laborCost: number, discount: number, quoteTotal: number) => {
    db.saveServiceOrder({ ...order, quoteParts: qParts, laborCost, discount, quoteTotal });
    reloadData();
  };

  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#5c5f77] uppercase tracking-wider mb-6">
          <Link href="/service-orders" className="hover:text-[#3b82f6] transition-colors">Ordens de Serviço</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#3f4257]" />
          <span className="text-[#e1e2e8]">Painel de Controle</span>
        </div>

        {/* 1. Module: Order Header */}
        <OrderHeaderPanel order={order} />

        {/* 2. Module: Customer & Device Overview */}
        <CustomerDevicePanel 
          order={order} 
          customer={customer} 
          brand={brand} 
          model={model} 
          tech={tech} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="space-y-6">
            {/* 3. Module: Bench Workflow (Labs) */}
            <TechnicianPanel order={order} />

            {/* 4. Module: Status Advancement & Timeline (Counter) */}
            <StatusActionsPanel 
              order={order} 
              onAdvance={handleAdvanceStatus} 
              onCancel={handleCancelOrder} 
            />
          </div>

          <div>
            {/* 5. Module: Finance & Quotes (Counter) */}
            <OrderQuotePanel 
              order={order} 
              parts={parts} 
              onSaveQuote={handleSaveQuote} 
            />

            {/* Warranty Alert (If finished) */}
            {order.warrantyExpiresAt && (
              <div className="mt-6 bg-[#3b82f6]/10 border border-[#3b82f6]/20 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#3b82f6]/10 rounded-bl-full pointer-events-none blur-2xl" />
                <p className="text-[11px] font-bold text-[#3b82f6] uppercase tracking-wider mb-2">Período de Garantia Ativo</p>
                <p className="text-[15px] font-bold text-[#e1e2e8]">
                  {order.warrantyDays} dias cobertos.
                </p>
                <p className="text-[13px] text-[#8b8fa3] mt-1">
                  Expiração: {new Date(order.warrantyExpiresAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </AppShell>
  );
}
