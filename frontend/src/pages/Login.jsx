import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Mail, Lock, LogIn, UserPlus, ArrowRight } from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    setError('');
    try {
      const response = await api.post('/login', { email, password });
      sessionStorage.setItem('auth_token', response.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data.user));
      navigate(`/${response.data.user.role}`);
    } catch (error) {
      setError("Identifiants incorrects. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const autofillAndLogin = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('password');
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-[#1E293B] selection:bg-blue-500/30">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[10%] left-[10%] w-72 h-72 rounded-full bg-blue-100/50 blur-3xl animate-float" />
          <div className="absolute bottom-[10%] right-[10%] w-96 h-96 rounded-full bg-indigo-100/40 blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-[40%] right-[30%] w-48 h-48 rounded-full bg-emerald-100/30 blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10 w-full max-w-md animate-scale-in relative overflow-hidden">
          
          {/* Top gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600" />

          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 mx-auto mb-6 flex items-center justify-center shadow-lg shadow-blue-500/30 hover:scale-105 transition-transform">
              <Activity color="white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Bienvenue sur Dar-Soins</h1>
            <p className="text-slate-500 mt-2 text-sm">Connectez-vous à votre espace personnel</p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Adresse Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input 
                  type="email" 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-700"
                  placeholder="votre@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mot de passe</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input 
                  type="password" 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-700"
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-70 disabled:cursor-not-allowed mt-2 hover:-translate-y-0.5 active:translate-y-0"
            >
              <LogIn size={20} />
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
            
            <button 
              type="button" 
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 hover:border-blue-300 font-semibold py-3.5 rounded-xl transition-all"
              onClick={() => navigate('/register')}
            >
              <UserPlus size={20} />
              Créer un compte client
            </button>

          </form>

          {/* DEMO MODE */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="divider-text mb-4">
              <span>Mode Démo</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { emoji: '👤', label: 'Patient', email: 'client@dar-soins.com', color: 'blue' },
                { emoji: '⚕️', label: 'Infirmier', email: 'infirmier@dar-soins.com', color: 'emerald' },
                { emoji: '🛡️', label: 'Admin', email: 'admin@dar-soins.com', color: 'violet' }
              ].map((role) => (
                <button 
                  key={role.label}
                  onClick={() => autofillAndLogin(role.email)}
                  className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl bg-slate-50 hover:bg-${role.color}-50 border border-slate-200 hover:border-${role.color}-200 text-slate-700 font-medium transition-all text-xs hover:-translate-y-0.5`}
                >
                  <span className="text-lg">{role.emoji}</span>
                  <span>{role.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
