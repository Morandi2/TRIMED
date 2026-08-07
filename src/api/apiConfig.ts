import axios from 'axios';
import config from '../config/environment';
import { logApiError } from '../utils/apiErrorHandler';

// Configuration de base pour axios - Django Backend
const API_BASE_URL = config.API_BASE_URL;

// Créer une instance axios avec configuration par défaut
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: true, // Requis si on veut que Django lise les cookies de session/CSRF
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

// Lojik retry senp pou jere echèk rezo oswa cold starts
const MAX_RETRIES = 3;
const retryRequest = async (error: any, retryCount = 0): Promise<any> => {
  const { config } = error;

  // Si nou pa gen config oswa nou depase limit retry, nou rejte
  if (!config || retryCount >= MAX_RETRIES) {
    return Promise.reject(error);
  }

  // Sèlman retry sou erè rezo oswa erè sèvè (500, 503, 504)
  // PA retry sou POST/PUT/PATCH/DELETE (mutations) pou evite duplikasyon
  const isMutation = config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase());
  const shouldRetry = !isMutation && (!error.response || (error.response.status >= 500 && error.response.status <= 504));

  if (shouldRetry) {
    const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
    console.warn(`[API Retry] Attempt ${retryCount + 1} for ${config.url} after ${delay}ms...`);

    await new Promise(resolve => setTimeout(resolve, delay));
    return apiClient({
      ...config,
      _retryCount: retryCount + 1
    });
  }

  return Promise.reject(error);
};

// Intercepteur pour les requêtes
apiClient.interceptors.request.use(
  (requestConfig) => {
    // Ajouter token JWT si disponible
    const token = localStorage.getItem('access_token');
    if (token && requestConfig.headers) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }

    // En-tête multi-tenant (si présent). Le backend infère normalement le
    // tenant depuis le JWT, mais on le transmet quand il est disponible.
    const tenantId = localStorage.getItem('tenant_id');
    if (tenantId && requestConfig.headers) {
      requestConfig.headers['X-Tenant-ID'] = tenantId;
    }

    // Cache-buster universel pour forcer les requêtes GET à contourner le cache du navigateur
    if (requestConfig.method?.toLowerCase() === 'get') {
      requestConfig.params = requestConfig.params || {};
      // Seuls les endpoints critiques nécessitent un rafraîchissement strict, mais on l'applique globalement
      requestConfig.params._t = Date.now();
    }

    // Log pour le débogage (désactivé automatiquement en production)
    if (config.DEBUG) {
      console.log(`[API Request] ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`);
    }

    return requestConfig;
  },
  (error) => {
    logApiError(error, 'request');
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
apiClient.interceptors.response.use(
  (response) => {
    // Log pour le débogage (désactivé automatiquement en production)
    if (config.DEBUG) {
      console.log(`[API Response] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    // Journalisation centralisée et cohérente (incidents vs erreurs normales)
    logApiError(error, error.config?.url);

    // Gestion spécifique des erreurs
    if (error.response) {
      switch (error.response.status) {
        case 401: {
          // Essayer de rafraîchir le token
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              const refreshResponse = await axios.post(`${API_BASE_URL}/comptes/token/refresh/`, {
                refresh: refreshToken
              });
              const newAccessToken = refreshResponse.data.access;
              localStorage.setItem('access_token', newAccessToken);
              // Retry original request
              if (error.config) {
                error.config.headers.Authorization = `Bearer ${newAccessToken}`;
                return axios.request(error.config);
              }
            } catch {
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user_data');
              window.location.href = '/connexion';
            }
          } else {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_data');
            window.location.href = '/connexion';
          }
          break;
        }
        case 404:
          console.error('Ressource non trouvée');
          break;
        case 500:
          console.error('Erreur serveur interne');
          break;
      }
    } else if (error.code === 'ERR_NETWORK') {
      console.error('Erreur réseau - Vérifiez votre connexion internet');
    }

    return retryRequest(error, (error.config as any)?._retryCount || 0);
  }
);

export default apiClient;