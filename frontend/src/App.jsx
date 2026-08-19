import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingFallback from './components/common/LoadingFallback';
import './index.css';

// Public & Auth Pages (Lazy loaded)
const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const Contact = lazy(() => import('./pages/Contact'));
const APropos = lazy(() => import('./pages/APropos'));
const Faq = lazy(() => import('./pages/Faq'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

// User Portals
const ClientDashboard = lazy(() => import('./pages/ClientDashboard'));
const InfirmierDashboard = lazy(() => import('./pages/InfirmierDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const ErpComingSoon = lazy(() => import('./components/ErpComingSoon'));

// ERP Modules — Gens & Utilisateurs
const ClientsList = lazy(() => import('./pages/erp/ClientsList'));
const FournisseursList = lazy(() => import('./pages/erp/FournisseursList'));
const UtilisateursList = lazy(() => import('./pages/erp/UtilisateursList'));
const RolesList = lazy(() => import('./pages/erp/RolesList'));
const PermissionsList = lazy(() => import('./pages/erp/PermissionsList'));

// ERP Modules — Produits & Stock
const ProduitsList = lazy(() => import('./pages/erp/ProduitsList'));
const ProduitsCreate = lazy(() => import('./pages/erp/ProduitsCreate'));
const PrintBarcode = lazy(() => import('./pages/erp/PrintBarcode'));
const CategoriesList = lazy(() => import('./pages/erp/CategoriesList'));
const MarquesList = lazy(() => import('./pages/erp/MarquesList'));
const UnitesList = lazy(() => import('./pages/erp/UnitesList'));
const UnitesBaseList = lazy(() => import('./pages/erp/UnitesBaseList'));
const VariationsList = lazy(() => import('./pages/erp/VariationsList'));
const AjustementsList = lazy(() => import('./pages/erp/AjustementsList'));
const AjustementsCreate = lazy(() => import('./pages/erp/AjustementsCreate'));
const TransfertsList = lazy(() => import('./pages/erp/TransfertsList'));
const TransfertsCreate = lazy(() => import('./pages/erp/TransfertsCreate'));

// ERP Modules — Achats & Ventes
const AchatsList = lazy(() => import('./pages/erp/AchatsList'));
const AchatsCreate = lazy(() => import('./pages/erp/AchatsCreate'));
const RetourAchatsList = lazy(() => import('./pages/erp/RetourAchatsList'));
const RetourAchatsCreate = lazy(() => import('./pages/erp/RetourAchatsCreate'));
const VentesList = lazy(() => import('./pages/erp/VentesList'));
const RetourVentesList = lazy(() => import('./pages/erp/RetourVentesList'));
const RetourVentesCreate = lazy(() => import('./pages/erp/RetourVentesCreate'));
const DevisList = lazy(() => import('./pages/erp/DevisList'));

// ERP Modules — RH, Organisation & Contrats
const EmployesList = lazy(() => import('./pages/erp/EmployesList'));
const PresencesList = lazy(() => import('./pages/erp/PresencesList'));
const CongesList = lazy(() => import('./pages/erp/CongesList'));
const PaieList = lazy(() => import('./pages/erp/PaieList'));
const ContratsList = lazy(() => import('./pages/erp/ContratsList'));
const ContratsCreate = lazy(() => import('./pages/erp/ContratsCreate'));
const TachesList = lazy(() => import('./pages/erp/TachesList'));
const CalendrierPage = lazy(() => import('./pages/erp/CalendrierPage'));

// ERP Modules — Paramètres
const EntrepotsList = lazy(() => import('./pages/erp/EntrepotsList'));
const ParametresSysteme = lazy(() => import('./pages/erp/ParametresSysteme'));
const TaxesList = lazy(() => import('./pages/erp/TaxesList'));
const DevisesList = lazy(() => import('./pages/erp/DevisesList'));
const NumerotationSettings = lazy(() => import('./pages/erp/NumerotationSettings'));
const NotificationsSettings = lazy(() => import('./pages/erp/NotificationsSettings'));

// ERP Modules — Rapports & IA
const AiReportsPage = lazy(() => import('./pages/erp/reports/AiReportsPage'));
const RapportStockPage = lazy(() => import('./pages/erp/reports/RapportStockPage'));
const RapportVentesPage = lazy(() => import('./pages/erp/reports/RapportVentesPage'));
const RapportAchatsPage = lazy(() => import('./pages/erp/reports/RapportAchatsPage'));
const RapportCommissionsPage = lazy(() => import('./pages/erp/reports/RapportCommissionsPage'));

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingFallback message="Chargement de l'application Dar-Soins..." />}>
        <Routes>
          {/* Public Website Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/a-propos" element={<APropos />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Portails Utilisateurs Sécurisés */}
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
            
            {/* Gens */}
            <Route path="gens/clients" element={<ClientsList />} />
            <Route path="gens/fournisseurs" element={<FournisseursList />} />
            
            {/* Utilisateurs & Rôles */}
            <Route path="utilisateurs" element={<UtilisateursList />} />
            <Route path="roles" element={<RolesList />} />
            <Route path="permissions" element={<PermissionsList />} />
            
            {/* Produits */}
            <Route path="produits" element={<ProduitsList />} />
            <Route path="produits/create" element={<ProduitsCreate />} />
            <Route path="produits/edit/:id" element={<ProduitsCreate />} />
            <Route path="produits/code-barres" element={<PrintBarcode />} />
            <Route path="produits/categories" element={<CategoriesList />} />
            <Route path="produits/marques" element={<MarquesList />} />
            <Route path="produits/unites" element={<UnitesList />} />
            <Route path="produits/unites-base" element={<UnitesBaseList />} />
            <Route path="produits/variations" element={<VariationsList />} />
            
            {/* Stock */}
            <Route path="ajustements" element={<AjustementsList />} />
            <Route path="ajustements/ajouter" element={<AjustementsCreate />} />
            <Route path="transferts" element={<TransfertsList />} />
            <Route path="transferts/ajouter" element={<TransfertsCreate />} />
            
            {/* Achats & Retours Achats */}
            <Route path="achats" element={<AchatsList />} />
            <Route path="achats/ajouter" element={<AchatsCreate />} />
            <Route path="achats/modifier/:id" element={<AchatsCreate />} />
            <Route path="achats/retour/:id" element={<RetourAchatsCreate />} />
            <Route path="retours/achats" element={<RetourAchatsList />} />
            <Route path="retours/achats/ajouter" element={<RetourAchatsCreate />} />
            
            {/* Ventes & Retours Ventes */}
            <Route path="ventes" element={<VentesList />} />
            <Route path="ventes/ajouter" element={<ErpComingSoon title="Nouvelle Vente" />} />
            <Route path="retours/ventes" element={<RetourVentesList />} />
            <Route path="retours/ventes/ajouter" element={<RetourVentesCreate />} />
            
            {/* Devis */}
            <Route path="devis" element={<DevisList />} />
            
            {/* RH */}
            <Route path="hrm/employes" element={<EmployesList />} />
            <Route path="hrm/presences" element={<PresencesList />} />
            <Route path="hrm/conges" element={<CongesList />} />
            <Route path="hrm/paie" element={<PaieList />} />
            
            {/* Contrats de Garde & Organisation */}
            <Route path="contrats" element={<ContratsList />} />
            <Route path="contrats/ajouter" element={<ContratsCreate />} />
            <Route path="taches" element={<TachesList />} />
            <Route path="calendrier" element={<CalendrierPage />} />
            <Route path="reservations" element={<ErpComingSoon title="Réservations" />} />
            <Route path="commissions" element={<RapportCommissionsPage />} />
            
            {/* Paramètres */}
            <Route path="parametres/systeme" element={<ParametresSysteme />} />
            <Route path="parametres/taxes" element={<TaxesList />} />
            <Route path="parametres/devises" element={<DevisesList />} />
            <Route path="parametres/entrepots" element={<EntrepotsList />} />
            <Route path="parametres/numerotation" element={<NumerotationSettings />} />
            <Route path="parametres/notifications" element={<NotificationsSettings />} />
            
            {/* Rapports & IA */}
            <Route path="ai-reports" element={<AiReportsPage />} />
            <Route path="rapports/stock" element={<RapportStockPage />} />
            <Route path="rapports/ventes" element={<RapportVentesPage />} />
            <Route path="rapports/achats" element={<RapportAchatsPage />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
