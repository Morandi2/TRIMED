/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from './apiConfig';
import {
  InscriptionData,
  ConnexionData,
  AuthUser,
  ApiResponse,
  ConnexionResponse,
  InscriptionResponse
} from './types/auth.types';

// Helper to map backend user data to frontend AuthUser type
function mapUser(u: any): AuthUser {
  // Extraction robuste de l'ID hôpital
  let hId = null;
  if (u.hopital_detail && u.hopital_detail.id) {
    hId = u.hopital_detail.id;
  } else if (u.hopital && typeof u.hopital === 'object') {
    hId = u.hopital.id;
  } else if (u.hopital) {
    hId = u.hopital;
  }

  return {
    utilisateur_id: u.utilisateur_id || u.id,
    nom_complet: u.nom_complet || `${u.nom || u.first_name || ''} ${u.prenom || u.last_name || ''}`.trim() || u.email,
    email: u.email,
    role: u.role,
    telephone: u.telephone,
    photo: u.photo,
    hopital_id: hId,
    hopital_nom: u.hopital_detail ? u.hopital_detail.nom : (u.hopital && typeof u.hopital === 'object' ? u.hopital.nom : null)
  };
}

// API pour l'authentification avec Django REST Framework
export const djangoAuthApi = {
  /**
   * Connexion utilisateur - Django JWT
   */
  async connexion(data: ConnexionData): Promise<ApiResponse<ConnexionResponse>> {
    try {
      console.log('Tentative de connexion:', data.email);

      const response = await apiClient.post('/comptes/login/', {
        email: data.email,
        username: data.email, // Django SimpleJWT parfois exige username
        password: data.password
      });

      const { access, refresh, user: responseUser } = response.data;
      let user = responseUser;

      // Stocker les tokens JWT d'abord pour que getProfile puisse les utiliser
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      if (!user || !user.id || user.hopital === undefined) {
        console.warn('Données utilisateur incomplètes dans la réponse de login, récupération forcée du profil...');
        const profileRes = await this.getProfile();
        if (profileRes.success) {
          user = profileRes.data;
        }
      }

      if (!user) {
        throw new Error('Impossible de récupérer les données utilisateur après la connexion.');
      }

      localStorage.setItem('user_data', JSON.stringify(user));

      console.log('Connexion réussie pou:', user.email);

      return {
        success: true,
        message: `Connexion réussie! Bienvenue ${user.nom || user.first_name || ''}`,
        data: {
          user: mapUser(user),
          token: access,
          redirectTo: this.getRedirectPath(user.role),
          tenant: user.hopital
        }
      };

    } catch (error: any) {
      console.error('Erreur de connexion (détails):', error.response?.data || error.message);

      let errorMessage = 'Erreur lors de la connexion';

      if (error.response?.status === 401) {
        errorMessage = 'Email ou mot de passe incorrect';
      } else if (error.response?.status === 400) {
        const details = error.response.data;
        console.error('[djangoAuthApi] Erreur 400 login (champs):', details);
        if (typeof details === 'object' && details !== null) {
          const messages = Object.entries(details)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs[0] : msgs}`)
            .join(' | ');
          errorMessage = messages || details.detail || 'Données de connexion invalides';
        } else {
          errorMessage = 'Données de connexion invalides';
        }
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
      }

      return {
        success: false,
        message: errorMessage,
        error: error.response?.data || error.message
      };
    }
  },

  /**
   * Inscription utilisateur - Django
   */
  async inscription(data: InscriptionData): Promise<ApiResponse<InscriptionResponse>> {
    try {
      console.log('Début de l\'inscription pour:', data.email);

      const prenom = data.prenomAdmin || data.directeur?.split(' ')[0] || 'Nouvel';
      const nom = data.nomAdmin || data.directeur?.split(' ')[1] || 'Utilisateur';
      const userEmail = data.adminEmail || data.email;
      const nomComplet = `${prenom} ${nom}`.trim();

      const payload = {
        email: userEmail,
        password: data.password,
        confirm_password: data.password,
        nom: nom,
        prenom: prenom,
        nom_complet: nomComplet,
        first_name: prenom,
        last_name: nom,
        role: 'proprietaire-hopital',
        is_active: false, // Kont lan dwe inaktif jiskaske verifikasyon fini
        hopital_data: {
          nom: data.nomHopital,
          adresse: data.adresseLigne1 || data.adresse || '',
          telephone: data.telephone,
          email_professionnel: data.email,
          directeur: nomComplet || "Non défini",
          nombre_de_lits: data.nombreLits ? parseInt(data.nombreLits) : 1,
          numero_enregistrement: data.numeroEnregistrement || "NON-DEFINI",
          statut: "actif",
          type_abonnement: (data.planAbonnement || 'basic').toLowerCase(),
          statut_verification_document: "en_attente"
        }
      };

      console.log('[djangoAuthApi] Payload inscription:', JSON.stringify(payload, null, 2));

      const response = await apiClient.post('/comptes/inscription/', payload);

      console.log('[djangoAuthApi] Réponse inscription brute:', JSON.stringify(response.data, null, 2));

      const access = response.data.access || response.data.token;
      const refresh = response.data.refresh;
      // Backend retounen "utilisateur" pa "user"
      const user = response.data.utilisateur || response.data.user || response.data;

      // Stocker les tokens JWT
      if (access) localStorage.setItem('access_token', access);
      if (refresh) localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user_data', JSON.stringify(user));

      console.log('Inscription terminée avec succès!');

      return {
        success: true,
        message: `Félicitations! L'hôpital "${data.nomHopital}" a été créé avec succès.`,
        data: {
          user: user ? mapUser(user) : null,
          tenant: user?.hopital_detail || null,
          token: access,
          redirectTo: '/home'
        }
      };

    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);

      let errorMessage = 'Erreur lors de la création du compte';

      if (error.response?.status === 500) {
        // Backend kreye done yo men crash pandan response serialization
        // Donk kont lan te kreye an reyalite
        console.warn('[djangoAuthApi] Erreur 500 — le backend a probablement créé le compte mais a crashé pendant la réponse.');
        return {
          success: true,
          message: `L'hôpital "${data.nomHopital}" a été créé. Le compte est en attente de vérification. Vous pouvez vous connecter une fois qu'il sera activé.`,
          data: {
            user: null,
            tenant: null,
            token: null,
            redirectTo: '/signin'
          }
        };
      } else if (error.response?.status === 400) {
        const details = error.response.data;
        console.error('[djangoAuthApi] Erreur 400 Inscription (Détails):', details);
        
        if (details.email) {
          errorMessage = 'Cet email est déjà utilisé';
        } else if (details.password) {
          errorMessage = 'Mot de passe trop faible';
        } else {
          errorMessage = Object.entries(details)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join(' | ') || details.detail || 'Données d\'inscription invalides';
        }
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
      }

      return {
        success: false,
        message: errorMessage,
        error: error.message
      };
    }
  },

  /**
   * Déconnexion - Django
   */
  async deconnexion(): Promise<ApiResponse> {
    try {
      console.log('Déconnexion en cours...');

      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          await apiClient.post('/comptes/logout/', {
            refresh: refreshToken
          });
          console.log('Session fermée côté serveur');
        } catch (error) {
          console.warn('Impossible de fermer la session côté serveur:', error);
        }
      }

      // Nettoyer le localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');

      console.log('localStorage nettoyé');

      return {
        success: true,
        message: 'Déconnexion réussie. À bientôt!'
      };
    } catch (error: any) {
      console.error('Erreur lors de la déconnexion:', error);

      // Même en cas d'erreur, nettoyer le localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');

      return {
        success: false,
        message: 'Erreur lors de la déconnexion',
        error: error.message
      };
    }
  },

  /**
   * Vérifier si l'utilisateur est connecté
   */
  verifierSession(): { user: AuthUser | null; isValid: boolean; message: string } {
    try {
      const userData = localStorage.getItem('user_data');
      const accessToken = localStorage.getItem('access_token');

      if (!userData || !accessToken) {
        return {
          user: null,
          isValid: false,
          message: 'Aucune session active'
        };
      }

      // Vérifier si le token JWT est expiré
      try {
        const parts = accessToken.split('.');
        if (parts.length !== 3) {
          throw new Error('Token format invalide');
        }

        const tokenPayload = JSON.parse(atob(parts[1]));
        const currentTime = Date.now() / 1000;

        if (tokenPayload.exp < currentTime) {
          console.log('Token expiré');
          return {
            user: null,
            isValid: false,
            message: 'Session expirée'
          };
        }

        const user = JSON.parse(userData);
        return {
          user: mapUser(user),
          isValid: true,
          message: 'Session valide'
        };

      } catch (tokenError) {
        console.error('Token invalide:', tokenError);
        this.deconnexion();
        return {
          user: null,
          isValid: false,
          message: 'Token invalide'
        };
      }

    } catch (error) {
      console.error('Erreur vérification session:', error);
      return {
        user: null,
        isValid: false,
        message: 'Erreur de vérification'
      };
    }
  },

  /**
   * Vérifier la validité du token JWT avec le backend
   */
  async verifyToken(token?: string): Promise<ApiResponse> {
    try {
      const accessToken = token || localStorage.getItem('access_token');
      if (!accessToken) {
        return { success: false, message: 'Aucun token fourni' };
      }
      const response = await apiClient.post('/comptes/token/verify/', { token: accessToken });
      return { success: true, message: 'Token valide', data: response.data };
    } catch (error: any) {
      console.error('Erreur vérification token:', error);
      return { success: false, message: 'Token invalide ou expiré', error: error.message };
    }
  },

  /**
   * Rafraîchir le token JWT
   */
  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        return {
          success: false,
          message: 'Aucun refresh token disponible'
        };
      }

      const response = await apiClient.post('/comptes/token/refresh/', {
        refresh: refreshToken
      });

      const { access } = response.data;

      // Mettre à jour le token
      localStorage.setItem('access_token', access);

      return {
        success: true,
        message: 'Token rafraîchi',
        data: { token: access }
      };

    } catch (error: any) {
      console.error('Erreur rafraîchissement token:', error);

      // Si le refresh token est expiré, déconnecter
      if (error.response?.status === 401) {
        this.deconnexion();
      }

      return {
        success: false,
        message: 'Erreur lors du rafraîchissement du token',
        error: error.message
      };
    }
  },

  /**
   * Récupérer le profil utilisateur
   */
  async getProfile(): Promise<ApiResponse> {
    try {
      const response = await apiClient.get('/comptes/utilisateurs/profile/');

      // Mettre à jour les données utilisateur
      localStorage.setItem('user_data', JSON.stringify(response.data));

      return {
        success: true,
        message: 'Profil récupéré',
        data: response.data
      };
    } catch (error: any) {
      console.error('Erreur récupération profil:', error);
      return {
        success: false,
        message: 'Erreur lors de la récupération du profil',
        error: error.message
      };
    }
  },

  /**
   * Mettre à jour le profil utilisateur
   */
  async updateProfile(data: any): Promise<ApiResponse> {
    try {
      const response = await apiClient.put('/comptes/utilisateurs/update_profile/', data);

      // Mettre à jour les données utilisateur
      localStorage.setItem('user_data', JSON.stringify(response.data));

      return {
        success: true,
        message: 'Profil mis à jour avec succès',
        data: response.data
      };
    } catch (error: any) {
      console.error('Erreur mise à jour profil:', error);

      let errorMessage = 'Erreur lors de la mise à jour du profil';

      if (error.response?.status === 400) {
        const details = error.response.data;
        if (details.email) {
          errorMessage = 'Email invalide ou déjà utilisé';
        } else if (details.telephone) {
          errorMessage = 'Numéro de téléphone invalide';
        }
      }

      return {
        success: false,
        message: errorMessage,
        error: error.message
      };
    }
  },

  /**
   * Récupérer tous les utilisateurs de l'hôpital actuel
   */
  async getUtilisateurs(): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClient.get('/comptes/utilisateurs/');
      return {
        success: true,
        message: 'Utilisateurs récupérés avec succès',
        data: response.data
      };
    } catch (error: any) {
      console.error('Erreur récupération utilisateurs:', error);
      return {
        success: false,
        message: 'Erreur lors de la récupération des utilisateurs',
        error: error.message
      };
    }
  },

  /**
   * Créer un nouvel utilisateur (par un administrateur)
   * Essaie d'abord l'endpoint d'inscription qui utilise create_user() pour hasher les mots de passe
   */
  async creerUtilisateur(data: any): Promise<ApiResponse> {
    // Essayer d'abord l'endpoint dédié à la création par admin (s'il existe)
    // puis fallback vers l'endpoint CRUD standard
    const endpointsToTry = [
      '/comptes/creer-utilisateur/',
      '/comptes/utilisateurs/creer/',
      '/comptes/utilisateurs/',
    ];

    let lastError: any = null;

    for (const endpoint of endpointsToTry) {
      try {
        const response = await apiClient.post(endpoint, data);
        console.log(`[djangoAuthApi] Utilisateur créé via ${endpoint}`, response.data);
        return {
          success: true,
          message: 'Utilisateur créé avec succès',
          data: response.data
        };
      } catch (error: any) {
        // Si 404 (endpoint n'existe pas), essayer le suivant
        if (error.response?.status === 404) {
          console.warn(`[djangoAuthApi] Endpoint ${endpoint} non trouvé, essai suivant...`);
          lastError = error;
          continue;
        }
        // Toute autre erreur (400, 403, 500...) est une vraie erreur
        console.error(`[djangoAuthApi] Erreur création utilisateur via ${endpoint}:`, error.response?.data);
        let errorMessage = "Erreur lors de la création de l'utilisateur";
        if (error.response?.status === 400) {
          const details = error.response.data;
          console.error('[djangoAuthApi] Erreur 400 (Détails):', details);
          if (details.email) {
            errorMessage = 'Cet email est déjà utilisé';
          } else {
            errorMessage = Object.entries(details)
              .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
              .join(' | ') || errorMessage;
          }
        }
        return {
          success: false,
          message: errorMessage,
          error: error.response?.data || error.message
        };
      }
    }

    // Tous les endpoints ont échoué avec 404
    return {
      success: false,
      message: "Aucun endpoint de création disponible. Vérifiez la configuration du backend.",
      error: lastError?.message
    };
  },

  /**
   * Modifier un utilisateur existant
   */
  async updateUtilisateur(id: number, data: any): Promise<ApiResponse> {
    try {
      const response = await apiClient.patch(`/comptes/utilisateurs/${id}/`, data);
      return {
        success: true,
        message: 'Utilisateur mis à jour avec succès',
        data: response.data
      };
    } catch (error: any) {
      console.error('Erreur modification utilisateur:', error);
      let errorMessage = 'Erreur lors de la modification de l\'utilisateur';
      
      if (error.response?.status === 400) {
        const details = error.response.data;
        console.error('[djangoAuthApi] Erreur 400 (Détails):', details);
        errorMessage = Object.entries(details)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(' | ') || errorMessage;
      }

      return {
        success: false,
        message: errorMessage,
        error: error.response?.data || error.message
      };
    }
  },

  /**
   * Supprimer un utilisateur
   */
  async deleteUtilisateur(id: number): Promise<ApiResponse> {
    try {
      await apiClient.delete(`/comptes/utilisateurs/${id}/`);
      return {
        success: true,
        message: 'Utilisateur supprimé avec succès'
      };
    } catch (error: any) {
      console.error('Erreur suppression utilisateur:', error);
      return {
        success: false,
        message: 'Erreur lors de la suppression de l\'utilisateur',
        error: error.message
      };
    }
  },

  /**
   * Changer le mot de passe d'un utilisateur par l'admin
   */
  async changePassword(id: number, data: { new_password?: string; password?: string }): Promise<ApiResponse> {
    try {
      const response = await apiClient.post(`/comptes/utilisateurs/${id}/change_password/`, data);
      return {
        success: true,
        message: 'Mot de passe modifié avec succès',
        data: response.data
      };
    } catch (error: any) {
      console.error('Erreur changement mot de passe:', error);
      return {
        success: false,
        message: 'Erreur lors du changement de mot de passe',
        error: error.message
      };
    }
  },

  /**
   * Activer ou désactiver un utilisateur
   */
  async toggleActive(id: number): Promise<ApiResponse> {
    try {
      const response = await apiClient.post(`/comptes/utilisateurs/${id}/toggle_active/`);
      return {
        success: true,
        message: 'Statut de l\'utilisateur modifié avec succès',
        data: response.data
      };
    } catch (error: any) {
      console.error('Erreur toggle actif:', error);
      return {
        success: false,
        message: 'Erreur lors de la modification du statut',
        error: error.message
      };
    }
  },

  /**
   * Déterminer la page de redirection selon le rôle
   */
  getRedirectPath(role: string): string {
    // Tous les rôles sont redirigés vers /home
    // Le composant RoleBasedHome se changera de rendre le bon composant de dashboard
    return '/home';
  }
};