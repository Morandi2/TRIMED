export type UserRole = 'Administrateur' | 'Médecin' | 'Infirmier' | 'Réceptionniste' | 'Pharmacien' | 'Manager' | 'Technicien' | 'Finance' | 'Auditeur';

export const normalizeRole = (role: string | null | undefined): UserRole => {
  if (!role) return 'Administrateur'; // Fallback par défaut
  
  const r = role.toLowerCase().trim();
  
  // Mapping des slugs ou noms variés vers les types UI officiels
  if (r.includes('admin') || r.includes('proprietaire')) return 'Administrateur';
  if (r.includes('medecin') || r.includes('docteur')) return 'Médecin';
  if (r.includes('infirmier')) return 'Infirmier';
  if (r.includes('receptionniste') || r.includes('secretaire')) return 'Réceptionniste';
  if (r.includes('pharmacien')) return 'Pharmacien';
  if (r.includes('manager') || r.includes('gestionnaire')) return 'Manager';
  if (r.includes('technicien') || r.includes('laborantin')) return 'Technicien';
  if (r.includes('finance') || r.includes('comptable')) return 'Finance';
  if (r.includes('auditeur')) return 'Auditeur';
  
  return 'Administrateur'; // Fallback final
};

export interface UserPermissions {
  canViewPatients: boolean;
  canEditPatients: boolean;
  canViewMedecins: boolean;
  canEditMedecins: boolean;
  canViewConsultations: boolean;
  canEditConsultations: boolean;
  canViewOrdonnances: boolean;
  canEditOrdonnances: boolean;
  canViewMedicaments: boolean;
  canEditMedicaments: boolean;
  canViewRendezVous: boolean;
  canEditRendezVous: boolean;
  canViewPaiements: boolean;
  canEditPaiements: boolean;
  canViewCalendar: boolean;
  canViewDashboard: boolean;
  canManageUsers: boolean;
  canManageRoles: boolean;
  canViewReports: boolean;
  canManageSystem: boolean;
  canViewFinancial: boolean;
  canViewAuditLogs: boolean;
}

