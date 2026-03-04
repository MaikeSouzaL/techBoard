import { Wrench } from '@/lib/icons';

export default function DashboardWelcome() {
  return (
    <div className="p-5 rounded-xl bg-gradient-to-r from-[#3b82f6]/10 via-[#3b82f6]/5 to-transparent border border-[#3b82f6]/20 shadow-lg shadow-[#3b82f6]/5">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-md bg-[#3b82f6] flex items-center justify-center shadow-md shadow-[#3b82f6]/30 shrink-0">
          <Wrench className="w-3.5 h-3.5 text-white" />
        </div>
        <h3 className="text-[15px] font-bold text-[#e1e2e8] tracking-tight">TechBoard Ecosystem</h3>
      </div>
      <p className="text-[13px] text-[#8b8fa3] leading-relaxed ml-8">
        Ecossistema completo para sua assistência. Do atendimento de balcão e logística de entrada/saída 
        ao diagnóstico técnico avançado com mapeamento de placas PCB por imagem.
      </p>
    </div>
  );
}
