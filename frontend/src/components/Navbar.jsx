import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Menu, X, LogOut } from 'lucide-react';
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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

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
  };

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'À propos', path: '/a-propos' },
    { name: 'Soins & Gardes', path: '/services' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-white/95 backdrop-blur-xl shadow-sm shadow-slate-200/50 py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <Link to="/" className="no-underline">
            <Logo size={40} />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className={`relative text-sm font-medium transition-colors no-underline px-4 py-2 rounded-lg ${
                  location.pathname === link.path 
                    ? 'text-blue-600 font-bold bg-blue-50' 
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-blue-600 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to={getDashboardLink()} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-xl font-medium transition-all no-underline shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5">
                  <User size={18} />
                  <span>Mon Espace</span>
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 transition-all bg-transparent border-none cursor-pointer px-3 py-2 rounded-lg"
                >
                  <LogOut size={16} /> Déconnexion
                </button>
              </>
            ) : (
              <Link to="/login" className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-xl font-medium transition-all no-underline shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5">
                <User size={18} />
                <span>Espace Patient</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-600 p-2 border-none bg-transparent cursor-pointer rounded-lg hover:bg-slate-100 transition-colors">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/98 backdrop-blur-xl border-t border-slate-100 shadow-xl animate-slide-down">
          <div className="px-4 pt-3 pb-6 space-y-1">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-medium no-underline transition-all ${
                  location.pathname === link.path 
                    ? 'bg-blue-50 text-blue-600 font-bold' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="pt-3 mt-2 border-t border-slate-100">
              {user ? (
                <div className="flex flex-col gap-2">
                  <Link 
                    to={getDashboardLink()} 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3.5 rounded-xl font-semibold no-underline w-full shadow-md"
                  >
                    <User size={18} /> Mon Espace
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-3 rounded-xl font-medium transition-colors"
                  >
                    <LogOut size={16} /> Déconnexion
                  </button>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3.5 rounded-xl font-semibold no-underline w-full shadow-md"
                >
                  <User size={18} /> Se Connecter
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
