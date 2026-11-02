import { useEffect, useState } from 'react';
import { lireOuNull, lireTout } from '../../../api/listes';
import { dateLocale } from '../../../utils/dates';
import type { AdmissionL, ConsultationL, LitL, MedicamentL, RendezVousL, StatsRendezVous } from './donnees';

export type RolePersonnel = 'medecin' | 'infirmier' | 'secretaire' | 'personnel' | 'patient';

export interface OrdonnanceL { ordonnance_id: number; date_ordonnance: string; recommandations?: string; medecin_nom?: string; medecin_prenom?: string; nb_prescriptions?: number }
export interface ExamenL { examen_id: number; nom_examen: string; type_examen?: string; date_examen?: string; date_resultat?: string | null; patient_nom?: string; patient_prenom?: string; medecin_nom?: string }
export interface StatsStock { total_medicaments: number; medicaments_rupture: number; medicaments_stock_faible: number; valeur_stock_total: number; repartition_formes?: Record<string, number> }
interface PatientL { patient_id: number; nom: string; prenom: string }

export interface DonneesPersonnel {
  rendezVous: RendezVousL[];
  consultations: ConsultationL[];
  ordonnances: OrdonnanceL[];
  examens: ExamenL[];
  admissions: AdmissionL[];
  lits: LitL[];
  stockFaible: MedicamentL[];
  statsRdv: StatsRendezVous | null;
  statsStock: StatsStock | null;
  nomsPatients: Record<number, string>;
  nbPatients: number;
  nbMedecins: number;
}

const UN_AN = 366 * 24 * 3600 * 1000;
const sur = <T,>(p: Promise<T[]>) => p.catch(() => [] as T[]);
const vide = <T,>() => Promise.resolve([] as T[]);

/** Charge ce qui est utile au rôle, rien de plus (les listes du médecin et du patient sont déjà filtrées par le serveur). */
async function charger(role: RolePersonnel, hopitalId: number): Promise<DonneesPersonnel> {
  const ancien = (champ: string) => (e: Record<string, string>) => dateLocale(e[champ]).getTime() < Date.now() - UN_AN;
  const rdvRecents = (params: Record<string, unknown>) => sur(lireTout<RendezVousL>('/rendez-vous/', { ordering: '-date_heure', ...params }, { arreterSi: ancien('date_heure') as never }));

  // Le médecin et le patient ne doivent voir que leurs propres rendez-vous : on filtre explicitement,
  // car le serveur renvoie aujourd’hui tous les rendez-vous de l’hôpital (BACKEND_MODIFICATIONS.md, 0.6).
  let filtreRdv: Record<string, unknown> | null = {};
  let patients: PatientL[] = [];
  if (role === 'medecin') {
    const moi = (await sur(lireTout<{ medecin_id: number }>('/medical/medecins/', {}, { maxPages: 1 })))[0];
    filtreRdv = moi ? { medecin: moi.medecin_id } : null;
  }
  if (role === 'patient') {
    patients = await sur(lireTout<PatientL>('/patients/', {}, { maxPages: 1 }));
    filtreRdv = patients[0] ? { patient: patients[0].patient_id } : null;
  }

  const voitHospitalisation = role === 'infirmier' || role === 'medecin';
  const voitStock = role === 'infirmier' || role === 'personnel';
  const voitMedical = role === 'medecin' || role === 'patient' || role === 'infirmier';

  const [rendezVous, consultations, ordonnances, examens, admissions, stockFaible, statsRdv, statsStock, chambres, listePatients, medecins] = await Promise.all([
    filtreRdv ? rdvRecents(filtreRdv) : vide<RendezVousL>(),
    voitMedical ? sur(lireTout<ConsultationL>('/medical/consultations/', { ordering: '-date_consultation' }, { maxPages: 10 })) : vide<ConsultationL>(),
    role === 'medecin' || role === 'patient' ? sur(lireTout<OrdonnanceL>('/medical/ordonnances/', { ordering: '-date_ordonnance' }, { maxPages: 5 })) : vide<OrdonnanceL>(),
    voitMedical ? sur(lireTout<ExamenL>('/medical/examens/', { ordering: '-date_examen' }, { maxPages: 5 })) : vide<ExamenL>(),
    voitHospitalisation ? sur(lireTout<AdmissionL>('/hospitalisation/admissions/', { statut: 'hospitalise' }, { maxPages: 10 })) : vide<AdmissionL>(),
    voitStock ? sur(lireTout<MedicamentL>('/medicaments/stock_faible/')) : vide<MedicamentL>(),
    role === 'patient' ? Promise.resolve(null) : lireOuNull<StatsRendezVous>('/rendez-vous/statistiques/'),
    role === 'personnel' ? lireOuNull<StatsStock>('/medicaments/statistiques/') : Promise.resolve(null),
    role === 'infirmier' ? sur(lireTout<{ id: number }>('/hospitalisation/chambres/', { tenant: hopitalId })) : vide<{ id: number }>(),
    role === 'infirmier' || role === 'secretaire' || role === 'medecin' ? sur(lireTout<PatientL>('/patients/')) : Promise.resolve(patients),
    role === 'secretaire' ? lireOuNull<{ count?: number }>('/medical/medecins/') : Promise.resolve(null),
  ]);

  let lits: LitL[] = [];
  if (chambres.length) {
    const ids = new Set(chambres.map((c) => c.id));
    lits = (await sur(lireTout<LitL>('/hospitalisation/lits/', {}, { maxPages: 50 }))).filter((l) => ids.has(l.chambre));
  }

  return {
    rendezVous, consultations, ordonnances, examens, admissions, stockFaible, statsRdv, statsStock, lits,
    nomsPatients: Object.fromEntries(listePatients.map((p) => [p.patient_id, `${p.prenom} ${p.nom}`])),
    nbPatients: listePatients.length,
    nbMedecins: medecins?.count ?? 0,
  };
}

export function useDonneesPersonnel(role: RolePersonnel, hopitalId: number) {
  const [donnees, setDonnees] = useState<DonneesPersonnel | null>(null);
  const [erreur, setErreur] = useState(false);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let annule = false;
    setErreur(false);
    charger(role, hopitalId).then((d) => { if (!annule) setDonnees(d); }).catch(() => { if (!annule) setErreur(true); });
    return () => { annule = true; };
  }, [role, hopitalId, version]);
  return { donnees, erreur, actualiser: () => setVersion((v) => v + 1) };
}
