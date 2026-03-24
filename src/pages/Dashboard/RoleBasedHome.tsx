import React, { useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';
import { normalizeRole } from '../../types/userRoles';
import Home from './Home';
// ... rest of imports
import { MedecinDashboard } from '../GestionHopital/GestionUtilisateur/pages/MedecinDashboard';
import { InfirmierDashboard } from '../GestionHopital/GestionUtilisateur/pages/InfirmierDashboard';
import { ReceptionnisteDashboard } from '../GestionHopital/GestionUtilisateur/pages/ReceptionnisteDashboard';
import { PharmacienDashboard } from '../GestionHopital/GestionUtilisateur/pages/PharmacienDashboard';
import { ManagerDashboard } from '../GestionHopital/GestionUtilisateur/pages/ManagerDashboard';
import { TechnicienDashboard } from '../GestionHopital/GestionUtilisateur/pages/TechnicienDashboard';
import { FinanceDashboard } from '../GestionHopital/GestionUtilisateur/pages/FinanceDashboard';
import { AuditeurDashboard } from '../GestionHopital/GestionUtilisateur/pages/AuditeurDashboard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function RoleBasedHome() {
  const { currentUserRole, setCurrentUserRole } = useUser();
  const { user, isLoading } = useAuth();

  // Effet pour synchroniser le rôle du contexte global avec le UserContext local
  useEffect(() => {
    if (user && user.role) {
      const mappedRole = normalizeRole(user.role);
      
      if (mappedRole && mappedRole !== currentUserRole) {
        setCurrentUserRole(mappedRole);
      }
    }
  }, [user, currentUserRole, setCurrentUserRole]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // On utilise une version normalisée pour le switch
  const role = currentUserRole;

  switch (role) {
    case 'Médecin':
      return <MedecinDashboard />;
    case 'Infirmier':
      return <InfirmierDashboard />;
    case 'Réceptionniste':
      return <ReceptionnisteDashboard />;
    case 'Pharmacien':
      return <PharmacienDashboard />;
    case 'Manager':
      return <ManagerDashboard />;
    case 'Technicien':
      return <TechnicienDashboard />;
    case 'Finance':
      return <FinanceDashboard />;
    case 'Auditeur':
      return <AuditeurDashboard />;
    case 'Administrateur':
    default:
      return <Home />;
  }
}
