import apiClient from './apiConfig';
import { ENTETE_SANS_CACHE } from './cacheApi';
import { lireTout } from './listes';

// Caisse des patients (/api/caisse/) et tiers payant (/api/assurances/). Les montants arrivent en chaînes
// décimales (« 1250.00 ») : on les convertit au moment de les afficher ou de calculer.

export type Categorie = 'consultation' | 'examen' | 'medicament' | 'hospitalisation' | 'soin' | 'chirurgie' | 'autre';
export type StatutFacture = 'brouillon' | 'emise' | 'partiellement_payee' | 'payee' | 'annulee';
export type ModePaiement = 'especes' | 'moncash' | 'natcash' | 'carte' | 'virement' | 'cheque';

export interface ActeTarif {
  id: number; code: string; libelle: string; categorie: Categorie; prix: string; specialite: number | null;
  type_chambre: string; compte_comptable: string; actif: boolean; date_debut: string; date_fin: string | null;
}
export interface ParametresCaisse {
  prefixe: string; categories_payees_avant: Categorie[]; paiement_bloquant: boolean; remise_max_pourcent: string; devises_acceptees: string[];
}
export interface TauxChange { id: number; devise: string; taux: string; date: string }
export interface ElementFacturable {
  id: number; patient: number; visite: number | null; categorie: Categorie; acte: number | null; libelle: string;
  quantite: string; prix_unitaire: string; montant: string; source_type: string; source_id: number | null;
  statut: 'a_facturer' | 'facture' | 'annule'; facture: number | null; cree_le: string;
}
export interface Paiement {
  id: number; numero_recu: string; facture: number | null; visite: number | null; patient: number; mode: ModePaiement;
  devise: string; montant_devise: string; taux: string; montant_htg: string; monnaie_rendue_htg: string; reference: string;
  est_remboursement: boolean; motif: string; encaisse_par_nom: string; date: string;
}
export interface Facture {
  id: number; numero: string; patient: number; patient_nom: string; visite: number | null; statut: StatutFacture;
  est_avoir: boolean; date_emission: string | null; sous_total: string; remise_montant: string; remise_motif: string;
  part_assurance: string; couverture: number | null; total: string; montant_paye: string; reste_du: string; cree_le: string;
  notes: string; elements?: ElementFacturable[]; paiements?: Paiement[];
}
export interface SessionCaisse {
  id: number; caissier: number; caissier_nom: string; statut: 'ouverte' | 'fermee'; ouverte_le: string; fermee_le: string | null;
  fond_initial: string; montants_declares: Record<string, string>; attendu: Record<string, string>; ecarts: Record<string, string>;
  en_cours?: { attendu: Record<string, string>; par_mode: Record<string, string> };
}
export interface Rapport { colonnes: string[]; lignes: Record<string, string | number>[] }

export const LIBELLES_CATEGORIE: Record<Categorie, string> = {
  consultation: 'Consultation', examen: 'Examen', medicament: 'Médicament', hospitalisation: "Journée d'hospitalisation",
  soin: 'Soin infirmier', chirurgie: 'Chirurgie', autre: 'Autre',
};
export const LIBELLES_STATUT: Record<StatutFacture, string> = {
  brouillon: 'Brouillon', emise: 'À payer', partiellement_payee: 'Payée en partie', payee: 'Payée', annulee: 'Annulée',
};
export const LIBELLES_MODE: Record<ModePaiement, string> = {
  especes: 'Espèces', moncash: 'MonCash', natcash: 'NatCash', carte: 'Carte', virement: 'Virement', cheque: 'Chèque',
};

const C = '/caisse';
const SANS_CACHE = { [ENTETE_SANS_CACHE]: '1' };
const donnees = <T,>(p: Promise<{ data: T }>) => p.then((r) => r.data);

