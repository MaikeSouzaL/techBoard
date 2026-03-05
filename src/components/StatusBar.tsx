'use client';

import { useMapperStore } from '../store/useMapperStore';

export default function StatusBar() {
  const { currentTool, isRoutingMode, isPreviewing, isWiring, components, wires } = useMapperStore();

  let status = 'Pronto';
  let icon = '⚡';
  if (isPreviewing) { status = 'Ajuste de posição — arraste ou confirme'; icon = '📐'; }
  else if (isWiring) { status = 'Clique para rotear o fio'; icon = '🔗'; }
  else if (isRoutingMode) { status = 'Clique em uma âncora para iniciar'; icon = '🔌'; }

  return (
    <div className="absolute bottom-5 left-5 glass px-4 py-2 rounded-xl text-[11px] z-[1000] flex items-center gap-3">
      <span>{icon}</span>
      <span className="text-text-dim">{status}</span>
      <span className="text-text-dim">|</span>
      <span className="text-accent uppercase font-semibold text-[10px]">{currentTool}</span>
      <span className="text-text-dim">|</span>
      <span className="text-text-dim">{components.length} comp · {wires.length} fios</span>
    </div>
  );
}
