// Vocabulaire commun des disponibilités (lits et salles) et règles d’état, partagés par la page
// « Lits et salles », le module Hospitalisation et les tableaux de bord.

export type EtatLit = 'libre' | 'occupe' | 'reserve' | 'nettoyage' | 'hors_service';
export type EtatSalle = 'disponible' | 'occupee' | 'reservee' | 'nettoyage' | 'maintenance';

export const LIBELLES_LIT: Record<EtatLit, string> = { libre: 'Libre', occupe: 'Occupé', reserve: 'Réservé', nettoyage: 'Nettoyage', hors_service: 'Hors service' };
export const LIBELLES_SALLE: Record<EtatSalle, string> = { disponible: 'Disponible', occupee: 'Occupée', reservee: 'Réservée', nettoyage: 'Nettoyage', maintenance: 'Maintenance' };

/** États qu’on peut choisir à la main. « Occupé » d’un lit vient toujours d’une hospitalisation. */
export const ETATS_LIT_MANUELS: EtatLit[] = ['libre', 'reserve', 'nettoyage', 'hors_service'];
export const ETATS_SALLE_MANUELS: EtatSalle[] = ['disponible', 'occupee', 'nettoyage', 'maintenance'];

export const COULEURS_ETAT: Record<EtatLit | EtatSalle, string> = {
  libre: 'bg-trimed-vert text-white', disponible: 'bg-trimed-vert text-white',
  occupe: 'bg-brand-500 text-white', occupee: 'bg-brand-500 text-white',
  reserve: 'bg-amber-400 text-gray-900', reservee: 'bg-amber-400 text-gray-900',
  nettoyage: 'bg-sky-400 text-gray-900',
  hors_service: 'bg-gray-400 text-white', maintenance: 'bg-gray-400 text-white',
};

/** Lit le statut enregistré (anciennes valeurs comprises : « disponible », « maintenance »). */
export function normaliserEtatLit(statut?: string | null): EtatLit {
  const s = (statut || '').toLowerCase().trim();
  if (s === 'occupe' || s === 'occupé' || s === 'occupee') return 'occupe';
  if (s === 'reserve' || s === 'réservé') return 'reserve';
  if (s === 'nettoyage') return 'nettoyage';
  if (s === 'hors_service' || s === 'maintenance' || s === 'indisponible') return 'hors_service';
  return 'libre';
}

export function normaliserEtatSalle(statut?: string | null): EtatSalle {
  const s = (statut || '').toLowerCase().trim();
  if (s === 'occupee' || s === 'occupée' || s === 'occupe') return 'occupee';
  if (s === 'nettoyage') return 'nettoyage';
  if (s === 'maintenance' || s === 'hors_service' || s === 'indisponible') return 'maintenance';
  return 'disponible';
}

export interface AdmissionActive { lit: number; statut: string }

/**
 * État affiché d’un lit : une hospitalisation en cours l’emporte toujours (« Occupé » automatique) ;
 * sinon, l’état choisi par le secrétariat. Un lit noté « occupé » sans hospitalisation passe en nettoyage.
 */
export function etatLit(lit: { id: number; statut?: string | null }, admissions: AdmissionActive[]): { etat: EtatLit; automatique: boolean } {
  if (admissions.some((a) => a.lit === lit.id && a.statut === 'hospitalise')) return { etat: 'occupe', automatique: true };
  const enregistre = normaliserEtatLit(lit.statut);
  return { etat: enregistre === 'occupe' ? 'nettoyage' : enregistre, automatique: false };
}

export interface Reservation { id: number; salle: number; date_debut: string; date_fin: string; statut?: string; motif?: string }

/** Réservations confirmées d’une salle, en cours ou à venir, de la plus proche à la plus lointaine. */
export function reservationsActives(salle: number, reservations: Reservation[], maintenant = new Date()) {
  const t = maintenant.getTime();
  return reservations
    .filter((r) => r.salle === salle && (r.statut ?? 'confirmee') === 'confirmee' && new Date(r.date_fin).getTime() > t)
    .sort((a, b) => new Date(a.date_debut).getTime() - new Date(b.date_debut).getTime());
}

/** État affiché d’une salle : une réservation en cours l’emporte (« Réservée » automatique). */
export function etatSalle(salle: { id: number; statut?: string | null }, reservations: Reservation[], maintenant = new Date()): { etat: EtatSalle; automatique: boolean; enCours?: Reservation } {
  const t = maintenant.getTime();
  const enCours = reservationsActives(salle.id, reservations, maintenant).find((r) => new Date(r.date_debut).getTime() <= t);
  if (enCours) return { etat: /nettoyage/i.test(enCours.motif || '') ? 'nettoyage' : /maintenance/i.test(enCours.motif || '') ? 'maintenance' : 'reservee', automatique: true, enCours };
  return { etat: normaliserEtatSalle(salle.statut), automatique: false };
}

/** Synchronisation des statuts enregistrés après un changement d’hospitalisation. */
export function corrections(lits: { id: number; statut?: string | null }[], admissions: AdmissionActive[]) {
  const occupes = new Set(admissions.filter((a) => a.statut === 'hospitalise').map((a) => a.lit));
  return lits.flatMap((l) => {
    const e = normaliserEtatLit(l.statut);
    if (occupes.has(l.id) && e !== 'occupe') return [{ id: l.id, statut: 'occupe' as EtatLit }];
    if (!occupes.has(l.id) && e === 'occupe') return [{ id: l.id, statut: 'nettoyage' as EtatLit }];
    return [];
  });
}
