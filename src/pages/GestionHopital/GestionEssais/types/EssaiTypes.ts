export interface EssaiGratuit {
  essai_id: number;
  tenant_id: number;
  plan_id: number;
  date_debut: string;
  date_fin: string;
  statut_id: number;
}

export interface EssaiFormData {
  tenant_id: number;
  plan_id: number;
  date_debut: string;
  date_fin: string;
  statut_id: number;
}

export interface EssaiFilters {
  searchTerm: string;
  statut: string;
  plan: string;
}

export interface EssaiStats {
  total: number;
  actif: number;
  expire: number;
}