import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Mémoire partagée des lectures (GET) : revenir sur un module affiche tout de suite ce qui a déjà été
// chargé, au lieu de tout retélécharger.
//  - moins de 15 s : la réponse gardée suffit, aucune requête ;
//  - de 15 s à 3 min : la réponse gardée s’affiche tout de suite et se met à jour en arrière-plan ;
//  - au-delà : nouvelle requête.
// Toute écriture réussie (ajout, modification, suppression) vide la mémoire. Rien n’est écrit sur le disque :
// la mémoire disparaît avec l’onglet et à la déconnexion.

export const ENTETE_SANS_CACHE = 'X-Sans-Cache';
const FRAIS_MS = 15 * 1000;
const PERIME_MS = 3 * 60 * 1000;
const MAX_ENTREES = 300;

interface Entree { reponse: AxiosResponse; le: number }
const memoire = new Map<string, Entree>();
const enVol = new Map<string, Promise<AxiosResponse>>();

function cle(c: InternalAxiosRequestConfig) {
  const params = { ...(c.params || {}) } as Record<string, unknown>;
  delete params._t; // anti-cache du navigateur, sans effet sur le contenu
  const compte = String(c.headers?.Authorization ?? '').slice(-32); // un compte ne lit jamais la mémoire d’un autre
  const tri = Object.keys(params).sort().map((k) => [k, params[k]]);
  return `${compte}|${c.baseURL ?? ''}${c.url ?? ''}|${JSON.stringify(tri)}`;
}

function elaguer() {
  while (memoire.size > MAX_ENTREES) memoire.delete(memoire.keys().next().value as string);
}

/** Vide la mémoire des lectures (après une écriture, à la connexion et à la déconnexion). */
export function viderCacheApi() {
  memoire.clear();
}

/** Ancienne mémoire disque des modules (dossiers patients, etc.) : à effacer sur un poste partagé. */
export function effacerAnciensCachesDisque() {
  try {
    for (const k of Object.keys(localStorage)) if (k.endsWith('_cache')) localStorage.removeItem(k);
  } catch { /* stockage indisponible */ }
}

/** Enveloppe l’adaptateur HTTP d’axios avec la mémoire des lectures. */
export function avecCache(base: AxiosAdapter): AxiosAdapter {
  return async (config) => {
    const methode = (config.method || 'get').toLowerCase();
    if (methode !== 'get') {
      const reponse = await base(config); // une erreur HTTP lève une exception : la mémoire reste intacte
      viderCacheApi();
      return reponse;
    }
    if (config.headers?.[ENTETE_SANS_CACHE]) {
      config.headers.delete?.(ENTETE_SANS_CACHE);
      return base(config);
    }

    const k = cle(config);
    const charger = () => {
      const deja = enVol.get(k);
      if (deja) return deja;
      const p = base(config)
        .then((r) => { memoire.set(k, { reponse: r, le: Date.now() }); elaguer(); return r; })
        .finally(() => enVol.delete(k));
      enVol.set(k, p);
      return p;
    };

    const e = memoire.get(k);
    const age = e ? Date.now() - e.le : Infinity;
    if (e && age < FRAIS_MS) return { ...e.reponse, config };
    if (e && age < PERIME_MS) {
      charger().catch(() => undefined);
      return { ...e.reponse, config };
    }
    return charger();
  };
}
