export type UserRole =
  | 'admin-systeme'
  | 'admin-hopital'
  | 'proprietaire-hopital'
  | 'medecin'
  | 'infirmier' 
  | 'secretaire' 
  | 'personnel' 
  | 'patient';

/**
 * Normalise le rôle reçu du backend vers les types officiels du frontend.
 * Correspondance exacte uniquement : un rôle inconnu ne doit jamais ouvrir plus de droits.
 * (Auparavant, tout rôle contenant « admin » devenait administrateur de la plateforme.)
 */
export const normalizeRole = (role: string | null | undefined): UserRole => {
  if (!role) return 'personnel';

  const r = role.toLowerCase().trim();

  if (r === 'admin-systeme') return 'admin-systeme';
  if (r === 'proprietaire-hopital') return 'proprietaire-hopital';
  if (r === 'medecin') return 'medecin';
  if (r === 'infirmier') return 'infirmier';
  if (r === 'secretaire') return 'secretaire';
  if (r === 'personnel') return 'personnel';
  if (r === 'patient') return 'patient';

  return 'personnel'; // Rôle inconnu : droits minimaux
};

/**
 * Rôle de l’interface pour le compte connecté.
 * Le portail Admin TRIMED est réservé à l’équipe TRIMED : rôle `admin-systeme` **et** case
 * « statut équipe » (`is_staff`) cochée dans l’admin Django, que l’API ne permet pas de modifier.
 * Un `admin-systeme` sans `is_staff` administre son hôpital (portail de l’hôpital).
 */
export const roleEffectif = (user: { role?: string | null; is_staff?: boolean } | null | undefined): UserRole => {
  const role = normalizeRole(user?.role);
  if (role === 'admin-systeme' && user?.is_staff !== true) return 'admin-hopital';
  return role;
};

/** Libellés lisibles des rôles, pour l’interface. */
export const LIBELLES_ROLES: Record<UserRole, string> = {
  'admin-systeme': 'Administrateur TRIMED',
  'admin-hopital': 'Administrateur de l’hôpital',
  'proprietaire-hopital': 'Propriétaire de l’hôpital',
  'medecin': 'Médecin',
  'infirmier': 'Infirmier',
  'secretaire': 'Secrétaire',
  'personnel': 'Personnel',
  'patient': 'Patient',
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
  /** Paramètres et assistant de configuration de son propre hôpital (propriétaire). */
  canConfigurerHopital: boolean;
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
    canConfigurerHopital: false,
  },
  'admin-hopital': {
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
    canConfigurerHopital: true,
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
    canConfigurerHopital: true,
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
    canConfigurerHopital: false,
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
    canConfigurerHopital: false,
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
    canConfigurerHopital: false,
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
    canConfigurerHopital: false,
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
    canViewMedicaments: false, // Le stock de l’hôpital ne concerne pas le patient
    canGererMedicaments: false,
    canModifierStock: false,
    canViewRendezVous: false, // Ses rendez-vous sont sur son tableau de bord
    canEditRendezVous: false,
    canGererSalles: false,
    canViewCalendar: false,
    canViewPaiements: false,
    canGererFacturation: false,
    canManageUsers: false,
    canViewDashboard: true,
    canViewReports: false,
    canManageSystem: false,
    canViewAuditLogs: false,
    canModifierTenant: false,
    canConfigurerHopital: false,
  },
};

