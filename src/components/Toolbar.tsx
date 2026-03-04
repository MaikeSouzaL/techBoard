'use client';

import { useMapperStore } from '@/store/useMapperStore';
import { useRef } from 'react';
import {
  MousePointer2,
  Square,
  Circle,
  Undo2,
  Redo2,
  FolderOpen,
  Save,
  Trash2,
} from 'lucide-react';

const tools = [
  { id: 'select' as const, Icon: MousePointer2, title: 'Selecionar', shortcut: 'V' },
  { id: 'rect' as const, Icon: Square, title: 'Retângulo', shortcut: 'R' },
  { id: 'circle' as const, Icon: Circle, title: 'Círculo', shortcut: 'C' },
];

const ToolBtn = ({
  Icon,
  title,
  active,
  onClick,
  disabled,
  className = '',
  danger = false,
}: {
  Icon: React.ElementType;
  title: string;
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  danger?: boolean;
}) => (
  <button
    title={title}
    onClick={onClick}
    disabled={disabled}
    className={`
      relative group w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer
      ${active
        ? 'bg-gradient-to-br from-accent/30 to-accent/10 text-accent shadow-[0_0_16px_rgba(0,229,255,0.15)] border border-accent/50 scale-105'
        : danger
          ? 'text-text-dim hover:text-danger hover:bg-danger/10 border border-transparent hover:border-danger/20'
          : 'text-text-dim hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/10'
      }
      ${disabled ? 'opacity-20 !cursor-default hover:bg-transparent hover:text-text-dim hover:border-transparent' : ''}
      ${className}
    `}
  >
    <Icon size={18} strokeWidth={1.8} className="relative z-10" />
    {/* Tooltip */}
    <span className="
      absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2
      bg-bg-card/95 backdrop-blur-md text-[11px] text-text px-2.5 py-1.5 rounded-lg
      opacity-0 group-hover:opacity-100 transition-all duration-150 delay-300
      whitespace-nowrap pointer-events-none z-[100]
      border border-border/50 shadow-[0_4px_20px_rgba(0,0,0,0.5)]
      translate-x-1 group-hover:translate-x-0
    ">
      {title}
    </span>
  </button>
);

export default function Toolbar() {
  const { currentTool, setTool, exportData, clearAll, undo, redo, undoStack, redoStack, importData } = useMapperStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => importData(reader.result as string);
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="w-[68px] bg-gradient-to-b from-bg-panel/90 to-bg-deep/90 backdrop-blur-xl border-r border-white/[0.04] flex flex-col items-center z-50 overflow-hidden">

      {/* Logo / Brand */}
      <div className="w-full py-4 flex items-center justify-center">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent/25 to-accent/5 border border-accent/20 flex items-center justify-center text-accent text-sm font-bold shadow-[0_0_20px_rgba(0,229,255,0.1)]">
          P
        </div>
      </div>

      <div className="w-8 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

      {/* Drawing Tools */}
      <div className="py-3 flex flex-col items-center gap-1">
        <span className="text-[8px] text-text-dim/40 uppercase font-semibold tracking-[0.15em] mb-1">Ferramentas</span>
        {tools.map(t => (
          <ToolBtn
            key={t.id}
            Icon={t.Icon}
            title={`${t.title} (${t.shortcut})`}
            active={currentTool === t.id}
            onClick={() => setTool(t.id)}
          />
        ))}
      </div>

      <div className="w-8 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

      {/* History */}
      <div className="py-3 flex flex-col items-center gap-1">
        <span className="text-[8px] text-text-dim/40 uppercase font-semibold tracking-[0.15em] mb-1">Histórico</span>
        <ToolBtn Icon={Undo2} title="Desfazer (Ctrl+Z)" onClick={undo} disabled={undoStack.length === 0} />
        <ToolBtn Icon={Redo2} title="Refazer (Ctrl+Y)" onClick={redo} disabled={redoStack.length === 0} />
      </div>

      <div className="w-8 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

      {/* File Operations */}
      <div className="py-3 flex flex-col items-center gap-1">
        <span className="text-[8px] text-text-dim/40 uppercase font-semibold tracking-[0.15em] mb-1">Arquivo</span>
        <ToolBtn Icon={FolderOpen} title="Importar JSON" onClick={() => fileRef.current?.click()} />
        <ToolBtn Icon={Save} title="Exportar JSON" onClick={exportData} />
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFile} />
      </div>

      {/* Spacer */}
      <div className="flex-grow" />

      {/* Clear All — danger zone at bottom */}
      <div className="py-4 flex flex-col items-center">
        <div className="w-8 h-px bg-gradient-to-r from-transparent via-danger/20 to-transparent mb-3" />
        <ToolBtn
          Icon={Trash2}
          title="Limpar Tudo"
          danger
          onClick={() => { if (confirm('Deseja apagar todos os componentes?')) clearAll(); }}
        />
      </div>
    </div>
  );
}