export const caisseApi = {
  parametres: () => donnees<ParametresCaisse>(apiClient.get(`${C}/parametres/`)),
  modifierParametres: (d: Partial<ParametresCaisse>) => donnees<ParametresCaisse>(apiClient.patch(`${C}/parametres/`, d)),
  actes: (params: Record<string, unknown> = {}) => lireTout<ActeTarif>(`${C}/actes/`, params),
  taux: () => lireTout<TauxChange>(`${C}/taux/`, { ordering: '-date' }, { maxPages: 2 }),
  ajouterTaux: (devise: string, taux: string) => donnees<TauxChange>(apiClient.post(`${C}/taux/`, { devise, taux })),

  elements: (params: Record<string, unknown>) => lireTout<ElementFacturable>(`${C}/elements/`, params, { sansCache: true }),
  ajouterElement: (patient: number, acte: number, quantite = 1, visite?: number | null) =>
    donnees<ElementFacturable>(apiClient.post(`${C}/elements/`, { patient, acte, quantite, ...(visite ? { visite } : {}) })),
  annulerElement: (id: number) => donnees<ElementFacturable>(apiClient.post(`${C}/elements/${id}/annuler/`)),

  factures: (params: Record<string, unknown> = {}) => lireTout<Facture>(`${C}/factures/`, { ordering: '-cree_le', ...params }, { sansCache: true, maxPages: 5 }),
  facture: (id: number) => donnees<Facture>(apiClient.get(`${C}/factures/${id}/`, { headers: SANS_CACHE })),
  creerFacture: (patient: number, visite?: number | null) => donnees<Facture>(apiClient.post(`${C}/factures/`, { patient, ...(visite ? { visite } : {}) })),
  remise: (id: number, montant: string, motif: string) => donnees<Facture>(apiClient.post(`${C}/factures/${id}/remise/`, { montant, motif })),
  emettre: (id: number) => donnees<Facture>(apiClient.post(`${C}/factures/${id}/emettre/`)),
  annulerFacture: (id: number, motif: string) => donnees<{ facture: Facture; avoir: Facture | null }>(apiClient.post(`${C}/factures/${id}/annuler/`, { motif })),

  encaisser: (d: { facture?: number; visite?: number; mode: ModePaiement; devise: string; montant_devise: string; reference?: string }) =>
    donnees<Paiement>(apiClient.post(`${C}/paiements/`, d)),
  rembourser: (id: number, motif: string) => donnees<Paiement>(apiClient.post(`${C}/paiements/${id}/rembourser/`, { motif })),
  paiements: (params: Record<string, unknown>) => lireTout<Paiement>(`${C}/paiements/`, params, { sansCache: true, maxPages: 5 }),

  sessionCourante: () => donnees<SessionCaisse | null>(apiClient.get(`${C}/sessions/courante/`, { headers: SANS_CACHE })),
  ouvrirSession: (fond_initial: string) => donnees<SessionCaisse>(apiClient.post(`${C}/sessions/ouvrir/`, { fond_initial })),
  fermerSession: (id: number, montants_declares: Record<string, string>) =>
    donnees<SessionCaisse>(apiClient.post(`${C}/sessions/${id}/fermer/`, { montants_declares })),

  delivrer: (d: { patient: number; medicament: number; quantite: number; ordonnance?: number; prescription?: number }) =>
    donnees<{ id: number }>(apiClient.post(`${C}/dispensations/`, d)),

  rapport: (nom: 'journal_ventes' | 'journal_encaissements' | 'creances' | 'recettes', params: Record<string, string> = {}) =>
    donnees<Rapport>(apiClient.get(`${C}/rapports/${nom}/`, { params, headers: SANS_CACHE })),
  /** Télécharge le rapport en CSV (point-virgule, pour Excel). */
  async telechargerCsv(nom: string, params: Record<string, string> = {}) {
    const r = await apiClient.get(`${C}/rapports/${nom}/`, { params: { ...params, export: 'csv' }, responseType: 'blob' });
    const url = URL.createObjectURL(r.data as Blob);
    const lien = document.createElement('a');
    lien.href = url;
    lien.download = `${nom.replace(/_/g, '-')}-${params.du ?? ''}-${params.au ?? ''}.csv`.replace(/--+/g, '-');
    lien.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
};

/** Montant décimal en nombre (0 si vide). */
export const nombre = (v: string | number | null | undefined) => (v === null || v === undefined || v === '' ? 0 : Number(v));

/** « 1 250,00 HTG » (ou autre devise). */
export function montant(v: string | number | null | undefined, devise = 'HTG') {
  return `${nombre(v).toLocaleString('fr-HT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${devise}`;
}

/** Ce que la caisse rend en gourdes, et ce qui est porté au crédit de la facture. */
export function calculerMonnaie(resteDu: number, montantDevise: number, taux: number) {
  const recu = Math.round(montantDevise * taux * 100) / 100;
  const applique = Math.min(recu, resteDu);
  return { recu, applique, monnaie: Math.max(0, Math.round((recu - applique) * 100) / 100) };
}

/** Le serveur n'a pas encore ce module (mise à jour en cours de déploiement) : 404 sur la route. */
export const moduleAbsent = (e: unknown) => (e as { response?: { status?: number } })?.response?.status === 404;

/** Adaptateur pour GenericCrudManager (même forme que les autres modules : { success, data, message }). */
export function crud(chemin: string, libelle: string) {
  const erreur = (e: unknown, message: string) => {
    const d = (e as { response?: { data?: unknown } })?.response?.data;
    const detail = d && typeof d === 'object' ? Object.values(d as Record<string, unknown>).flat().join(' ') : '';
    return { success: false, message: detail || message, errors: d };
  };
  return {
    getAll: async (params?: Record<string, unknown>) => {
      try { return { success: true, data: await lireTout(chemin, params ?? {}, { sansCache: true }) }; } catch (e) { return erreur(e, `Lecture impossible (${libelle})`); }
    },
    create: async (d: Record<string, unknown>) => {
      try { return { success: true, data: (await apiClient.post(chemin, d)).data, message: `${libelle} enregistré` }; } catch (e) { return erreur(e, `Enregistrement impossible (${libelle})`); }
    },
    update: async (id: number, d: Record<string, unknown>) => {
      try { return { success: true, data: (await apiClient.patch(`${chemin}${id}/`, d)).data, message: `${libelle} modifié` }; } catch (e) { return erreur(e, `Modification impossible (${libelle})`); }
    },
    delete: async (id: number) => {
      try { await apiClient.delete(`${chemin}${id}/`); return { success: true, message: `${libelle} supprimé` }; } catch (e) { return erreur(e, `Suppression impossible (${libelle})`); }
    },
  };
}
