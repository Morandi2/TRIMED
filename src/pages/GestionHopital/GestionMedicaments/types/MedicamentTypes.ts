// Types ak interfaces pou gestion medicaments
export interface Medicament {
  medicament_id: number;
  tenant_id: number;
  nom: string;
  forme_pharmaceutique: string;
  dosage_standard: string | null;
  categorie_id: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  
  // Champs addisyonèl pou gestion stock
  code?: string;
  nom_commercial?: string;
  laboratoire?: string;
  substance_active?: string;
  dci?: string;
  stock_actuel?: number;
  stock_minimum?: number;
  stock_maximum?: number;
  unite_stock?: string;
  quantite_par_unite?: number;
  conditionnement?: string;
  code_cip?: string;
  prix_achat?: number;
  prix_vente?: number;
  tva?: number;
  date_peremption?: string;
  date_fabrication?: string;
  date_entree_stock?: string;
  statut?: MedicamentStatut;
  besoin_ordonnance?: boolean;
  classe_therapeutique?: string;
  conditions_conservation?: string;
  lot_number?: string;
  numero_autorisation?: string;
  pays_fabrication?: string;
}

export interface MedicamentCategorie {
  categorie_id: number;
  tenant_id: number;
  nom: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface MouvementStock {
  mouvement_id: number;
  medicament_id: number;
  tenant_id: number;
  type: TypeMouvement;
  quantite: number;
  date_mouvement: string;
  heure_mouvement: string;
  reference: string;
  motif: string;
  utilisateur: string;
  stock_avant: number;
  stock_apres: number;
  cout_unitaire?: number;
  total?: number;
  destination?: string;
  fournisseur?: string;
  numero_lot?: string;
  date_peremption?: string;
  created_at: string;
}

// Enums ak constants
export type MedicamentStatut = "Disponible" | "Rupture" | "Stock bas" | "Périmé" | "Retiré";
export type TypeMouvement = "Entrée" | "Sortie" | "Ajustement" | "Inventaire";
export type FormePharmaceutique = "Comprimé" | "Gélule" | "Sirop" | "Injectable" | "Crème" | "Pommade" | "Suppositoire" | "Collyre" | "Aérosol" | "Autre";
export type UniteStock = "Boîte" | "Flacon" | "Ampoule" | "Tube" | "Sachet" | "Unité";
export type ClasseTherapeutique = "Classe A" | "Classe B" | "Classe C" | "Stupéfiant";
export type ConditionsConservation = "Ambiance" | "Frigo" | "Congélateur" | "Protégé lumière";

export const FORMES_PHARMACEUTIQUES: FormePharmaceutique[] = [
  "Comprimé", "Gélule", "Sirop", "Injectable", "Crème", 
  "Pommade", "Suppositoire", "Collyre", "Aérosol", "Autre"
];

export const UNITES_STOCK: UniteStock[] = [
  "Boîte", "Flacon", "Ampoule", "Tube", "Sachet", "Unité"
];

export const STATUTS_MEDICAMENT: MedicamentStatut[] = [
  "Disponible", "Rupture", "Stock bas", "Périmé", "Retiré"
];

export const CLASSES_THERAPEUTIQUES: ClasseTherapeutique[] = [
  "Classe A", "Classe B", "Classe C", "Stupéfiant"
];

export const CONDITIONS_CONSERVATION: ConditionsConservation[] = [
  "Ambiance", "Frigo", "Congélateur", "Protégé lumière"
];

export const TYPES_MOUVEMENT: TypeMouvement[] = [
  "Entrée", "Sortie", "Ajustement", "Inventaire"
];

export const CATEGORIES_THERAPEUTIQUES = [
  "Analgésique",
  "Antibiotique", 
  "Antihypertenseur",
  "Antidiabétique",
  "Anti-inflammatoire",
  "Psychotrope",
  "Cardiovasculaire",
  "Digestif",
  "Dermatologique",
  "Vitamines",
  "Vaccins",
  "Autre"
];

// Interfaces pou forms ak modals
export interface MedicamentFormData {
  nom: string;
  forme_pharmaceutique: string;
  dosage_standard: string;
  categorie_id: number | null;
  description: string;
  nom_commercial?: string;
  laboratoire?: string;
  substance_active?: string;
  dci?: string;
  stock_actuel?: number;
  stock_minimum?: number;
  stock_maximum?: number;
  unite_stock?: string;
  quantite_par_unite?: number;
  conditionnement?: string;
  code_cip?: string;
  prix_achat?: number;
  prix_vente?: number;
  tva?: number;
  date_peremption?: string;
  date_fabrication?: string;
  besoin_ordonnance?: boolean;
  classe_therapeutique?: string;
  conditions_conservation?: string;
  lot_number?: string;
  numero_autorisation?: string;
  pays_fabrication?: string;
}

export interface MouvementFormData {
  medicament_id: number;
  type: TypeMouvement;
  quantite: number;
  motif: string;
  utilisateur: string;
  cout_unitaire?: number;
  destination?: string;
  fournisseur?: string;
  numero_lot?: string;
  date_peremption?: string;
}

export interface MedicamentFilters {
  searchTerm: string;
  categorie: string;
  statut: string;
  forme_pharmaceutique: string;
}

export interface MedicamentStats {
  total: number;
  disponible: number;
  rupture: number;
  stock_bas: number;
  perime: number;
  valeur_stock: number;
}