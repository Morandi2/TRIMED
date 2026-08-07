import { AxiosError } from 'axios';

/**
 * Gestion centralisée et professionnelle des erreurs API.
 *
 * Objectif: transformer n'importe quelle erreur (réseau, timeout, HTTP)
 * en un objet normalisé exploitable par l'UI, avec un message clair en
 * français destiné à l'utilisateur (jamais d'erreur technique brute).
 *
 * Le backend Django REST renvoie les erreurs sous plusieurs formes:
 *   - "chaîne simple"
 *   - { detail: "..." }
 *   - { message: "..." } / { error: "..." }
 *   - { non_field_errors: ["..."] }
 *   - { champ: ["erreur 1", "erreur 2"], ... }  (validation par champ)
 */

export interface NormalizedApiError {
  /** Message clair destiné à l'utilisateur (français). */
  message: string;
  /** Code HTTP (ex: 404) ou null pour les erreurs réseau/timeout. */
  status: number | null;
  /** Code interne stable: 'NETWORK', 'TIMEOUT', 'CANCELED', 'HTTP_400'... */
  code: string;
  /** Erreurs par champ, pour l'affichage dans les formulaires (400/422). */
  fieldErrors: Record<string, string>;
  /** Indique si une nouvelle tentative est pertinente (réseau/5xx/timeout). */
  isRetryable: boolean;
  /** Donnée brute d'origine (pour le débogage). */
  raw?: unknown;
}

/** Messages utilisateur par code HTTP. */
const HTTP_MESSAGES: Record<number, string> = {
  400: 'Requête invalide. Vérifiez les informations saisies.',
  401: 'Votre session a expiré. Veuillez vous reconnecter.',
  403: "Vous n'avez pas les droits nécessaires pour cette action.",
  404: "La ressource demandée est introuvable.",
  405: "Cette opération n'est pas autorisée.",
  408: 'La requête a expiré. Veuillez réessayer.',
  409: 'Conflit: cette donnée existe déjà ou a été modifiée entre-temps.',
  422: 'Certaines informations sont invalides. Vérifiez le formulaire.',
  429: 'Trop de requêtes. Veuillez patienter quelques instants.',
  500: 'Une erreur interne du serveur est survenue. Réessayez plus tard.',
  502: 'Le serveur est momentanément indisponible (passerelle). Réessayez.',
  503: 'Le service est temporairement indisponible. Réessayez sous peu.',
  504: 'Le serveur met trop de temps à répondre. Réessayez plus tard.',
};

function isAxiosLikeError(error: unknown): error is AxiosError {
  return !!error && typeof error === 'object' && ('isAxiosError' in error || 'config' in error);
}

/**
 * Extrait les erreurs par champ + un message combiné à partir du corps
 * de réponse DRF.
 */
function extractFromBody(data: unknown): { message?: string; fieldErrors: Record<string, string> } {
  const fieldErrors: Record<string, string> = {};

  if (data == null) return { fieldErrors };

  if (typeof data === 'string') {
    return { message: data, fieldErrors };
  }

  if (typeof data !== 'object') {
    return { message: String(data), fieldErrors };
  }

  const obj = data as Record<string, unknown>;

  // Messages génériques prioritaires
  const generic =
    (typeof obj.detail === 'string' && obj.detail) ||
    (typeof obj.message === 'string' && obj.message) ||
    (typeof obj.error === 'string' && obj.error) ||
    undefined;

  const toText = (v: unknown): string =>
    Array.isArray(v) ? v.map(toText).join(' ') : typeof v === 'string' ? v : JSON.stringify(v);

  // Erreurs par champ (on ignore les clés génériques déjà traitées)
  const GENERIC_KEYS = new Set(['detail', 'message', 'error']);
  for (const [key, value] of Object.entries(obj)) {
    if (GENERIC_KEYS.has(key)) continue;
    if (key === 'non_field_errors') continue;
    fieldErrors[key] = toText(value);
  }

  // Message combiné: generic > non_field_errors > premier champ
  let message = generic;
  if (!message && obj.non_field_errors) message = toText(obj.non_field_errors);
  if (!message) {
    const first = Object.values(fieldErrors)[0];
    if (first) message = first;
  }

  return { message, fieldErrors };
}

