// Messages de connexion compréhensibles : on dit à la personne ce qui se passe et quoi faire,
// au lieu d’un « Échec de la connexion » qui ne dit rien.

export type CodeErreurConnexion = 'hors_ligne' | 'demarrage' | 'identifiants' | 'inactif' | 'trop_de_tentatives' | 'serveur' | 'autre';

export interface ErreurConnexion { code: CodeErreurConnexion; message: string }

interface ErreurAxios {
  code?: string;
  message?: string;
  response?: { status: number; data?: unknown };
}

export const MESSAGES_CONNEXION: Record<CodeErreurConnexion, string> = {
  hors_ligne: 'Pas de connexion Internet. Vérifiez le Wi-Fi ou les données mobiles, puis réessayez.',
  demarrage: 'Le serveur TRIMED se réveille après une période sans activité. Cela peut prendre jusqu’à une minute.',
  identifiants: 'Adresse e-mail ou mot de passe incorrect.',
  inactif: 'Ce compte n’est pas encore actif. Un administrateur doit l’activer avant la première connexion.',
  trop_de_tentatives: 'Trop de tentatives de connexion. Patientez une minute avant de réessayer.',
  serveur: 'Le serveur rencontre un problème. Réessayez dans quelques minutes ; si cela continue, prévenez l’équipe TRIMED.',
  autre: 'La connexion n’a pas abouti. Réessayez dans un instant.',
};

const texte = (v: unknown) => JSON.stringify(v ?? '').toLowerCase();

/** Classe une erreur de connexion selon sa cause réelle. */
export function classerErreurConnexion(erreur: ErreurAxios, enLigne = typeof navigator === 'undefined' ? true : navigator.onLine): ErreurConnexion {
  const statut = erreur.response?.status;
  const donnees = erreur.response?.data;
  const t = texte(donnees);
  const avec = (code: CodeErreurConnexion): ErreurConnexion => ({ code, message: MESSAGES_CONNEXION[code] });

  // Aucune réponse : soit l’appareil est hors ligne, soit le serveur (Render) est en train de démarrer.
  if (!erreur.response) {
    if (!enLigne) return avec('hors_ligne');
    return avec('demarrage');
  }
  if (/inactif|inactive|non actif|pas actif|not active|disabled/.test(t)) return avec('inactif');
  if (statut === 401 || /identifiants|credentials|mot de passe|password|invalid|incorrect/.test(t)) return avec('identifiants');
  if (statut === 429) return avec('trop_de_tentatives');
  if (statut === 502 || statut === 503 || statut === 504) return avec('demarrage');
  if (statut && statut >= 500) return avec('serveur');
  if (statut === 400 || statut === 403) return avec('identifiants');
  return avec('autre');
}
