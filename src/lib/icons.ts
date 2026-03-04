// ========================================
// RepairHub — Icon Utility
// ========================================
// Centralized mapping from icon name strings to lucide-react components.

import {
  Battery, Volume2, Smartphone, Cpu, Camera, Wifi, Code, Clipboard,
  Zap, Power, Monitor, HardDrive, Bluetooth, Signal, Mic, Headphones,
  Usb, Plug, Thermometer, Shield, Wrench, Settings, Search,
  LayoutDashboard, ClipboardList, Users, UserCog, Package, AlertTriangle,
  Tag, FolderTree, Plus, Pencil, Trash2, ChevronRight, ArrowLeft,
  Save, X, Check, CircleDot, Clock, FileText, DollarSign, Hash,
  Phone, Mail, MapPin, CreditCard, Percent, ChevronDown, Filter,
  Eye, BarChart3, TrendingUp, ArrowRight, CircleCheck, Ban, Upload,
  LogOut, Sparkles, RefreshCw, Activity, Database, Globe,
  type LucideIcon,
} from 'lucide-react';
import type { CategoryIconName } from './types';

// Map category icon names to lucide components
const ICON_MAP: Record<CategoryIconName, LucideIcon> = {
  'battery': Battery,
  'volume-2': Volume2,
  'smartphone': Smartphone,
  'cpu': Cpu,
  'camera': Camera,
  'wifi': Wifi,
  'code': Code,
  'clipboard': Clipboard,
  'zap': Zap,
  'power': Power,
  'monitor': Monitor,
  'hard-drive': HardDrive,
  'bluetooth': Bluetooth,
  'signal': Signal,
  'mic': Mic,
  'headphones': Headphones,
  'usb': Usb,
  'plug': Plug,
  'thermometer': Thermometer,
  'shield': Shield,
  'wrench': Wrench,
  'settings': Settings,
  'tool': Wrench,
  'search': Search,
  'activity': Activity,
  'database': Database,
  'globe': Globe,
};

export function getCategoryIcon(iconName: CategoryIconName): LucideIcon {
  return ICON_MAP[iconName] || Clipboard;
}

// Re-export commonly used icons for direct use in components
export {
  LayoutDashboard, ClipboardList, Users, UserCog, Package, AlertTriangle,
  Tag, FolderTree, Plus, Pencil, Trash2, ChevronRight, ArrowLeft,
  Save, X, Check, CircleDot, Clock, FileText, DollarSign, Hash,
  Phone, Mail, MapPin, CreditCard, Percent, ChevronDown, Filter,
  Eye, BarChart3, TrendingUp, ArrowRight, CircleCheck, Ban,
  Settings, Wrench, Search, Battery, Volume2, Smartphone, Cpu, Camera,
  Wifi, Code, Clipboard, Zap, Power, Monitor, HardDrive, Bluetooth,
  Signal, Mic, Headphones, Usb, Plug, Thermometer, Shield, Upload, LogOut,
  Sparkles, RefreshCw, Activity, Database, Globe
};
export type { LucideIcon };
