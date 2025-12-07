import React from 'react';
import { useUser } from '../../context/UserContext';
import Home from './Home';
import { MedecinDashboard } from '../GestionHopital/GestionUtilisateur/pages/MedecinDashboard';
import { InfirmierDashboard } from '../GestionHopital/GestionUtilisateur/pages/InfirmierDashboard';
import { ReceptionnisteDashboard } from '../GestionHopital/GestionUtilisateur/pages/ReceptionnisteDashboard';
import { PharmacienDashboard } from '../GestionHopital/GestionUtilisateur/pages/PharmacienDashboard';
import { ManagerDashboard } from '../GestionHopital/GestionUtilisateur/pages/ManagerDashboard';
import { TechnicienDashboard } from '../GestionHopital/GestionUtilisateur/pages/TechnicienDashboard';
import { FinanceDashboard } from '../GestionHopital/GestionUtilisateur/pages/FinanceDashboard';
import { AuditeurDashboard } from '../GestionHopital/GestionUtilisateur/pages/AuditeurDashboard';

export default function RoleBasedHome() {
  const { currentUserRole } = useUser();

  switch (currentUserRole) {
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
