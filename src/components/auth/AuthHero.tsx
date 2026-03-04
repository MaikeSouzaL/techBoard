import Image from 'next/image';

export default function AuthHero() {
  return (
    <div className="hidden lg:flex flex-1 flex-col relative items-center justify-center p-12 overflow-hidden bg-[#0c0e15] z-0">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#3b82f6]/20 via-[#0a0b10]/0 to-[#0a0b10]/0" />
      
      <div className="relative w-full h-[70vh] max-h-[900px] flex items-center justify-center group z-10">
        <Image unoptimized fill src="/Logo_login.png" alt="LogicLens Illustration" className="object-contain transition-transform duration-700 group-hover:scale-[1.03]" />
      </div>

      <div className="-mt-16 mb-10 z-10 flex flex-col items-center text-center">
        <h2 className="text-[32px] font-bold text-white tracking-tight mb-1">TechBoard</h2>
        <p className="text-[#8b8fa3] text-[12px] font-bold tracking-[0.2em] uppercase">GESTÃO 360° • LOGÍSTICA • CRM • REPARO AVANÇADO</p>
      </div>
    </div>
  );
}
