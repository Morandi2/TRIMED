import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { TenantProvider } from "./context/TenantContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Portail from "./pages/index/portail/Portail";
import { reveillerServeur } from "./utils/reveilServeur";
import { modules } from "./routes/modules";

// Le portail est la seule page chargée d’emblée. Les autres pages (et leurs bibliothèques :
// graphiques, calendrier…) ne sont téléchargées que lorsqu’on les ouvre.
const SignIn = lazy(() => import("./pages/AuthPages/SignIn"));
const SignUp = lazy(() => import("./pages/AuthPages/SignUp"));
const ForgotPassword = lazy(() => import("./pages/AuthPages/ForgotPassword"));
const VerifyEmailPage = lazy(() => import("./pages/AuthPages/VerifyEmailPage"));
const Contact = lazy(() => import("./pages/index/Contact"));
const PolitiqueConfidentialite = lazy(() => import("./pages/index/PolitiqueConfidentialite"));
const ConditionsUtilisation = lazy(() => import("./pages/index/ConditionsUtilisation"));
const CentreAide = lazy(() => import("./pages/index/CentreAide"));
const NotFound = lazy(() => import("./pages/OtherPage/NotFound"));
const AppLayout = lazy(() => import("./layout/AppLayout"));
const RoleBasedHome = lazy(() => import("./pages/Dashboard/RoleBasedHome"));
const Utilisateur = lazy(() => import("./pages/Dashboard/Utilisateur"));
const GestionTenants = lazy(() => import("./pages/AdminPortal/GestionTenants"));
const Patient = lazy(modules.patient);
const Consultation = lazy(modules.consultation);
const Medecin = lazy(modules.medecin);
const Medicament = lazy(modules.medicament);
const Ordonnance = lazy(modules.ordonnance);
const Examen = lazy(modules.examen);
const Hospitalisation = lazy(modules.hospitalisation);
const SallesMedicales = lazy(() => import("./pages/GestionHopital/SallesMedicales"));
const Paiement = lazy(() => import("./pages/GestionHopital/Paiement"));
const RendezVous = lazy(modules.rendezVous);
const Configuration = lazy(() => import("./pages/GestionHopital/Configuration"));
const AuditLogPage = lazy(() => import("./pages/GestionHopital/GestionUtilisateur/pages").then((m) => ({ default: m.AuditLogPage })));
const UserProfiles = lazy(() => import("./pages/UserProfiles"));
const Calendar = lazy(modules.calendrier);

function Chargement({ pleinEcran = false }: { pleinEcran?: boolean }) {
  return (
    <div className={`flex items-center justify-center ${pleinEcran ? "min-h-screen" : "min-h-[40vh]"}`} role="status" aria-live="polite">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#2720ff] border-t-transparent" aria-hidden="true" />
      <span className="sr-only">Chargement…</span>
    </div>
  );
}

// Pages de l’espace protégé : le chargement s’affiche dans la zone de contenu, la barre latérale reste en place.
const page = (contenu: ReactNode) => <Suspense fallback={<Chargement />}>{contenu}</Suspense>;

export default function App() {
  useEffect(reveillerServeur, []);
  return (
    <Router>
      <TenantProvider>
        <AuthProvider>
          <UserProvider>
            <ScrollToTop />
            <Suspense fallback={<Chargement pleinEcran />}>
              <Routes>
                {/* Routes Publiques */}
                <Route path="/" element={<Portail />} />
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
                  <Route path="/home" element={page(<RoleBasedHome />)} />
                  <Route path="/Utilisateur" element={<ProtectedRoute requiredPermission="canManageUsers">{page(<Utilisateur />)}</ProtectedRoute>} />

                  {/* Portail Administrateur TRIMED */}
                  <Route path="/admin/tenants" element={<ProtectedRoute requiredPermission="canManageSystem">{page(<GestionTenants />)}</ProtectedRoute>} />

                  {/* Gestion de l'Hôpital */}
                  <Route path="/patient" element={<ProtectedRoute requiredPermission="canViewPatients">{page(<Patient />)}</ProtectedRoute>} />
                  <Route path="/consultation" element={<ProtectedRoute requiredPermission="canViewConsultations">{page(<Consultation />)}</ProtectedRoute>} />
                  <Route path="/medecin" element={<ProtectedRoute requiredPermission="canViewMedecins">{page(<Medecin />)}</ProtectedRoute>} />
                  <Route path="/medicament" element={<ProtectedRoute requiredPermission="canViewMedicaments">{page(<Medicament />)}</ProtectedRoute>} />
                  <Route path="/ordonnance" element={<ProtectedRoute requiredPermission="canViewOrdonnances">{page(<Ordonnance />)}</ProtectedRoute>} />
                  <Route path="/examen" element={<ProtectedRoute requiredPermission="canViewConsultations">{page(<Examen />)}</ProtectedRoute>} />
                  <Route path="/hospitalisation" element={<ProtectedRoute requiredPermission="canViewConsultations">{page(<Hospitalisation />)}</ProtectedRoute>} />
                  <Route path="/salles-medicales" element={<ProtectedRoute requiredPermission="canViewConsultations">{page(<SallesMedicales />)}</ProtectedRoute>} />
                  <Route path="/paiement" element={<ProtectedRoute requiredPermission="canGererFacturation">{page(<Paiement />)}</ProtectedRoute>} />
                  <Route path="/rendezvous" element={<ProtectedRoute requiredPermission="canViewRendezVous">{page(<RendezVous />)}</ProtectedRoute>} />
                  <Route path="/configuration" element={<ProtectedRoute requiredPermission="canConfigurerHopital">{page(<Configuration />)}</ProtectedRoute>} />
                  <Route path="/admin/audit-logs" element={<ProtectedRoute requiredPermission="canViewAuditLogs">{page(<AuditLogPage />)}</ProtectedRoute>} />

                  {/* Autres Pages */}
                  <Route path="/profile" element={page(<UserProfiles />)} />
                  <Route path="/calendar" element={<ProtectedRoute requiredPermission="canViewCalendar">{page(<Calendar />)}</ProtectedRoute>} />
                </Route>

                {/* Itinéraire de Secours (Fallback) */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </UserProvider>
        </AuthProvider>
      </TenantProvider>
    </Router>
  );
}
