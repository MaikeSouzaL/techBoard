// ========================================
// RepairHub — localStorage Database Service
// ========================================

import {
  Brand, DeviceModel, RepairGuide, Customer, Employee, Part, Defect,
  ServiceOrder, ShopSettings, Category, DEFAULT_CATEGORIES,
  generateId, generateOSNumber,
} from './types';

const KEYS = {
  BRANDS: 'repairhub_brands',
  MODELS: 'repairhub_models',
  GUIDES: 'repairhub_guides',
  CUSTOMERS: 'repairhub_customers',
  EMPLOYEES: 'repairhub_employees',
  PARTS: 'repairhub_parts',
  DEFECTS: 'repairhub_defects',
  SERVICE_ORDERS: 'repairhub_service_orders',
  SETTINGS: 'repairhub_settings',
  CATEGORIES: 'repairhub_categories',
} as const;

function load<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}
function save<T>(key: string, data: T[]): void {
  if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(data));
}

// ===== Categories =====
export function getCategories(): Category[] {
  let cats = load<Category>(KEYS.CATEGORIES);
  if (cats.length === 0) {
    // Seed defaults
    const now = new Date().toISOString();
    cats = DEFAULT_CATEGORIES.map(c => ({ ...c, id: generateId(), createdAt: now }));
    save(KEYS.CATEGORIES, cats);
  }
  return cats.sort((a, b) => a.name.localeCompare(b.name));
}
export function getCategoryById(id: string): Category | undefined {
  return getCategories().find(c => c.id === id);
}
export function saveCategory(c: Partial<Category> & { name: string }): Category {
  const all = load<Category>(KEYS.CATEGORIES);
  if (c.id) { const i = all.findIndex(x => x.id === c.id); if (i >= 0) { all[i] = { ...all[i], ...c }; save(KEYS.CATEGORIES, all); return all[i]; } }
  const n: Category = { id: generateId(), name: c.name, icon: c.icon || 'clipboard', color: c.color || '#78909c', createdAt: new Date().toISOString() };
  all.push(n); save(KEYS.CATEGORIES, all); return n;
}
export function deleteCategory(id: string): void {
  save(KEYS.CATEGORIES, load<Category>(KEYS.CATEGORIES).filter(c => c.id !== id));
}

// ===== Brands =====
export function getBrands(): Brand[] { return load<Brand>(KEYS.BRANDS).sort((a, b) => a.name.localeCompare(b.name)); }
export function getBrandById(id: string): Brand | undefined { return load<Brand>(KEYS.BRANDS).find(b => b.id === id); }
export function saveBrand(brand: Partial<Brand> & { name: string }): Brand {
  const all = load<Brand>(KEYS.BRANDS);
  if (brand.id) { const i = all.findIndex(b => b.id === brand.id); if (i >= 0) { all[i] = { ...all[i], ...brand }; save(KEYS.BRANDS, all); return all[i]; } }
  const n: Brand = { id: generateId(), name: brand.name, logo: brand.logo, createdAt: new Date().toISOString() };
  all.push(n); save(KEYS.BRANDS, all); return n;
}
export function deleteBrand(id: string): void {
  save(KEYS.BRANDS, load<Brand>(KEYS.BRANDS).filter(b => b.id !== id));
  getModelsByBrand(id).forEach(m => deleteModel(m.id));
}

// ===== Models =====
export function getModels(): DeviceModel[] { return load<DeviceModel>(KEYS.MODELS); }
export function getModelsByBrand(brandId: string): DeviceModel[] { return load<DeviceModel>(KEYS.MODELS).filter(m => m.brandId === brandId).sort((a, b) => a.name.localeCompare(b.name)); }
export function getModelById(id: string): DeviceModel | undefined { return load<DeviceModel>(KEYS.MODELS).find(m => m.id === id); }
export function saveModel(model: Partial<DeviceModel> & { name: string; brandId: string }): DeviceModel {
  const all = load<DeviceModel>(KEYS.MODELS);
  if (model.id) { const i = all.findIndex(m => m.id === model.id); if (i >= 0) { all[i] = { ...all[i], ...model }; save(KEYS.MODELS, all); return all[i]; } }
  const n: DeviceModel = { id: generateId(), brandId: model.brandId, name: model.name, image: model.image, pcbData: model.pcbData, bgImage: model.bgImage, createdAt: new Date().toISOString() };
  all.push(n); save(KEYS.MODELS, all); return n;
}
export function deleteModel(id: string): void {
  save(KEYS.MODELS, load<DeviceModel>(KEYS.MODELS).filter(m => m.id !== id));
  save(KEYS.GUIDES, load<RepairGuide>(KEYS.GUIDES).filter(g => g.modelId !== id));
}

