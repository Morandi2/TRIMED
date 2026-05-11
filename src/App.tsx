import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { TenantProvider } from "./context/TenantContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Calendar from "./pages/Calendar";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import RoleBasedHome from "./pages/Dashboard/RoleBasedHome";
import Utilisateur from "./pages/Dashboard/Utilisateur";
import Patient from "./pages/GestionHopital/Patient";
import Consultation from "./pages/GestionHopital/Consultation";
import Medecin from "./pages/GestionHopital/Medecin";
import Medicament from "./pages/GestionHopital/Medicament";
import Ordonnance from "./pages/GestionHopital/Ordonnance";
import Paiement from "./pages/GestionHopital/Paiement";
import RendezVous from "./pages/GestionHopital/RendezVous";
import Configuration from "./pages/GestionHopital/Configuration";
import Index from "./pages/index/Index";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";
import Contact from "./pages/index/Contact";
import PolitiqueConfidentialite from "./pages/index/PolitiqueConfidentialite";
import ConditionsUtilisation from "./pages/index/ConditionsUtilisation";
import CentreAide from "./pages/index/CentreAide";
import { AuditLogPage } from "./pages/GestionHopital/GestionUtilisateur/pages";
import VerifyEmailPage from "./pages/AuthPages/VerifyEmailPage";
import GestionTenants from "./pages/AdminPortal/GestionTenants";

export default function App() {
  return (
    <Router>
      <TenantProvider>
        <AuthProvider>
          <UserProvider>
            <ScrollToTop />
            <Routes>
              {/* Routes Publiques */}
              <Route path="/" element={<Index />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/connexion" element={<SignIn />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/politique-de-confidentialite" element={<PolitiqueConfidentialite />} />
              <Route path="/conditions-utilisation" element={<ConditionsUtilisation />} />
              <Route path="/centre-aide" element={<CentreAide />} />
              <Route path="/verifier-email" element={<VerifyEmailPage />} />
              <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

              {/* Espace Protégé */}
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/home" element={<RoleBasedHome />} />
                <Route path="/Utilisateur" element={<ProtectedRoute requiredPermission="canManageUsers"><Utilisateur /></ProtectedRoute>} />

                {/* Portail Administrateur TRIMED */}
                <Route path="/admin/tenants" element={<ProtectedRoute requiredPermission="canManageSystem"><GestionTenants /></ProtectedRoute>} />

                {/* Gestion de l'Hôpital */}
                <Route path="/patient" element={<ProtectedRoute requiredPermission="canViewPatients"><Patient /></ProtectedRoute>} />
                <Route path="/consultation" element={<ProtectedRoute requiredPermission="canViewConsultations"><Consultation /></ProtectedRoute>} />
                <Route path="/medecin" element={<ProtectedRoute requiredPermission="canViewMedecins"><Medecin /></ProtectedRoute>} />
                <Route path="/medicament" element={<ProtectedRoute requiredPermission="canViewMedicaments"><Medicament /></ProtectedRoute>} />
                <Route path="/ordonnance" element={<ProtectedRoute requiredPermission="canViewOrdonnances"><Ordonnance /></ProtectedRoute>} />
                <Route path="/paiement" element={<ProtectedRoute requiredPermission="canViewPaiements"><Paiement /></ProtectedRoute>} />
                <Route path="/rendezvous" element={<ProtectedRoute requiredPermission="canViewRendezVous"><RendezVous /></ProtectedRoute>} />
                <Route path="/configuration" element={<ProtectedRoute requiredPermission="canManageSystem"><Configuration /></ProtectedRoute>} />
                <Route path="/admin/audit-logs" element={<ProtectedRoute requiredPermission="canViewAuditLogs"><AuditLogPage /></ProtectedRoute>} />

                {/* Autres Pages */}
                <Route path="/profile" element={<UserProfiles />} />
                <Route path="/calendar" element={<ProtectedRoute requiredPermission="canViewCalendar"><Calendar /></ProtectedRoute>} />
              </Route>

              {/* Itinéraire de Secours (Fallback) */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </UserProvider>
        </AuthProvider>
      </TenantProvider>
    </Router>
  );
}
