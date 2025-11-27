export interface AbonnementRenouvellement {
  renouvellement_id: number;
  abonnement_id: number;
  date_renouvellement: string;
  statut_id: number;
  methode_id: number;
}

export interface RenouvellementFormData {
  abonnement_id: number;
  date_renouvellement: string;
  statut_id: number;
  methode_id: number;
}

export interface RenouvellementStats {
  total: number;
  reussi: number;
  echoue: number;
  en_attente: number;
}