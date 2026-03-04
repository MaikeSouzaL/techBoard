'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import * as db from '@/lib/db';
import { type ServiceOrder, type OSStatus, type OSPriority, type Brand, type DeviceModel, type Customer, type Employee, type Defect } from '@/lib/types';
import OrdersHeader from '@/components/service-orders/OrdersHeader';
import OrdersFilter from '@/components/service-orders/OrdersFilter';
import OrderList from '@/components/service-orders/OrderList';
import OrderForm from '@/components/service-orders/OrderForm';

export default function ServiceOrdersScreen() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<OSStatus | 'all'>('all');
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<DeviceModel[]>([]);
  const [technicians, setTechnicians] = useState<Employee[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  
  const [formData, setFormData] = useState({ 
    customerId: '', brandId: '', modelId: '', deviceSerial: '', deviceColor: '', 
    deviceCondition: '', defectReported: '', defectIds: [] as string[], 
    technicianId: '', priority: 'normal' as OSPriority, notes: '' 
  });

  const reloadData = () => { 
    setOrders(db.getServiceOrders()); 
    setCustomers(db.getCustomers()); 
    setBrands(db.getBrands()); 
    setTechnicians(db.getTechnicians()); 
    setDefects(db.getDefects()); 
  };
  
  useEffect(() => { 
    const t = setTimeout(reloadData, 0); 
    return () => clearTimeout(t); 
  }, []);
  
  useEffect(() => { 
    const t = setTimeout(() => { 
      if (formData.brandId) setModels(db.getModelsByBrand(formData.brandId)); 
      else setModels([]); 
    }, 0); 
    return () => clearTimeout(t); 
  }, [formData.brandId]);

  const handleOpenCreate = () => { 
    setFormData({ 
      customerId: '', brandId: '', modelId: '', deviceSerial: '', deviceColor: '', 
      deviceCondition: '', defectReported: '', defectIds: [], technicianId: '', 
      priority: 'normal', notes: '' 
    }); 
    setShowForm(true); 
  };
  
  const handleSaveOrder = () => { 
    if (!formData.customerId) return alert('Por favor, selecione um cliente.'); 
    db.saveServiceOrder({ ...formData }); 
    setShowForm(false); 
    reloadData(); 
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  const openOrdersCount = orders.filter(o => !['concluido', 'entregue', 'cancelado'].includes(o.status)).length;

  return (
    <AppShell>
      <div className="p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
        
        {/* Header Module */}
        <OrdersHeader 
          totalOrders={orders.length} 
          openOrders={openOrdersCount} 
          onOpenCreate={handleOpenCreate} 
        />

        {/* Filter Module */}
        <OrdersFilter 
          currentFilter={filterStatus} 
          onFilterChange={setFilterStatus} 
        />

        {/* List Module */}
        <OrderList 
          orders={filteredOrders} 
          customers={customers} 
        />

        {/* Modal Module */}
        {showForm && (
          <OrderForm 
            formData={formData} 
            setFormData={setFormData}
            customers={customers}
            brands={brands}
            models={models}
            defects={defects}
            technicians={technicians}
            onClose={() => setShowForm(false)}
            onSave={handleSaveOrder}
          />
        )}
        
      </div>
    </AppShell>
  );
}
