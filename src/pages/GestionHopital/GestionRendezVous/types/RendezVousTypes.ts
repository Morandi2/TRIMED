// Types ak interfaces pou gestion rendez-vous
export interface RendezVous {
  rendez_vous_id: number;
  tenant_id: number;
  patient_id: number;
  medecin_id: number;
  date_heure: string;
  type_id: number | null;
  statut_id: number;
  motif: string | null;
  
  // Read-only fields
  patient_nom?: string;
  patient_prenom?: string;
  medecin_nom?: string;
  medecin_prenom?: string;
  type_nom?: string;
  statut_nom?: string;
  statut_couleur?: string;
  
  created_at: string;
  updated_at: string;
}

export interface RendezVousType {
  type_id: number;
  tenant_id?: number;
  nom: string;
  description?: string;
}

export interface RendezVousStatut {
  statut_id: number;
  tenant_id?: number;
  nom: string;
  description?: string;
}

// Enums ak constants
export type StatutRendezVous = "Programmé" | "Confirmé" | "En cours" | "Terminé" | "Annulé" | "Reporté";
export type TypeConsultation = "Consultation" | "Contrôle" | "Urgence" | "Suivi" | "Téléconsultation";
export const STATUTS_RENDEZ_VOUS: StatutRendezVous[] = [
  "Programmé", "Confirmé", "En cours", "Terminé", "Annulé", "Reporté"
];

export const TYPES_CONSULTATION: TypeConsultation[] = [
  "Consultation", "Contrôle", "Urgence", "Suivi", "Téléconsultation"
];

export const MOYENS_PAIEMENT = ["Espèces", "Carte bancaire", "Chèque", "Virement", "Assurance"];
export const SALLES_CONSULTATION = ["Salle 101", "Salle 102", "Salle 103", "Salle 201", "Salle 202"];
export const DUREES_CONSULTATION = [15, 30, 45, 60, 90, 120];
export const HEURES_CONSULTATION = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

// Interfaces pou forms ak modals
export interface RendezVousFormData {
  patient_id: number;
  patient_nom: string;
  patient_email: string;
  patient_phone: string;
  medecin_id: number;
  medecin_nom: string;
  specialite: string;
  date_heure: string;
  type_id: number | null;
  type_nom: string;
  statut_id: number;
  statut_nom: string;
  motif: string;
  duree: number;
  salle: string;
  prix: number;
  notes: string;
  moyen_paiement?: string;
  assurance_validee: boolean;
}

export interface RendezVousFilters {
  searchTerm: string;
  statut: string;
  medecin: string;
  type: string;
  date: string;
}

export interface RendezVousStats {
  total: number;
  programme: number;
  confirme: number;
  termine: number;
  annule: number;
  aujourdhui: number;
  cette_semaine: number;
}

// Interfaces pou rechèch ak données simule
export interface Patient {
  patient_id: number;
  nom: string;
  email: string;
  telephone: string;
  date_naissance?: string;
  adresse?: string;
  assurance?: string;
}

export interface Medecin {
  medecin_id: number;
  nom: string;
  specialite: string;
  telephone: string;
  email: string;
  disponibilite?: string[];
}