export const rolePermissions: Record<UserRole, UserPermissions> = {
  Administrateur: {
    canViewPatients: true,
    canEditPatients: true,
    canViewMedecins: true,
    canEditMedecins: true,
    canViewConsultations: true,
    canEditConsultations: true,
    canViewOrdonnances: true,
    canEditOrdonnances: true,
    canViewMedicaments: true,
    canEditMedicaments: true,
    canViewRendezVous: true,
    canEditRendezVous: true,
    canViewPaiements: true,
    canEditPaiements: true,
    canViewCalendar: true,
    canViewDashboard: true,
    canManageUsers: true,
    canManageRoles: true,
    canViewReports: true,
    canManageSystem: true,
    canViewFinancial: true,
    canViewAuditLogs: true,
  },
  Médecin: {
    canViewPatients: true,
    canEditPatients: false,
    canViewMedecins: false,
    canEditMedecins: false,
    canViewConsultations: true,
    canEditConsultations: false,
    canViewOrdonnances: true,
    canEditOrdonnances: true,
    canViewMedicaments: false,
    canEditMedicaments: false,
    canViewRendezVous: true,
    canEditRendezVous: false,
    canViewPaiements: false,
    canEditPaiements: false,
    canViewCalendar: true,
    canViewDashboard: true,
    canManageUsers: false,
    canManageRoles: false,
    canViewReports: false,
    canManageSystem: false,
    canViewFinancial: false,
    canViewAuditLogs: false,
  },
  Infirmier: {
    canViewPatients: true,
    canEditPatients: false,
    canViewMedecins: true,
    canEditMedecins: false,
    canViewConsultations: true,
    canEditConsultations: false,
    canViewOrdonnances: true,
    canEditOrdonnances: false,
    canViewMedicaments: true,
    canEditMedicaments: false,
    canViewRendezVous: true,
    canEditRendezVous: false,
    canViewPaiements: false,
    canEditPaiements: false,
    canViewCalendar: true,
    canViewDashboard: true,
    canManageUsers: false,
    canManageRoles: false,
    canViewReports: false,
    canManageSystem: false,
    canViewFinancial: false,
    canViewAuditLogs: false,
  },
  Réceptionniste: {
    canViewPatients: true,
    canEditPatients: true,
    canViewMedecins: true,
    canEditMedecins: false,
    canViewConsultations: false,
    canEditConsultations: false,
    canViewOrdonnances: false,
    canEditOrdonnances: false,
    canViewMedicaments: false,
    canEditMedicaments: false,
    canViewRendezVous: true,
    canEditRendezVous: true,
    canViewPaiements: false,
    canEditPaiements: false,
    canViewCalendar: true,
    canViewDashboard: true,
    canManageUsers: false,
    canManageRoles: false,
    canViewReports: false,
    canManageSystem: false,
    canViewFinancial: false,
    canViewAuditLogs: false,
  },
  Pharmacien: {
    canViewPatients: true,
    canEditPatients: false,
    canViewMedecins: false,
    canEditMedecins: false,
    canViewConsultations: false,
    canEditConsultations: false,
    canViewOrdonnances: true,
    canEditOrdonnances: false,
    canViewMedicaments: true,
    canEditMedicaments: true,
    canViewRendezVous: false,
    canEditRendezVous: false,
    canViewPaiements: false,
    canEditPaiements: false,
    canViewCalendar: false,
    canViewDashboard: true,
    canManageUsers: false,
    canManageRoles: false,
    canViewReports: false,
    canManageSystem: false,
    canViewFinancial: false,
    canViewAuditLogs: false,
  },
  Manager: {
    canViewPatients: true,
    canEditPatients: false,
    canViewMedecins: true,
    canEditMedecins: false,
    canViewConsultations: false,
    canEditConsultations: false,
    canViewOrdonnances: false,
    canEditOrdonnances: false,
    canViewMedicaments: true,
    canEditMedicaments: true,
    canViewRendezVous: true,
    canEditRendezVous: true,
    canViewPaiements: false,
    canEditPaiements: false,
    canViewCalendar: true,
    canViewDashboard: true,
    canManageUsers: true,
    canManageRoles: false,
    canViewReports: true,
    canManageSystem: false,
    canViewFinancial: false,
    canViewAuditLogs: false,
  },
  Technicien: {
    canViewPatients: true,
    canEditPatients: false,
    canViewMedecins: false,
    canEditMedecins: false,
    canViewConsultations: true,
    canEditConsultations: false,
    canViewOrdonnances: true,
    canEditOrdonnances: false,
    canViewMedicaments: false,
    canEditMedicaments: false,
    canViewRendezVous: false,
    canEditRendezVous: false,
    canViewPaiements: false,
    canEditPaiements: false,
    canViewCalendar: false,
    canViewDashboard: true,
    canManageUsers: false,
    canManageRoles: false,
    canViewReports: false,
    canManageSystem: false,
    canViewFinancial: false,
    canViewAuditLogs: false,
  },
  Finance: {
    canViewPatients: true,
    canEditPatients: false,
    canViewMedecins: false,
    canEditMedecins: false,
    canViewConsultations: false,
    canEditConsultations: false,
    canViewOrdonnances: false,
    canEditOrdonnances: false,
    canViewMedicaments: false,
    canEditMedicaments: false,
    canViewRendezVous: false,
    canEditRendezVous: false,
    canViewPaiements: true,
    canEditPaiements: true,
    canViewCalendar: false,
    canViewDashboard: true,
    canManageUsers: false,
    canManageRoles: false,
    canViewReports: true,
    canManageSystem: false,
    canViewFinancial: true,
    canViewAuditLogs: false,
  },
  Auditeur: {
    canViewPatients: false,
    canEditPatients: false,
    canViewMedecins: false,
    canEditMedecins: false,
    canViewConsultations: false,
    canEditConsultations: false,
    canViewOrdonnances: false,
    canEditOrdonnances: false,
    canViewMedicaments: false,
    canEditMedicaments: false,
    canViewRendezVous: false,
    canEditRendezVous: false,
    canViewPaiements: false,
    canEditPaiements: false,
    canViewCalendar: false,
    canViewDashboard: true,
    canManageUsers: false,
    canManageRoles: false,
    canViewReports: true,
    canManageSystem: false,
    canViewFinancial: false,
    canViewAuditLogs: true,
  },
};