// ===== Guides =====
export function getGuides(): RepairGuide[] { return load<RepairGuide>(KEYS.GUIDES); }
export function getGuidesByModel(modelId: string): RepairGuide[] { return load<RepairGuide>(KEYS.GUIDES).filter(g => g.modelId === modelId).sort((a, b) => a.problemTitle.localeCompare(b.problemTitle)); }
export function getGuideById(id: string): RepairGuide | undefined { return load<RepairGuide>(KEYS.GUIDES).find(g => g.id === id); }
export function saveGuide(guide: Partial<RepairGuide> & { modelId: string; problemTitle: string }): RepairGuide {
  const all = load<RepairGuide>(KEYS.GUIDES); const now = new Date().toISOString();
  if (guide.id) { const i = all.findIndex(g => g.id === guide.id); if (i >= 0) { all[i] = { ...all[i], ...guide, updatedAt: now }; save(KEYS.GUIDES, all); return all[i]; } }
  const n: RepairGuide = { id: generateId(), modelId: guide.modelId, problemTitle: guide.problemTitle, categoryId: guide.categoryId || '', description: guide.description || '', difficulty: guide.difficulty || 'medio', steps: guide.steps || [], highlightedComponentIds: guide.highlightedComponentIds || [], createdAt: now, updatedAt: now };
  all.push(n); save(KEYS.GUIDES, all); return n;
}
export function deleteGuide(id: string): void { save(KEYS.GUIDES, load<RepairGuide>(KEYS.GUIDES).filter(g => g.id !== id)); }

// ===== Customers =====
export function getCustomers(): Customer[] { return load<Customer>(KEYS.CUSTOMERS).sort((a, b) => a.name.localeCompare(b.name)); }
export function getCustomerById(id: string): Customer | undefined { return load<Customer>(KEYS.CUSTOMERS).find(c => c.id === id); }
export function saveCustomer(c: Partial<Customer> & { name: string }): Customer {
  const all = load<Customer>(KEYS.CUSTOMERS);
  if (c.id) { const i = all.findIndex(x => x.id === c.id); if (i >= 0) { all[i] = { ...all[i], ...c }; save(KEYS.CUSTOMERS, all); return all[i]; } }
  const n: Customer = { id: generateId(), name: c.name, phone: c.phone || '', email: c.email || '', cpfCnpj: c.cpfCnpj || '', address: c.address || '', notes: c.notes || '', createdAt: new Date().toISOString() };
  all.push(n); save(KEYS.CUSTOMERS, all); return n;
}
export function deleteCustomer(id: string): void { save(KEYS.CUSTOMERS, load<Customer>(KEYS.CUSTOMERS).filter(c => c.id !== id)); }

// ===== Employees =====
export function getEmployees(): Employee[] { return load<Employee>(KEYS.EMPLOYEES).sort((a, b) => a.name.localeCompare(b.name)); }
export function getEmployeeById(id: string): Employee | undefined { return load<Employee>(KEYS.EMPLOYEES).find(e => e.id === id); }
export function getTechnicians(): Employee[] { return getEmployees().filter(e => e.role === 'tecnico'); }
export function saveEmployee(e: Partial<Employee> & { name: string }): Employee {
  const all = load<Employee>(KEYS.EMPLOYEES);
  if (e.id) { const i = all.findIndex(x => x.id === e.id); if (i >= 0) { all[i] = { ...all[i], ...e }; save(KEYS.EMPLOYEES, all); return all[i]; } }
  const n: Employee = { id: generateId(), name: e.name, role: e.role || 'tecnico', phone: e.phone || '', email: e.email || '', commission: e.commission ?? 0, createdAt: new Date().toISOString() };
  all.push(n); save(KEYS.EMPLOYEES, all); return n;
}
export function deleteEmployee(id: string): void { save(KEYS.EMPLOYEES, load<Employee>(KEYS.EMPLOYEES).filter(e => e.id !== id)); }

// ===== Parts =====
export function getParts(): Part[] { return load<Part>(KEYS.PARTS).sort((a, b) => a.name.localeCompare(b.name)); }
export function getPartById(id: string): Part | undefined { return load<Part>(KEYS.PARTS).find(p => p.id === id); }
export function savePart(p: Partial<Part> & { name: string }): Part {
  const all = load<Part>(KEYS.PARTS);
  if (p.id) { const i = all.findIndex(x => x.id === p.id); if (i >= 0) { all[i] = { ...all[i], ...p }; save(KEYS.PARTS, all); return all[i]; } }
  const n: Part = { id: generateId(), name: p.name, code: p.code || '', costPrice: p.costPrice ?? 0, sellPrice: p.sellPrice ?? 0, stock: p.stock ?? 0, brandIds: p.brandIds || [], createdAt: new Date().toISOString() };
  all.push(n); save(KEYS.PARTS, all); return n;
}
export function deletePart(id: string): void { save(KEYS.PARTS, load<Part>(KEYS.PARTS).filter(p => p.id !== id)); }

