export interface Paiement {
  paiement_id: number;
  tenant_id: number;
  abonnement_id: number;
  montant: number;
  methode_id: number;
  date_paiement: string;
  statut_id: number;
  reference?: string;
  notes?: string;
  methode_paiement?: string;
  statut?: string;
  patient_id?: number;
  consultation_id?: number;
  created_at: string;
  updated_at?: string;
}

export interface PaiementFormData {
  tenant_id: number;
  abonnement_id: number;
  montant: number;
  methode_id: number;
  date_paiement: string;
  statut_id: number;
  reference?: string;
  notes?: string;
  methode_paiement?: string;
  statut?: string;
  patient_id?: number;
  consultation_id?: number;
}

export interface PaiementFilters {
  searchTerm: string;
  statut: string;
  methode: string;
  dateDebut: string;
  dateFin: string;
}

export interface PaiementStats {
  total: number;
  paye: number;
  en_attente: number;
  rembourse: number;
  montant_total: number;
  montant_mois: number;
}

export interface PaiementMethode {
  methode_id: number;
  nom: string;
  description?: string;
}

export interface PaiementStatut {
  statut_id: number;
  nom: string;
  description?: string;
}

export interface MethodePaiement {
  methode_id: number;
  nom: string;
  actif: boolean;
  couleur?: string;
  description?: string;
}

export interface StatutPaiement {
  statut_id: number;
  nom: string;
  couleur: string;
  description?: string;
}