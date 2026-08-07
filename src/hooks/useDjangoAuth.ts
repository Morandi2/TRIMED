import { useState, useEffect, useCallback } from 'react';
import { djangoAuthApi } from '../api/djangoAuthApi';
import { AuthUser } from '../api/types/auth.types';

interface UseAuthReturn {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; redirectTo?: string }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  checkAuthStatus: () => void;
}

export const useDjangoAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier le statut d'authentification
  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    const sessionCheck = djangoAuthApi.verifierSession();
    
    if (sessionCheck.isValid && sessionCheck.user) {
      const u = sessionCheck.user;
      
      // Si les données sont incomplètes, on tente de récupérer le profil
      if (!u.hopital_id || (u.nom_complet ?? '').includes('undefined')) {
        console.warn('Session valide mais profil incomplet, récupération du profil...');
        const profileRes = await djangoAuthApi.getProfile();
        if (profileRes.success && profileRes.data) {
          const userData = profileRes.data;
          const mappedUser = djangoAuthApi.mapUserResponse(userData);
          setUser(mappedUser);
          // Mettre à jour localStorage pour les prochains rechargements
          localStorage.setItem('user_data', JSON.stringify(mappedUser));

          // Synchroniser aussi la configuration du tenant (hôpital) si disponible
          if (userData.hopital && typeof userData.hopital === 'object') {
            const tenantConfig = {
              tenant_id: userData.hopital.id,
              nom: userData.hopital.nom,
              logo: userData.hopital.logo,
              couleur_principale: userData.hopital.couleur_principale || '#0066CC',
              is_configured: true
            };
            localStorage.setItem('tenant_config', JSON.stringify(tenantConfig));
          }
        } else {
          setUser(u);
        }
      } else {
        setUser(u);
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  // Connexion
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await djangoAuthApi.connexion({ email, password });

      if (response.success && response.data) {
        let finalUser = response.data.user;

        // Si le login ne retourne pas toutes les informations (par ex. juste 3 clés comme id/email),
        // on tente de récupérer le profil complet immédiatement
        try {
          // On vérifie quelques champs clés qui pourraient manquer (nom_complet est calculé par mapUserResponse, mais s'il s'est rabattu sur l'email, on fetch)
          const needsProfile = !finalUser.hopital_id || finalUser.role === 'personnel' || finalUser.nom_complet === finalUser.email || finalUser.nom_complet === 'Utilisateur';
          
          if (needsProfile) {
            const profileRes = await djangoAuthApi.getProfile();
            if (profileRes.success && profileRes.data) {
              finalUser = djangoAuthApi.mapUserResponse(profileRes.data);
              // Mettre à jour le localStorage avec les nouvelles données
              localStorage.setItem('user_data', JSON.stringify(finalUser));
              
              if (profileRes.data.hopital && typeof profileRes.data.hopital === 'object') {
                const tenantConfig = {
                  tenant_id: profileRes.data.hopital.id,
                  nom: profileRes.data.hopital.nom,
                  logo: profileRes.data.hopital.logo,
                  couleur_principale: profileRes.data.hopital.couleur_principale || '#0066CC',
                  is_configured: true
                };
                localStorage.setItem('tenant_config', JSON.stringify(tenantConfig));
              }
            }
          }
        } catch (profileErr) {
          console.warn('Erreur lors de la récupération du profil après login:', profileErr);
        }

        setUser(finalUser);
        
        // Synchroniser le tenant_config si retourné par le login (fallback)
        if (response.data.tenant && typeof response.data.tenant === 'object' && !localStorage.getItem('tenant_config')) {
          const tenantConfig = {
            tenant_id: response.data.tenant.id,
            nom: response.data.tenant.nom,
            logo: response.data.tenant.logo,
            couleur_principale: response.data.tenant.couleur_principale || '#0066CC',
            is_configured: true
          };
          localStorage.setItem('tenant_config', JSON.stringify(tenantConfig));
        }
        
        // S'assurer de rediriger vers le dashboard approprié si le rôle a été mis à jour
        return {
          success: true,
          message: response.message,
          redirectTo: response.data.redirectTo
        };
      } else {
        return {
          success: false,
          message: response.message
        };
      }
    } catch (error: any) {
      console.error('Erreur login hook:', error);
      return {
        success: false,
        message: 'Erreur lors de la connexion'
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Déconnexion
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await djangoAuthApi.deconnexion();
      setUser(null);
    } catch (error) {
      console.error('Erreur logout hook:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Rafraîchir le token
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await djangoAuthApi.refreshToken();
      if (response.success) {
        // Récupérer le profil mis à jour
        const profileResponse = await djangoAuthApi.getProfile();
        if (profileResponse.success && profileResponse.data) {
          const userData = profileResponse.data;
          setUser(djangoAuthApi.mapUserResponse(userData));

          // Synchroniser aussi la configuration du tenant (hôpital) si disponible
          if (userData.hopital && typeof userData.hopital === 'object') {
            const tenantConfig = {
              tenant_id: userData.hopital.id,
              nom: userData.hopital.nom,
              logo: userData.hopital.logo,
              couleur_principale: userData.hopital.couleur_principale || '#0066CC',
              is_configured: true
            };
            localStorage.setItem('tenant_config', JSON.stringify(tenantConfig));
          }
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur refresh token hook:', error);
      return false;
    }
  }, []);

  // Vérifier la session au chargement initial
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Vérifier périodiquement si le token doit être rafraîchi
  useEffect(() => {
    if (!user) return;

    // Vérification immédiate
    const checkAndRefresh = async () => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) return;

      try {
        const parts = accessToken.split('.');
        if (parts.length === 3) {
          const tokenPayload = JSON.parse(atob(parts[1]));
          const currentTime = Date.now() / 1000;
          const timeUntilExpiry = tokenPayload.exp - currentTime;

          // Rafraîchir si le token expire dans moins de 10 minutes (plus proactif)
          if (timeUntilExpiry < 600) {
            const success = await refreshToken();
            if (!success) {
              console.warn('Échec du rafraîchissement proactif, déconnexion forcée.');
              await logout();
            }
          }
        }
      } catch (error) {
        console.error('Erreur vérification token:', error);
      }
    };

    checkAndRefresh();
    const interval = setInterval(checkAndRefresh, 30000); // Vérifier toutes les 30 secondes

    return () => clearInterval(interval);
  }, [user, refreshToken, logout]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshToken,
    checkAuthStatus
  };
};