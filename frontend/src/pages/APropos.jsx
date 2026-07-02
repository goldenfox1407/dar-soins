import React, { useRef, useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ShieldCheck, Heart, Users, Clock } from 'lucide-react';

/* ── Intersection Observer Hook ── */
function useOnScreen(threshold = 0.15) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, isVisible };
}

export default function APropos() {
  const valuesSection = useOnScreen(0.1);
  const storySection = useOnScreen(0.1);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-[#1E293B] selection:bg-blue-500/30">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        {/* Header Section */}
        <section className="relative py-20 overflow-hidden text-center">
          <div className="absolute inset-0 z-0">
            <div className="absolute -top-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-blue-100/40 blur-[120px]" />
            <div className="absolute bottom-0 right-[10%] w-[40%] h-[40%] rounded-full bg-emerald-100/30 blur-[100px]" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 animate-fade-in">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-6 border border-blue-100">Qui sommes-nous ?</span>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-[#1E293B]">À propos de Dar-Soins</h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Dar-Soins est née d'une conviction simple : chaque patient mérite des soins de qualité dans le confort et la chaleur de son foyer.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" ref={storySection.ref}>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className={`transition-all duration-700 ${storySection.isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
              <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-semibold mb-4 border border-emerald-100">Notre Mission</span>
              <h2 className="text-3xl font-bold mb-6 text-slate-800">Notre Histoire</h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                Fondée par des professionnels de la santé passionnés, Dar-Soins a été créée pour répondre à un besoin croissant au Maroc : le maintien à domicile dans des conditions de sécurité médicale optimales.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Notre plateforme technologique permet de connecter instantanément les patients avec un réseau d'infirmiers diplômés d'État et de garde-malades certifiés, tout en assurant un suivi médical rigoureux.
              </p>
            </div>
            <div className={`relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 transition-all duration-700 ${storySection.isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
              <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1000&auto=format&fit=crop" alt="Équipe médicale" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent" />
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-white py-24 mt-12 border-y border-slate-100" ref={valuesSection.ref}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-violet-50 text-violet-600 text-sm font-semibold mb-4 border border-violet-100">Ce qui nous guide</span>
            <h2 className="text-3xl font-bold mb-12 text-[#1E293B]">Nos Valeurs</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: Heart, title: 'Bienveillance', text: 'Le patient au centre de toutes nos attentions.', gradient: 'from-rose-500 to-rose-700' },
                { icon: ShieldCheck, title: 'Sécurité', text: 'Des professionnels rigoureusement sélectionnés.', gradient: 'from-blue-500 to-blue-700' },
                { icon: Users, title: 'Proximité', text: 'Un réseau maillé pour intervenir rapidement.', gradient: 'from-emerald-500 to-emerald-700' },
                { icon: Clock, title: 'Disponibilité', text: 'Une assistance continue 24h/24 et 7j/7.', gradient: 'from-violet-500 to-violet-700' }
              ].map((val, i) => (
                <div 
                  key={i} 
                  className={`bg-white border border-slate-100 p-8 rounded-2xl hover:shadow-lg transition-all duration-500 hover:-translate-y-1 ${valuesSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                  style={{ transitionDelay: `${(i + 1) * 100}ms` }}
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${val.gradient} text-white rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <val.icon size={26} />
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-[#1E293B]">{val.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{val.text}</p>
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
