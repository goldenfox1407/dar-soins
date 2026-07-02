import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, ShieldPlus, Heart, Clock, Star, CheckCircle, Phone, Stethoscope, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/* ── Animated Counter Hook ── */
function useCountUp(end, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!startOnView) { setStarted(true); return; }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [startOnView]);

  useEffect(() => {
    if (!started) return;
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, end, duration]);

  return { count, ref };
}

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

/* ── Testimonials Data ── */
const TESTIMONIALS = [
  {
    text: "Dar-Soins m'a permis de trouver une infirmière de nuit pour ma mère en moins d'une heure. Le professionnalisme et la bienveillance de l'équipe ont été exceptionnels.",
    author: "Youssef E.",
    city: "Casablanca",
    rating: 5
  },
  {
    text: "Service impeccable ! L'infirmier était ponctuel, très professionnel et a parfaitement géré les soins post-opératoires de mon père. Je recommande à 100%.",
    author: "Fatima Z.",
    city: "Rabat",
    rating: 5
  },
  {
    text: "Grâce à Dar-Soins, j'ai pu recevoir mes injections d'insuline à domicile sans avoir à me déplacer. Un vrai soulagement pour ma santé au quotidien.",
    author: "Ahmed B.",
    city: "Marrakech",
    rating: 5
  }
];

/* ── Steps Data ── */
const STEPS = [
  { number: '01', title: 'Décrivez votre besoin', desc: 'Remplissez le formulaire avec le type de soin et votre localisation GPS.', icon: FileText },
  { number: '02', title: 'Un infirmier est trouvé', desc: 'Notre algorithme localise le soignant certifié le plus proche disponible.', icon: MapPin },
  { number: '03', title: 'Validez votre devis', desc: 'Consultez et acceptez le devis détaillé avant l\'intervention.', icon: CheckCircle },
  { number: '04', title: 'Recevez vos soins', desc: 'L\'infirmier se déplace chez vous et vous prodigue les soins nécessaires.', icon: Stethoscope },
];

