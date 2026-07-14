import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, UserCog, Package, ArrowRightLeft, ShoppingCart, TrendingUp, 
  RotateCcw, FileText, Briefcase, Calculator, Repeat, Wrench, 
  FileSignature, CheckSquare, Calendar, Percent, Settings, Brain, 
  BarChart, Menu, X, ChevronDown, ChevronRight, LogOut, Bell, Search
} from 'lucide-react';
import Logo from './Logo';

const MENU_ITEMS = [
  { id: 'gens', title: 'Contacts & Gens', icon: Users, submenus: [
    { title: 'Clients', path: '/gestionnaire/gens/clients' },
    { title: 'Fournisseurs', path: '/gestionnaire/gens/fournisseurs' }
  ]},
  { id: 'users', title: 'Utilisateurs', icon: UserCog, submenus: [
    { title: 'Liste des Utilisateurs', path: '/gestionnaire/utilisateurs' },
    { title: 'Rôles', path: '/gestionnaire/roles' }
  ]},
  { id: 'produits', title: 'Produits', icon: Package, submenus: [
    { title: 'Liste des produits', path: '/gestionnaire/produits' },
    { title: 'Ajouter Produit', path: '/gestionnaire/produits/create' },
    { title: 'Imprimer Code-barres', path: '/gestionnaire/produits/code-barres' },
    { title: 'Catégories', path: '/gestionnaire/produits/categories' },
    { title: 'Marques', path: '/gestionnaire/produits/marques' },
    { title: 'Unités', path: '/gestionnaire/produits/unites' },
    { title: 'Unités de base', path: '/gestionnaire/produits/unites-base' },
    { title: 'Variations', path: '/gestionnaire/produits/variations' }
  ]},
  { id: 'stock_adj', title: 'Gestion des Stocks', icon: ArrowRightLeft, submenus: [
    { title: 'Ajustements', path: '/gestionnaire/ajustements' },
    { title: 'Transferts', path: '/gestionnaire/transferts' }
  ]},
  { id: 'achats', title: 'Achats', icon: ShoppingCart, submenus: [
    { title: 'Liste des achats', path: '/gestionnaire/achats' },
    { title: 'Ajouter Achat', path: '/gestionnaire/achats/ajouter' },
    { title: 'Retours achats', path: '/gestionnaire/retours/achats' }
  ]},
  { id: 'ventes', title: 'Ventes', icon: TrendingUp, submenus: [
    { title: 'Liste des ventes', path: '/gestionnaire/ventes' },
    { title: 'Retours ventes', path: '/gestionnaire/retours/ventes' },
    { title: 'Devis', path: '/gestionnaire/devis' }
  ]},
  { id: 'hrm', title: 'Ressources Humaines', icon: Briefcase, submenus: [
    { title: 'Employés', path: '/gestionnaire/hrm/employes' },
    { title: 'Présences', path: '/gestionnaire/hrm/presences' },
    { title: 'Congés', path: '/gestionnaire/hrm/conges' },
    { title: 'Paie', path: '/gestionnaire/hrm/paie' }
  ]},
  { id: 'compta', title: 'Comptabilité', icon: Calculator, submenus: [
    { title: 'Comptes', path: '/gestionnaire/compta/comptes' },
    { title: 'Dépôts', path: '/gestionnaire/compta/depots' },
    { title: 'Dépenses', path: '/gestionnaire/compta/depenses' },
    { title: 'Transferts', path: '/gestionnaire/compta/transferts' }
  ]},
  { id: 'service', title: 'Services & Contrats', icon: Wrench, submenus: [
    { title: 'Services', path: '/gestionnaire/services' },
    { title: 'Abonnements', path: '/gestionnaire/abonnements' },
    { title: 'Contrats', path: '/gestionnaire/contrats' }
  ]},
  { id: 'taches', title: 'Organisation', icon: CheckSquare, submenus: [
    { title: 'Tâches', path: '/gestionnaire/taches' },
    { title: 'Calendrier', path: '/gestionnaire/calendrier' }
  ]},
  { id: 'rapp', title: 'Rapports & IA', icon: Brain, submenus: [
    { title: 'AI Reports', path: '/gestionnaire/ai-reports' },
    { title: 'Stock', path: '/gestionnaire/rapports/stock' },
    { title: 'Ventes', path: '/gestionnaire/rapports/ventes' },
    { title: 'Achats', path: '/gestionnaire/rapports/achats' },
    { title: 'Commissions', path: '/gestionnaire/commissions' }
  ]},
  { id: 'parametres', title: 'Paramètres', icon: Settings, submenus: [
    { title: 'Système', path: '/gestionnaire/parametres/systeme' },
    { title: 'Taxes', path: '/gestionnaire/parametres/taxes' },
    { title: 'Devises', path: '/gestionnaire/parametres/devises' },
    { title: 'Entrepôts', path: '/gestionnaire/parametres/entrepots' },
    { title: 'Numérotation', path: '/gestionnaire/parametres/numerotation' },
    { title: 'Notifications', path: '/gestionnaire/parametres/notifications' }
  ]},
];

