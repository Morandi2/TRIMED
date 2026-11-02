import type { UserPermissions } from '../types/userRoles';

// Chargeurs des modules de l’espace connecté. App.tsx s’en sert pour le chargement à la demande ;
// le tableau de bord s’en sert pour précharger, pendant que le navigateur est libre, les modules du rôle.
export const modules = {
  patient: () => import('../pages/GestionHopital/Patient'),
  consultation: () => import('../pages/GestionHopital/Consultation'),
  medecin: () => import('../pages/GestionHopital/Medecin'),
  medicament: () => import('../pages/GestionHopital/Medicament'),
  ordonnance: () => import('../pages/GestionHopital/Ordonnance'),
  examen: () => import('../pages/GestionHopital/Examen'),
  hospitalisation: () => import('../pages/GestionHopital/Hospitalisation'),
  rendezVous: () => import('../pages/GestionHopital/RendezVous'),
  calendrier: () => import('../pages/Calendar'),
};

type NomModule = keyof typeof modules;

const DROITS: [NomModule, keyof UserPermissions][] = [
  ['patient', 'canViewPatients'], ['rendezVous', 'canViewRendezVous'], ['consultation', 'canViewConsultations'],
  ['medicament', 'canViewMedicaments'], ['ordonnance', 'canViewOrdonnances'], ['medecin', 'canViewMedecins'],
  ['examen', 'canViewConsultations'], ['hospitalisation', 'canGererHospitalisation'], ['calendrier', 'canViewCalendar'],
];

let fait = false;

/** Précharge, un par un et quand le navigateur est libre, les modules auxquels le rôle a accès. */
export function prechargerModules(permissions: UserPermissions) {
  if (fait) return;
  const connexion = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (connexion?.saveData || ['slow-2g', '2g'].includes(connexion?.effectiveType ?? '')) return;
  fait = true;
  const file = DROITS.filter(([, droit]) => permissions[droit]).map(([nom]) => modules[nom]);
  const w = window as Window & { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number };
  const suivant = () => {
    const charger = file.shift();
    if (!charger) return;
    charger().catch(() => undefined).finally(() => (w.requestIdleCallback ? w.requestIdleCallback(suivant, { timeout: 3000 }) : setTimeout(suivant, 800)));
  };
  setTimeout(suivant, 2500);
}
