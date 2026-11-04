import { useEffect, useState } from 'react';
import { lireTout } from '../../../api/listes';

/** Champ sans largeur imposée : à compléter par w-28, w-40… (sinon w-full l'emporte). */
export const champBase = 'h-11 rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/15 dark:border-gray-700 dark:bg-gray-900 dark:text-white';
export const champ = `${champBase} w-full`;
export const bouton = 'inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50';
export const boutonSecondaire = 'inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200';
export const carte = 'rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]';
export const titreCarte = 'font-marque text-base text-gray-900 dark:text-white';
export const alerte = 'rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300';
export const info = 'rounded-xl bg-trimed-brume px-4 py-3 text-sm text-trimed-vert-fonce dark:bg-white/5 dark:text-trimed-menthe';

export const jourFr = (iso?: string | null) => (iso ? new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString('fr-HT', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
export const dateHeure = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('fr-HT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

/** Message lisible à partir d'une erreur de l'API (détail, liste ou dictionnaire de champs). */
export function messageErreur(e: unknown, defaut: string) {
  const d = (e as { response?: { data?: unknown } })?.response?.data;
  if (typeof d === 'string') return d;
  if (Array.isArray(d)) return d.join(' ');
  if (d && typeof d === 'object') {
    const valeurs = Object.values(d as Record<string, unknown>).flatMap((v) => (typeof v === 'object' && v && !Array.isArray(v) ? Object.values(v) : v));
    return valeurs.flat().join(' ') || defaut;
  }
  return defaut;
}

interface PatientNom { patient_id: number; nom: string; prenom: string; numero_dossier_medical?: string }

/** Noms des patients de l'hôpital (les listes de la caisse ne donnent que l'identifiant). */
export function usePatients() {
  const [patients, setPatients] = useState<PatientNom[]>([]);
  useEffect(() => { lireTout<PatientNom>('/patients/').then(setPatients).catch(() => setPatients([])); }, []);
  const nom = (id: number) => { const p = patients.find((x) => x.patient_id === id); return p ? `${p.prenom} ${p.nom}` : `Patient n° ${id}`; };
  return { patients, nom };
}
