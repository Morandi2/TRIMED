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

export interface InvoiceFormData {
  paiement_id: number;
  tenant_id: number;
  numero_facture: string;
  date_emission: string;
  date_echeance?: string;
  montant: number;
  statut_id: number;
  url_pdf?: string;
}

export interface InvoiceFilters {
  searchTerm: string;
  statut: string;
  dateDebut: string;
  dateFin: string;
}

export interface InvoiceStats {
  total: number;
  paye: number;
  en_attente: number;
  annule: number;
  montant_total: number;
}