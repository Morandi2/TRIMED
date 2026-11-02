import { useEffect, useState } from 'react';
import { lireOuNull, lireTout } from '../../../api/listes';

export interface PatientL { patient_id: number; sexe?: string; age?: number | null }
export interface ConsultationL { consultation_id: number; date_consultation: string; motif?: string; patient_nom?: string; patient_prenom?: string; medecin_nom?: string; medecin_prenom?: string }
export interface RendezVousL { rendez_vous_id: number; date_heure: string; motif?: string; patient_nom?: string; patient_prenom?: string; medecin_nom?: string; medecin_prenom?: string; type_nom?: string; statut_nom?: string; statut_couleur?: string }
export interface AdmissionL { id: number; date_admission: string; date_sortie?: string | null; statut: string; lit: number }
export interface LitL { id: number; numero_lit: string; statut?: string; chambre: number }
export interface MedicamentL { medicament_id: number; nom: string; stock_actuel: number; stock_minimum: number; dosage_standard?: string }
export interface StatsRendezVous { total: number; aujourd_hui: number; cette_semaine: number; par_statut: Record<string, number>; par_medecin: Record<string, number> }
export interface StatsMedicaments { total_medicaments: number; medicaments_rupture: number; medicaments_stock_faible: number; valeur_stock_total: number }

export interface DonneesTableau {
  patients: PatientL[];
  consultations: ConsultationL[];
  rendezVous: RendezVousL[];
  admissions: AdmissionL[];
  lits: LitL[];
  stockFaible: MedicamentL[];
  statsRdv: StatsRendezVous | null;
  statsMedicaments: StatsMedicaments | null;
  chargeLe: number;
}

const DUREE_CACHE = 2 * 60 * 1000;
const cache = new Map<number, DonneesTableau>();
const UN_AN = 366 * 24 * 3600 * 1000;

async function charger(hopitalId: number): Promise<DonneesTableau> {
  const ilYaUnAn = Date.now() - UN_AN;
  const recent = (champ: string) => (e: Record<string, string>) => new Date(e[champ]).getTime() < ilYaUnAn;
  const sur = <T,>(p: Promise<T[]>) => p.catch(() => [] as T[]);

  // Les chambres ne sont pas filtrées par hôpital côté serveur : on filtre explicitement
  // pour ne compter que les lits de cet hôpital (voir BACKEND_MODIFICATIONS.md, 0.2).
  const chambres = await sur(lireTout<{ id: number }>('/hospitalisation/chambres/', { tenant: hopitalId }));
  const idsChambres = new Set(chambres.map((c) => c.id));

  const [patients, consultations, rendezVous, admissions, lits, stockFaible, statsRdv, statsMedicaments] = await Promise.all([
    sur(lireTout<PatientL>('/patients/')),
    sur(lireTout<ConsultationL>('/medical/consultations/', { ordering: '-date_consultation' }, { arreterSi: recent('date_consultation') as never })),
    sur(lireTout<RendezVousL>('/rendez-vous/', { ordering: '-date_heure' }, { arreterSi: recent('date_heure') as never })),
    sur(lireTout<AdmissionL>('/hospitalisation/admissions/', { ordering: '-date_admission' }, { maxPages: 10 })),
    sur(lireTout<LitL>('/hospitalisation/lits/', {}, { maxPages: 50 })),
    sur(lireTout<MedicamentL>('/medicaments/stock_faible/')),
    lireOuNull<StatsRendezVous>('/rendez-vous/statistiques/'),
    lireOuNull<StatsMedicaments>('/medicaments/statistiques/'),
  ]);

  return {
    patients, consultations, rendezVous, admissions, stockFaible, statsRdv, statsMedicaments,
    lits: lits.filter((l) => idsChambres.has(l.chambre)),
    chargeLe: Date.now(),
  };
}

/** Données du tableau de bord de l’hôpital, gardées 2 minutes pour un retour instantané. */
export function useDonneesTableau(hopitalId: number) {
  const enCache = cache.get(hopitalId);
  const [donnees, setDonnees] = useState<DonneesTableau | null>(enCache ?? null);
  const [erreur, setErreur] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!hopitalId) return;
    const c = cache.get(hopitalId);
    if (c && Date.now() - c.chargeLe < DUREE_CACHE && version === 0) { setDonnees(c); return; }
    let annule = false;
    setErreur(false);
    charger(hopitalId)
      .then((d) => { if (annule) return; cache.set(hopitalId, d); setDonnees(d); })
      .catch(() => { if (!annule) setErreur(true); });
    return () => { annule = true; };
  }, [hopitalId, version]);

  return { donnees, erreur, actualiser: () => setVersion((v) => v + 1) };
}
