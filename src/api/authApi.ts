/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from './apiConfig';
import {
  InscriptionData,
  ConnexionData,
  UserData,
  TenantData,
  AuthUser,
  SessionData,
  ApiResponse,
  ConnexionResponse,
  InscriptionResponse
} from './types/auth.types';

// Utilitaires de gestion de session locale
const SessionHelper = {
  generateToken: (user: any, expiresIn = 24 * 60 * 60 * 1000): string => {
    const tokenData = {
      userId: user.utilisateur_id || user.userId,
      email: user.email,
      role: user.role,
      hopitalId: user.hopital_id || user.hopitalId,
      timestamp: Date.now(),
      expiresIn
    };
    return btoa(JSON.stringify(tokenData));
  },

  getTokenData: (token: string): any => {
    try {
      return JSON.parse(atob(token));
    } catch {
      return null;
    }
  },

  setSession: (token: string, user: AuthUser, tenant: any = null) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(user));
    if (tenant) {
      localStorage.setItem('tenant_data', JSON.stringify(tenant));
    }
  },

  clearSession: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('tenant_data');
  },

  getRedirectUrl: (role: string): string => {
    switch (role) {
      case 'admin-systeme': return '/admin/dashboard';
      case 'personnel': return '/personnel/dashboard';
      case 'proprietaire-hopital': return '/home';
      default: return '/home';
    }
  }
};

