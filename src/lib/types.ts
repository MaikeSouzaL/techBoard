// ========================================
// TechBoard — Data Types
// ========================================

export interface Brand {
  id: string;
  name: string;
  logo?: string;
  createdAt: string;
}

export interface DeviceModel {
  id: string;
  brandId: string;
  name: string;
  image?: string;
  pcbImageFront?: string;
  pcbImageBack?: string;
  pcbImageFrontClean?: string;
  pcbImageBackClean?: string;
  pcbData?: PCBData;
  bgImage?: string;
  createdAt: string;
}

export type Difficulty = 'facil' | 'medio' | 'dificil';

export const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string }> = {
  facil: { label: 'Fácil', color: '#00e676' },
  medio: { label: 'Médio', color: '#ffc107' },
  dificil: { label: 'Difícil', color: '#ff5252' },
};

// ========================================
// Dynamic Categories
// ========================================

// Available lucide icon names for category creation
export const CATEGORY_ICON_OPTIONS = [
  'battery', 'volume-2', 'smartphone', 'cpu', 'camera', 'wifi', 'code', 'clipboard',
  'zap', 'power', 'monitor', 'hard-drive', 'bluetooth', 'signal', 'mic', 'headphones',
  'usb', 'plug', 'thermometer', 'shield', 'wrench', 'settings', 'tool', 'search',
  'activity', 'database', 'globe'
] as const;

export type CategoryIconName = typeof CATEGORY_ICON_OPTIONS[number];

export interface Category {
  id: string;
  name: string;
  icon: CategoryIconName;
  color: string;
  createdAt: string;
}

export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'createdAt'>[] = [
  { name: 'Não Liga / Não Inicia', icon: 'power', color: '#ef4444' },
  { name: 'Problemas de Carga', icon: 'battery', color: '#22c55e' },
  { name: 'Problemas de Tela', icon: 'smartphone', color: '#8b5cf6' },
  { name: 'Problemas de Sinal', icon: 'signal', color: '#3b82f6' },
  { name: 'Problemas de Software', icon: 'code', color: '#ec4899' },
  { name: 'Problemas de Segurança', icon: 'shield', color: '#f97316' },
  { name: 'Problemas de Câmera', icon: 'camera', color: '#f59e0b' },
  { name: 'Problemas de Áudio', icon: 'volume-2', color: '#06b6d4' },
  { name: 'Problemas de Armazenamento', icon: 'hard-drive', color: '#64748b' },
  { name: 'Problemas de Hardware', icon: 'cpu', color: '#f43f5e' },
  { name: 'Problemas de Boot', icon: 'zap', color: '#eab308' },
  { name: 'Problemas de Desempenho', icon: 'activity', color: '#14b8a6' },
  { name: 'Problemas de Backup/Dados', icon: 'database', color: '#6366f1' },
  { name: 'Problemas de Rede', icon: 'globe', color: '#0ea5e9' },
  { name: 'Problemas de Sistema', icon: 'settings', color: '#78716c' },
];

// ========================================
// Repair Guide Types
// ========================================

export type StepRiskLevel = 'low' | 'medium' | 'high';

