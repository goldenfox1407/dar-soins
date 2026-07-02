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

// ERP Pages Imports
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
import AchatsList from './pages/erp/AchatsList';
import VentesList from './pages/erp/VentesList';
import RetoursVentes from './pages/erp/RetoursVentes';
import RetoursAchats from './pages/erp/RetoursAchats';
import DevisList from './pages/erp/DevisList';
import TransfertsList from './pages/erp/TransfertsList';
import EmployesList from './pages/erp/EmployesList';
import PresencesList from './pages/erp/PresencesList';
import CongesList from './pages/erp/CongesList';
import PaieList from './pages/erp/PaieList';
import ComptesList from './pages/erp/ComptesList';
import DepotsList from './pages/erp/DepotsList';
import DepensesList from './pages/erp/DepensesList';
import TransfertsFinanciers from './pages/erp/TransfertsFinanciers';
import AbonnementsList from './pages/erp/AbonnementsList';
import ServicesList from './pages/erp/ServicesList';
import ContratsList from './pages/erp/ContratsList';
import TachesList from './pages/erp/TachesList';
import ReservationsList from './pages/erp/ReservationsList';
import CommissionsList from './pages/erp/CommissionsList';
import ParametresSysteme from './pages/erp/ParametresSysteme';
import TaxesList from './pages/erp/TaxesList';
import DevisesList from './pages/erp/DevisesList';
import EntrepotsList from './pages/erp/EntrepotsList';
import AiReports from './pages/erp/AiReports';
import RapportStock from './pages/erp/RapportStock';
import RapportVentes from './pages/erp/RapportVentes';
import RapportAchats from './pages/erp/RapportAchats';
// Reusing generic pages where specific ones aren't generated yet
import ErpPage from './pages/ErpPage';

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
        
        {/* Nouveau ERP Layout pour Gestionnaire */}
        <Route path="/gestionnaire" element={
          <ProtectedRoute allowedRoles={['gestionnaire']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          
          <Route path="gens/clients" element={<ClientsList />} />
          <Route path="gens/fournisseurs" element={<FournisseursList />} />
          
          <Route path="utilisateurs" element={<UtilisateursList />} />
          <Route path="roles" element={<RolesList />} />
          <Route path="permissions" element={<PermissionsList />} />
          
          <Route path="produits" element={<ProduitsList />} />
          <Route path="produits/create" element={<ProduitsCreate />} />
          <Route path="produits/code-barres" element={<PrintBarcode />} />
          <Route path="produits/categories" element={<CategoriesList />} />
          <Route path="produits/marques" element={<MarquesList />} />
          <Route path="produits/unites" element={<UnitesList />} />
          <Route path="produits/unites-base" element={<UnitesBaseList />} />
          <Route path="produits/variations" element={<VariationsList />} />
          
          <Route path="ajustements" element={<AjustementsList />} />
          <Route path="ajustements/ajouter" element={<ErpPage />} />
          
          <Route path="achats" element={<AchatsList />} />
          <Route path="achats/ajouter" element={<ErpPage />} />
          
          <Route path="ventes" element={<VentesList />} />
          <Route path="ventes/ajouter" element={<ErpPage />} />
          
          <Route path="retours/ventes" element={<RetoursVentes />} />
          <Route path="retours/achats" element={<RetoursAchats />} />
          
          <Route path="devis" element={<DevisList />} />
          <Route path="transferts" element={<TransfertsList />} />
          
          <Route path="hrm/employes" element={<EmployesList />} />
          <Route path="hrm/presences" element={<PresencesList />} />
          <Route path="hrm/conges" element={<CongesList />} />
          <Route path="hrm/paie" element={<PaieList />} />
          
          <Route path="compta/comptes" element={<ComptesList />} />
          <Route path="compta/depots" element={<DepotsList />} />
          <Route path="compta/depenses" element={<DepensesList />} />
          <Route path="compta/transferts" element={<TransfertsFinanciers />} />
          
          <Route path="abonnements" element={<AbonnementsList />} />
          <Route path="services" element={<ServicesList />} />
          <Route path="contrats" element={<ContratsList />} />
          <Route path="taches" element={<TachesList />} />
          <Route path="reservations" element={<ReservationsList />} />
          <Route path="commissions" element={<CommissionsList />} />
          
          <Route path="parametres/systeme" element={<ParametresSysteme />} />
          <Route path="parametres/taxes" element={<TaxesList />} />
          <Route path="parametres/devises" element={<DevisesList />} />
          <Route path="parametres/entrepots" element={<EntrepotsList />} />
          
          <Route path="ai-reports" element={<AiReports />} />
          <Route path="rapports/stock" element={<RapportStock />} />
          <Route path="rapports/ventes" element={<RapportVentes />} />
          <Route path="rapports/achats" element={<RapportAchats />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
