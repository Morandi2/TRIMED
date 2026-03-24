export interface Utilisateur {
  utilisateur_id: number;
  nom_complet: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role_id: number;
  statut_id: number;
  created_at: string;
  updated_at: string;
  tenant_id: number;
  hopital_nom?: string;
}

export interface UtilisateurFormData {
  nom_complet: string;
  email: string;
  password?: string;
  password_confirm?: string;
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