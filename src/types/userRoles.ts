export type UserRole = 
  | 'admin-systeme' 
  | 'proprietaire-hopital' 
  | 'medecin' 
  | 'infirmier' 
  | 'secretaire' 
  | 'personnel' 
  | 'patient';

/**
 * Normalise le rôle reçu du backend vers les types officiels du frontend
 */
export const normalizeRole = (role: string | null | undefined): UserRole => {
  if (!role) return 'personnel'; 
  
  const r = role.toLowerCase().trim();
  
  // Mapping direct avec les slugs backend
  if (r === 'admin-systeme' || r === 'superadmin' || r === 'administrateur-trimed') return 'admin-systeme';
  if (r === 'proprietaire-hopital' || r === 'proprietaire') return 'proprietaire-hopital';
  if (r === 'medecin' || r === 'docteur') return 'medecin';
  if (r === 'infirmier') return 'infirmier';
  if (r === 'secretaire') return 'secretaire';
  if (r === 'personnel') return 'personnel';
  if (r === 'patient') return 'patient';
  
  // Mapping des alias courants
  if (r.includes('admin')) return 'admin-systeme';
  if (r.includes('owner')) return 'proprietaire-hopital';
  if (r.includes('doc')) return 'medecin';
  if (r.includes('nurse')) return 'infirmier';
  
  return 'personnel'; // Fallback par défaut sécurisé
};

export interface UserPermissions {
  // Patients
  canViewPatients: boolean;
  canEditPatients: boolean;
  canViewOwnFolderOnly: boolean;
  canViewMedecins: boolean;
  
  // Médical
  canViewConsultations: boolean;
  canEditConsultations: boolean;
  canViewOrdonnances: boolean;
  canEditOrdonnances: boolean;
  canGererHospitalisation: boolean;
  
  // Médicaments & Stock
  canViewMedicaments: boolean;
  canGererMedicaments: boolean;
  canModifierStock: boolean;
  
  // Opérations & Logistique
  canViewRendezVous: boolean;
  canEditRendezVous: boolean;
  canGererSalles: boolean;
  canViewCalendar: boolean;
  
  // Administration & Finance
  canViewPaiements: boolean;
  canGererFacturation: boolean;
  canManageUsers: boolean;
  canViewDashboard: boolean;
  canViewReports: boolean;
  canManageSystem: boolean;
  canViewAuditLogs: boolean;
  canModifierTenant: boolean;
}

