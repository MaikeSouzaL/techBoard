import Image from 'next/image';
import { Cpu, ChevronRight, Check, Trash2, Upload } from '@/lib/icons';
import { DeviceModel } from '@/lib/types';

interface GuidesPcbPanelProps {
  model: DeviceModel | null;
  userMode: string;
  showPcbImages: boolean;
  setShowPcbImages: (val: boolean) => void;
  uploading: 'front' | 'back' | null;
  onUpload: (side: 'front' | 'back', e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (side: 'front' | 'back') => void;
}

export default function GuidesPcbPanel({ 
  model, 
  userMode, 
  showPcbImages, 
  setShowPcbImages, 
  uploading,
  onUpload, 
  onRemove,
}: GuidesPcbPanelProps) {
  
  if (userMode !== 'admin') return null;

  const hasFront = !!model?.pcbImageFront;
  const hasBack = !!model?.pcbImageBack;
  const hasPcbImages = hasFront || hasBack;

  return (
    <div className="bg-[#161921] rounded-2xl border border-[#1e2030] overflow-hidden transition-all duration-300 hover:border-[#2e3148] shadow-sm">
      <button 
        onClick={() => setShowPcbImages(!showPcbImages)}
        className="w-full flex items-center justify-between p-5 hover:bg-[#1c1f2a] transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#3b82f6]/10 flex items-center justify-center border border-[#3b82f6]/20 shadow-inner">
            <Cpu className="w-5 h-5 text-[#3b82f6]" />
          </div>
          <div className="text-left">
            <h3 className="text-[15px] font-bold text-[#e1e2e8]">Imagens da Placa — {model?.name}</h3>
            <p className="text-[12px] text-[#5c5f77] flex items-center gap-2 mt-0.5 font-medium">
              <span className="flex items-center gap-1">
                {hasFront ? <Check className="w-3 h-3 text-[#22c55e]" /> : <span className="w-1.5 h-1.5 rounded-full bg-[#3f4257]" />} Frente
              </span>
              <span className="w-1 h-1 rounded-full bg-[#2e3148]"></span>
              <span className="flex items-center gap-1">
                {hasBack ? <Check className="w-3 h-3 text-[#22c55e]" /> : <span className="w-1.5 h-1.5 rounded-full bg-[#3f4257]" />} Verso
              </span>
            </p>
          </div>
        </div>
        <ChevronRight className={`w-5 h-5 text-[#5c5f77] transition-transform duration-300 ${showPcbImages ? 'rotate-90' : ''}`} />
      </button>

      {showPcbImages && (
        <div className="px-5 pb-5 pt-2 animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Front Panel */}
            <div className="bg-[#12141d] p-4 rounded-xl border border-[#1e2030]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[12px] font-bold text-[#e1e2e8] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span> Frente da Placa
                </p>
              </div>
              
              {model?.pcbImageFront ? (
                <div className="relative group">
                  <div className="relative w-full aspect-[4/3] rounded-lg bg-[#0a0b10] border border-[#1e2030] overflow-hidden">
                    <Image unoptimized fill src={model.pcbImageFrontClean || model.pcbImageFront} alt="PCB Frente" className="object-contain" />
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1.5 z-20">
                    {model.pcbImageFrontClean && (
                      <span className="px-2.5 py-1 rounded-md bg-[#22c55e]/90 text-white text-[11px] font-bold shadow-md flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />Fundo Recortado (IA)
                      </span>
                    )}
                    <button 
                      onClick={() => onRemove('front')} 
                      title="Remover imagem"
                      className="w-8 h-8 rounded-md bg-[#12141d]/95 border border-[#1e2030] text-[#ef4444] flex items-center justify-center hover:bg-[#ef4444] hover:text-white cursor-pointer shadow-md transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {uploading === 'front' && (
                    <div className="absolute inset-0 bg-[#0a0b10]/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center animate-in fade-in">
                      <div className="w-6 h-6 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin mb-2" />
                      <span className="text-[12px] font-medium text-[#3b82f6]">Processando IA...</span>
                    </div>
                  )}
                </div>
              ) : (
                <label className={`w-full aspect-[4/3] rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-all relative ${uploading === 'front' ? 'border-[#3b82f6]/40 bg-[#3b82f6]/5 cursor-wait' : 'border-[#2e3148] cursor-pointer hover:border-[#3b82f6]/50 hover:bg-[#3b82f6]/5'}`}>
                  {uploading === 'front' ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/30 flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="text-[13px] font-bold text-[#3b82f6] block">IA Processando...</span>
                        <span className="text-[11px] text-[#5c5f77] mt-0.5 block">Removendo fundo da imagem</span>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-[#1e2030] flex items-center justify-center mb-3">
                        <Upload className="w-5 h-5 text-[#8b8fa3]" />
                      </div>
                      <span className="text-[13px] font-medium text-[#e1e2e8]">Enviar Foto Lateral (A)</span>
                      <span className="text-[11px] text-[#5c5f77] mt-1">PNG ou JPG até 10MB</span>
                      <span className="text-[10px] text-[#3b82f6] mt-1.5 font-medium">✨ IA remove o fundo automaticamente</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" disabled={!!uploading} onChange={e => onUpload('front', e)} />
                </label>
              )}
            </div>

            {/* Back Panel */}
            <div className="bg-[#12141d] p-4 rounded-xl border border-[#1e2030]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[12px] font-bold text-[#e1e2e8] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span> Verso da Placa
                </p>
              </div>
              
              {model?.pcbImageBack ? (
                <div className="relative group">
                  <div className="relative w-full aspect-[4/3] rounded-lg bg-[#0a0b10] border border-[#1e2030] overflow-hidden">
                    <Image unoptimized fill src={model.pcbImageBackClean || model.pcbImageBack} alt="PCB Verso" className="object-contain" />
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1.5 z-20">
                    {model.pcbImageBackClean && (
                      <span className="px-2.5 py-1 rounded-md bg-[#22c55e]/90 text-white text-[11px] font-bold shadow-md flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />Fundo Recortado (IA)
                      </span>
                    )}
                    <button 
                      onClick={() => onRemove('back')} 
                      title="Remover imagem"
                      className="w-8 h-8 rounded-md bg-[#12141d]/95 border border-[#1e2030] text-[#ef4444] flex items-center justify-center hover:bg-[#ef4444] hover:text-white cursor-pointer shadow-md transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {uploading === 'back' && (
                    <div className="absolute inset-0 bg-[#0a0b10]/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center animate-in fade-in">
                      <div className="w-6 h-6 border-2 border-[#f59e0b] border-t-transparent rounded-full animate-spin mb-2" />
                      <span className="text-[12px] font-medium text-[#f59e0b]">Processando IA...</span>
                    </div>
                  )}
                </div>
              ) : (
                <label className={`w-full aspect-[4/3] rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-all relative ${uploading === 'back' ? 'border-[#f59e0b]/40 bg-[#f59e0b]/5 cursor-wait' : 'border-[#2e3148] cursor-pointer hover:border-[#f59e0b]/50 hover:bg-[#f59e0b]/5'}`}>
                  {uploading === 'back' ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/30 flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-[#f59e0b] border-t-transparent rounded-full animate-spin" />
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="text-[13px] font-bold text-[#f59e0b] block">IA Processando...</span>
                        <span className="text-[11px] text-[#5c5f77] mt-0.5 block">Removendo fundo da imagem</span>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-[#1e2030] flex items-center justify-center mb-3">
                        <Upload className="w-5 h-5 text-[#8b8fa3]" />
                      </div>
                      <span className="text-[13px] font-medium text-[#e1e2e8]">Enviar Foto Lateral (B)</span>
                      <span className="text-[11px] text-[#5c5f77] mt-1">PNG ou JPG até 10MB</span>
                      <span className="text-[10px] text-[#f59e0b] mt-1.5 font-medium">✨ IA remove o fundo automaticamente</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" disabled={!!uploading} onChange={e => onUpload('back', e)} />
                </label>
              )}
            </div>
          </div>

          {hasPcbImages && (
            <div className="mt-4 p-3 rounded-lg bg-[#3b82f6]/5 border border-[#3b82f6]/10 text-center">
              <p className="text-[12px] text-[#8b8fa3] font-medium">As imagens escaneadas serão compartilhadas com todos os guias de reparo técnicos deste modelo de placa.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
