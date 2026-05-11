// Configuration des environnements pour TRIMEDH

interface EnvironmentConfig {
  API_BASE_URL: string;
  ENVIRONMENT: 'development' | 'production' | 'staging';
  DEBUG: boolean;
  TOKEN_REFRESH_INTERVAL: number; // en millisecondes
  SESSION_TIMEOUT: number; // en millisecondes
}

// Configuration par défaut (développement)
const defaultConfig: EnvironmentConfig = {
  API_BASE_URL: 'https://trimedh-service.onrender.com/api',
  ENVIRONMENT: 'development',
  DEBUG: true,
  TOKEN_REFRESH_INTERVAL: 60000, // 1 minute
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 heures
};

// Configuration de production
const productionConfig: EnvironmentConfig = {
  API_BASE_URL: 'https://trimedh-service.onrender.com/api',
  ENVIRONMENT: 'production',
  DEBUG: false,
  TOKEN_REFRESH_INTERVAL: 300000, // 5 minutes
  SESSION_TIMEOUT: 8 * 60 * 60 * 1000, // 8 heures
};

// Configuration de staging
const stagingConfig: EnvironmentConfig = {
  API_BASE_URL: 'https://staging-api.TRIMEDH.com/api',
  ENVIRONMENT: 'staging',
  DEBUG: true,
  TOKEN_REFRESH_INTERVAL: 120000, // 2 minutes
  SESSION_TIMEOUT: 12 * 60 * 60 * 1000, // 12 heures
};

// Déterminer la configuration selon l'environnement
const getConfig = (): EnvironmentConfig => {
  const env = import.meta.env.MODE || 'development';
  const customApiUrl = import.meta.env.VITE_API_BASE_URL;

  let config: EnvironmentConfig;

  switch (env) {
    case 'production':
      config = productionConfig;
      break;
    case 'staging':
      config = stagingConfig;
      break;
    default:
      config = defaultConfig;
  }

  // Permettre de surcharger l'URL de l'API via les variables d'environnement
  // On ignore si c'est juste '/api' pour éviter les problèmes de redirection Vercel, ou on utilise la valeur absolue
  if (customApiUrl && customApiUrl !== '/api') {
    config.API_BASE_URL = customApiUrl;
  }
  
  // Sécurité supplémentaire: Si l'URL finit par se retrouver à '/api' sur production, forcer le full path
  if (config.API_BASE_URL === '/api' || config.API_BASE_URL === 'api') {
     config.API_BASE_URL = 'https://trimedh-service.onrender.com/api';
  }

  return config;
};

export const config = getConfig();

// Utilitaires pour le debugging
export const isDevelopment = config.ENVIRONMENT === 'development';
export const isProduction = config.ENVIRONMENT === 'production';
export const isStaging = config.ENVIRONMENT === 'staging';

// Log de la configuration (seulement en développement)
if (isDevelopment) {
  console.log('Configuration TRIMEDH:', {
    environment: config.ENVIRONMENT,
    apiUrl: config.API_BASE_URL,
    debug: config.DEBUG,
    tokenRefreshInterval: `${config.TOKEN_REFRESH_INTERVAL / 1000}s`,
    sessionTimeout: `${config.SESSION_TIMEOUT / (1000 * 60 * 60)}h`
  });
}

export default config;
