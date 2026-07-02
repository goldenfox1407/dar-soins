import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="inline-block no-underline mb-4">
              <Logo size={32} />
            </Link>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Des soins infirmiers professionnels et une assistance médicale de qualité, directement à votre domicile, partout au Maroc.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-slate-800 font-bold mb-4 uppercase text-sm tracking-wider">Navigation</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-slate-600 hover:text-blue-600 text-sm no-underline">Accueil</Link></li>
              <li><Link to="/services" className="text-slate-600 hover:text-blue-600 text-sm no-underline">Nos Services</Link></li>
              <li><Link to="/contact" className="text-slate-600 hover:text-blue-600 text-sm no-underline">Contact</Link></li>
              <li><Link to="/login" className="text-slate-600 hover:text-blue-600 text-sm no-underline">Espace Patient</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-slate-800 font-bold mb-4 uppercase text-sm tracking-wider">Nos Soins</h3>
            <ul className="space-y-3">
              <li className="text-slate-600 text-sm">Soins Infirmiers Courants</li>
              <li className="text-slate-600 text-sm">Pansements Simples & Complexes</li>
              <li className="text-slate-600 text-sm">Injections & Perfusions</li>
              <li className="text-slate-600 text-sm">Garde Malade (Jour & Nuit)</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-slate-800 font-bold mb-4 uppercase text-sm tracking-wider">Contactez-nous</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <span className="text-slate-600 text-sm">Centre-ville, Casablanca, Maroc</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-blue-600 shrink-0" />
                <span className="text-slate-600 text-sm">+212 5 00 00 00 00</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-blue-600 shrink-0" />
                <span className="text-slate-600 text-sm">contact@dar-soins.ma</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Dar-Soins Maroc. Tous droits réservés.
          </p>
          <div className="flex gap-6">
            <Link to="#" className="text-slate-500 hover:text-blue-600 text-sm no-underline">Mentions Légales</Link>
            <Link to="#" className="text-slate-500 hover:text-blue-600 text-sm no-underline">Politique de Confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