/**
 * Normalise n'importe quelle erreur en {@link NormalizedApiError}.
 * Ne lève jamais d'exception.
 */
export function normalizeApiError(error: unknown): NormalizedApiError {
  // Annulation volontaire d'une requête (AbortController / axios cancel)
  if (
    (isAxiosLikeError(error) && (error.code === 'ERR_CANCELED' || error.name === 'CanceledError')) ||
    (error instanceof Error && error.name === 'AbortError')
  ) {
    return {
      message: 'Requête annulée.',
      status: null,
      code: 'CANCELED',
      fieldErrors: {},
      isRetryable: false,
      raw: error,
    };
  }

  if (isAxiosLikeError(error)) {
    // Timeout
    if (error.code === 'ECONNABORTED' || /timeout/i.test(error.message || '')) {
      return {
        message: 'La connexion a expiré (délai dépassé). Vérifiez votre réseau et réessayez.',
        status: null,
        code: 'TIMEOUT',
        fieldErrors: {},
        isRetryable: true,
        raw: error,
      };
    }

    // Pas de réponse => erreur réseau / serveur injoignable
    if (!error.response) {
      return {
        message: 'Impossible de contacter le serveur. Vérifiez votre connexion internet.',
        status: null,
        code: 'NETWORK',
        fieldErrors: {},
        isRetryable: true,
        raw: error,
      };
    }

    const status = error.response.status;
    const { message: bodyMessage, fieldErrors } = extractFromBody(error.response.data);

    // Pour 400/422 on préfère le message du backend (source de vérité).
    const preferBody = status === 400 || status === 422 || status === 409;
    const message =
      (preferBody && bodyMessage) ||
      HTTP_MESSAGES[status] ||
      bodyMessage ||
      `Une erreur est survenue (code ${status}).`;

    return {
      message,
      status,
      code: `HTTP_${status}`,
      fieldErrors,
      isRetryable: status >= 500 && status <= 504,
      raw: error,
    };
  }

  // Erreur JS générique
  return {
    message: error instanceof Error && error.message ? error.message : 'Une erreur inattendue est survenue.',
    status: null,
    code: 'UNKNOWN',
    fieldErrors: {},
    isRetryable: false,
    raw: error,
  };
}

/**
 * Raccourci: renvoie uniquement le message utilisateur d'une erreur.
 */
export function getApiErrorMessage(error: unknown): string {
  return normalizeApiError(error).message;
}

/**
 * Indique si l'erreur provient d'une annulation volontaire de la requête
 * (AbortController / axios cancel). Utile pour NE PAS afficher de message
 * d'erreur lorsqu'une requête est délibérément annulée (navigation, saisie
 * rapide, démontage du composant).
 */
export function isCanceledError(error: unknown): boolean {
  return normalizeApiError(error).code === 'CANCELED';
}

/**
 * Journalise une erreur importante (>= 500, réseau, timeout) de façon
 * cohérente. Les erreurs "normales" (400/401/403/404/validation) ne sont
 * pas considérées comme des incidents et ne sont pas journalisées en erreur.
 */
export function logApiError(error: unknown, context?: string): NormalizedApiError {
  const normalized = normalizeApiError(error);
  const prefix = context ? `[API][${context}]` : '[API]';

  const isIncident =
    normalized.code === 'NETWORK' ||
    normalized.code === 'TIMEOUT' ||
    (normalized.status != null && normalized.status >= 500);

  if (isIncident) {
    console.error(`${prefix} ${normalized.code} - ${normalized.message}`, normalized.raw);
  } else if (normalized.code !== 'CANCELED') {
    console.warn(`${prefix} ${normalized.code} - ${normalized.message}`);
  }

  return normalized;
}
