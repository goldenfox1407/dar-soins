import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('sending');
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-[#1E293B] selection:bg-blue-500/30">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-6 border border-blue-100">Support 24/7</span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-[#1E293B]">Contactez-nous</h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Notre équipe médicale et administrative est à votre disposition pour répondre à toutes vos questions.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-0 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg shadow-slate-200/50 animate-slide-up delay-200">
            
            {/* Info Side */}
            <div className="relative p-10 lg:p-12 overflow-hidden flex flex-col justify-between">
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
              <div className="absolute inset-0 z-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
              </div>

              <div className="relative z-10 mb-12">
                <h3 className="text-2xl font-bold text-white mb-8">Informations de Contact</h3>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4 group">
                    <div className="w-12 h-12 bg-white/15 group-hover:bg-white/25 rounded-xl flex items-center justify-center shrink-0 transition-colors">
                      <Phone className="text-white" size={22} />
                    </div>
                    <div>
                      <p className="text-sm text-blue-200 mb-1">Appelez-nous</p>
                      <p className="text-lg text-white font-semibold">+212 5 00 00 00 00</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4 group">
                    <div className="w-12 h-12 bg-white/15 group-hover:bg-white/25 rounded-xl flex items-center justify-center shrink-0 transition-colors">
                      <Mail className="text-white" size={22} />
                    </div>
                    <div>
                      <p className="text-sm text-blue-200 mb-1">Envoyez-nous un email</p>
                      <p className="text-lg text-white font-semibold">contact@dar-soins.ma</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4 group">
                    <div className="w-12 h-12 bg-white/15 group-hover:bg-white/25 rounded-xl flex items-center justify-center shrink-0 transition-colors">
                      <MapPin className="text-white" size={22} />
                    </div>
                    <div>
                      <p className="text-sm text-blue-200 mb-1">Visitez-nous</p>
                      <p className="text-lg text-white font-semibold">Centre-ville, Casablanca<br/>Maroc</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Form Side */}
            <div className="p-10 lg:p-12 relative z-10 bg-white">
              <h3 className="text-2xl font-bold text-[#1E293B] mb-2">Envoyez un message</h3>
              <p className="text-slate-500 mb-8">Nous vous répondrons dans les plus brefs délais.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nom Complet</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#1E293B] placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all"
                      placeholder="Jean Dupont"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#1E293B] placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all"
                      placeholder="jean@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sujet</label>
                  <input 
                    type="text" 
                    required
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#1E293B] placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all"
                    placeholder="Demande de renseignements"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Message</label>
                  <textarea 
                    rows="5"
                    required
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#1E293B] placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all resize-none"
                    placeholder="Comment pouvons-nous vous aider ?"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={status === 'sending'}
                  className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/25 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
                >
                  {status === 'sending' ? 'Envoi en cours...' : 'Envoyer le message'}
                  {status !== 'sending' && <Send size={18} />}
                </button>

                {status === 'success' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm text-center flex items-center justify-center gap-2 animate-fade-in">
                    <CheckCircle size={18} />
                    Votre message a été envoyé avec succès !
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
