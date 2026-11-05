import apiClient from './apiConfig';
import { ENTETE_SANS_CACHE } from './cacheApi';

// Rapport mensuel d'activité (GET /api/rapports/mensuel/?mois=AAAA-MM), exigence EF13.0.

export interface LigneAgeSexe {
  groupe: string;
  nouvelles_m: number; nouvelles_f: number; nouvelles_autre: number;
  revisites_m: number; revisites_f: number; revisites_autre: number;
  total: number;
}

export interface RapportMensuel {
  hopital: { id: number; nom: string };
  periode: { annee: number; mois: number; libelle: string; debut: string; fin: string; debut_exercice: string };
  genere_le: string;
  consultations: { total: number; visites_nouvelles: number; revisites: number; par_age_sexe: LigneAgeSexe[]; urgences: number; teleconsultations: number };
  morbidite: {
    consultations_codees: number; consultations_non_codees: number;
    principales: { code: string; libelle: string; moins_5_ans: number; cinq_ans_et_plus: number; age_inconnu: number; total: number }[];
  };
  sante_maternelle: { consultations_prenatales: number; accouchements: number; cesariennes: number; consultations_postnatales: number };
  hospitalisation: {
    admissions: number; sorties: number; transferts: number; hospitalises_fin_de_mois: number; journees: number; lits: number;
    taux_occupation: number | null; duree_moyenne_sejour: number | null;
  };
  examens: { total: number; avec_resultat: number; par_type: { type_examen: string; nombre: number }[] };
  pharmacie: { delivrances: number; unites: number; principaux: { nom: string; unites: number }[]; ruptures: number; stock_faible: number };
  rendez_vous: { prevus: number; honores: number; annules: number };
  definitions: string[];
}

export const TYPES_EXAMEN: Record<string, string> = {
  biologie: 'Biologie', imagerie: 'Imagerie', radiologie: 'Radiologie', echographie: 'Échographie', ecg: 'Électrocardiogramme',
};

/** Mois précédent, au format AAAA-MM (le mois en cours n'est pas terminé). */
export const moisPrecedent = (maintenant = new Date()) => {
  const d = new Date(maintenant.getFullYear(), maintenant.getMonth() - 1, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const rapportsApi = {
  async mensuel(mois: string): Promise<RapportMensuel> {
    const { data } = await apiClient.get('/rapports/mensuel/', { params: { mois }, headers: { [ENTETE_SANS_CACHE]: '1' } });
    return data as RapportMensuel;
  },
  /** Le rapport en CSV (l'export est tracé dans le journal d'audit). */
  async exporter(mois: string): Promise<Blob> {
    const { data } = await apiClient.get('/rapports/mensuel/', { params: { mois, export: 'csv' }, responseType: 'blob' });
    return data as Blob;
  },
};
