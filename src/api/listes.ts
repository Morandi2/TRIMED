import apiClient from './apiConfig';

/** Liste renvoyée par l’API, paginée (`results`) ou non. */
export const enListe = <T,>(donnees: unknown): T[] => {
  const d = donnees as { results?: T[] } | T[] | null;
  if (Array.isArray(d)) return d;
  return d?.results ?? [];
};

interface OptionsLecture<T> {
  /** Nombre maximal de pages lues (le serveur renvoie 10 éléments par page). */
  maxPages?: number;
  /** Arrête la lecture dès qu’un élément remplit cette condition (ex. : trop ancien, avec un tri décroissant). */
  arreterSi?: (element: T) => boolean;
  signal?: AbortSignal;
}

/** Lit toutes les pages d’une liste, ou jusqu’à la condition d’arrêt. */
export async function lireTout<T>(chemin: string, params: Record<string, unknown> = {}, options: OptionsLecture<T> = {}): Promise<T[]> {
  const { maxPages = 30, arreterSi, signal } = options;
  const tout: T[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const { data } = await apiClient.get(chemin, { params: { ...params, page }, signal });
    const elements = enListe<T>(data);
    for (const e of elements) {
      if (arreterSi?.(e)) return tout;
      tout.push(e);
    }
    if (!data?.next) break;
  }
  return tout;
}

/** Lecture simple qui renvoie `null` au lieu d’échouer (pour les tableaux de bord). */
export async function lireOuNull<T>(chemin: string, params: Record<string, unknown> = {}): Promise<T | null> {
  try {
    const { data } = await apiClient.get(chemin, { params });
    return data as T;
  } catch {
    return null;
  }
}