export default function Home() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const featuresSection = useOnScreen(0.1);
  const stepsSection = useOnScreen(0.1);
  const statsSection = useOnScreen(0.2);

  const stat1 = useCountUp(1000, 2000);
  const stat2 = useCountUp(50, 1800);
  const stat3 = useCountUp(98, 2200);

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextTestimonial = () => setCurrentTestimonial(prev => (prev + 1) % TESTIMONIALS.length);
  const prevTestimonial = () => setCurrentTestimonial(prev => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-[#1E293B] selection:bg-blue-500/30">
      <Navbar />

      <main className="flex-1">
        {/* ═══════════ HERO ═══════════ */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
            <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-blue-600/5 blur-[120px]" />
            <div className="absolute bottom-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-600/5 blur-[100px]" />
            <div className="absolute top-[20%] left-[30%] w-[30%] h-[30%] rounded-full bg-violet-600/3 blur-[80px]" />
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
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700">
                    directement chez vous.
                  </span>
                </h1>
                
                <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
                  Dar-Soins vous connecte avec les meilleurs infirmiers et gardes-malades qualifiés autour de vous en moins de 15 minutes. Profitez d'une convalescence sereine à domicile.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/services" className="group inline-flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all transform hover:-translate-y-1 shadow-lg shadow-blue-500/25 no-underline">
                    Réserver un soin <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link to="/contact" className="inline-flex justify-center items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-semibold transition-all no-underline shadow-sm hover:shadow-md">
                    <Phone size={18} /> Nous Contacter
                  </Link>
                </div>
                
                {/* Trust indicators */}
                <div className="mt-10 flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex -space-x-2">
                    {['👩‍⚕️', '👨‍⚕️', '👩‍⚕️', '+'].map((emoji, i) => (
                      <div key={i} className={`w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-sm font-bold shadow-sm ${i === 3 ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-700'}`}>
                        {emoji}
                      </div>
                    ))}
                  </div>
                  <p>Plus de <strong className="text-slate-700">1,000</strong> patients nous font confiance</p>
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative animate-slide-left delay-200">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/10 border border-slate-200">
                  <img 
                    src="/images/hero_nursing.png" 
                    alt="Infirmière souriante prodiguant des soins à domicile" 
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent" />
                </div>
                
                {/* Floating Badge */}
                <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-xl flex items-center gap-4 animate-float">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="text-emerald-500" size={24} />
                  </div>
                  <div>
                    <p className="text-slate-800 font-bold text-lg">Certifiés</p>
                    <p className="text-slate-500 text-sm">Infirmiers d'État</p>
                  </div>
                </div>

                {/* Second floating badge */}
                <div className="absolute -top-4 -right-4 bg-white/95 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-200 shadow-xl animate-float" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-2">
                    <Clock className="text-blue-500" size={18} />
                    <span className="font-bold text-slate-800 text-sm">15 min</span>
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5">Temps moyen</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ═══════════ STATS BAND ═══════════ */}
        <section className="py-6 bg-white border-y border-slate-100" ref={statsSection.ref}>
          <div className="max-w-5xl mx-auto px-4 grid grid-cols-3 divide-x divide-slate-200">
            {[
              { countRef: stat1, suffix: '+', label: 'Patients satisfaits', icon: Heart },
              { countRef: stat2, suffix: '+', label: 'Infirmiers certifiés', icon: Stethoscope },
              { countRef: stat3, suffix: '%', label: 'Taux de satisfaction', icon: Star },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} ref={idx === 0 ? stat.countRef.ref : undefined} className="text-center py-4 px-2">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Icon size={20} className="text-blue-500" />
                    <span className="text-3xl lg:text-4xl font-extrabold text-slate-800">
                      {stat.countRef.count}{stat.suffix}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══════════ FEATURES ═══════════ */}
        <section className="py-24 bg-white border-b border-slate-100" ref={featuresSection.ref}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${featuresSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-4 border border-blue-100">Nos Avantages</span>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-800">Pourquoi choisir Dar-Soins ?</h2>
              <p className="text-slate-600 text-lg">Notre plateforme redéfinit la prise en charge médicale à domicile en alliant rapidité, sécurité et humanité.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: MapPin, title: 'Intervention Rapide', desc: 'Notre algorithme trouve l\'infirmier disponible le plus proche de votre position instantanément.', color: 'blue', gradient: 'from-blue-500 to-blue-700' },
                { icon: ShieldPlus, title: 'Sécurité Garantie', desc: 'Tous nos soignants sont certifiés, expérimentés et validés rigoureusement par notre administration.', color: 'emerald', gradient: 'from-emerald-500 to-emerald-700' },
                { icon: Heart, title: 'Suivi Médical Complet', desc: 'Vos constantes et rapports de soins sont enregistrés numériquement dans votre carnet de santé privé.', color: 'violet', gradient: 'from-violet-500 to-violet-700' }
              ].map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={idx} 
                    className={`group bg-white border border-slate-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-500 hover:-translate-y-1 ${featuresSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                    style={{ transitionDelay: `${(idx + 1) * 150}ms` }}
                  >
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br ${feature.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={26} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════ COMMENT ÇA MARCHE ═══════════ */}
        <section className="py-24 bg-gradient-to-b from-slate-50 to-white" ref={stepsSection.ref}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${stepsSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-sm font-semibold mb-4 border border-emerald-100">Simple & Rapide</span>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-800">Comment ça marche ?</h2>
              <p className="text-slate-600 text-lg">En 4 étapes simples, recevez des soins professionnels à domicile.</p>
            </div>

            <div className="grid md:grid-cols-4 gap-6 relative">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-16 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-blue-200 via-blue-300 to-emerald-200 z-0" />
              
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div 
                    key={idx} 
                    className={`relative z-10 text-center transition-all duration-700 ${stepsSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                    style={{ transitionDelay: `${(idx + 1) * 200}ms` }}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white border-2 border-blue-100 flex items-center justify-center mx-auto mb-5 shadow-md hover:shadow-lg transition-shadow hover:border-blue-300 group">
                      <Icon size={28} className="text-blue-600" />
                    </div>
                    <span className="text-xs font-extrabold text-blue-500 tracking-widest mb-2 block">ÉTAPE {step.number}</span>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed max-w-[200px] mx-auto">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════ TESTIMONIALS CAROUSEL ═══════════ */}
        <section className="py-24 bg-white border-y border-slate-100">
          <div className="max-w-4xl mx-auto px-4 text-center relative">
            <span className="inline-block px-4 py-1.5 rounded-full bg-amber-50 text-amber-600 text-sm font-semibold mb-6 border border-amber-100">Témoignages</span>
            
            <div className="relative overflow-hidden" style={{ minHeight: '200px' }}>
              {TESTIMONIALS.map((t, idx) => (
                <div 
                  key={idx}
                  className="transition-all duration-500 absolute inset-0 flex flex-col items-center justify-center px-4"
                  style={{ 
                    opacity: currentTestimonial === idx ? 1 : 0,
                    transform: `translateX(${(idx - currentTestimonial) * 100}%)`,
                    pointerEvents: currentTestimonial === idx ? 'auto' : 'none'
                  }}
                >
                  <div className="flex justify-center gap-1 mb-6">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="text-amber-400 fill-amber-400" size={22} />
                    ))}
                  </div>
                  <h3 className="text-xl md:text-2xl font-medium leading-relaxed mb-6 text-slate-700 max-w-2xl">
                    "{t.text}"
                  </h3>
                  <p className="text-slate-500 font-semibold">— {t.author}, {t.city}</p>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button onClick={prevTestimonial} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors">
                <ChevronLeft size={20} />
              </button>
              <div className="flex gap-2">
                {TESTIMONIALS.map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentTestimonial(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${currentTestimonial === idx ? 'w-8 bg-blue-500' : 'w-2 bg-slate-300'}`}
                  />
                ))}
              </div>
              <button onClick={nextTestimonial} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </section>

        {/* ═══════════ CTA FINALE ═══════════ */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
          </div>
          
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-6 leading-tight">
              Prêt à recevoir des soins <br className="hidden sm:inline"/> de qualité chez vous ?
            </h2>
            <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Rejoignez plus de 1000 patients qui font confiance à Dar-Soins pour leurs soins médicaux à domicile.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/services" className="group inline-flex justify-center items-center gap-2 bg-white hover:bg-blue-50 text-blue-700 px-8 py-4 rounded-xl font-bold transition-all no-underline shadow-xl shadow-black/10 hover:shadow-2xl hover:-translate-y-1">
                Réserver un soin maintenant <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/contact" className="inline-flex justify-center items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-xl font-semibold transition-all no-underline backdrop-blur-sm">
                <Phone size={18} /> Appelez-nous
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
