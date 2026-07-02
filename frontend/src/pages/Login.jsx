import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    try {
      const response = await api.post('/login', { email, password });
      sessionStorage.setItem('auth_token', response.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data.user));
      navigate(`/${response.data.user.role}`);
    } catch (error) {
      alert("Erreur de connexion. Veuillez vérifier vos identifiants.");
    } finally {
      setIsLoading(false);
    }
  };

  const autofillAndLogin = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('password');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-[#1E293B] selection:bg-blue-500/30">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10 w-full max-w-md animate-fade-in relative overflow-hidden">
          
          {/* Background decoration */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl -z-10" />
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl -z-10" />

          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 mx-auto mb-6 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Activity color="white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Bienvenue sur Dar-Soins</h1>
            <p className="text-slate-500 mt-2 text-sm">Connectez-vous à votre espace personnel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Adresse Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="email" 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-700"
                  placeholder="votre@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mot de passe</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="password" 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-700"
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
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              <LogIn size={20} />
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
            
            <button 
              type="button" 
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 font-semibold py-3.5 rounded-xl transition-all"
              onClick={() => navigate('/register')}
            >
              <UserPlus size={20} />
              Créer un compte client
            </button>

          </form>

          {/* DEMO MODE - Auto fill */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs text-center text-slate-400 uppercase tracking-wider font-semibold mb-4">Mode Démo (Test) : Auto-connexion</p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => autofillAndLogin('client@dar-soins.com')}
                className="text-sm py-2 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors text-left"
              >
                👤 Remplir en tant que <strong>Patient</strong>
              </button>
              <button 
                onClick={() => autofillAndLogin('infirmier@dar-soins.com')}
                className="text-sm py-2 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors text-left"
              >
                ⚕️ Remplir en tant qu'<strong>Infirmier</strong>
              </button>
              <button 
                onClick={() => autofillAndLogin('admin@dar-soins.com')}
                className="text-sm py-2 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors text-left"
              >
                🛡️ Remplir en tant que <strong>Gestionnaire</strong>
              </button>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
