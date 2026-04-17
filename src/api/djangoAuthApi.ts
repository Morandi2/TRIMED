import apiClient from './apiConfig';
import {
  InscriptionData,
  ConnexionData,
  ApiResponse,
  ConnexionResponse,
  InscriptionResponse,
  AuthUser
} from './types/auth.types';

/**
 * API pour l'authentification Django
 */
export const djangoAuthApi = {
  /**
   * Connexion (Login)
   */
  connexion: async function (data: ConnexionData): Promise<ApiResponse<ConnexionResponse>> {
    try {
      // Envoyer à la fois email et username au cas où le backend attend l'un ou l'autre
      const payload = {
        ...data,
        username: data.email
      };
      
      console.log('🔍 Tentative de connexion Django:', data.email);
      const response = await apiClient.post('/comptes/login/', payload);

      console.log('📦 Data reçue du backend (KEYS):', Object.keys(response.data));
      const respData = response.data;
      if (respData.user) console.log('👤 User KEYS:', Object.keys(respData.user));
      if (respData.tenant) console.log('🏥 Tenant KEYS:', Object.keys(respData.tenant));
      if (respData.user && respData.user.hopital) console.log('🏥 User.hopital structure:', respData.user.hopital);
      const access = respData.access || respData.token;
      const refresh = respData.refresh;

      // Mapper l'utilisateur avec la nouvelle logique centralisée
      const authUser = this.mapUserResponse(respData.user || respData, respData.tenant);

      // Stocker les tokens
      if (access) localStorage.setItem('access_token', access);
      if (refresh) localStorage.setItem('refresh_token', refresh);

      localStorage.setItem('user_data', JSON.stringify(authUser));
      if (respData.tenant || (respData.user && respData.user.hopital)) {
        localStorage.setItem('tenant_data', JSON.stringify(respData.tenant || respData.user.hopital));
      }

      console.log('✅ Connexion Django réussie, user:', authUser);

      return {
        success: true,
        message: 'Connexion réussie',
        data: {
          user: authUser,
          token: access,
          redirectTo: this.getRedirectionPath(authUser.role),
          tenant: respData.tenant || (respData.user && respData.user.hopital)
        }
      };
    } catch (error: any) {
      console.error('❌ Erreur connexion Django:', error.response?.data || error.message);

      let message = 'Échec de la connexion';
      const errorData = error.response?.data;

      if (errorData) {
        if (errorData.detail) message = errorData.detail;
        else if (errorData.error) message = errorData.error;
        else if (errorData.non_field_errors) message = errorData.non_field_errors[0];
        else if (typeof errorData === 'object') {
          const firstKey = Object.keys(errorData)[0];
          if (Array.isArray(errorData[firstKey])) {
            message = `${firstKey}: ${errorData[firstKey][0]}`;
          }
        }
      }

      return {
        success: false,
        message,
        error: errorData
      };
    }
  },

  /**
   * Inscription d'un Hôpital (Propriétaire)
   */
  inscription: async function (data: InscriptionData): Promise<ApiResponse<InscriptionResponse>> {
    try {
      console.log('🏥 Inscription hôpital Django:', data.nomHopital);

      const payload = {
        admin_email: data.adminEmail,
        password: data.password,
        prenom_admin: data.prenomAdmin,
        nom_admin: data.nomAdmin,
        admin_telephone: data.adminTelephone,
        nom_hopital: data.nomHopital,
        raison_sociale: data.raisonSociale,
        numero_enregistrement: data.numeroEnregistrement,
        nif: data.nif,
        type_etablissement: data.typeEtablissement,
        site_web: data.siteWeb,
        description: data.description,
        pays: data.pays,
        province: data.province,
        ville: data.ville,
        adresse_ligne1: data.adresseLigne1,
        adresse_ligne2: data.adresseLigne2,
        code_postal: data.codePostal,
        telephone: data.telephone,
        telephone_urgence: data.telephoneUrgence,
        email_hospital: data.email,
        email_support: data.emailSupport,
        nombre_lits: data.nombreLits,
        urgence_disponible: data.urgenceDisponible,
        laboratoire_disponible: data.laboratoireDisponible,
        pharmacie_disponible: data.pharmacieDisponible,
        radiologie_disponible: data.radiologieDisponible,
        heure_ouverture: data.heureOuverture,
        heure_fermeture: data.heureFermeture,
        plan_abonnement: data.planAbonnement,
        cycle_facturation: data.cycleFacturation
      };

      const response = await apiClient.post('/comptes/inscription/', payload);

      console.log(' Inscription réussie');

      const respData = response.data;
      const authUser = this.mapUserResponse(respData.user || respData, respData.tenant);

      return {
        success: true,
        message: 'Inscription réussie. Votre compte est en attente de vérification.',
        data: {
          user: authUser,
          token: respData.access || respData.token,
          redirectTo: this.getRedirectionPath(authUser.role),
          tenant: respData.tenant || (respData.user && respData.user.hopital)
        }
      };
    } catch (error: any) {
      console.error(' Erreur inscription Django:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.detail || 'Une erreur est survenue lors de l\'inscription',
        error: error.response?.data
      };
    }
  },

  /**
   * Créer un utilisateur (Staff)
   */
  creerUtilisateur: async function (data: any): Promise<ApiResponse<any>> {
    try {
      console.log('👤 Tentative de création utilisateur sur: /comptes/utilisateurs/');
      const response = await apiClient.post('/comptes/utilisateurs/', data);
      return {
        success: true,
        message: 'Utilisateur créé avec succès',
        data: response.data
      };
    } catch (error: any) {
      console.error('❌ Erreur création utilisateur Django:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.detail || error.response?.data?.error || 'Impossible de créer l\'utilisateur',
        error: error.response?.data
      };
    }
  },

  /**
   * Récupérer le profil
   */
  getProfile: async function (): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get('/comptes/utilisateurs/profile/');
      return { success: true, message: 'Profil récupéré avec succès', data: response.data };
    } catch (error: any) {
      return { success: false, message: 'Erreur lors de la récupération du profil', error: error.response?.data };
    }
  },

  /**
   * Liste des utilisateurs (Supporte la pagination si une URL est fournie)
   */
  getUtilisateurs: async function (url?: string): Promise<ApiResponse<any[]>> {
    try {
      const targetUrl = url || '/comptes/utilisateurs/';
      const response = await apiClient.get(targetUrl);
      return { success: true, message: 'Utilisateurs récupérés avec succès', data: response.data };
    } catch (error: any) {
      return { success: false, message: 'Erreur lors de la récupération des utilisateurs', error: error.response?.data };
    }
  },

  /**
   * Update utilisateur
   */
  updateUtilisateur: async function (id: number, data: any): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.patch(`/comptes/utilisateurs/${id}/`, data);
      return { success: true, message: 'Utilisateur mis à jour', data: response.data };
    } catch (error: any) {
      return { success: false, message: 'Erreur mise à jour', error: error.response?.data };
    }
  },

  /**
   * Delete utilisateur
   */
  deleteUtilisateur: async function (id: number): Promise<ApiResponse<any>> {
    try {
      await apiClient.delete(`/comptes/utilisateurs/${id}/`);
      return { success: true, message: 'Utilisateur supprimé' };
    } catch (error: any) {
      return { success: false, message: 'Erreur suppression', error: error.response?.data };
    }
  },

  /**
   * Liste des sessions actives (Outstanding Tokens)
   */
  getOutstandingTokens: async function (): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClient.get('/comptes/outstanding-tokens/');
      return { success: true, message: 'Sessions récupérées', data: response.data };
    } catch (error: any) {
      return { success: false, message: 'Erreur récupération sessions', error: error.response?.data };
    }
  },

  /**
   * Liste des tokens révoqués (Blacklisted Tokens)
   */
  getBlacklistedTokens: async function (): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClient.get('/comptes/blacklisted-tokens/');
      return { success: true, message: 'Tokens révoqués récupérés', data: response.data };
    } catch (error: any) {
      return { success: false, message: 'Erreur récupération blacklist', error: error.response?.data };
    }
  },

  /**
   * Rafraîchir le token
   */
  refreshToken: async function (): Promise<ApiResponse<{ access: string }>> {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) throw new Error('No refresh token');
      const response = await apiClient.post('/comptes/token/refresh/', { refresh });
      localStorage.setItem('access_token', response.data.access);
      return { success: true, message: 'Token rafraîchi avec succès', data: response.data };
    } catch (error: any) {
      return { success: false, message: 'Session expirée' };
    }
  },

  /**
   * Déconnexion
   */
  deconnexion: async function (): Promise<void> {
    try {
      await apiClient.post('/comptes/logout/');
    } catch (error) {
      console.warn('Erreur logout API');
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('tenant_data');
  },

  /**
   * Vérifier la session
   */
  verifierSession: function (): { isValid: boolean; user: AuthUser | null } {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');
    if (!token || !userData) return { isValid: false, user: null };
    try {
      const user = JSON.parse(userData);
      return { isValid: true, user };
    } catch (e) {
      return { isValid: false, user: null };
    }
  },

  mapUserResponse: function (user: any, tenant: any = null): AuthUser {
    console.log('🗺️ Mapping user/tenant:', { user, tenant });
    if (user) {
      console.log('👤 User keys:', Object.keys(user));
      if (user.hopital) console.log('🏥 user.hopital type:', typeof user.hopital, user.hopital);
      if (user.hopital_detail) console.log('🏥 user.hopital_detail:', user.hopital_detail);
    }

    // Essayer de trouver le tenant (hôpital) dans plusieurs endroits possibles
    const activeTenant = tenant ||
      (user && user.hopital_detail) ||
      (user && user.hopital) ||
      (user && user.tenant);

    // Extraction robuste de l'ID de l'hôpital
    let hopital_id = 0;
    if (activeTenant && typeof activeTenant === 'object') {
      hopital_id = activeTenant.id || activeTenant.hopital_id || activeTenant.tenant_id || activeTenant.pk || 0;
    } else if (activeTenant) {
      hopital_id = Number(activeTenant);
    }

    // Si toujours 0, chercher dans les champs directs de l'utilisateur
    if (!hopital_id && user) {
      hopital_id = user.hopital_id || user.hospital_id || user.tenant_id || user.hopital || user.hospital || 0;
    }

    // Extraction du nom de l'hôpital
    let hopital_nom = '';
    if (activeTenant && typeof activeTenant === 'object') {
      hopital_nom = activeTenant.nom || activeTenant.hopital_nom || activeTenant.tenant_nom || '';
    } else {
      hopital_nom = user?.hopital_nom || user?.hospital_nom || '';
    }

    console.log('📍 Mapped IDs:', { user_id: user?.id || user?.pk, hopital_id });

    return {
      utilisateur_id: user?.id || user?.utilisateur_id || user?.pk || 0,
      nom_complet: user?.nom_complet || `${user?.prenom || user?.first_name || ''} ${user?.nom || user?.last_name || ''}`.trim() || user?.email || 'Utilisateur',
      email: user?.email || '',
      role: user?.role || 'personnel',
      hopital_id: Number(hopital_id) || 0,
      hopital_nom
    };
  },

  /**
   * Helper redirection
   */
  getRedirectionPath: function (role: string): string {
    switch (role) {
      case 'admin-systeme': return '/admin/dashboard';
      case 'proprietaire-hopital': return '/Home';
      case 'medecin': return '/home';
      case 'infirmier': return '/home';
      case 'secretaire': return '/home';
      default: return '/home';
    }
  }
};
