import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';
import hospitalApi from '../../api/hospitalApi';
import Home from './Home';
import TrimedAdminDashboard from './TrimedAdminDashboard';
import TableauPersonnel from './TableauPersonnel';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { hopitalDejaConfigure, marquerHopitalConfigure } from '../GestionHopital/Configuration/etat';
import { prechargerModules } from '../../routes/modules';

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

  // Une fois le tableau de bord affiché, les modules du rôle se chargent en arrière-plan :
  // ils s’ouvrent ensuite sans attente.
  useEffect(() => { if (role !== 'admin-systeme') prechargerModules(permissions); }, [role, permissions]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  switch (role) {
    case 'medecin':
    case 'infirmier':
    case 'secretaire':
    case 'personnel':
    case 'patient':
      return <TableauPersonnel role={role} />;
    // Administrateur de l’hôpital (propriétaire ou admin délégué) : le portail de l’hôpital
    case 'proprietaire-hopital':
    case 'admin-hopital':
      return <Home />;
    case 'admin-systeme':
      return <TrimedAdminDashboard />;
    default:
      return <Home />;
  }
}
