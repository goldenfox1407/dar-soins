import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Mail, Lock, LogIn, UserPlus, Map, CheckCircle, Phone, Calendar, User as UserIcon, Search, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function MapUpdater({ center }) {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo(center, 15);
  }, [center, map]);
  return null;
}

export default function Register() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    date_naissance: '',
    email: '',
    telephone: '',
    password: '',
    password_confirmation: '',
    latitude: '',
    longitude: ''
  });
  
  const [address, setAddress] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const detectLocation = () => {
    setIsLocating(true);
    setLocationError('');
    
    if (!navigator.geolocation) {
      setLocationError("La géolocalisation n'est pas supportée par votre navigateur.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lon
        }));
        
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
          .then(res => res.json())
          .then(data => {
            setAddress(data.display_name);
            setIsLocating(false);
          })
          .catch(() => setIsLocating(false));
      },
      (error) => {
        console.error(error);
        setLocationError("Impossible d'obtenir votre position. Veuillez autoriser l'accès au GPS.");
        setIsLocating(false);
      }
    );
  };

  const searchAddress = () => {
    if (!address) return;
    setIsLocating(true);
    setLocationError('');
    
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lon
          }));
          setAddress(data[0].display_name);
        } else {
          setLocationError("Adresse introuvable.");
        }
        setIsLocating(false);
      })
      .catch(() => {
        setLocationError("Erreur lors de la recherche de l'adresse.");
        setIsLocating(false);
      });
  };

  const defaultCenter = formData.latitude ? [formData.latitude, formData.longitude] : [33.5731, -7.5898]; // Casablanca par défaut

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }
    
    setIsLoading(true);
    try {
      const payload = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        password: formData.password,
        telephone: formData.telephone,
        date_naissance: formData.date_naissance,
        latitude: formData.latitude,
        longitude: formData.longitude,
        adresse: address,
        role: 'client'
      };

      const response = await api.post('/register', payload);
      sessionStorage.setItem('auth_token', response.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/client');
    } catch (err) {
      console.error("Registration error", err);
      let errorMsg = 'Erreur lors de la création du compte.';
      if (err.response && err.response.data) {
        errorMsg += '\n\nDétail : ' + (err.response.data.message || '');
        if (err.response.data.errors) {
          errorMsg += '\n' + JSON.stringify(err.response.data.errors, null, 2);
        }
      }
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-[#1E293B] selection:bg-emerald-500/30">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 lg:py-12">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10 w-full max-w-3xl animate-fade-in relative overflow-hidden">
          
          {/* Background decoration */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-blue-50 rounded-full blur-3xl -z-10" />

          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 mx-auto mb-6 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <UserPlus color="white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Rejoignez Dar-Soins</h1>
            <p className="text-slate-500 mt-2">Créez votre compte patient pour commander vos soins à domicile.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            
            {/* Infos personnelles */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nom</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="text" name="nom"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                    placeholder="Votre nom" 
                    value={formData.nom} onChange={handleInputChange} required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Prénom</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="text" name="prenom"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                    placeholder="Votre prénom" 
                    value={formData.prenom} onChange={handleInputChange} required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date de Naissance</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="date" name="date_naissance"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-slate-600"
                    value={formData.date_naissance} onChange={handleInputChange} required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Téléphone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="tel" name="telephone"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                    placeholder="Ex: +212 600 000 000" 
                    value={formData.telephone} onChange={handleInputChange} required
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Géolocalisation */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 flex justify-between items-center">
                <span>Adresse & Position (Nécessaire pour l'infirmier)</span>
                {formData.latitude && <span className="text-emerald-500 text-xs flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full"><CheckCircle size={12}/> Localisé</span>}
              </label>
              
              <div className="flex flex-col gap-4">
                
                {/* Entrée d'adresse manuelle */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-slate-400" />
                    </div>
                    <input 
                      type="text" 
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                      placeholder="Saisissez votre adresse manuellement..." 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchAddress())}
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={searchAddress}
                    className="flex-shrink-0 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-xl transition-colors font-medium shadow-md shadow-blue-500/25"
                  >
                    <Search size={18} /> <span className="hidden sm:inline">Chercher</span>
                  </button>
                </div>

                <div className="flex items-center gap-4 my-2">
                  <div className="flex-1 border-t border-slate-200"></div>
                  <span className="text-slate-400 text-sm font-medium">OU</span>
                  <div className="flex-1 border-t border-slate-200"></div>
                </div>

                <button 
                  type="button" 
                  onClick={detectLocation}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl transition-colors font-medium ${
                    formData.latitude 
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      : 'bg-slate-800 text-white hover:bg-slate-700 shadow-md shadow-slate-300/50'
                  }`}
                >
                  <Map size={18} /> {isLocating ? 'Recherche en cours...' : (formData.latitude ? 'Actualiser ma position GPS' : 'Me géolocaliser automatiquement')}
                </button>

                <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner mt-2 relative">
                  {!formData.latitude && (
                    <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] z-[400] flex items-center justify-center pointer-events-none">
                      <span className="bg-white/90 px-4 py-2 rounded-lg font-semibold text-slate-600 shadow-sm border border-slate-200">
                        Veuillez chercher une adresse ou vous géolocaliser
                      </span>
                    </div>
                  )}
                  <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapUpdater center={defaultCenter} />
                    {formData.latitude && (
                      <Marker position={[formData.latitude, formData.longitude]}>
                        <Popup>Votre domicile</Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>
                {locationError && <p className="text-rose-500 text-xs font-semibold">{locationError}</p>}
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Identifiants */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Adresse Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="email" name="email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                    placeholder="votre@email.com" 
                    value={formData.email} onChange={handleInputChange} required
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
                    type="password" name="password"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                    placeholder="••••••••" 
                    value={formData.password} onChange={handleInputChange} required minLength="6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirmer le mot de passe</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="password" name="password_confirmation"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                    placeholder="••••••••" 
                    value={formData.password_confirmation} onChange={handleInputChange} required minLength="6"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-70 disabled:cursor-not-allowed text-lg"
              >
                {isLoading ? 'Création en cours...' : 'Finaliser mon inscription'}
              </button>
            </div>
            
            <p className="text-center text-slate-500 text-sm mt-6">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="text-emerald-600 font-semibold hover:underline">
                Connectez-vous ici
              </Link>
            </p>

          </form>

        </div>
      </main>

      <Footer />
    </div>
  );
}
