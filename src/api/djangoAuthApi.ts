import apiClient from './apiConfig';
import {
  InscriptionData,
  ConnexionData,
  ApiResponse,
  ConnexionResponse,
  InscriptionResponse,
  AuthUser
} from './types/auth.types';
import { validation } from '../utils/validation';

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
      
      console.log('Tentative de connexion Django:', data.email);
      const response = await apiClient.post('/comptes/login/', payload);

      console.log('Data reçue du backend (KEYS):', Object.keys(response.data));
      const respData = response.data;
      if (respData.user) console.log('User KEYS:', Object.keys(respData.user));
      if (respData.tenant) console.log('Tenant KEYS:', Object.keys(respData.tenant));
      if (respData.user && respData.user.hopital) console.log('User.hopital structure:', respData.user.hopital);
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

      console.log('Connexion Django réussie, user:', authUser);

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
      console.error('Erreur connexion Django:', error.response?.data || error.message);

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
      console.log('Inscription hôpital Django:', data.nom);

      const formData = new FormData();
      
      // Informations Administrateur (Comptes)
      formData.append('email', data.adminEmail);
      formData.append('nom_complet', `${data.prenomAdmin} ${data.nomAdmin}`.trim());
      formData.append('password', data.password);
      formData.append('confirm_password', data.password); // Requis par le backend
      formData.append('admin_telephone', validation.cleanPhone(data.adminTelephone || ''));
      formData.append('role', 'proprietaire-hopital'); // CRITIQUE: Sans ça, le backend l'ignore et met "Patient"
      formData.append('is_active', 'false');

      // Informations Hôpital (Tenant) - Format Plat (Supporté par DRF Serializer direct)
      const hospitalName = data.nom || data.nomHopital;
      formData.append('nom', hospitalName);
      formData.append('raison_sociale', data.raisonSociale || '');
      formData.append('numero_enregistrement', data.numeroEnregistrement);
      formData.append('nif', (data.nif || '').replace(/\D/g, ''));
      formData.append('type_etablissement', data.typeEtablissement);
      
      const fullAdresse = `${data.adresseLigne1}, ${data.ville}${data.province ? ', ' + data.province : ''}${data.codePostal ? ' (' + data.codePostal + ')' : ''}`;
      formData.append('adresse', fullAdresse);
      
      formData.append('telephone', validation.cleanPhone(data.telephone));
      formData.append('telephone_urgence', validation.cleanPhone(data.telephoneUrgence || ''));
      formData.append('email_professionnel', data.email);
      formData.append('email_support', data.emailSupport || '');
      
      formData.append('directeur', data.directeur || '');
      formData.append('nombre_de_lits', data.nombreLits ? data.nombreLits.toString() : '1');

      // Mapping du plan d'abonnement pour le backend
      let typeAbo = 'basic';
      if (data.planAbonnement === 'Pro') typeAbo = 'standard';
      if (data.planAbonnement === 'Enterprise') typeAbo = 'premium';

      // État & Système
      formData.append('statut', 'inactif');
      formData.append('type_abonnement', typeAbo);
      formData.append('statut_verification_document', 'en_attente');
      
      const schemaName = `tenant_${hospitalName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
      formData.append('nom_schema_base_de_donnees', schemaName);

      // On ajoute aussi l'objet complet au cas où le backend l'extrait littéralement via request.data.get('hopital_data')
      const hopitalDataObj = {
        nom: hospitalName,
        adresse: fullAdresse,
        telephone: validation.cleanPhone(data.telephone),
        email_professionnel: data.email,
        directeur: data.directeur || '',
        nombre_de_lits: data.nombreLits ? parseInt(data.nombreLits.toString(), 10) : 1,
        numero_enregistrement: data.numeroEnregistrement || '',
        statut: 'inactif',
        type_abonnement: typeAbo,
        statut_verification_document: 'en_attente',
        nom_schema_base_de_donnees: schemaName
      };
      // Le backend devra faire json.loads(hopital_data) si c'est stringifié, sinon DRF parse le JSON plat.
      formData.append('hopital_data', JSON.stringify(hopitalDataObj));

      // Ajout des documents justificatifs
      if (data.documentsJustificatifs && data.documentsJustificatifs.length > 0) {
        data.documentsJustificatifs.forEach((file) => {
          formData.append('documents_justificatifs', file);
        });
      }

      // Autres infos techniques (Flat)
      formData.append('site_web', data.siteWeb || '');
      formData.append('description', data.description || '');
      formData.append('pays', data.pays || 'Haïti');
      formData.append('province', data.province || '');
      formData.append('ville', data.ville || '');
      formData.append('code_postal', data.codePostal || '');
      formData.append('urgence_disponible', String(data.urgenceDisponible));
      formData.append('laboratoire_disponible', String(data.laboratoireDisponible));
      formData.append('pharmacie_disponible', String(data.pharmacieDisponible));
      formData.append('radiologie_disponible', String(data.radiologieDisponible));
      formData.append('heure_ouverture', data.heureOuverture || '08:00');
      formData.append('heure_fermeture', data.heureFermeture || '17:00');
      formData.append('cycle_facturation', data.cycleFacturation);

      const response = await apiClient.post('/comptes/inscription/', formData);

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
      console.error('Erreur inscription Django (FULL):', error);
      console.error('Erreur inscription Django (RAW):', error.response?.data);
      if (error.response?.data) {
        console.error('Erreur inscription Django (STRING):', JSON.stringify(error.response.data, null, 2));
      }
      
      let message = 'Une erreur est survenue lors de l\'inscription';
      const errorData = error.response?.data;
      
      if (!error.response) {
        message = `Erreur de connexion : ${error.message || 'Le serveur ne répond pas'}`;
      } else if (errorData) {
        if (typeof errorData === 'string') {
          message = errorData;
        } else if (errorData.detail) {
          message = errorData.detail;
        } else if (typeof errorData === 'object') {
          const firstField = Object.keys(errorData)[0];
          const fieldError = errorData[firstField];
          if (Array.isArray(fieldError)) {
            message = `${firstField}: ${fieldError[0]}`;
          } else if (typeof fieldError === 'string') {
            message = `${firstField}: ${fieldError}`;
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
   * Valide la vérification d'email via Token (POST)
   */
  confirmEmailVerification: async function (token: string): Promise<ApiResponse<any>> {
    try {
      console.log('Confirmation email avec token:', token);
      const response = await apiClient.post(`/comptes/verify-email/${token}/`);

      return {
        success: true,
        message: response.data.message || 'Email vérifié avec succès',
        data: response.data
      };
    } catch (error: any) {
      console.error('Erreur confirmation email:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.error || error.response?.data?.detail || 'Le lien est invalide ou a expiré',
        error: error.response?.data
      };
    }
  },

  /**
   * Vérifier l'email via Link (UIDB64 + Token) - Gardé pour compatibilité temporaire
   */
  verifyEmailLink: async function (uidb64: string, token: string): Promise<ApiResponse<any>> {
    try {
      console.log('Vérification email via lien (Legacy) pour UUID:', uidb64);
      const response = await apiClient.get('/comptes/verify-email/', {
        params: { uidb64, token }
      });

      return {
        success: true,
        message: response.data.message || 'Email vérifié avec succès',
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || 'Le lien est invalide',
        error: error.response?.data
      };
    }
  },

  /**
   * Renvoyer le code OTP
   */
  renvoyerOTP: async function (email: string): Promise<ApiResponse<any>> {
    try {
      console.log('Demande de renvoi OTP pour:', email);
      const response = await apiClient.post('/comptes/renvoyer_otp/', { email });
      return {
        success: true,
        message: 'Nouveau code envoyé avec succès',
        data: response.data
      };
    } catch (error: any) {
      console.error('Erreur renvoi OTP:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.detail || 'Impossible de renvoyer le code',
        error: error.response?.data
      };
    }
  },

  /**
   * Créer un utilisateur (Staff)
   */
  creerUtilisateur: async function (data: any): Promise<ApiResponse<any>> {
    try {
      console.log('Tentative de création utilisateur sur: /comptes/utilisateurs/');
      const response = await apiClient.post('/comptes/utilisateurs/', data);
      return {
        success: true,
        message: 'Utilisateur créé avec succès',
        data: response.data
      };
    } catch (error: any) {
      console.error('Erreur création utilisateur Django:', error.response?.data || error.message);
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
    console.log('Mapping user/tenant:', { user, tenant });
    if (user) {
      console.log('User keys:', Object.keys(user));
      if (user.hopital) console.log('user.hopital type:', typeof user.hopital, user.hopital);
      if (user.hopital_detail) console.log('user.hopital_detail:', user.hopital_detail);
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

    console.log('Mapped IDs:', { user_id: user?.id || user?.pk, hopital_id });

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
