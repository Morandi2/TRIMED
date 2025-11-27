export interface Utilisateur {
  utilisateur_id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role_id: number;
  statut_id: number;
  created_at: string;
  updated_at: string;
  tenant_id: number;
}

export interface UtilisateurFormData {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role_id: number;
  statut_id: number;
}

export interface UtilisateurFilters {
  searchTerm: string;
  role: string;
  statut: string;
}

export interface UtilisateurStats {
  total: number;
  actif: number;
  inactif: number;
  admin: number;
  medecin: number;
  infirmier: number;
}

export interface UtilisateurRole {
  role_id: number;
  nom: string;
  description?: string;
}

export interface UtilisateurStatut {
  statut_id: number;
  nom: string;
  description?: string;
}