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

// Fonctions API pour l'authentification
export const authApi = {
 /**
 * Connexion utilisateur - Vérifie dans JSON Server
 */
 async connexion(data: ConnexionData): Promise<ApiResponse<ConnexionResponse>> {
 try {
 console.log('Recherche utilisateur:', data.email);

 // 1. Chercher l'utilisateur par email dans JSON Server
 const response = await apiClient.get(`/utilisateurs?email=${data.email}`);
 const users = response.data;

 console.log('Utilisateurs trouvés:', users.length);

 if (!users || users.length === 0) {
 return {
 success: false,
 message: 'Aucun compte trouvé avec cet email. Veuillez vérifier ou créer un compte.'
 };
 }

 const user = users[0];

 // 2. Vérifier le mot de passe
 // NOTE: En développement avec JSON Server, on compare en clair
 // En production, il faudrait comparer des hash avec bcrypt
 console.log('Vérification du mot de passe...');
 if (user.mot_de_passe !== data.password) {
 return {
 success: false,
 message: 'Mot de passe incorrect. Veuillez réessayer.'
 };
 }

 // 3. Vérifier le statut de l'utilisateur et du tenant
 if (user.hopital_id) {
 try {
 const tenantResponse = await apiClient.get(`/tenants/${user.hopital_id}`);
 const tenant = tenantResponse.data;

 if (tenant.statut !== 'actif') {
 return {
 success: false,
 message: `L'hôpital "${tenant.nom}" est ${tenant.statut}. Contactez l'administration.`
 };
 }
 } catch (error) {
 console.warn('Tenant non trouvé pour l\'utilisateur:', user.hopital_id);
 }
 }

 // 4. Récupérer les informations du tenant (hôpital) si disponible
 let tenantInfo = null;
 if (user.hopital_id) {
 try {
 const tenantResponse = await apiClient.get(`/tenants/${user.hopital_id}`);
 tenantInfo = tenantResponse.data;
 console.log('Tenant trouvé:', tenantInfo.nom);
 } catch (error) {
 console.warn('Impossible de récupérer le tenant:', error);
 }
 }

 // 5. Créer un token simulé (en production, utiliser JWT)
 const tokenData = {
 userId: user.utilisateur_id,
 email: user.email,
 role: user.role,
 hopitalId: user.hopital_id,
 timestamp: Date.now(),
 expiresIn: 24 * 60 * 60 * 1000 // 24 heures
 };

 const token = btoa(JSON.stringify(tokenData));
 console.log('Token généré');

 // 6. Déterminer la page de redirection selon le rôle
 let redirectTo = '/Home'; // Page par défaut

 switch (user.role) {
 case 'admin-systeme':
 redirectTo = '/admin/dashboard';
 break;
 case 'proprietaire-hopital':
 redirectTo = '/home';
 break;
 case 'personnel':
 redirectTo = '/personnel/dashboard';
 break;
 default:
 redirectTo = '/home';
 }

 console.log('Redirection vers:', redirectTo);

 // 7. Préparer les données utilisateur à stocker
 const userData: AuthUser = {
 utilisateur_id: user.utilisateur_id,
 nom_complet: user.nom_complet,
 email: user.email,
 role: user.role,
 hopital_id: user.hopital_id
 };

 // 8. Stocker dans localStorage pour la session
 localStorage.setItem('auth_token', token);
 localStorage.setItem('user_data', JSON.stringify(userData));
 if (tenantInfo) {
 localStorage.setItem('tenant_data', JSON.stringify(tenantInfo));
 }

 console.log('Données stockées dans localStorage');

 // 9. Enregistrer la session dans la base de données (optionnel)
 try {
 const sessionData: SessionData = {
 utilisateur_id: user.utilisateur_id,
 token: token,
 date_creation: new Date().toISOString(),
 date_expiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
 actif: true
 };

 await apiClient.post('/sessions', sessionData);
 console.log('Session enregistrée dans la base de données');
 } catch (error) {
 console.warn('Impossible de créer la session dans la DB:', error);
 }

 console.log('Connexion réussie pour:', user.email);

 return {
 success: true,
 message: `Connexion réussie! Bienvenue ${user.nom_complet}`,
 data: {
 user: userData,
 token: token,
 redirectTo: redirectTo,
 tenant: tenantInfo
 }
 };

 } catch (error: any) {
 console.error('Erreur de connexion:', error);

 let errorMessage = 'Erreur lors de la connexion au serveur';

 if (error.code === 'ERR_NETWORK') {
 errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
 } else if (error.response?.status === 404) {
 errorMessage = 'Service d\'authentification indisponible. Contactez l\'administrateur.';
 } else if (error.response?.status === 500) {
 errorMessage = 'Erreur serveur interne. Veuillez réessayer plus tard.';
 }

 return {
 success: false,
 message: errorMessage,
 error: error.message
 };
 }
 },

 /**
 * Inscription complète (tenant + utilisateur)
 */
 async inscriptionComplet(data: InscriptionData): Promise<ApiResponse<InscriptionResponse>> {
 try {
 console.log('Début de l\'inscription pour:', data.nomHopital);

 // 1. Vérifier si l'email existe déjà
 console.log('Vérification de l\'email:', data.email);
 const emailCheck = await apiClient.get(`/utilisateurs?email=${data.email}`);
 if (emailCheck.data && emailCheck.data.length > 0) {
 return {
 success: false,
 message: 'Cet email est déjà utilisé. Veuillez utiliser un autre email.'
 };
 }

 // 2. Créer d'abord l'utilisateur (propriétaire)
 console.log('Création de l\'utilisateur...');
 const userData: UserData = {
 nom_complet: `${data.prenomAdmin} ${data.nomAdmin}`,
 email: data.adminEmail,
 mot_de_passe: data.password,
 role: 'proprietaire-hopital'
 };

 const userResponse = await apiClient.post('/utilisateurs', userData);
 const userId = userResponse.data.utilisateur_id;
 console.log('Utilisateur créé avec ID:', userId);

 // 3. Créer le tenant (hôpital)
 console.log('Création du tenant...');
 const tenantData: TenantData = {
 nom: data.nomHopital,
 raison_sociale: data.raisonSociale,
 numero_enregistrement: data.numeroEnregistrement,
 nif: data.nif,
 type_etablissement: data.typeEtablissement,
 logo: data.logo, // Note: Normalement géré via upload séparé
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

 nombre_de_lits: data.nombreLits ? parseInt(data.nombreLits) : null,
 urgence_disponible: data.urgenceDisponible,
 laboratoire_disponible: data.laboratoireDisponible,
 pharmacie_disponible: data.pharmacieDisponible,
 radiologie_disponible: data.radiologieDisponible,
 heure_ouverture: data.heureOuverture,
 heure_fermeture: data.heureFermeture,

 type_abonnement: data.planAbonnement,
 cycle_facturation: data.cycleFacturation,

 statut: 'inactif', // Par défaut inactif comme demandé
 statut_verification_document: 'en_attente',
 proprietaire_utilisateur_id: userId,
 nom_schema_base_de_donnees: `tenant_${data.nomHopital.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,

 // Legacy
 adresse: data.adresseLigne1,
 directeur: `${data.prenomAdmin} ${data.nomAdmin}`
 };

 const tenantResponse = await apiClient.post('/tenants', tenantData);
 const tenantId = tenantResponse.data.tenant_id;
 console.log('Tenant créé avec ID:', tenantId);

 // 4. Mettre à jour l'utilisateur avec l'ID du tenant
 console.log('Mise à jour de l\'utilisateur avec hopital_id...');
 await apiClient.patch(`/utilisateurs/${userId}`, {
 hopital_id: tenantId
 });

 // 5. Créer un token pour la session
 const tokenData = {
 userId: userId,
 email: data.adminEmail,
 role: 'proprietaire-hopital',
 hopitalId: tenantId,
 timestamp: Date.now()
 };

 const token = btoa(JSON.stringify(tokenData));
 console.log('Token généré');

 // 6. Stocker dans localStorage
 const userAuthData: AuthUser = {
 utilisateur_id: userId,
 nom_complet: userData.nom_complet,
 email: data.adminEmail,
 role: 'proprietaire-hopital',
 hopital_id: tenantId
 };

 localStorage.setItem('auth_token', token);
 localStorage.setItem('user_data', JSON.stringify(userAuthData));
 localStorage.setItem('tenant_data', JSON.stringify(tenantResponse.data));

 console.log('Données stockées dans localStorage');

 // 7. Créer une session
 try {
 const sessionData: SessionData = {
 utilisateur_id: userId,
 token: token,
 date_creation: new Date().toISOString(),
 date_expiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
 actif: true
 };

 await apiClient.post('/sessions', sessionData);
 console.log('Session créée');
 } catch (error) {
 console.warn('Impossible de créer la session:', error);
 }

 console.log('Inscription terminée avec succès!');
 return {
 success: true,
 message: `Félicitations! L'hôpital "${data.nomHopital}" a été créé avec succès. Votre compte est actuellement inactif et sera activé dans moins de deux jours après vérification.`,
 data: {
 user: userAuthData,
 tenant: tenantResponse.data,
 token: token,
 redirectTo: '/home'
 }
 };

 } catch (error: any) {
 console.error(' Erreur lors de l\'inscription:', error);

 let errorMessage = 'Erreur lors de la création du compte';

 if (error.response?.status === 409) {
 errorMessage = 'Un conflit est survenu. Veuillez réessayer.';
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
 * Déconnexion - Nettoyer le localStorage et la session
 */
 async deconnexion(): Promise<ApiResponse> {
 try {
 console.log('Déconnexion en cours...');

 const token = localStorage.getItem('auth_token');
 const userData = localStorage.getItem('user_data');

 if (userData) {
 try {
 // const user = JSON.parse(userData);
 // Utiliser l'ID utilisateur si nécessaire pour d'autres appels API
 } catch (e) {
 console.warn('Impossible de parser user_data:', e);
 }
 }

 // 1. Marquer la session comme inactive dans la DB
 if (token) {
 try {
 // Chercher la session par token
 const sessionsResponse = await apiClient.get(`/sessions?token=${token}&actif=true`);
 if (sessionsResponse.data && sessionsResponse.data.length > 0) {
 const sessionId = sessionsResponse.data[0].id;
 await apiClient.patch(`/sessions/${sessionId}`, {
 actif: false,
 date_deconnexion: new Date().toISOString()
 });
 console.log('Session marquée comme inactive');
 }
 } catch (error) {
 console.warn('Impossible de mettre à jour la session:', error);
 }
 }

 // 2. Nettoyer le localStorage
 localStorage.removeItem('auth_token');
 localStorage.removeItem('user_data');
 localStorage.removeItem('tenant_data');

 console.log('localStorage nettoyé');

 return {
 success: true,
 message: 'Déconnexion réussie. À bientôt!'
 };
 } catch (error: any) {
 console.error('Erreur lors de la déconnexion:', error);

 // Même en cas d'erreur, nettoyer le localStorage
 localStorage.removeItem('auth_token');
 localStorage.removeItem('user_data');
 localStorage.removeItem('tenant_data');

 return {
 success: false,
 message: 'Erreur lors de la déconnexion',
 error: error.message
 };
 }
 },

 /**
 * Vérifier si l'utilisateur est connecté et si la session est valide
 */
 verifierSession(): { user: AuthUser | null; isValid: boolean; message: string } {
 try {
 const userData = localStorage.getItem('user_data');
 const token = localStorage.getItem('auth_token');

 if (!userData || !token) {
 return {
 user: null,
 isValid: false,
 message: 'Aucune session active'
 };
 }

 // Vérifier le token
 try {
 const tokenData = JSON.parse(atob(token));
 const tokenAge = Date.now() - tokenData.timestamp;
 const maxAge = tokenData.expiresIn || 24 * 60 * 60 * 1000; // 24 heures par défaut

 if (tokenAge > maxAge) {
 console.log('Token expiré, déconnexion...');
 this.deconnexion();
 return {
 user: null,
 isValid: false,
 message: 'Session expirée'
 };
 }

 const user = JSON.parse(userData);
 return {
 user,
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
 console.error(' Erreur vérification session:', error);
 return {
 user: null,
 isValid: false,
 message: 'Erreur de vérification'
 };
 }
 },

 /**
 * Réinitialisation de mot de passe
 */
 async resetPassword(email: string): Promise<ApiResponse> {
 try {
 console.log('Demande de réinitialisation pour:', email);

 // Vérifier si l'email existe
 const response = await apiClient.get(`/utilisateurs?email=${email}`);
 const users = response.data;

 if (!users || users.length === 0) {
 // Pour des raisons de sécurité, on ne révèle pas si l'email existe
 return {
 success: true,
 message: 'Si cet email existe dans notre système, vous recevrez un lien de réinitialisation dans quelques minutes.'
 };
 }

 const user = users[0];

 // Générer un token de réinitialisation
 const resetToken = btoa(JSON.stringify({
 userId: user.utilisateur_id,
 email: user.email,
 type: 'password-reset',
 timestamp: Date.now(),
 expiresIn: 3600000 // 1 heure
 }));

 // Enregistrer le token (dans une vraie app, on l'enverrait par email)
 console.log('Token de réinitialisation généré:', resetToken.substring(0, 20) + '...');

 // Simuler l'envoi d'email
 console.log(`Email simulé envoyé à ${email} avec lien de réinitialisation`);

 return {
 success: true,
 message: `Un email de réinitialisation a été envoyé à ${email}. Le lien est valide pendant 1 heure.`,
 data: {
 resetToken: resetToken // À utiliser pour la page de reset
 }
 };

 } catch (error: any) {
 console.error(' Erreur réinitialisation mot de passe:', error);

 return {
 success: false,
 message: 'Erreur lors de la réinitialisation du mot de passe',
 error: error.message
 };
 }
 },

 /**
 * Récupérer les informations du tenant par ID
 */
 async getTenantById(tenantId: number): Promise<ApiResponse> {
 try {
 const response = await apiClient.get(`/tenants/${tenantId}`);
 return {
 success: true,
 message: 'Tenant récupéré',
 data: response.data
 };
 } catch (error: any) {
 return {
 success: false,
 message: 'Erreur lors de la récupération du tenant',
 error: error.message
 };
 }
 },

 /**
 * Récupérer les informations de l'utilisateur par ID
 */
 async getUserById(userId: number): Promise<ApiResponse> {
 try {
 const response = await apiClient.get(`/utilisateurs/${userId}`);
 return {
 success: true,
 message: 'Utilisateur récupéré',
 data: response.data
 };
 } catch (error: any) {
 return {
 success: false,
 message: 'Erreur lors de la récupération de l\'utilisateur',
 error: error.message
 };
 }
 },

 /**
 * Rafraîchir le token (pour prolonger la session)
 */
 async refreshToken(): Promise<ApiResponse<{ token: string }>> {
 try {
 const currentToken = localStorage.getItem('auth_token');
 const userData = localStorage.getItem('user_data');

 if (!currentToken || !userData) {
 return {
 success: false,
 message: 'Aucune session active'
 };
 }

 const user = JSON.parse(userData);

 // Créer un nouveau token
 const newTokenData = {
 userId: user.utilisateur_id,
 email: user.email,
 role: user.role,
 hopitalId: user.hopital_id,
 timestamp: Date.now(),
 expiresIn: 24 * 60 * 60 * 1000
 };

 const newToken = btoa(JSON.stringify(newTokenData));

 // Mettre à jour le localStorage
 localStorage.setItem('auth_token', newToken);

 // Mettre à jour la session dans la DB
 try {
 const sessionsResponse = await apiClient.get(`/sessions?token=${currentToken}&actif=true`);
 if (sessionsResponse.data && sessionsResponse.data.length > 0) {
 const sessionId = sessionsResponse.data[0].id;
 await apiClient.patch(`/sessions/${sessionId}`, {
 token: newToken,
 date_expiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
 });
 }
 } catch (error) {
 console.warn('Impossible de mettre à jour la session:', error);
 }

 return {
 success: true,
 message: 'Token rafraîchi',
 data: { token: newToken }
 };

 } catch (error: any) {
 console.error('Erreur rafraîchissement token:', error);
 return {
 success: false,
 message: 'Erreur lors du rafraîchissement du token',
 error: error.message
 };
 }
 }
};