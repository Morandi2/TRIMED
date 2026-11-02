export type CategorieJournal = 'Connexion' | 'Compte' | 'Consultation' | 'Ordonnance' | 'Examen' | 'Hospitalisation' | 'Hôpital';

/** Un événement du journal d’activité, reconstitué à partir des données datées du serveur. */
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
}

export type PeriodeJournal = 'jour' | 'semaine' | 'mois' | 'tout';

export interface FiltresJournal {
  recherche: string;
  categorie: CategorieJournal | '';
  periode: PeriodeJournal;
}
