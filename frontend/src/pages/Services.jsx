import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Syringe, Stethoscope, HeartPulse, Activity, CheckCircle2, Package } from 'lucide-react';
import api from '../services/api';

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

export default function Services() {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('soin');
  const navigate = useNavigate();
  const gridSection = useOnScreen(0.05);

  useEffect(() => {
    fetchProduits();
  }, []);

  const fetchProduits = async () => {
    try {
      const res = await api.get('/produits');
      setProduits(res.data.data || res.data || []);
    } catch (error) {
      console.error("Erreur de chargement des produits", error);
    } finally {
      setLoading(false);
    }
  };

  const getIconForService = (nom) => {
    const n = nom.toLowerCase();
    if (n.includes('injection') || n.includes('sang')) return Syringe;
    if (n.includes('garde') || n.includes('nuit')) return HeartPulse;
    if (n.includes('pansement')) return Activity;
    if (n.includes('suivi') || n.includes('consultation')) return Stethoscope;
    return Package; 
  };

  const handleChoisir = (produitId) => {
    const token = sessionStorage.getItem('auth_token');
    if (token) {
      navigate('/client', { state: { selectedProduitId: produitId } });
    } else {
      navigate('/login');
    }
  };

  const displayedProduits = produits.filter(p => p.type === activeTab || (!p.type && activeTab === 'soin'));

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-[#1E293B] selection:bg-blue-500/30">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        
        {/* Page Header */}
        <div className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-white to-[#F8FAFC]" />
            <div className="absolute -top-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-100/40 blur-[120px]" />
            <div className="absolute bottom-0 left-[20%] w-[40%] h-[40%] rounded-full bg-emerald-100/30 blur-[100px]" />
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-6 border border-blue-100">Notre Catalogue</span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-[#1E293B]">Nos Soins & Gardes</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Découvrez notre catalogue complet de prestations médicales à domicile et d'accompagnement par des professionnels diplômés.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-xl mx-auto px-4 mb-12">
          <div className="flex bg-white p-1.5 rounded-xl shadow-sm border border-slate-200">
            <button
              onClick={() => setActiveTab('soin')}
              className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'soin' 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              Soins Infirmiers
            </button>
            <button
              onClick={() => setActiveTab('garde')}
              className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'garde' 
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              Gardes Malades
            </button>
          </div>
        </div>

        {/* Services Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12" ref={gridSection.ref}>
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1,2,3].map(i => (
                <div key={i} className="skeleton-card skeleton" style={{ height: '360px' }} />
              ))}
            </div>
          ) : displayedProduits.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Package className="text-slate-300" size={28} />
              </div>
              <p className="text-slate-500 font-medium">Aucun produit disponible dans cette catégorie.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedProduits.map((produit, idx) => {
                const Icon = getIconForService(produit.nom);
                const isSoin = activeTab === 'soin';

                return (
                  <div 
                    key={produit.id} 
                    className={`bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-500 group hover:-translate-y-2 flex flex-col ${gridSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                    style={{ transitionDelay: `${idx * 100}ms` }}
                  >
                    {/* Image Header */}
                    <div className="h-48 w-full bg-slate-100 relative overflow-hidden">
                      {produit.image ? (
                        <img 
                          src={`http://localhost:8000/storage/${produit.image}`} 
                          alt={produit.nom}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                          <Icon size={48} className="text-slate-300" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm border border-slate-100 text-sm font-bold text-slate-800">
                        {produit.prix_client} MAD
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-slate-800 mb-3">{produit.nom}</h3>
                      <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">
                        {produit.description || "Aucune description détaillée n'est disponible."}
                      </p>
                      
                      <ul className="space-y-3 mb-6">
                        <li className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                          <CheckCircle2 size={16} className={isSoin ? "text-blue-500" : "text-emerald-500"} /> 
                          {isSoin ? "Matériel stérile inclus" : "Personnel qualifié"}
                        </li>
                        <li className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                          <CheckCircle2 size={16} className={isSoin ? "text-blue-500" : "text-emerald-500"} /> 
                          Disponible 7j/7
                        </li>
                      </ul>

                      <button 
                        onClick={() => handleChoisir(produit.id)}
                        className={`w-full text-center py-3 rounded-xl font-semibold transition-all shadow-sm hover:-translate-y-0.5 ${
                          isSoin 
                            ? "bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/20" 
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:shadow-lg hover:shadow-emerald-500/20"
                        }`}
                      >
                        {isSoin ? "Choisir ce soin" : "Choisir cette garde"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