export const rolePermissions: Record<UserRole, UserPermissions> = {
  'admin-systeme': {
    canViewPatients: true,
    canEditPatients: true,
    canViewOwnFolderOnly: false,
    canViewMedecins: true,
    canViewConsultations: true,
    canEditConsultations: true,
    canViewOrdonnances: true,
    canEditOrdonnances: true,
    canGererHospitalisation: true,
    canViewMedicaments: true,
    canGererMedicaments: true,
    canModifierStock: true,
    canViewRendezVous: true,
    canEditRendezVous: true,
    canGererSalles: true,
    canViewCalendar: true,
    canViewPaiements: true,
    canGererFacturation: true,
    canManageUsers: true,
    canViewDashboard: true,
    canViewReports: true,
    canManageSystem: true,
    canViewAuditLogs: true,
    canModifierTenant: true,
  },
  'proprietaire-hopital': {
    canViewPatients: true,
    canEditPatients: true,
    canViewOwnFolderOnly: false,
    canViewMedecins: true,
    canViewConsultations: true,
    canEditConsultations: true,
    canViewOrdonnances: true,
    canEditOrdonnances: true,
    canGererHospitalisation: true,
    canViewMedicaments: true,
    canGererMedicaments: true,
    canModifierStock: true,
    canViewRendezVous: true,
    canEditRendezVous: true,
    canGererSalles: true,
    canViewCalendar: true,
    canViewPaiements: true,
    canGererFacturation: true,
    canManageUsers: true,
    canViewDashboard: true,
    canViewReports: true,
    canManageSystem: false,
    canViewAuditLogs: true,
    canModifierTenant: false,
  },
  'medecin': {
    canViewPatients: true,
    canEditPatients: true,
    canViewOwnFolderOnly: false,
    canViewMedecins: true,
    canViewConsultations: true,
    canEditConsultations: true,
    canViewOrdonnances: true,
    canEditOrdonnances: true,
    canGererHospitalisation: true,
    canViewMedicaments: true,
    canGererMedicaments: true,
    canModifierStock: false, // Médecin ne peut pas modifier le stock
    canViewRendezVous: true,
    canEditRendezVous: true,
    canGererSalles: true,
    canViewCalendar: true,
    canViewPaiements: false,
    canGererFacturation: false,
    canManageUsers: false,
    canViewDashboard: true,
    canViewReports: false,
    canManageSystem: false,
    canViewAuditLogs: false,
    canModifierTenant: false,
  },
  'infirmier': {
    canViewPatients: true,
    canEditPatients: true,
    canViewOwnFolderOnly: false,
    canViewMedecins: true,
    canViewConsultations: true,
    canEditConsultations: true,
    canViewOrdonnances: true,
    canEditOrdonnances: false,
    canGererHospitalisation: true,
    canViewMedicaments: true,
    canGererMedicaments: true,
    canModifierStock: true, // Infirmier peut modifier le stock
    canViewRendezVous: true,
    canEditRendezVous: true,
    canGererSalles: false,
    canViewCalendar: true,
    canViewPaiements: false,
    canGererFacturation: false,
    canManageUsers: false,
    canViewDashboard: true,
    canViewReports: false,
    canManageSystem: false,
    canViewAuditLogs: false,
    canModifierTenant: false,
  },
  'secretaire': {
    canViewPatients: true,
    canEditPatients: true,
    canViewOwnFolderOnly: false,
    canViewMedecins: true,
    canViewConsultations: false,
    canEditConsultations: false,
    canViewOrdonnances: false,
    canEditOrdonnances: false,
    canGererHospitalisation: false,
    canViewMedicaments: true,
    canGererMedicaments: true,
    canModifierStock: false, // Secrétaire pas de stock
    canViewRendezVous: true,
    canEditRendezVous: true,
    canGererSalles: true,
    canViewCalendar: true,
    canViewPaiements: false, // Peut voir factures tenant mais pas gérer facturation (selon résumé)
    canGererFacturation: false,
    canManageUsers: false,
    canViewDashboard: true,
    canViewReports: false,
    canManageSystem: false,
    canViewAuditLogs: false,
    canModifierTenant: false,
  },
  'personnel': {
    canViewPatients: true,
    canEditPatients: true,
    canViewOwnFolderOnly: false,
    canViewMedecins: true,
    canViewConsultations: false,
    canEditConsultations: false,
    canViewOrdonnances: false,
    canEditOrdonnances: false,
    canGererHospitalisation: false,
    canViewMedicaments: true,
    canGererMedicaments: true,
    canModifierStock: true, // Personnel peut modifier le stock
    canViewRendezVous: true,
    canEditRendezVous: true,
    canGererSalles: false,
    canViewCalendar: true,
    canViewPaiements: false,
    canGererFacturation: false,
    canManageUsers: false,
    canViewDashboard: true,
    canViewReports: false,
    canManageSystem: false,
    canViewAuditLogs: false,
    canModifierTenant: false,
  },
  'patient': {
    canViewPatients: false,
    canEditPatients: false,
    canViewOwnFolderOnly: true, // Accède uniquement à son propre dossier
    canViewMedecins: true,
    canViewConsultations: false,
    canEditConsultations: false,
    canViewOrdonnances: false,
    canEditOrdonnances: false,
    canGererHospitalisation: false,
    canViewMedicaments: true, // Peut voir médicaments hôpital
    canGererMedicaments: false,
    canModifierStock: false,
    canViewRendezVous: true,
    canEditRendezVous: true, // Ses propres RDV
    canGererSalles: false,
    canViewCalendar: false,
    canViewPaiements: true, // Peut voir ses factures
    canGererFacturation: false,
    canManageUsers: false,
    canViewDashboard: true,
    canViewReports: false,
    canManageSystem: false,
    canViewAuditLogs: false,
    canModifierTenant: false,
  },
};

