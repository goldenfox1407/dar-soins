import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import './index.css';

import ClientDashboard from './pages/ClientDashboard';
import InfirmierDashboard from './pages/InfirmierDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Services from './pages/Services';
import Contact from './pages/Contact';
import ProtectedRoute from './components/ProtectedRoute';
import ErpComingSoon from './components/ErpComingSoon';

// ERP Pages Imports — Fonctionnels
import ClientsList from './pages/erp/ClientsList';
import FournisseursList from './pages/erp/FournisseursList';
import UtilisateursList from './pages/erp/UtilisateursList';
import RolesList from './pages/erp/RolesList';
import PermissionsList from './pages/erp/PermissionsList';
import ProduitsList from './pages/erp/ProduitsList';
import ProduitsCreate from './pages/erp/ProduitsCreate';
import PrintBarcode from './pages/erp/PrintBarcode';
import CategoriesList from './pages/erp/CategoriesList';
import MarquesList from './pages/erp/MarquesList';
import UnitesList from './pages/erp/UnitesList';
import UnitesBaseList from './pages/erp/UnitesBaseList';
import VariationsList from './pages/erp/VariationsList';
import AjustementsList from './pages/erp/AjustementsList';
import AjustementsCreate from './pages/erp/AjustementsCreate';
import TransfertsList from './pages/erp/TransfertsList';
import TransfertsCreate from './pages/erp/TransfertsCreate';
import AchatsList from './pages/erp/AchatsList';
import AchatsCreate from './pages/erp/AchatsCreate';
import AchatsReturn from './pages/erp/AchatsReturn';
import VentesList from './pages/erp/VentesList';
import DevisList from './pages/erp/DevisList';
import EntrepotsList from './pages/erp/EntrepotsList';
import ParametresSysteme from './pages/erp/ParametresSysteme';
import TaxesList from './pages/erp/TaxesList';
import DevisesList from './pages/erp/DevisesList';
import NumerotationSettings from './pages/erp/NumerotationSettings';
import NotificationsSettings from './pages/erp/NotificationsSettings';

import APropos from './pages/APropos';
import Faq from './pages/Faq';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/a-propos" element={<APropos />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/client/*" element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientDashboard />
          </ProtectedRoute>
        } />
        <Route path="/infirmier/*" element={
          <ProtectedRoute allowedRoles={['infirmier']}>
            <InfirmierDashboard />
          </ProtectedRoute>
        } />
        
        {/* ERP Layout pour Gestionnaire */}
        <Route path="/gestionnaire" element={
          <ProtectedRoute allowedRoles={['gestionnaire']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          
          {/* Gens — Fonctionnel */}
          <Route path="gens/clients" element={<ClientsList />} />
          <Route path="gens/fournisseurs" element={<FournisseursList />} />
          
          {/* Utilisateurs & Rôles — Fonctionnel */}
          <Route path="utilisateurs" element={<UtilisateursList />} />
          <Route path="roles" element={<RolesList />} />
          <Route path="permissions" element={<PermissionsList />} />
          
          {/* Produits — Fonctionnel */}
          <Route path="produits" element={<ProduitsList />} />
          <Route path="produits/create" element={<ProduitsCreate />} />
          <Route path="produits/edit/:id" element={<ProduitsCreate />} />
          <Route path="produits/code-barres" element={<PrintBarcode />} />
          <Route path="produits/categories" element={<CategoriesList />} />
          <Route path="produits/marques" element={<MarquesList />} />
          <Route path="produits/unites" element={<UnitesList />} />
          <Route path="produits/unites-base" element={<UnitesBaseList />} />
          <Route path="produits/variations" element={<VariationsList />} />
          
          {/* Stock — Fonctionnel */}
          <Route path="ajustements" element={<AjustementsList />} />
          <Route path="ajustements/ajouter" element={<AjustementsCreate />} />
          <Route path="transferts" element={<TransfertsList />} />
          <Route path="transferts/ajouter" element={<TransfertsCreate />} />
          
          {/* Achats & Ventes — Fonctionnel */}
          <Route path="achats" element={<AchatsList />} />
          <Route path="achats/ajouter" element={<AchatsCreate />} />
          <Route path="achats/modifier/:id" element={<AchatsCreate />} />
          <Route path="achats/retour/:id" element={<AchatsReturn />} />
          <Route path="ventes" element={<VentesList />} />
          <Route path="ventes/ajouter" element={<ErpComingSoon title="Nouvelle Vente" />} />
          
          {/* Retours — En développement */}
          <Route path="retours/ventes" element={<ErpComingSoon title="Retours Ventes" />} />
          <Route path="retours/achats" element={<ErpComingSoon title="Retours Achats" />} />
          
          {/* Devis — Fonctionnel */}
          <Route path="devis" element={<DevisList />} />
          
          {/* RH — En développement */}
          <Route path="hrm/employes" element={<ErpComingSoon title="Employés" description="La gestion des employés, fiches de paie et contrats sera bientôt disponible." />} />
          <Route path="hrm/presences" element={<ErpComingSoon title="Présences" description="Le pointage et le suivi des présences sera bientôt disponible." />} />
          <Route path="hrm/conges" element={<ErpComingSoon title="Congés" description="La gestion des congés et absences sera bientôt disponible." />} />
          <Route path="hrm/paie" element={<ErpComingSoon title="Paie" description="Le module de gestion de la paie sera bientôt disponible." />} />
          
          {/* Comptabilité — En développement */}
          <Route path="compta/comptes" element={<ErpComingSoon title="Comptes Bancaires" description="La gestion des comptes bancaires et soldes sera bientôt disponible." />} />
          <Route path="compta/depots" element={<ErpComingSoon title="Dépôts" description="Le suivi des dépôts bancaires sera bientôt disponible." />} />
          <Route path="compta/depenses" element={<ErpComingSoon title="Dépenses" description="Le suivi des dépenses sera bientôt disponible." />} />
          <Route path="compta/transferts" element={<ErpComingSoon title="Transferts Financiers" description="Les transferts entre comptes seront bientôt disponibles." />} />
          
          {/* Services — En développement */}
          <Route path="abonnements" element={<ErpComingSoon title="Abonnements" />} />
          <Route path="services" element={<ErpComingSoon title="Services" />} />
          <Route path="contrats" element={<ErpComingSoon title="Contrats" />} />
          <Route path="taches" element={<ErpComingSoon title="Tâches" />} />
          <Route path="reservations" element={<ErpComingSoon title="Réservations" />} />
          <Route path="commissions" element={<ErpComingSoon title="Commissions" />} />
          
          {/* Paramètres — Actifs */}
          <Route path="parametres/systeme" element={<ParametresSysteme />} />
          <Route path="parametres/taxes" element={<TaxesList />} />
          <Route path="parametres/devises" element={<DevisesList />} />
          <Route path="parametres/entrepots" element={<EntrepotsList />} />
          <Route path="parametres/numerotation" element={<NumerotationSettings />} />
          <Route path="parametres/notifications" element={<NotificationsSettings />} />
          
          {/* Rapports — En développement */}
          <Route path="ai-reports" element={<ErpComingSoon title="Rapports IA" description="Les rapports générés par intelligence artificielle seront bientôt disponibles." />} />
          <Route path="rapports/stock" element={<ErpComingSoon title="Rapport de Stock" />} />
          <Route path="rapports/ventes" element={<ErpComingSoon title="Rapport des Ventes" />} />
          <Route path="rapports/achats" element={<ErpComingSoon title="Rapport des Achats" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
