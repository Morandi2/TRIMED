import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';
import hospitalApi from '../../api/hospitalApi';
import Home from './Home';
import { MedecinDashboard } from '../GestionHopital/GestionUtilisateur/pages/MedecinDashboard';
import { InfirmierDashboard } from '../GestionHopital/GestionUtilisateur/pages/InfirmierDashboard';
import { ReceptionnisteDashboard } from '../GestionHopital/GestionUtilisateur/pages/ReceptionnisteDashboard';
import { PharmacienDashboard } from '../GestionHopital/GestionUtilisateur/pages/PharmacienDashboard';
import { PatientDashboard } from '../GestionHopital/GestionUtilisateur/pages/PatientDashboard';
import TrimedAdminDashboard from './TrimedAdminDashboard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { hopitalDejaConfigure, marquerHopitalConfigure } from '../GestionHopital/Configuration/etat';

export default function RoleBasedHome() {
  const { currentUserRole: role, permissions } = useUser();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Première connexion d’un administrateur d’hôpital : tant que l’hôpital n’a pas ses
  // paramètres (langue, devise, rendez-vous…), on ouvre l’assistant de configuration.
  useEffect(() => {
    if (!permissions.canConfigurerHopital || !user?.hopital_id) return;
    const hopitalId = user.hopital_id;
    if (hopitalDejaConfigure(hopitalId)) return;
    let annule = false;
    hospitalApi.config.getParametres().then((res) => {
      if (annule || !res.success) return;
      if (res.data) marquerHopitalConfigure(hopitalId);
      else {
        navigate('/configuration?premiere=1', { replace: true });
      }
    });
    return () => { annule = true; };
  }, [permissions.canConfigurerHopital, user?.hopital_id, navigate]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  switch (role) {
    case 'medecin':
      return <MedecinDashboard />;
    case 'infirmier':
      return <InfirmierDashboard />;
    case 'secretaire':
      return <ReceptionnisteDashboard />;
    case 'personnel':
      return <PharmacienDashboard />;
    // Administrateur de l’hôpital (propriétaire ou admin délégué) : le portail de l’hôpital
    case 'proprietaire-hopital':
    case 'admin-hopital':
      return <Home />;
    case 'patient':
      return <PatientDashboard />;
    case 'admin-systeme':
      return <TrimedAdminDashboard />;
    default:
      return <Home />;
  }
}
