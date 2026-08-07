import apiClient from './apiConfig';

/**
 * Rassemble TOUTES les pages d'une réponse paginée DRF.
 *
 * DRF renvoie `{ count, next, previous, results: [...] }`. Lorsqu'il y a plus
 * d'éléments que `page_size`, `next` contient l'URL de la page suivante. Cette
 * fonction suit ces liens pour éviter toute troncature des données au-delà de
 * la première page (ex: plus de 1000 patients).
 *
 * - Si la réponse n'est pas paginée (tableau simple), elle est renvoyée telle quelle.
 * - Aucune requête supplémentaire n'est faite s'il n'y a pas de `next`.
 * - `signal` permet d'annuler la récupération (cohérent avec le reste de l'app).
 */
export async function collectAllPages(firstPage: any, signal?: AbortSignal): Promise<any[]> {
  let results: any[] = Array.isArray(firstPage?.results)
    ? [...firstPage.results]
    : Array.isArray(firstPage)
      ? [...firstPage]
      : [];

  let next: string | null = firstPage?.next || null;
  let guard = 0; // sécurité anti-boucle infinie
  const MAX_PAGES = 100;

  while (next && guard < MAX_PAGES) {
    const response = await apiClient.get(next, { signal });
    const data = response.data;
    if (Array.isArray(data?.results)) {
      results = results.concat(data.results);
    } else if (Array.isArray(data)) {
      results = results.concat(data);
    }
    next = data?.next || null;
    guard++;
  }

  return results;
}
