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
  created_at: string;
  updated_at: string;
}

export interface RendezVousType {
  type_id: number;
  tenant_id: number;
  nom: string;
  description?: string;
}

export interface RendezVousStatut {
  statut_id: number;
  tenant_id: number;
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

// Interfaces pou forms ak modals
export interface RendezVousFormData {
  patient_id: number;
  medecin_id: number;
  date_heure: string;
  type_id: number | null;
  statut_id: number;
  motif: string;
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