export const authApi = {
  /**
   * Connexion utilisateur
   */
  async connexion(data: ConnexionData): Promise<ApiResponse<ConnexionResponse>> {
    try {
      const response = await apiClient.get(`/utilisateurs?email=${data.email}`);
      const users = response.data;

      if (!users?.length) {
        return { success: false, message: 'Aucun compte trouvé avec cet email.' };
      }

      const user = users[0];

      if (user.mot_de_passe !== data.password) {
        return { success: false, message: 'Mot de passe incorrect.' };
      }

      let tenantInfo = null;
      if (user.hopital_id) {
        try {
          const tenantResponse = await apiClient.get(`/tenants/${user.hopital_id}`);
          tenantInfo = tenantResponse.data;

          if (tenantInfo.statut !== 'actif') {
            return { success: false, message: `L'hôpital "${tenantInfo.nom}" est ${tenantInfo.statut}. Contactez l'administration.` };
          }
        } catch (error) {
          console.warn('Tenant non trouvé:', error);
        }
      }

      const token = SessionHelper.generateToken(user);
      const redirectTo = SessionHelper.getRedirectUrl(user.role);

      const userData: AuthUser = {
        utilisateur_id: user.utilisateur_id,
        nom_complet: user.nom_complet,
        email: user.email,
        role: user.role,
        hopital_id: user.hopital_id
      };

      SessionHelper.setSession(token, userData, tenantInfo);

      // Create session in DB asymptotically 
      apiClient.post('/sessions', {
        utilisateur_id: user.utilisateur_id,
        token: token,
        date_creation: new Date().toISOString(),
        date_expiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        actif: true
      }).catch(err => console.warn('Erreur création session DB:', err));

      return {
        success: true,
        message: `Connexion réussie! Bienvenue ${user.nom_complet}`,
        data: { user: userData, token, redirectTo, tenant: tenantInfo }
      };

    } catch (error: any) {
      console.error('Erreur connexion:', error);
      let errorMessage = 'Erreur lors de la connexion au serveur';
      if (error.code === 'ERR_NETWORK') errorMessage = 'Impossible de se connecter au serveur.';
      else if (error.response?.status === 404) errorMessage = 'Service indisponible.';
      
      return { success: false, message: errorMessage, error: error.message };
    }
  },

  /**
   * Inscription complète (tenant + utilisateur)
   */
  async inscriptionComplet(data: InscriptionData): Promise<ApiResponse<InscriptionResponse>> {
    try {
      const emailCheck = await apiClient.get(`/utilisateurs?email=${data.email}`);
      if (emailCheck.data?.length) {
        return { success: false, message: 'Cet email est déjà utilisé.' };
      }

      const userData: UserData = {
        nom_complet: `${data.prenomAdmin} ${data.nomAdmin}`,
        email: data.adminEmail,
        mot_de_passe: data.password,
        role: 'proprietaire-hopital'
      };

      const userResponse = await apiClient.post('/utilisateurs', userData);
      const userId = userResponse.data.utilisateur_id;

      const tenantData: TenantData = {
        nom: data.nomHopital,
        raison_sociale: data.raisonSociale,
        numero_enregistrement: data.numeroEnregistrement,
        nif: data.nif,
        type_etablissement: data.typeEtablissement,
        logo: data.logo,
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
        email_professionnel: data.email,
        email_support: data.emailSupport,
        nombre_de_lits: data.nombreLits ? parseInt(data.nombreLits as string) : null,
        urgence_disponible: data.urgenceDisponible,
        laboratoire_disponible: data.laboratoireDisponible,
        pharmacie_disponible: data.pharmacieDisponible,
        radiologie_disponible: data.radiologieDisponible,
        heure_ouverture: data.heureOuverture,
        heure_fermeture: data.heureFermeture,
        type_abonnement: data.planAbonnement,
        cycle_facturation: data.cycleFacturation,
        statut: 'inactif',
        statut_verification_document: 'en_attente',
        proprietaire_utilisateur_id: userId,
        nom_schema_base_de_donnees: `tenant_${data.nomHopital.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
        adresse: data.adresseLigne1,
        directeur: `${data.prenomAdmin} ${data.nomAdmin}`
      };

      const tenantResponse = await apiClient.post('/tenants', tenantData);
      const tenantId = tenantResponse.data.tenant_id;

      await apiClient.patch(`/utilisateurs/${userId}`, { hopital_id: tenantId });

      const authUser: AuthUser = {
        utilisateur_id: userId,
        nom_complet: userData.nom_complet!,
        email: data.adminEmail,
        role: 'proprietaire-hopital',
        hopital_id: tenantId
      };

      const token = SessionHelper.generateToken(authUser);
      SessionHelper.setSession(token, authUser, tenantResponse.data);

      apiClient.post('/sessions', {
        utilisateur_id: userId,
        token: token,
        date_creation: new Date().toISOString(),
        date_expiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        actif: true
      }).catch(err => console.warn('Impossible de créer la session:', err));

      return {
        success: true,
        message: `Félicitations! L'hôpital "${data.nomHopital}" a été créé avec succès.`,
        data: { user: authUser, tenant: tenantResponse.data, token, redirectTo: '/home' }
      };

    } catch (error: any) {
      console.error('Erreur inscription:', error);
      let errorMessage = 'Erreur lors de la création du compte';
      if (error.response?.status === 409) errorMessage = 'Un conflit est survenu.';
      else if (error.code === 'ERR_NETWORK') errorMessage = 'Impossible de se connecter au serveur.';
      
      return { success: false, message: errorMessage, error: error.message };
    }
  },

  /**
   * Déconnexion
   */
  async deconnexion(): Promise<ApiResponse> {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        apiClient.get(`/sessions?token=${token}&actif=true`).then(response => {
          if (response.data?.length > 0) {
            apiClient.patch(`/sessions/${response.data[0].id}`, {
              actif: false,
              date_deconnexion: new Date().toISOString()
            });
          }
        }).catch(err => console.warn('Erreur mise à jour session', err));
      }

      SessionHelper.clearSession();
      return { success: true, message: 'Déconnexion réussie. À bientôt!' };
    } catch (error: any) {
      SessionHelper.clearSession();
      return { success: false, message: 'Erreur lors de la déconnexion', error: error.message };
    }
  },

  /**
   * Vérifier session
   */
  verifierSession(): { user: AuthUser | null; isValid: boolean; message: string } {
    try {
      const userData = localStorage.getItem('user_data');
      const token = localStorage.getItem('auth_token');

      if (!userData || !token) {
        return { user: null, isValid: false, message: 'Aucune session active' };
      }

      const tokenData = SessionHelper.getTokenData(token);
      if (!tokenData) throw new Error('Invalid token');

      const tokenAge = Date.now() - tokenData.timestamp;
      const maxAge = tokenData.expiresIn || 24 * 60 * 60 * 1000;

      if (tokenAge > maxAge) {
        this.deconnexion();
        return { user: null, isValid: false, message: 'Session expirée' };
      }

      return { user: JSON.parse(userData), isValid: true, message: 'Session valide' };

    } catch (error) {
      return { user: null, isValid: false, message: 'Erreur de vérification' };
    }
  },

  /**
   * Réinitialisation de mot de passe
   */
  async resetPassword(email: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.get(`/utilisateurs?email=${email}`);
      const users = response.data;

      if (!users?.length) {
        return { success: true, message: 'Si cet email existe, vous recevrez un lien.' };
      }

      const resetToken = btoa(JSON.stringify({
        userId: users[0].utilisateur_id,
        email: users[0].email,
        type: 'password-reset',
        timestamp: Date.now(),
        expiresIn: 3600000
      }));

      return {
        success: true,
        message: `Un email a été envoyé à ${email}.`,
        data: { resetToken }
      };
    } catch (error: any) {
      return { success: false, message: 'Erreur lors de la réinitialisation', error: error.message };
    }
  },

  async getTenantById(tenantId: number): Promise<ApiResponse> {
    return this.fetchWithErrorHandling(`/tenants/${tenantId}`, 'Tenant récupéré');
  },

  async getUserById(userId: number): Promise<ApiResponse> {
    return this.fetchWithErrorHandling(`/utilisateurs/${userId}`, 'Utilisateur récupéré');
  },

  async fetchWithErrorHandling(endpoint: string, successMsg: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.get(endpoint);
      return { success: true, message: successMsg, data: response.data };
    } catch (error: any) {
      return { success: false, message: 'Erreur lors de la récupération', error: error.message };
    }
  },

  /**
   * Rafraîchir le token
   */
  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    try {
      const currentToken = localStorage.getItem('auth_token');
      const userDataStr = localStorage.getItem('user_data');

      if (!currentToken || !userDataStr) {
        return { success: false, message: 'Aucune session active' };
      }

      const user = JSON.parse(userDataStr);
      const newToken = SessionHelper.generateToken(user);

      localStorage.setItem('auth_token', newToken);

      apiClient.get(`/sessions?token=${currentToken}&actif=true`).then(response => {
        if (response.data?.length > 0) {
          apiClient.patch(`/sessions/${response.data[0].id}`, {
             token: newToken,
             date_expiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          });
        }
      }).catch(err => console.warn('Impossible de mettre à jour la session DB:', err));

      return { success: true, message: 'Token rafraîchi', data: { token: newToken } };

    } catch (error: any) {
      return { success: false, message: 'Erreur rafraîchissement token', error: error.message };
    }
  }
};