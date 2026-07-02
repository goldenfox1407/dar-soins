import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

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
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-[#1E293B]">Contactez-nous</h1>
            <p className="text-lg text-slate-600">
              Notre équipe médicale et administrative est à votre disposition 24h/24 et 7j/7 pour répondre à toutes vos questions.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-fade-in" style={{ animationDelay: '0.1s' }}>
            
            {/* Image & Info Side */}
            <div className="relative p-10 lg:p-12 overflow-hidden flex flex-col justify-between">
              <div className="absolute inset-0 z-0">
                <img 
                  src="/images/contact_support.png" 
                  alt="Support médical" 
                  className="w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-blue-600/90" />
              </div>

              <div className="relative z-10 mb-12">
                <h3 className="text-2xl font-bold text-white mb-8">Informations de Contact</h3>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                      <Phone className="text-white" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-blue-100 mb-1">Appelez-nous</p>
                      <p className="text-lg text-white font-semibold">+212 5 00 00 00 00</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                      <Mail className="text-white" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-blue-100 mb-1">Envoyez-nous un email</p>
                      <p className="text-lg text-white font-semibold">contact@dar-soins.ma</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="text-white" size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-blue-100 mb-1">Visitez-nous</p>
                      <p className="text-lg text-white font-semibold">Centre-ville, Casablanca<br/>Maroc</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Form Side */}
            <div className="p-10 lg:p-12 relative z-10 bg-white">
              <h3 className="text-2xl font-bold text-[#1E293B] mb-2">Envoyez un message</h3>
              <p className="text-slate-600 mb-8">Nous vous répondrons dans les plus brefs délais.</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nom Complet</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white border border-slate-300 rounded-md px-4 py-3 text-[#1E293B] placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all"
                      placeholder="Jean Dupont"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-white border border-slate-300 rounded-md px-4 py-3 text-[#1E293B] placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all"
                      placeholder="jean@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Sujet</label>
                  <input 
                    type="text" 
                    required
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    className="w-full bg-white border border-slate-300 rounded-md px-4 py-3 text-[#1E293B] placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all"
                    placeholder="Demande de renseignements"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                  <textarea 
                    rows="5"
                    required
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-white border border-slate-300 rounded-md px-4 py-3 text-[#1E293B] placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all resize-none"
                    placeholder="Comment pouvons-nous vous aider ?"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={status === 'sending'}
                  className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-md font-semibold transition-all shadow-md shadow-blue-500/25 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {status === 'sending' ? 'Envoi en cours...' : 'Envoyer le message'}
                  {status !== 'sending' && <Send size={20} />}
                </button>

                {status === 'success' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-600 text-sm text-center">
                    Votre message a été envoyé avec succès ! Nous vous recontacterons très vite.
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