// ===== Defects =====
export function getDefects(): Defect[] { return load<Defect>(KEYS.DEFECTS).sort((a, b) => a.title.localeCompare(b.title)); }
export function getDefectById(id: string): Defect | undefined { return load<Defect>(KEYS.DEFECTS).find(d => d.id === id); }
export function saveDefect(d: Partial<Defect> & { title: string }): Defect {
  const all = load<Defect>(KEYS.DEFECTS);
  if (d.id) { const i = all.findIndex(x => x.id === d.id); if (i >= 0) { all[i] = { ...all[i], ...d }; save(KEYS.DEFECTS, all); return all[i]; } }
  const n: Defect = { id: generateId(), title: d.title, categoryId: d.categoryId || '', description: d.description || '', createdAt: new Date().toISOString() };
  all.push(n); save(KEYS.DEFECTS, all); return n;
}
export function deleteDefect(id: string): void { save(KEYS.DEFECTS, load<Defect>(KEYS.DEFECTS).filter(d => d.id !== id)); }

// ===== Service Orders =====
export function getServiceOrders(): ServiceOrder[] { return load<ServiceOrder>(KEYS.SERVICE_ORDERS).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
export function getServiceOrderById(id: string): ServiceOrder | undefined { return load<ServiceOrder>(KEYS.SERVICE_ORDERS).find(s => s.id === id); }
export function getServiceOrdersByCustomer(customerId: string): ServiceOrder[] { return getServiceOrders().filter(s => s.customerId === customerId); }
export function saveServiceOrder(o: Partial<ServiceOrder> & { customerId: string }): ServiceOrder {
  const all = load<ServiceOrder>(KEYS.SERVICE_ORDERS); const now = new Date().toISOString();
  if (o.id) { const i = all.findIndex(x => x.id === o.id); if (i >= 0) { all[i] = { ...all[i], ...o, updatedAt: now }; save(KEYS.SERVICE_ORDERS, all); return all[i]; } }
  const n: ServiceOrder = {
    id: generateId(), osNumber: generateOSNumber(), customerId: o.customerId,
    brandId: o.brandId || '', modelId: o.modelId || '',
    deviceSerial: o.deviceSerial || '', deviceColor: o.deviceColor || '', deviceCondition: o.deviceCondition || '',
    defectReported: o.defectReported || '', defectIds: o.defectIds || [],
    technicianId: o.technicianId || '', status: o.status || 'aguardando', priority: o.priority || 'normal',
    quoteParts: o.quoteParts || [], laborCost: o.laborCost ?? 0, discount: o.discount ?? 0, quoteTotal: o.quoteTotal ?? 0,
    warrantyDays: o.warrantyDays ?? 90, notes: o.notes || '',
    entryDate: o.entryDate || now, createdAt: now, updatedAt: now,
  };
  all.push(n); save(KEYS.SERVICE_ORDERS, all); return n;
}
export function deleteServiceOrder(id: string): void { save(KEYS.SERVICE_ORDERS, load<ServiceOrder>(KEYS.SERVICE_ORDERS).filter(s => s.id !== id)); }

// ===== Settings =====
const DEFAULT_SETTINGS: ShopSettings = { shopName: 'Minha Assistência', phone: '', address: '', cnpj: '', defaultWarrantyDays: 90 };
export function getSettings(): ShopSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try { return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(KEYS.SETTINGS) || '{}') }; } catch { return DEFAULT_SETTINGS; }
}
export function saveSettings(s: Partial<ShopSettings>): ShopSettings {
  const current = getSettings(); const updated = { ...current, ...s };
  if (typeof window !== 'undefined') localStorage.setItem(KEYS.SETTINGS, JSON.stringify(updated));
  return updated;
}

// ===== Stats =====
export function getStats() {
  const orders = getServiceOrders();
  return {
    totalBrands: getBrands().length, totalModels: getModels().length, totalGuides: getGuides().length,
    totalCustomers: getCustomers().length, totalEmployees: getEmployees().length, totalParts: getParts().length,
    totalOrders: orders.length,
    openOrders: orders.filter(o => !['concluido','entregue','cancelado'].includes(o.status)).length,
    completedToday: orders.filter(o => o.completedDate?.startsWith(new Date().toISOString().slice(0, 10))).length,
  };
}
