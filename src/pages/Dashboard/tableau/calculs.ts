// Calculs du tableau de bord à partir des listes du serveur (fonctions pures, testées).
import { dateLocale } from '../../../utils/dates';

export const JOUR = 24 * 3600 * 1000;
const MOIS_COURTS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

const debutJour = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Nombre d’éléments par jour sur les `n` derniers jours (aujourd’hui inclus). */
export function parJour(dates: (string | undefined)[], n: number, maintenant = new Date()) {
  const fin = debutJour(maintenant).getTime();
  const jours = Array.from({ length: n }, (_, i) => new Date(fin - (n - 1 - i) * JOUR));
  const compte = new Array(n).fill(0);
  for (const s of dates) {
    if (!s) continue;
    const i = n - 1 - Math.round((fin - debutJour(dateLocale(s)).getTime()) / JOUR);
    if (i >= 0 && i < n) compte[i]++;
  }
  return { jours, compte };
}

/** Nombre d’éléments par mois sur les `n` derniers mois (mois en cours inclus). */
export function parMois(dates: (string | undefined)[], n: number, maintenant = new Date()) {
  const mois = Array.from({ length: n }, (_, i) => new Date(maintenant.getFullYear(), maintenant.getMonth() - (n - 1 - i), 1));
  const compte = new Array(n).fill(0);
  const cle = (d: Date) => d.getFullYear() * 12 + d.getMonth();
  const premier = cle(mois[0]);
  for (const s of dates) {
    if (!s) continue;
    const i = cle(dateLocale(s)) - premier;
    if (i >= 0 && i < n) compte[i]++;
  }
  return { libelles: mois.map((m) => `${MOIS_COURTS[m.getMonth()]}${m.getMonth() === 0 ? ` ${String(m.getFullYear()).slice(2)}` : ''}`), compte };
}

/** Variation en % entre deux valeurs (null si la base est nulle). */
export const variation = (actuel: number, precedent: number) => (precedent ? Math.round(((actuel - precedent) / precedent) * 100) : null);

export const TRANCHES_AGE = ['0–14 ans', '15–24 ans', '25–44 ans', '45–64 ans', '65 ans et +'];

export function repartitionAges(ages: (number | null | undefined)[]) {
  const compte = new Array(TRANCHES_AGE.length).fill(0);
  for (const a of ages) {
    if (a === null || a === undefined || Number.isNaN(a)) continue;
    compte[a < 15 ? 0 : a < 25 ? 1 : a < 45 ? 2 : a < 65 ? 3 : 4]++;
  }
  return compte;
}

/** Taux d’occupation en % (0 si aucun lit). */
export const tauxOccupation = (occupes: number, total: number) => (total ? Math.round((occupes / total) * 100) : 0);

/** Les `n` prochains éléments datés à partir de maintenant, du plus proche au plus lointain. */
export function prochains<T>(elements: T[], date: (e: T) => string | undefined, n: number, maintenant = new Date()) {
  const t = maintenant.getTime();
  return elements
    .filter((e) => { const d = date(e); return d && dateLocale(d).getTime() >= t - 15 * 60 * 1000; })
    .sort((a, b) => dateLocale(date(a)!).getTime() - dateLocale(date(b)!).getTime())
    .slice(0, n);
}
