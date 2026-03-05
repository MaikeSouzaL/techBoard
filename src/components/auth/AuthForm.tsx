'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Wrench, Loader2, ArrowRight, User, Lock, Mail, Check } from 'lucide-react';
import { encryptData, decryptData } from '@/lib/crypto';

export default function AuthForm() {
  const router = useRouter();
  const { setUserMode } = useAppStore();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const savedEmail = localStorage.getItem('logiclens_saved_email');
    const savedPassEnc = localStorage.getItem('logiclens_saved_pass');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
    if (savedPassEnc) {
      decryptData(savedPassEnc).then(decrypted => {
        if (decrypted) setPassword(decrypted);
      }).catch(console.error);
    }
  }, []);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const endpoint = authMode === 'login' 
        ? 'http://localhost:5001/api/auth/login'
        : 'http://localhost:5001/api/auth/register';

      const payload = authMode === 'login' 
        ? { email, password }
        : { storeName: name || 'Nova Loja', userName: 'Admin', email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro de autenticação');
      }

      if (data.token) {
        localStorage.setItem('logiclens_token', data.token);
      }

      if (authMode === 'login') {
        if (rememberMe) {
          localStorage.setItem('logiclens_saved_email', email);
          const encrypted = await encryptData(password);
          localStorage.setItem('logiclens_saved_pass', encrypted);
        } else {
          localStorage.removeItem('logiclens_saved_email');
          localStorage.removeItem('logiclens_saved_pass');
        }
        setUserMode('admin');
        router.push('/dashboard');
      } else {
        alert('Loja registrada no MongoDB com sucesso!');
        setAuthMode('login');
      }
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full pl-10 pr-4 py-3 rounded-xl bg-[#12141d]/50 border border-[#1e2030] text-[13px] text-[#e1e2e8] placeholder-[#5c5f77] focus:border-[#3b82f6] focus:bg-[#161921] focus:outline-none transition-all";

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 lg:max-w-[600px] w-full bg-[#0a0b10]">
      <div className="w-full max-w-[400px] bg-[#12141d]/80 backdrop-blur-3xl border border-[#1e2030]/60 rounded-3xl p-10 flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#2563eb] flex items-center justify-center shadow-lg shadow-[#3b82f6]/20 mb-6 shrink-0">
            <Wrench className="w-8 h-8 text-white drop-shadow-md" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
            {authMode === 'login' ? 'Bem-vindo ao TechBoard' : 'Crie sua conta na Nuvem'}
          </h1>
          <p className="text-[#8b8fa3] text-[14px]">
            {authMode === 'login' ? 'Insira suas credenciais para acessar o workspace.' : 'Registre os dados da sua assistência.'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="w-full flex-col">
          <div className="flex bg-[#0c0e15] p-1.5 rounded-xl mb-6 border border-[#1e2030]/50 shadow-inner">
            <button type="button" onClick={() => { setAuthMode('login'); setErrorMsg(''); }} className={`flex-1 text-[13px] font-semibold py-2.5 rounded-lg transition-all ${authMode === 'login' ? 'bg-[#1e2030] text-white shadow-md' : 'text-[#8b8fa3] hover:text-[#e1e2e8]'}`}>Entrar</button>
            <button type="button" onClick={() => { setAuthMode('register'); setErrorMsg(''); }} className={`flex-1 text-[13px] font-semibold py-2.5 rounded-lg transition-all ${authMode === 'register' ? 'bg-[#1e2030] text-white shadow-md' : 'text-[#8b8fa3] hover:text-[#e1e2e8]'}`}>Nova Loja</button>
          </div>

          <div className="space-y-3 mb-8">
            {errorMsg && (
              <div className="p-3 mb-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] text-center">
                {errorMsg}
              </div>
            )}
            
            {authMode === 'register' && (
               <div className="relative">
                 <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5c5f77]" />
                 <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nome da Loja" className={inputClass} required />
               </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5c5f77]" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Endereço de e-mail" className={inputClass} required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5c5f77]" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha mestre" className={inputClass} required />
            </div>
            
            {authMode === 'login' && (
              <label className="flex items-center gap-2 cursor-pointer mt-4 py-1">
                <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${rememberMe ? 'bg-[#3b82f6] border-[#3b82f6]' : 'bg-[#12141d] border-[#1e2030]'}`}>
                  {rememberMe && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-[12px] text-[#8b8fa3] select-none hover:text-[#e1e2e8] transition-colors">Lembrar email e senha</span>
                <input type="checkbox" className="hidden" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              </label>
            )}
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full group relative flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1d4ed8] text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 overflow-hidden shadow-[0_4px_20px_rgba(59,130,246,0.3)] disabled:opacity-70 cursor-pointer"
          >
            {loading ? (
               <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
               <>
                 <span className="relative z-10 text-[14px]">{authMode === 'login' ? 'Acessar Workspace' : 'Criar Conta e Entrar'}</span>
                 <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
               </>
            )}
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          </button>
        </form>
      </div>
      
      <div className="absolute bottom-6 flex items-center gap-2">
        <span className="text-[#3f4257] text-[10px] tracking-[0.1em] font-medium uppercase">
          TechBoard criado por Maike leite • 2026
        </span>
      </div>
    </div>
  );
}
