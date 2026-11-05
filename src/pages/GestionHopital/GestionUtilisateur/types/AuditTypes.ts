export type CategorieJournal =
  | 'Connexion' | 'Compte' | 'Dossier' | 'Consultation' | 'Ordonnance' | 'Examen' | 'Hospitalisation'
  | 'Rendez-vous' | 'Téléconsultation' | 'Caisse' | 'Assurance' | 'Pharmacie' | 'Hôpital';

/** Un événement du journal : lu dans le journal d’audit du serveur, ou reconstitué à partir des données datées. */
export interface EvenementJournal {
  id: string;
  date: string;
  categorie: CategorieJournal;
  action: string;
  /** Qui a agi (compte, médecin). */
  acteur: string;
  /** Sur qui ou quoi (patient, compte, hôpital). */
  cible?: string;
  details?: string;
  /** Code de l’action côté serveur (connexion, lecture, creation…) ; absent pour un événement reconstitué. */
  type?: string;
}

/** Ligne renvoyée par GET /api/comptes/audit-logs/. */
export interface EntreeJournalServeur {
  evenement_id: number;
  date: string;
  action: string;
  action_libelle: string;
  ressource: string;
  ressource_id: string;
  utilisateur: number | null;
  utilisateur_libelle: string;
  role: string;
  patient: number | null;
  patient_nom: string | null;
  tenant: number | null;
  tenant_nom: string | null;
  description: string;
  adresse_ip: string | null;
}

/** Résultat du chargement : `journalServeur` vaut faux quand le serveur n’a pas encore de journal d’audit. */
export interface ChargementJournal {
  evenements: EvenementJournal[];
  journalServeur: boolean;
}

export type PeriodeJournal = 'jour' | 'semaine' | 'mois' | 'tout';

export interface FiltresJournal {
  recherche: string;
  categorie: CategorieJournal | '';
  periode: PeriodeJournal;
}
