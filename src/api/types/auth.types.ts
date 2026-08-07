// Types et interfaces pour l'authentification

export interface InscriptionData {
  // ÉTAPE 1 — Informations Générales
  nomHopital: string;
  nom?: string; // Sync avec backend
  raisonSociale?: string;
  numeroEnregistrement: string;
  nif?: string;
  typeEtablissement: 'Public' | 'Privé' | 'Clinique';
  logo?: any;
  siteWeb?: string;
  description?: string;
  documentsJustificatifs?: File[];

  // ÉTAPE 2 — Adresse & Localisation
  pays: string; // "Haiti" par défaut
  province: string;
  ville: string;
  adresseLigne1: string;
  adresseLigne2?: string;
  codePostal?: string;

  // ÉTAPE 3 — Informations de Contact
  telephone: string;
  telephoneUrgence?: string;
  email: string; // Email principal
  emailSupport?: string;

  // ÉTAPE 4 — Création de l’Administrateur Principal
  prenomAdmin: string;
  nomAdmin: string;
  adminEmail: string;
  adminTelephone?: string;
  password: string;

  // ÉTAPE 5 — Configuration Opérationnelle
  nombreLits?: string;
  urgenceDisponible: boolean;
  laboratoireDisponible: boolean;
  pharmacieDisponible: boolean;
  radiologieDisponible: boolean;
  heureOuverture?: string;
  heureFermeture?: string;

  // ÉTAPE 6 — Abonnement (SaaS)
  planAbonnement: 'Basic' | 'Pro' | 'Enterprise';
  cycleFacturation: 'Mensuel' | 'Annuel';

  // Debugging/Development Checklist (added as per instruction)
  // - [x] Verify the `SignUpForm.tsx` Implementation
  // - [x] Update `useDjangoAuth.ts`
  // - [x] Address `npm run build` Failure
  // - [x] Review `Connexion.tsx`
  // - [/] Debugging Blank Page Issue
  // - [/] Final Testing and Verifications

  // Legacy fields (for compatibility)
  adresse: string;
  directeur?: string;
}

export interface ConnexionData {
  email: string;
  password: string;
}

export interface UserData {
  nom_complet: string;
  email: string;
  mot_de_passe: string;
  role: 'proprietaire-hopital' | 'admin-systeme' | 'personnel';
  hopital_id?: number;
}

export interface TenantData {
  nom: string;
  raison_sociale?: string;
  numero_enregistrement: string;
  nif?: string;
  type_etablissement: string;
  logo?: string;
  site_web?: string;
  description?: string;

  pays: string;
  province: string;
  ville: string;
  adresse_ligne1: string;
  adresse_ligne2?: string;
  code_postal?: string;

  telephone: string;
  telephone_urgence?: string;
  email_professionnel: string;
  email_support?: string;

  nombre_de_lits?: number | null;
  urgence_disponible: boolean;
  laboratoire_disponible: boolean;
  pharmacie_disponible: boolean;
  radiologie_disponible: boolean;
  heure_ouverture?: string;
  heure_fermeture?: string;

  type_abonnement: 'Basic' | 'Pro' | 'Enterprise';
  cycle_facturation: 'Mensuel' | 'Annuel';

  statut?: 'actif' | 'inactif' | 'suspendu';
  statut_verification_document?: 'en_attente' | 'verifie' | 'rejete';
  proprietaire_utilisateur_id?: number;
  nom_schema_base_de_donnees?: string;

  // Legacy fields
  adresse: string;
  directeur?: string | null;
}

export interface AuthUser {
  utilisateur_id: number;
  nom_complet: string;
  email: string;
  role: string;
  telephone?: string;
  photo?: string | null;
  hopital_id?: number;
  hopital_nom?: string;
}

export interface SessionData {
  session_id?: number;
  utilisateur_id: number;
  token: string;
  date_creation: string;
  date_expiration: string;
  actif: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface ConnexionResponse {
  user: AuthUser;
  token: string;
  redirectTo: string;
  tenant?: any;
}

export interface InscriptionResponse {
  user: AuthUser;
  tenant: any;
  token: string;
  redirectTo: string;
}

export interface ModalMessage {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  show: boolean;
}