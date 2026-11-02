const JOUR_SEUL = /^\d{4}-\d{2}-\d{2}$/;

/** Vrai si la valeur est une date sans heure (« 2026-11-01 »). */
export const estJourSeul = (s: string) => JOUR_SEUL.test(s);

/**
 * Lit une date du serveur dans le fuseau du navigateur.
 * Une date sans heure (« 2026-11-01 ») est lue comme ce jour-là à minuit, heure locale :
 * `new Date("2026-11-01")` la lirait en UTC, soit la veille au soir en Haïti.
 */
export function dateLocale(s: string): Date {
  if (estJourSeul(s)) {
    const [a, m, j] = s.split('-').map(Number);
    return new Date(a, m - 1, j);
  }
  return new Date(s);
}
