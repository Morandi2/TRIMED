export interface Abonnement {
  abonnement_id: number;
  tenant_id: number;
  plan_id: number;
  date_debut: string;
  date_fin: string;
  statut_id: number;
  created_at: string;
  updated_at: string;
}

export interface AbonnementStatut {
  statut_id: number;
  nom: string;
  description?: string;
}

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

export interface Invoice {
  invoice_id: number;
  paiement_id: number;
  tenant_id: number;
  numero_facture: string;
  date_emission: string;
  date_echeance?: string;
  montant: number;
  statut_id: number;
  url_pdf?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceStatut {
  statut_id: number;
  nom: string;
  description?: string;
}

export interface AbonnementFormData {
  tenant_id: number;
  plan_id: number;
  date_debut: string;
  date_fin: string;
  statut_id: number;
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

export interface AbonnementFilters {
  searchTerm: string;
  statut: string;
  dateDebut: string;
  dateFin: string;
}

export interface AbonnementStats {
  total: number;
  actif: number;
  expire: number;
  suspendu: number;
  revenus_mois: number;
  revenus_total: number;
}