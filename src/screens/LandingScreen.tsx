'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import AuthHero from '@/components/auth/AuthHero';
import AuthForm from '@/components/auth/AuthForm';

export default function LandingScreen() {
  const { setUserMode } = useAppStore();
  
  useEffect(() => {
    setUserMode('admin'); // Forçar modo admin na loja principal
  }, [setUserMode]);

  return (
    <div className="min-h-screen bg-[#0a0b10] flex overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#3b82f6]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#8b5cf6]/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Left Panel - Image Area */}
      <AuthHero />

      {/* Right Panel - Form Area */}
      <AuthForm />
    </div>
  );
}
