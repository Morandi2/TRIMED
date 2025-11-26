export interface Paiement {
  paiement_id: number;
  tenant_id: number;
  abonnement_id: number;
  montant: number;
  methode_id: number;
  date_paiement: string;
  statut_id: number;
  reference?: string;
  created_at: string;
}

export interface PaiementFormData {
  tenant_id: number;
  abonnement_id: number;
  montant: number;
  methode_id: number;
  date_paiement: string;
  statut_id: number;
  reference?: string;
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