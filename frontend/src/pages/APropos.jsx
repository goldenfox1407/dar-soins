import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ShieldCheck, Heart, Users, Clock } from 'lucide-react';

export default function APropos() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-[#1E293B] selection:bg-blue-500/30">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        {/* Header Section */}
        <section className="relative py-20 overflow-hidden text-center">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-100 rounded-full blur-[100px] pointer-events-none" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-[#1E293B]">À propos de Dar-Soins</h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              Dar-Soins est née d'une conviction simple : chaque patient mérite des soins de qualité dans le confort et la chaleur de son foyer.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-3xl font-bold mb-6 text-blue-600">Notre Histoire</h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                Fondée par des professionnels de la santé passionnés, Dar-Soins a été créée pour répondre à un besoin croissant au Maroc : le maintien à domicile dans des conditions de sécurité médicale optimales.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Notre plateforme technologique permet de connecter instantanément les patients avec un réseau d'infirmiers diplômés d'État et de garde-malades certifiés, tout en assurant un suivi médical rigoureux.
              </p>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1000&auto=format&fit=crop" alt="Équipe médicale" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-blue-100/10 mix-blend-multiply" />
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-white py-20 mt-12 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-12 text-[#1E293B]">Nos Valeurs</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { icon: Heart, title: 'Bienveillance', text: 'Le patient au centre de toutes nos attentions.' },
                { icon: ShieldCheck, title: 'Sécurité', text: 'Des professionnels rigoureusement sélectionnés.' },
                { icon: Users, title: 'Proximité', text: 'Un réseau maillé pour intervenir rapidement.' },
                { icon: Clock, title: 'Disponibilité', text: 'Une assistance continue 24h/24 et 7j/7.' }
              ].map((val, i) => (
                <div key={i} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <val.icon size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-[#1E293B]">{val.title}</h3>
                  <p className="text-slate-600">{val.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
