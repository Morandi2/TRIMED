import apiClient from './apiConfig';
import { lireTout } from './listes';
import type { Categorie } from './caisseApi';

export interface Assureur { id: number; nom: string; type_assureur: string; delai_paiement_jours: number; actif: boolean }
export interface Convention {
  id: number; assureur: number; assureur_nom: string; reference: string; date_debut: string; date_fin: string | null; actif: boolean;
  taux_par_categorie: Partial<Record<Categorie, number>>; plafond_par_facture: string | null; plafond_annuel: string | null;
  categories_accord_prealable: Categorie[]; codes_exclus: string[]; documents_requis: string[];
}
export interface Couverture {
  id: number; patient: number; convention: number; assureur_nom: string; numero_carte: string; est_assure_principal: boolean;
  nom_assure_principal: string; lien_avec_assure: string; date_debut: string; date_fin: string | null; actif: boolean; valide: boolean;
}
export interface AccordPrealable {
  id: number; couverture: number; visite: number | null; objet: string; montant_estime: string | null;
  statut: 'en_attente' | 'accorde' | 'refuse'; numero_accord: string; montant_accorde: string | null; date_demande: string; date_expiration: string | null;
}
export interface Justificatif { id: number; patient: number; type_document: string; titre: string; nom_fichier: string; facture: number | null; ajoute_le: string }
export interface LigneBordereau {
  id: number; facture: number; facture_numero: string; patient_nom: string; montant_reclame: string;
  statut: 'en_attente' | 'acceptee' | 'partielle' | 'rejetee'; montant_accepte: string | null; motif_rejet: string; refacture_au_patient: boolean;
}
export interface Bordereau {
  id: number; numero: string; assureur: number; assureur_nom: string; periode_debut: string; periode_fin: string;
  statut: 'prepare' | 'envoye' | 'partiellement_paye' | 'paye'; montant_reclame: string; montant_accepte: string; montant_paye: string;
  lignes: LigneBordereau[]; reglements: { id: number; montant: string; date: string; reference: string }[];
}

export const TYPES_JUSTIFICATIF: Record<string, string> = {
  carte_assurance: "Carte d'assurance", piece_identite: "Pièce d'identité", lettre_prise_en_charge: 'Lettre de prise en charge',
  ordonnance: 'Ordonnance', rapport_medical: 'Rapport médical', resultat_examen: "Résultat d'examen",
  formulaire_assureur: "Formulaire de l'assureur signé", autre: 'Autre',
};
export const STATUTS_BORDEREAU: Record<Bordereau['statut'], string> = {
  prepare: 'Préparé', envoye: 'Envoyé', partiellement_paye: 'Payé en partie', paye: 'Payé',
};

const A = '/assurances';
const d = <T,>(p: Promise<{ data: T }>) => p.then((r) => r.data);

export const assurancesApi = {
  assureurs: () => lireTout<Assureur>(`${A}/assureurs/`, {}, { sansCache: true }),
  conventions: () => lireTout<Convention>(`${A}/conventions/`, {}, { sansCache: true }),
  creerConvention: (c: Partial<Convention>) => d<Convention>(apiClient.post(`${A}/conventions/`, c)),
  modifierConvention: (id: number, c: Partial<Convention>) => d<Convention>(apiClient.patch(`${A}/conventions/${id}/`, c)),
  couvertures: (params: Record<string, unknown> = {}) => lireTout<Couverture>(`${A}/couvertures/`, params, { sansCache: true }),
  accords: (params: Record<string, unknown> = {}) => lireTout<AccordPrealable>(`${A}/accords/`, params, { sansCache: true }),
  demanderAccord: (a: { couverture: number; objet: string; montant_estime?: string }) => d<AccordPrealable>(apiClient.post(`${A}/accords/`, a)),
  repondreAccord: (id: number, r: { statut: 'accorde' | 'refuse'; numero_accord?: string; montant_accorde?: string; date_expiration?: string }) =>
    d<AccordPrealable>(apiClient.post(`${A}/accords/${id}/repondre/`, r)),
  justificatifs: (params: Record<string, unknown> = {}) => lireTout<Justificatif>(`${A}/justificatifs/`, params, { sansCache: true }),
  envoyerJustificatif: (form: FormData) => d<Justificatif>(apiClient.post(`${A}/justificatifs/`, form, { headers: { 'Content-Type': 'multipart/form-data' } })),
  async telechargerJustificatif(j: Justificatif) {
    const r = await apiClient.get(`${A}/justificatifs/${j.id}/telecharger/`, { responseType: 'blob' });
    const url = URL.createObjectURL(r.data as Blob);
    const lien = document.createElement('a');
    lien.href = url; lien.download = j.nom_fichier || `justificatif-${j.id}`; lien.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
  bordereaux: () => lireTout<Bordereau>(`${A}/bordereaux/`, {}, { sansCache: true, maxPages: 5 }),
  creerBordereau: (assureur: number, periode_debut: string, periode_fin: string) => d<Bordereau>(apiClient.post(`${A}/bordereaux/`, { assureur, periode_debut, periode_fin })),
  envoyerBordereau: (id: number) => d<Bordereau>(apiClient.post(`${A}/bordereaux/${id}/envoyer/`)),
  statuer: (id: number, ligne: number, montant_accepte: string, motif: string, refacturer: boolean) =>
    d<Bordereau>(apiClient.post(`${A}/bordereaux/${id}/statuer/`, { ligne, montant_accepte, motif, refacturer })),
  reglement: (id: number, montant: string, reference: string) => d<unknown>(apiClient.post(`${A}/bordereaux/${id}/reglement/`, { montant, reference })),
  creances: () => d<{ lignes: Record<string, string>[] }>(apiClient.get(`${A}/bordereaux/creances/`)),
};
