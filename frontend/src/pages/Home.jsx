import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, ShieldPlus, Heart, Clock, Star, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-[#1E293B] selection:bg-blue-500/30">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
            <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-blue-600/5 blur-[120px]" />
            <div className="absolute bottom-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-600/5 blur-[100px]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              
              {/* Hero Text */}
              <div className="max-w-2xl animate-fade-in">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-semibold text-sm mb-6 border border-blue-200">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                  </span>
                  Nouveau au Maroc
                </div>
                
                <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1] text-[#1E293B]">
                  Des soins médicaux <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
                    directement chez vous.
                  </span>
                </h1>
                
                <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
                  Dar-Soins vous connecte avec les meilleurs infirmiers et gardes-malades qualifiés autour de vous en moins de 15 minutes. Profitez d'une convalescence sereine à domicile.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/services" className="inline-flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-md font-semibold transition-all transform hover:-translate-y-1 shadow-md shadow-blue-500/25 no-underline">
                    Réserver un soin <ArrowRight size={20} />
                  </Link>
                  <Link to="/contact" className="inline-flex justify-center items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-md font-semibold transition-all no-underline shadow-sm">
                    Nous Contacter
                  </Link>
                </div>
                
                <div className="mt-10 flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-700">
                        {i === 4 ? '+' : ''}
                      </div>
                    ))}
                  </div>
                  <p>Plus de 1,000 patients nous font confiance</p>
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/10 border border-slate-200">
                  <img 
                    src="/images/hero_nursing.png" 
                    alt="Infirmière souriante prodiguant des soins à domicile" 
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent" />
                </div>
                
                {/* Floating Badge */}
                <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="text-emerald-500" size={24} />
                  </div>
                  <div>
                    <p className="text-slate-800 font-bold text-lg">Certifiés</p>
                    <p className="text-slate-500 text-sm">Infirmiers d'État</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4 text-slate-800">Pourquoi choisir Dar-Soins ?</h2>
              <p className="text-slate-600 text-lg">Notre plateforme redéfinit la prise en charge médicale à domicile en alliant rapidité, sécurité et humanité.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: MapPin, title: 'Intervention Rapide', desc: 'Notre algorithme trouve l\'infirmier disponible le plus proche de votre position instantanément.', color: 'blue' },
                { icon: ShieldPlus, title: 'Sécurité Garantie', desc: 'Tous nos soignants sont certifiés, expérimentés et validés rigoureusement par notre administration.', color: 'emerald' },
                { icon: Heart, title: 'Suivi Médical Complet', desc: 'Vos constantes et rapports de soins sont enregistrés numériquement dans votre carnet de santé privé.', color: 'blue' }
              ].map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={idx} className="bg-slate-50 border border-slate-100 p-8 rounded-2xl hover:shadow-md transition-shadow">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-${feature.color}-100 text-${feature.color}-600`}>
                      <Icon size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        
        {/* Simple Testimonial */}
        <section className="py-24 bg-[#F8FAFC]">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="flex justify-center gap-1 mb-6">
              {[1,2,3,4,5].map(i => <Star key={i} className="text-yellow-400 fill-yellow-400" size={24} />)}
            </div>
            <h3 className="text-2xl md:text-3xl font-medium leading-relaxed mb-8 text-slate-700">
              "Dar-Soins m'a permis de trouver une infirmière de nuit pour ma mère en moins d'une heure. Le professionnalisme et la bienveillance de l'équipe ont été exceptionnels."
            </h3>
            <p className="text-slate-500 font-semibold">— Youssef E., Casablanca</p>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