export const STEP_RISK_CONFIG: Record<StepRiskLevel, { label: string; color: string; bg: string }> = {
  low:    { label: 'Baixo Risco',  color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  medium: { label: 'Atenção',      color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  high:   { label: 'Alto Risco',   color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

export const STEP_TOOL_OPTIONS = [
  'Multímetro', 'Microscópio', 'Ferro de Solda', 'Hot Air', 'Bisturi',
  'Pinça', 'Chave T2', 'Chave T3', 'Chave T4', 'Chave P5',
  'Lupa', 'Isca de Corrente', 'Fonte DC', 'Ultrassom', 'Pasta Flux',
  'Estanho 0.3mm', 'Fita Kapton', 'BGA Reballing', 'Alavanca Plástica',
] as const;

export type StepTool = typeof STEP_TOOL_OPTIONS[number];

export interface StepChecklistItem {
  id: string;
  text: string;
}

export interface RepairStep {
  order: number;
  title: string;
  description: string;
  image?: string;
  riskLevel?: StepRiskLevel;
  tools?: StepTool[];
  checklist?: StepChecklistItem[];
}

export interface PCBData {
  components: unknown[];
  wires: unknown[];
}

export interface VoltageTest {
  id: string;
  lineName: string; // ex: PP_VDD_MAIN
  expectedVoltage: string; // ex: 3.8V
  status?: string;
}

export interface RepairGuide {
  id: string;
  modelId: string;
  problemTitle: string;
  categoryId: string;
  description: string;
  difficulty: Difficulty;
  requiredTools?: string[];  // ex: ['Multímetro', 'Microscópio']
  voltageTests?: VoltageTest[]; 
  videoUrl?: string; // Para assinantes Premium
  boardDiagramData?: unknown; // Payload SVG/Canvas do React Flow
  
  // Structured Technical Info
  classicSymptoms?: string;
  circuitAnalysis?: string;
  identifiedCause?: string;
  appliedSolution?: string;
  observations?: string;

  steps: RepairStep[];
  /** Step pin markers placed on the PCB — stored with native SVG coordinates */
  pins?: Array<{
    id: string;
    svgX: number;
    svgY: number;
    stepIndex: number;
    label: string;
  }>;
  highlightedComponentIds?: string[];
  authorId?: string; // Para Ranking colaborativo
  createdAt: string;
  updatedAt: string;
}

// ========================================
// Shop Management Types
// ========================================

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  cpfCnpj: string;
  address: string;
  notes: string;
  createdAt: string;
}

export type EmployeeRole = 'admin' | 'tecnico' | 'atendente' | 'assinante_externo';

export const EMPLOYEE_ROLES: { value: EmployeeRole; label: string }[] = [
  { value: 'admin', label: 'Administrador' },
  { value: 'tecnico', label: 'Técnico' },
  { value: 'atendente', label: 'Recepção / Balcão' },
  { value: 'assinante_externo', label: 'Assinante B2B (Apenas Guia)' },
];

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  phone: string;
  email: string;
  commission: number;
  createdAt: string;
}

export interface Part {
  id: string;
  name: string;
  code: string;
  supplier?: string;
  costPrice: number;
  sellPrice: number;
  stock: number;
  minStock?: number;
  brandIds: string[];
  createdAt: string;
}

export interface Defect {
  id: string;
  title: string;
  categoryId: string;
  description: string;
  createdAt: string;
}

// ========================================
// Finance Management Types
// ========================================

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface FinanceTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string;
  relatedOrderId?: string;
  employeeId?: string;
  status: 'PENDENTE' | 'PAGO';
  createdAt: string;
}

export type OSStatus =
  | 'aguardando' | 'em_analise' | 'orcamento_enviado'
  | 'aprovado' | 'em_reparo' | 'concluido' | 'entregue' | 'cancelado';

export const OS_STATUS_CONFIG: Record<OSStatus, { label: string; color: string }> = {
  aguardando:        { label: 'Aguardando',        color: '#78909c' },
  em_analise:        { label: 'Em Análise',        color: '#42a5f5' },
  orcamento_enviado: { label: 'Orçamento Enviado', color: '#ffa726' },
  aprovado:          { label: 'Aprovado',           color: '#66bb6a' },
  em_reparo:         { label: 'Em Reparo',          color: '#ab47bc' },
  concluido:         { label: 'Concluído',          color: '#26a69a' },
  entregue:          { label: 'Entregue',           color: '#00e676' },
  cancelado:         { label: 'Cancelado',          color: '#ef5350' },
};

export type OSPriority = 'baixa' | 'normal' | 'alta' | 'urgente';

export const OS_PRIORITY_CONFIG: Record<OSPriority, { label: string; color: string }> = {
  baixa:   { label: 'Baixa',   color: '#78909c' },
  normal:  { label: 'Normal',  color: '#42a5f5' },
  alta:    { label: 'Alta',    color: '#ffa726' },
  urgente: { label: 'Urgente', color: '#ef5350' },
};

export interface QuotePart {
  partId: string;
  partName: string;
  qty: number;
  unitPrice: number;
}

export interface ServiceOrder {
  id: string;
  osNumber: string;
  customerId: string;
  brandId: string;
  modelId: string;
  
  // Device specifics
  deviceSerial: string;
  deviceColor: string;
  deviceStorageSize?: string; // ex: 128GB
  devicePassword?: string;
  deviceCondition: string;
  entryPhotos?: string[]; // Array de URLs das fotos tiradas no balcão
  
  // Diagnostics
  defectReported: string; // Relato do cliente
  technicalDiagnostic?: string; // Laudo do técnico
  technicalChecklist?: Record<string, boolean>; // Ex: { 'cameraFrontal': true, 'faceId': false }
  defectIds: string[];
  
  technicianId: string;
  status: OSStatus;
  priority: OSPriority;
  quoteParts: QuotePart[];
  laborCost: number;
  discount: number;
  quoteTotal: number;
  quoteSentAt?: string;
  quoteApprovedAt?: string;
  warrantyDays: number;
  warrantyExpiresAt?: string;
  notes: string;
  entryDate: string;
  completedDate?: string;
  deliveredDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type SaaSPlan = 'basico' | 'pro' | 'premium';

export interface ShopSettings {
  shopName: string;
  phone: string;
  address: string;
  cnpj: string;
  defaultWarrantyDays: number;
  saasPlan?: SaaSPlan;
  maxTechnicians?: number;
}

// ========================================
// Helpers
// ========================================

export type UserMode = 'admin' | 'subscriber';

export function generateId(): string {
  return Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
}

let _osCounter: number | null = null;
export function generateOSNumber(): string {
  if (_osCounter === null) {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('techboard_os_counter') : null;
    _osCounter = raw ? parseInt(raw, 10) : 0;
  }
  _osCounter++;
  if (typeof window !== 'undefined') localStorage.setItem('techboard_os_counter', String(_osCounter));
  return String(_osCounter).padStart(6, '0');
}
