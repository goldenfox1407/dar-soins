import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Menu, X } from 'lucide-react';
import Logo from './Logo';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Check auth
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]); // Re-check auth on route change if needed

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'client') return '/client';
    if (user.role === 'infirmier') return '/infirmier';
    if (user.role === 'gestionnaire') return '/gestionnaire';
    return '/login';
  };

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('auth_token');
    setUser(null);
    setIsMenuOpen(false);
    // Optional: could navigate to / but since we are just updating the navbar, it's fine.
  };

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'À propos', path: '/a-propos' },
    { name: 'Soins & Gardes', path: '/services' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <Link to="/" className="no-underline">
            <Logo size={40} />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className={`text-sm font-medium transition-colors no-underline ${location.pathname === link.path ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-blue-600'}`}
              >
                {link.name}
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center gap-4">
                <Link to={getDashboardLink()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md font-medium transition-colors no-underline">
                  <User size={18} />
                  <span>Mon Espace</span>
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors bg-transparent border-none cursor-pointer"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md font-medium transition-colors no-underline">
                <User size={18} />
                <span>Espace Patient</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-600 p-2 border-none bg-transparent cursor-pointer">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-slate-200 shadow-xl">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-base font-medium no-underline ${location.pathname === link.path ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                {link.name}
              </Link>
            ))}
            
            {user ? (
              <div className="mt-4 flex flex-col gap-2">
                <Link 
                  to={getDashboardLink()} 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md font-medium no-underline w-full"
                >
                  <User size={18} />
                  Mon Espace
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-3 rounded-md font-medium transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                onClick={() => setIsMenuOpen(false)}
                className="block mt-4 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-md font-medium no-underline w-full"
              >
                <User size={18} />
                Se Connecter
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
