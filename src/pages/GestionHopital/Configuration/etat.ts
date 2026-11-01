// Marqueur de session : l’hôpital a déjà ses paramètres, inutile de rouvrir l’assistant.
export const cleHopitalConfigure = (hopitalId: number) => `trimed-hopital-configure-${hopitalId}`;

export function marquerHopitalConfigure(hopitalId: number) {
  try { sessionStorage.setItem(cleHopitalConfigure(hopitalId), '1'); } catch { /* stockage indisponible */ }
}

export function hopitalDejaConfigure(hopitalId: number) {
  try { return !!sessionStorage.getItem(cleHopitalConfigure(hopitalId)); } catch { return false; }
}

/** Liste renvoyée par l’API, paginée ou non. */
export const enListe = <T,>(donnees: unknown): T[] => {
  const d = donnees as { results?: T[] } | T[] | null;
  if (Array.isArray(d)) return d;
  return d?.results ?? [];
};

type Lecture = (params?: Record<string, unknown>) => Promise<{ success: boolean; data?: unknown; message?: string }>;

/** Lit toutes les pages d’une liste (le serveur renvoie 10 éléments par page, quoi qu’on demande). */
export async function toutesLesPages<T>(lire: Lecture, params: Record<string, unknown> = {}) {
  const tout: T[] = [];
  for (let page = 1; page <= 50; page++) {
    const res = await lire({ ...params, page });
    if (!res.success) return page === 1 ? { success: false as const, message: res.message, data: tout } : { success: true as const, data: tout };
    tout.push(...enListe<T>(res.data));
    if (!(res.data as { next?: string | null } | undefined)?.next) break;
  }
  return { success: true as const, data: tout };
}
