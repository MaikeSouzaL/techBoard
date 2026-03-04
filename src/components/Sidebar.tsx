'use client';

import React from 'react';
import { useMapperStore, COMP_TYPE_OPTIONS, COMP_TYPE_COLORS } from '@/store/useMapperStore';
import { Search, Package, Plug } from 'lucide-react';

export default function Sidebar() {
  const {
    selectedId, selectedPin, setSelectedPin, components, wires, isRoutingMode, searchQuery,
    toggleRoutingMode, deleteSelected, setSearchQuery, selectItem,
  } = useMapperStore();

  const comp = components.find(c => c.id === selectedId);

  const [isSaving, setIsSaving] = React.useState(false);
  const [gndCorner, setGndCorner] = React.useState<'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'center' | 'centerLeft' | 'centerRight'>(
    comp?.metadata?.gndCorner || 'topLeft'
  );

  const handleSave = () => {
    setIsSaving(true);
    if (selectedPin !== null) {
      const name = (document.getElementById('prop-pin-name') as HTMLInputElement)?.value || '';
      const net = (document.getElementById('prop-pin-net') as HTMLInputElement)?.value || '';
      const desc = (document.getElementById('prop-pin-desc') as HTMLTextAreaElement)?.value || '';
      const voltage = (document.getElementById('prop-pin-voltage') as HTMLInputElement)?.value || '';
      const resistance = (document.getElementById('prop-pin-resistance') as HTMLInputElement)?.value || '';
      useMapperStore.getState().savePinProperties(selectedPin, name, net, desc, voltage, resistance);
    } else {
      const name = (document.getElementById('prop-name') as HTMLInputElement)?.value || '';
      const rawCompType = (document.getElementById('prop-type') as HTMLSelectElement)?.value || 'ic';
      const customType = (document.getElementById('prop-type-custom') as HTMLInputElement)?.value || '';
      const compType = rawCompType === '__custom__' && customType ? customType.toLowerCase().trim() : rawCompType;
      const net = (document.getElementById('prop-net') as HTMLInputElement)?.value || '';
      const desc = (document.getElementById('prop-desc') as HTMLTextAreaElement)?.value || '';
      const voltage = (document.getElementById('prop-voltage') as HTMLInputElement)?.value || '';
      const resistance = (document.getElementById('prop-resistance') as HTMLInputElement)?.value || '';
      const isGnd = (document.getElementById('prop-gnd') as HTMLInputElement)?.checked || false;
      const pinCountVal = parseInt((document.getElementById('prop-pincount') as HTMLInputElement)?.value || '0', 10);
      const pinCount = pinCountVal > 0 ? pinCountVal : undefined;
      const pinStartCorner = (document.getElementById('prop-pinstartcorner') as HTMLSelectElement)?.value || 'topLeft';
      const pinNumbering = (document.getElementById('prop-pinnumbering') as HTMLSelectElement)?.value || 'sequential';
      useMapperStore.getState().saveProperties(name, compType, net, desc, voltage, resistance, isGnd, gndCorner, pinCount, pinStartCorner, pinNumbering);
    }
    
    // Simple visual feedback
    setTimeout(() => setIsSaving(false), 1500);
  };

  const connectedCount = comp?.net ? components.filter(c => c.net === comp.net).length : 0;
  const connectedWires = comp?.net ? wires.filter(w => w.net === comp.net).length : 0;


  return (
    <div className="w-[300px] bg-bg-panel/60 backdrop-blur-xl border-l border-border/30 flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <h2 className="text-accent font-semibold text-base tracking-tight">TechBoard Pro</h2>
        </div>
        <p className="text-[11px] text-text-dim mt-0.5 ml-4.5">Integrated Workstation</p>
      </div>

      {/* Search */}
      <div className="px-4 mb-3">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
          <input
            type="text"
            placeholder="Buscar componente ou NET..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-input-bg border border-border/50 text-text text-xs pl-8 pr-3 py-2 rounded-lg focus:border-accent/50 focus:outline-none transition-colors placeholder:text-text-dim/50"
          />
        </div>
      </div>

      <div className="h-px bg-border/30 mx-4" />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 custom-scrollbar">
        {!comp ? (
          <div className="text-center py-12 text-text-dim">
            <Package size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum componente selecionado</p>
            <p className="text-xs mt-1 opacity-60">Clique em um objeto para ver detalhes técnicos</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5 animate-in">
            {/* Component badge */}
            <div className={`flex items-center gap-2 bg-bg-card/60 rounded-lg px-3 py-2 border ${comp.metadata.isGnd ? 'border-green-500/30' : 'border-border/30'}`}>
              {selectedPin !== null && (
                <button onClick={() => setSelectedPin(null)} className="mr-1 text-text-dim hover:text-white" title="Voltar para Componente">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
              )}
              {selectedPin === null ? (
                <>
                  <span className="w-3 h-3 rounded-full" style={{ background: (COMP_TYPE_COLORS[comp.compType] || COMP_TYPE_COLORS.ic).stroke }} />
                  <span className="text-xs font-bold text-text truncate max-w-[150px]">{comp.name}</span>
                  {comp.metadata.isGnd && <span className="text-[9px] bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded ml-1 font-black shrink-0">GND</span>}
                  <span className="ml-auto text-[10px] text-text-dim font-mono shrink-0">{comp.id.slice(3, 8)}</span>
                </>
              ) : (
                <>
                  <span className="w-4 h-4 rounded-md bg-[#00ff00]/20 border border-[#00ff00] text-[#00ff00] flex items-center justify-center text-[10px] font-bold shrink-0">{selectedPin}</span>
                  <span className="text-xs font-bold text-[#00ff00] truncate max-w-[150px]">Pino {selectedPin}</span>
                  <span className="ml-auto text-[9px] text-text-dim bg-white/5 px-1.5 py-0.5 rounded shrink-0">{comp.name}</span>
                </>
              )}
            </div>

            {selectedPin !== null ? (() => {
              const pinData = comp.metadata?.pinsInfo?.[selectedPin] || {};
              return (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1 col-span-2">
                      <label className="text-[10px] text-text-dim uppercase font-semibold tracking-wider">Identificação do Pino</label>
                      <input id="prop-pin-name" type="text" defaultValue={pinData.name || ''} key={comp.id + '-' + selectedPin + '-n'}
                        placeholder="Ex: VCC, GND, IN, OUT..."
                        className="bg-input-bg border border-border/40 text-text text-sm px-3 py-2 rounded-lg focus:border-accent/50 focus:outline-none transition-colors" />
                    </div>
                    <div className="flex flex-col gap-1 col-span-2">
                      <label className="text-[10px] text-text-dim uppercase font-semibold tracking-wider">NET ID</label>
                      <input id="prop-pin-net" type="text" defaultValue={pinData.net || ''} key={comp.id + '-' + selectedPin + '-net'}
                        placeholder="Ex: VCC_MAIN"
                        className="bg-input-bg border border-border/40 text-text text-xs px-2 py-2 rounded-lg focus:border-accent/50 focus:outline-none transition-colors" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-text-dim uppercase font-semibold tracking-wider">Voltagem (V)</label>
                      <input id="prop-pin-voltage" type="text" defaultValue={pinData.voltage || ''} key={comp.id + '-' + selectedPin + '-v'}
                        placeholder="3.8V"
                        className="bg-input-bg border border-border/40 text-text text-xs px-3 py-2 rounded-lg focus:border-accent/50 focus:outline-none transition-colors border-blue-500/20" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-text-dim uppercase font-semibold tracking-wider">Resistência (Ω)</label>
                      <input id="prop-pin-resistance" type="text" defaultValue={pinData.resistance || ''} key={comp.id + '-' + selectedPin + '-r'}
                        placeholder="470Ω"
                        className="bg-input-bg border border-border/40 text-text text-xs px-3 py-2 rounded-lg focus:border-accent/50 focus:outline-none transition-colors border-orange-500/20" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-text-dim uppercase font-semibold tracking-wider">Notas do Pino</label>
                    <textarea id="prop-pin-desc" rows={3} defaultValue={pinData.desc || ''} key={comp.id + '-' + selectedPin + '-d'}
                      placeholder="Observações do pino..."
                      className="bg-input-bg border border-border/40 text-text text-xs px-3 py-2 rounded-lg focus:border-accent/50 focus:outline-none transition-colors resize-none" />
                  </div>
                </div>
              );
            })() : (
              <>
            <div className="grid grid-cols-2 gap-3">
               {/* Name */}
              <div className="flex flex-col gap-1 col-span-2">
                <label className="text-[10px] text-text-dim uppercase font-semibold tracking-wider">Identificação</label>
                <input id="prop-name" type="text" defaultValue={comp.name} key={comp.id + '-n'}
                  className="bg-input-bg border border-border/40 text-text text-sm px-3 py-2 rounded-lg focus:border-accent/50 focus:outline-none transition-colors" />
              </div>

              {/* Type */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-text-dim uppercase font-semibold tracking-wider">Tipo</label>
                <select id="prop-type" defaultValue={COMP_TYPE_OPTIONS.some(o => o.value === comp.compType) ? comp.compType : '__custom__'} key={comp.id + '-t'}
                  onChange={e => {
                    const customInput = document.getElementById('prop-type-custom') as HTMLInputElement;
                    if (customInput) customInput.style.display = e.target.value === '__custom__' ? 'block' : 'none';
                  }}
                  className="bg-input-bg border border-border/40 text-text text-xs px-2 py-2 rounded-lg focus:border-accent/50 focus:outline-none transition-colors">
                  {COMP_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  <option value="__custom__">✏️ Outro...</option>
                </select>
                <input id="prop-type-custom" type="text"
                  defaultValue={COMP_TYPE_OPTIONS.some(o => o.value === comp.compType) ? '' : comp.compType}
                  placeholder="Ex: resistor, diodo, mosfet..."
                  style={{ display: COMP_TYPE_OPTIONS.some(o => o.value === comp.compType) ? 'none' : 'block' }}
                  className="bg-input-bg border border-border/40 text-text text-xs px-2 py-2 rounded-lg focus:border-accent/50 focus:outline-none transition-colors mt-1" />
              </div>

              {/* NET */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-text-dim uppercase font-semibold tracking-wider">NET ID</label>
                <input id="prop-net" type="text" defaultValue={comp.net} key={comp.id + '-ne'}
                  placeholder="Ex: VCC"
                  className="bg-input-bg border border-border/40 text-text text-xs px-2 py-2 rounded-lg focus:border-accent/50 focus:outline-none transition-colors" />
              </div>

               {/* Voltage */}
               <div className="flex flex-col gap-1">
                <label className="text-[10px] text-text-dim uppercase font-semibold tracking-wider">Voltagem (V)</label>
                <input id="prop-voltage" type="text" defaultValue={comp.metadata.voltage} key={comp.id + '-v'}
                  placeholder="3.8V"
                  className="bg-input-bg border border-border/40 text-text text-xs px-3 py-2 rounded-lg focus:border-accent/50 focus:outline-none transition-colors border-blue-500/20" />
              </div>

              {/* Resistance */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-text-dim uppercase font-semibold tracking-wider">Resistência (Ω)</label>
                <input id="prop-resistance" type="text" defaultValue={comp.metadata.resistance} key={comp.id + '-r'}
                  placeholder="470Ω"
                  className="bg-input-bg border border-border/40 text-text text-xs px-3 py-2 rounded-lg focus:border-accent/50 focus:outline-none transition-colors border-orange-500/20" />
              </div>
            </div>

            {/* GND Toggle */}
            <label className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
               <input id="prop-gnd" type="checkbox" defaultChecked={comp.metadata.isGnd} key={comp.id + '-g'} className="w-4 h-4 rounded accent-green-500" />
               <span className="text-[11px] font-bold text-text-dim uppercase tracking-wider">Linha de Terra (GND)</span>
            </label>

            {/* GND Corner Picker — only visible when isGnd is on */}
            {comp.metadata.isGnd && comp.x !== undefined && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-green-400/80 uppercase tracking-wider">Posição do Terra (GND)</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['topLeft', 'topRight', 'centerLeft', 'center', 'centerRight', 'bottomLeft', 'bottomRight'] as const).map(corner => {
                    const labels: Record<string, string> = {
                      topLeft: '↖ Sup. Esq.', topRight: '↗ Sup. Dir.',
                      bottomLeft: '↙ Inf. Esq.', bottomRight: '↘ Inf. Dir.',
                      center: '⊙ Centro',
                      centerLeft: '◁ Esquerda', centerRight: '▷ Direita',
                    };
                    // Place items in correct grid positions
                    const gridPos: Record<string, string> = {
                      topLeft: 'col-start-1', topRight: 'col-start-3',
                      centerLeft: 'col-start-1', center: 'col-start-2', centerRight: 'col-start-3',
                      bottomLeft: 'col-start-1', bottomRight: 'col-start-3',
                    };
                    return (
                      <button key={corner} onClick={() => setGndCorner(corner)}
                        className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${gridPos[corner]} ${
                          gndCorner === corner
                            ? 'bg-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                            : 'bg-white/5 text-text-dim border border-white/10 hover:bg-green-500/10 hover:text-green-400'
                        }`}>
                        {labels[corner]}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* IC Pin Configuration — only for rect components */}
            {comp.x !== undefined && (
              <div className="flex flex-col gap-1.5 p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
                <label className="text-[10px] font-black text-blue-400/80 uppercase tracking-wider">Perninhas do CI (Pinos)</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-text-dim uppercase">Nº de Pinos</label>
                    <input id="prop-pincount" type="number" min={0} max={128} step={2}
                      defaultValue={comp.metadata.pinCount || ''} key={comp.id + '-pc'}
                      placeholder="0 = nenhum"
                      className="bg-input-bg border border-border/40 text-text text-xs px-2 py-1.5 rounded-lg focus:border-blue-500/50 focus:outline-none transition-colors" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-text-dim uppercase">Pino 1 (início)</label>
                    <select id="prop-pinstartcorner" defaultValue={comp.metadata.pinStartCorner || 'topLeft'} key={comp.id + '-psc'}
                      className="bg-input-bg border border-border/40 text-text text-xs px-2 py-1.5 rounded-lg focus:border-blue-500/50 focus:outline-none transition-colors">
                      <option value="topLeft">↖ Sup. Esq.</option>
                      <option value="topRight">↗ Sup. Dir.</option>
                      <option value="bottomLeft">↙ Inf. Esq.</option>
                      <option value="bottomRight">↘ Inf. Dir.</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1 col-span-2 mt-1 border-t border-blue-500/10 pt-2">
                    <label className="text-[9px] text-text-dim uppercase">Ordem dos Pinos</label>
                    <select id="prop-pinnumbering" defaultValue={comp.metadata.pinNumbering || 'sequential'} key={comp.id + '-pn'}
                      className="bg-input-bg border border-border/40 text-text text-xs px-2 py-1.5 rounded-lg focus:border-blue-500/50 focus:outline-none transition-colors">
                      <option value="sequential">Sequencial (U)</option>
                      <option value="alternating">Intercalado (Zig-Zag)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Desc */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-text-dim uppercase font-semibold tracking-wider">Notas Técnicas</label>
              <textarea id="prop-desc" rows={2} defaultValue={comp.metadata.desc} key={comp.id + '-d'}
                placeholder="Pinagem, comportamentos..."
                className="bg-input-bg border border-border/40 text-text text-xs px-3 py-2 rounded-lg focus:border-accent/50 focus:outline-none transition-colors resize-none" />
            </div>
            </>
            )}

            {/* Buttons */}
            <div className="flex gap-2">
              <button onClick={deleteSelected}
                className="flex-1 py-2 rounded-lg text-[11px] font-bold cursor-pointer transition-all bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 uppercase tracking-tighter">
                Excluir
              </button>
              <button onClick={handleSave}
                className={`flex-[2] py-2 rounded-lg text-[11px] font-bold cursor-pointer transition-all uppercase tracking-tighter ${isSaving ? 'bg-green-500/20 text-green-500 border-green-500/40' : 'bg-accent/15 text-accent border border-accent/30 hover:bg-accent/25'}`}>
                {isSaving ? '✓ Salvo Localmente' : 'Salvar Dados'}
              </button>
            </div>

            <div className="h-px bg-border/30" />

            {/* Routing */}
            <button onClick={toggleRoutingMode}
              className={`py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                isRoutingMode
                  ? 'bg-accent text-bg-deep shadow-[0_0_20px_rgba(0,229,255,0.2)]'
                  : 'bg-transparent border border-accent/30 text-accent hover:bg-accent/10'
              }`}>
              <span className="flex items-center justify-center gap-1.5">
                <Plug size={13} />
                {isRoutingMode ? 'Finalizar Conexões' : 'Editar Conexões'}
              </span>
            </button>

            {/* Net Info */}
            {comp.net && (
              <div className="bg-bg-card/40 rounded-lg px-3 py-2 border border-accent/10">
                <p className="text-[10px] text-text-dim uppercase font-semibold mb-1">Rede: {comp.net}</p>
                <p className="text-xs text-accent">{connectedCount} componentes · {connectedWires} fios</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Component List */}
      <div className="h-px bg-border/30" />
      <div className="px-4 py-2 max-h-[140px] overflow-y-auto">
        <p className="text-[10px] text-text-dim uppercase font-semibold tracking-wider mb-1.5">
          Componentes ({components.length})
        </p>
        {components.length === 0 ? (
          <p className="text-xs text-text-dim/50">Nenhum componente ainda</p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {components.slice(0, 20).map(c => {
              const col = COMP_TYPE_COLORS[c.compType] || COMP_TYPE_COLORS.ic;
              return (
                <button key={c.id}
                  onClick={() => selectItem(c.id)}
                  className={`w-full text-left px-2 py-1 text-xs rounded flex items-center gap-2 transition-all cursor-pointer ${
                    c.id === selectedId ? 'bg-accent/10 text-accent' : 'text-text-dim hover:text-text hover:bg-white/5'
                  }`}>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: col.stroke }} />
                  <span className="truncate">{c.name}</span>
                  {c.net && <span className="ml-auto text-[9px] opacity-50 truncate max-w-[60px]">{c.net}</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