const SidebarItem = ({ item, isOpen, toggleOpen, currentPath }) => {
  const Icon = item.icon;
  const isExpanded = isOpen === item.id;
  
  const hasActiveSub = item.submenus && item.submenus.some(sub => currentPath.startsWith(sub.path));
  
  if (item.submenus) {
    return (
      <div className="erp-sidebar-item">
        <button 
          onClick={() => toggleOpen(isExpanded ? null : item.id)} 
          className={`erp-sidebar-btn ${isExpanded ? 'expanded' : ''} ${hasActiveSub ? 'child-active' : ''}`}
        >
          <div className="erp-sidebar-btn-content">
            <Icon size={18} className="erp-sidebar-icon" />
            <span className="erp-sidebar-label">{item.title}</span>
          </div>
          <ChevronRight 
            size={16} 
            className={`erp-sidebar-chevron ${isExpanded ? 'rotate-90' : ''}`} 
          />
        </button>
        <div className={`erp-sidebar-submenus ${isExpanded ? 'open' : ''}`}>
          {item.submenus.map((sub, idx) => (
            <NavLink 
              key={idx} 
              to={sub.path} 
              className={({isActive}) => `erp-sidebar-sub-link ${isActive ? 'active-sub' : ''}`}
            >
              {sub.title}
            </NavLink>
          ))}
        </div>
      </div>
    );
  }

  return (
    <NavLink 
      to={item.path} 
      className={({isActive}) => `erp-sidebar-btn ${isActive ? 'active-sub' : ''}`}
    >
      <div className="erp-sidebar-btn-content">
        <Icon size={18} className="erp-sidebar-icon" />
        <span className="erp-sidebar-label">{item.title}</span>
      </div>
    </NavLink>
  );
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="erp-layout">
      {/* SIDEBAR */}
      <aside className={`erp-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="erp-sidebar-header">
          <div className="erp-brand" onClick={() => navigate('/gestionnaire')} style={{ cursor: 'pointer' }}>
            <Logo size={36} light={false} />
            <span className="erp-brand-text-badge" style={{ fontSize: '0.65rem', background: 'rgba(37, 99, 235, 0.15)', color: '#2563EB', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', marginLeft: '-4px' }}>ERP</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="erp-sidebar-close lg:hidden">
            <X size={20} />
          </button>
        </div>
        
        <div className="erp-sidebar-menu custom-scrollbar">
          <div className="erp-sidebar-section">Menu Principal</div>
          {MENU_ITEMS.map((item) => (
            <SidebarItem 
              key={item.id} 
              item={item} 
              isOpen={openMenuId} 
              toggleOpen={setOpenMenuId} 
              currentPath={location.pathname}
            />
          ))}
        </div>
        
        <div className="erp-sidebar-footer">
          <div className="erp-user-profile">
            <div className="erp-avatar">A</div>
            <div className="erp-user-info">
              <p className="erp-user-name">Admin User</p>
              <p className="erp-user-role">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="erp-main">
        {/* TOPBAR */}
        <header className="erp-topbar">
          <div className="erp-topbar-left">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="erp-menu-trigger"
            >
              <Menu size={20} />
            </button>
            <div className="erp-searchbar">
              <Search size={16} className="erp-search-icon" />
              <input type="text" placeholder="Rechercher (Ctrl+K)..." className="erp-search-input" />
            </div>
          </div>

          <div className="erp-topbar-right">
            <button className="erp-icon-btn">
              <Bell size={18} />
              <span className="erp-badge">3</span>
            </button>
            
            <button 
              onClick={handleLogout}
              className="erp-logout-btn"
            >
              <LogOut size={16} />
              <span>Déconnexion</span>
            </button>
          </div>
        </header>

        {/* PAGE CONTENT (Outlet) */}
        <div className="erp-content-area custom-scrollbar">
          <div className="erp-content-container">
            <Outlet />
          </div>
        </div>
      </main>

      {/* EMBEDDED CSS FOR EXTREME PREMIUM ERP FEEL */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        :root {
          --bg-app: #F8FAFC;
          --text-main: #1E293B;
          --primary-color: #2563EB;
          --primary-light: rgba(37, 99, 235, 0.1);
          --primary-glow: rgba(37, 99, 235, 0.2);
          --card-border: #E2E8F0;
        }

        .erp-layout {
          display: flex;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          background: var(--bg-app);
          color: var(--text-main);
          font-family: 'Inter', sans-serif;
        }

        /* SIDEBAR */
        .erp-sidebar {
          width: 280px;
          min-width: 280px;
          flex-shrink: 0;
          background: #FFFFFF;
          border-right: 1px solid var(--card-border);
          display: flex;
          flex-direction: column;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 50;
          overflow: hidden;
        }
        .erp-sidebar.closed {
          width: 0;
          min-width: 0;
          border-right: none;
          transform: translateX(-100%);
          opacity: 0;
        }

        .erp-sidebar-header {
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          border-bottom: 1px solid var(--card-border);
        }

        .erp-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .erp-sidebar-close {
          color: #64748b;
          background: none;
          border: none;
          cursor: pointer;
        }

        .erp-sidebar-menu {
          flex: 1;
          overflow-y: auto;
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .erp-sidebar-section {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          font-weight: 600;
          margin: 10px 0 8px 12px;
        }

        /* SIDEBAR ITEMS */
        .erp-sidebar-item {
          display: flex;
          flex-direction: column;
        }

        .erp-sidebar-btn {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          border-radius: 8px;
          background: transparent;
          border: 1px solid transparent;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .erp-sidebar-btn:hover {
          background: #F1F5F9;
          color: var(--primary-color);
        }

        .erp-sidebar-btn.expanded {
          color: var(--text-main);
        }

        .erp-sidebar-btn.child-active {
          color: var(--primary-color);
        }

        .erp-sidebar-btn-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .erp-sidebar-icon {
          transition: color 0.2s;
        }
        
        .erp-sidebar-btn.child-active .erp-sidebar-icon {
          color: var(--primary-color);
        }

        .erp-sidebar-label {
          font-size: 0.9rem;
          font-weight: 500;
        }

        .erp-sidebar-chevron {
          transition: transform 0.3s ease;
          color: #94a3b8;
        }
        .erp-sidebar-chevron.rotate-90 {
          transform: rotate(90deg);
        }

        /* SUBMENUS */
        .erp-sidebar-submenus {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s;
          opacity: 0;
          display: flex;
          flex-direction: column;
          padding-left: 36px;
          margin-top: 2px;
          position: relative;
        }
        
        .erp-sidebar-submenus::before {
          content: '';
          position: absolute;
          left: 22px;
          top: 0;
          bottom: 12px;
          width: 1px;
          background: var(--card-border);
        }

        .erp-sidebar-submenus.open {
          max-height: 500px;
          opacity: 1;
          margin-bottom: 8px;
        }

        .erp-sidebar-sub-link {
          padding: 8px 12px;
          font-size: 0.85rem;
          color: #64748b;
          text-decoration: none;
          border-radius: 6px;
          transition: all 0.2s ease;
          margin-bottom: 2px;
          position: relative;
        }

        .erp-sidebar-sub-link:hover {
          color: var(--primary-color);
          background: #F1F5F9;
        }

        .erp-sidebar-sub-link.active-sub {
          color: var(--primary-color);
          font-weight: 500;
          background: var(--primary-light);
        }

        /* SIDEBAR FOOTER */
        .erp-sidebar-footer {
          padding: 16px;
          border-top: 1px solid var(--card-border);
        }

        .erp-user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px;
          border-radius: 10px;
          background: #F8FAFC;
          border: 1px solid var(--card-border);
          cursor: pointer;
          transition: background 0.2s;
        }
        .erp-user-profile:hover {
          background: #F1F5F9;
        }

        .erp-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--primary-light);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: var(--primary-color);
        }

        .erp-user-info {
          display: flex;
          flex-direction: column;
        }

        .erp-user-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-main);
          margin: 0;
        }
        .erp-user-role {
          font-size: 0.75rem;
          color: #64748b;
          margin: 0;
        }

        /* MAIN CONTENT AREA */
        .erp-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
          background: var(--bg-app);
        }

        /* TOPBAR */
        .erp-topbar {
          height: 70px;
          min-height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--card-border);
          z-index: 40;
        }

        .erp-topbar-left, .erp-topbar-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .erp-menu-trigger {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .erp-menu-trigger:hover {
          background: #F1F5F9;
          color: var(--text-main);
        }

        .erp-searchbar {
          display: flex;
          align-items: center;
          background: #F8FAFC;
          border: 1px solid var(--card-border);
          border-radius: 8px;
          padding: 0 12px;
          height: 38px;
          width: 300px;
          transition: border-color 0.2s;
        }
        .erp-searchbar:focus-within {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px var(--primary-glow);
        }
        .erp-search-icon {
          color: #64748b;
        }
        .erp-search-input {
          background: transparent;
          border: none;
          color: var(--text-main);
          font-size: 0.85rem;
          padding: 0 10px;
          width: 100%;
          outline: none;
        }
        .erp-search-input::placeholder {
          color: #94a3b8;
        }

        .erp-icon-btn {
          background: transparent;
          border: 1px solid var(--card-border);
          color: #64748b;
          width: 38px;
          height: 38px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          transition: all 0.2s;
        }
        .erp-icon-btn:hover {
          background: #F1F5F9;
          color: var(--text-main);
        }
        .erp-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #ef4444;
          color: white;
          font-size: 0.65rem;
          font-weight: bold;
          min-width: 18px;
          height: 18px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #FFFFFF;
        }

        .erp-logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(239, 68, 68, 0.08);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.15);
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .erp-logout-btn:hover {
          background: rgba(239, 68, 68, 0.12);
          border-color: rgba(239, 68, 68, 0.25);
        }

        /* CONTENT AREA */
        .erp-content-area {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
          background: #F8FAFC;
        }

        .erp-content-container {
          max-width: 1400px;
          margin: 0 auto;
          color: var(--text-main);
        }

        /* SCROLLBAR */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
      `}</style>
    </div>
  );
}
