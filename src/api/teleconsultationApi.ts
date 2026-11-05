import apiClient from './apiConfig';
import { lireTout } from './listes';

export type StatutTeleconsultation = 'planifiee' | 'patient_en_attente' | 'en_cours' | 'terminee' | 'annulee';

export interface Teleconsultation {
  id: number; patient: number; patient_nom: string; medecin: number; medecin_nom: string; rendez_vous: number | null;
  visite: number | null; date_prevue: string; motif: string; statut: StatutTeleconsultation; consentement_le: string | null;
  mode_audio: boolean; patient_arrive_le: string | null; debut: string | null; fin: string | null;
}
/** Informations remises au seul participant (patient ou médecin) pour entrer dans la salle vidéo. */
export interface Connexion {
  role: 'medecin' | 'patient'; moderateur: boolean; nom_affiche: string; mode_audio: boolean;
  fournisseur: 'jaas' | 'jitsi' | 'public'; domaine: string; salle: string; script: string; jwt: string | null;
}

export const LIBELLES_STATUT_TC: Record<StatutTeleconsultation, string> = {
  planifiee: 'Planifiée', patient_en_attente: "Patient en salle d'attente", en_cours: 'En cours', terminee: 'Terminée', annulee: 'Annulée',
};

const T = '/teleconsultations';
const d = <R,>(p: Promise<{ data: R }>) => p.then((r) => r.data);

export const teleconsultationApi = {
  liste: (params: Record<string, unknown> = {}) => lireTout<Teleconsultation>(`${T}/`, { ordering: 'date_prevue', ...params }, { sansCache: true, maxPages: 5 }),
  planifier: (t: { patient: number; medecin: number; date_prevue: string; motif?: string }) => d<Teleconsultation>(apiClient.post(`${T}/`, t)),
  consentir: (id: number, mode_audio: boolean) => d<Teleconsultation>(apiClient.post(`${T}/${id}/consentir/`, { mode_audio })),
  rejoindre: (id: number) => d<Connexion>(apiClient.post(`${T}/${id}/rejoindre/`)),
  salleAttente: () => d<Teleconsultation[]>(apiClient.get(`${T}/salle_attente/`, { headers: { 'X-Sans-Cache': '1' } })),
  demarrer: (id: number) => d<Teleconsultation>(apiClient.post(`${T}/${id}/demarrer/`)),
  terminer: (id: number) => d<Teleconsultation>(apiClient.post(`${T}/${id}/terminer/`)),
  annuler: (id: number) => d<Teleconsultation>(apiClient.post(`${T}/${id}/annuler/`)),
};

/** La salle s'ouvre 15 minutes avant l'heure prévue et reste ouverte 3 heures. */
export function salleOuverte(t: Teleconsultation, maintenant = Date.now()) {
  if (t.statut === 'en_cours') return true;
  if (t.statut === 'terminee' || t.statut === 'annulee') return false;
  const prevu = new Date(t.date_prevue).getTime();
  return maintenant >= prevu - 15 * 60_000 && maintenant <= prevu + 3 * 3600_000;
}
