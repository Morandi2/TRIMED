/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from './apiConfig';

// Types pour les données hospitalières
export interface Patient {
 patient_id?: number;
 hopital_id?: number;
 nom: string;
 prenom: string;
 email?: string;
 telephone: string;
 numero_identification_nationale?: string;
 date_naissance: string;
 sexe: 'M' | 'F' | 'Autre';
 photo?: string | File | null;
 numero_dossier_medical?: string;
 
 // Nested data (Write)
 adresse?: {
 pays?: string;
 departement?: string;
 ville: string;
 adresse_ligne1: string;
 adresse_ligne2?: string;
 code_postal: string;
 };
 contacts?: Array<{
 nom: string;
 telephone: string;
 relation?: string;
 }>;
 assurances?: Array<{
 nom_assurance: string;
 numero_police: string;
 date_expiration?: string;
 }>;
 allergies?: Array<{
 nom_allergie: string;
 description?: string;
 gravite?: string;
 }>;
 antecedents?: Array<{
 type_antecedent: string;
 description: string;
 date_debut?: string;
 date_fin?: string;
 en_cours?: boolean;
 }>;

 // Read-only nested details (from API response)
 adresses_detail?: any[];
 contacts_detail?: any[];
 assurances_detail?: any[];
 allergies_detail?: any[];
 antecedents_detail?: any[];
 suivis_detail?: any[];
}

export interface RendezVous {
 rendez_vous_id?: number;
 patient: number;
 medecin: number;
 date_heure: string;
 type?: number;
 statut: number;
 motif?: string;
 notes?: string;
 raison_annulation?: string;
 duree?: number;
 
 // Read-only fields from API
 patient_nom?: string;
 patient_prenom?: string;
 medecin_nom?: string;
 medecin_prenom?: string;
 type_nom?: string;
 statut_nom?: string;
 statut_couleur?: string;
 est_dans_futur?: boolean;
 est_aujourdhui?: boolean;
 created_at?: string;
 updated_at?: string;
}

export interface RendezVousType {
 type_id: number;
 tenant_id?: number;
 nom: string;
 description?: string;
 duree_defaut?: number;
 couleur?: string;
}

export interface RendezVousStatut {
 statut_id: number;
 tenant_id?: number;
 nom: string;
 description?: string;
 couleur?: string;
 est_annule?: boolean;
 est_confirme?: boolean;
 est_termine?: boolean;
}

export interface Consultation {
 consultation_id?: number;
 patient_id: number;
 medecin_id: number;
 date_consultation: string;
 motif: string;
 diagnostic?: string;
 traitement?: string;
 notes?: string;
 ordonnances?: any[];
}

export interface Medecin {
 medecin_id?: number;
 hopital_id?: number;
 nom: string;
 prenom: string;
 email_professionnel: string;
 telephone: string;
 specialite_principale_id: number;
 specialites_secondaires_ids?: number[];
 numero_identification?: string;
 numero_matricule_professionnel?: string;
 photo?: string | File | null;
 biographie?: string;
}

export interface Medicament {
 medicament_id?: number;
 tenant?: number;
 nom: string;
 forme_pharmaceutique: string;
 dosage_standard?: string;
 categorie?: number;
 code_atc?: string;
 dci?: string;
 description?: string;
 stock_actuel: number;
 stock_minimum: number;
 prix_unitaire?: string;
 necessite_ordonnance: boolean;
 actif: boolean;
 
 // Read-only fields
 categorie_nom?: string;
 besoin_reapprovisionnement?: boolean;
 statut_stock?: {
 niveau: 'rupture' | 'faible' | 'normal';
 couleur: string;
 message: string;
 };
 created_at?: string;
 updated_at?: string;
}

export interface MedicamentCategorie {
 categorie_id?: number;
 tenant?: number;
 nom: string;
 description?: string;
 nb_medicaments?: number;
 created_at?: string;
 updated_at?: string;
}

export interface MedicamentStatistiques {
 total_medicaments: number;
 medicaments_actifs: number;
 medicaments_rupture: number;
 medicaments_stock_faible: number;
 valeur_stock_total: number;
 categories_count: number;
 repartition_formes: Record<string, number>;
 top_medicaments_chers: any[];
 attention_requise: any[];
}

// API pour la gestion hospitalière avec Django
export const hospitalApi = {
 // ==================== PATIENTS ====================
 patients: {
 // Récupérer tous les patients
 async getAll(params?: { page?: number; search?: string; sexe?: string }) {
 try {
 const response = await apiClient.get('/patients/', { params });
 return {
 success: true,
 data: response.data,
 message: 'Patients récupérés avec succès'
 };
 } catch (error: any) {
 console.error(' Erreur récupération patients:', error);
 return {
 success: false,
 message: error.response?.data?.detail || 'Erreur lors de la récupération des patients',
 error: error.message
 };
 }
 },

 // Récupérer un patient par ID
 async getById(id: number) {
 try {
 const response = await apiClient.get(`/patients/${id}/`);
 return {
 success: true,
 data: response.data,
 message: 'Patient récupéré avec succès'
 };
 } catch (error: any) {
 console.error(' Erreur récupération patient:', error);
 return {
 success: false,
 message: error.response?.data?.detail || 'Patient non trouvé',
 error: error.message
 };
 }
 },

 // Créer un nouveau patient
 async create(patientData: any) {
 try {
 let payload = patientData;
 
 // Gérer FormData si une photo est présente
 if (patientData.photo instanceof File) {
 payload = new FormData();
 Object.keys(patientData).forEach(key => {
 if (patientData[key] !== null && patientData[key] !== undefined) {
 if (typeof patientData[key] === 'object' && !(patientData[key] instanceof File)) {
 payload.append(key, JSON.stringify(patientData[key]));
 } else {
 payload.append(key, patientData[key]);
 }
 }
 });
 }

 const response = await apiClient.post('/patients/', payload);
 return {
 success: true,
 data: response.data,
 message: 'Patient créé avec succès'
 };
 } catch (error: any) {
 console.error(' Erreur création patient:', error);
 return {
 success: false,
 message: error.response?.data?.detail || 'Erreur lors de la création du patient',
 error: error.response?.data || error.message
 };
 }
 },

 // Mettre à jour un patient
 async update(id: number, patientData: Partial<Patient>) {
 try {
 const response = await apiClient.put(`/patients/${id}/`, patientData);
 return {
 success: true,
 data: response.data,
 message: 'Patient mis à jour avec succès'
 };
 } catch (error: any) {
 console.error(' Erreur mise à jour patient:', error);
 return {
 success: false,
 message: error.response?.data?.detail || 'Erreur lors de la mise à jour du patient',
 error: error.response?.data || error.message
 };
 }
 },

 // Supprimer un patient
 async delete(id: number) {
 try {
 await apiClient.delete(`/patients/${id}/`);
 return {
 success: true,
 message: 'Patient supprimé avec succès'
 };
 } catch (error: any) {
 console.error(' Erreur suppression patient:', error);
 return {
 success: false,
 message: error.response?.data?.detail || 'Erreur lors de la suppression du patient',
 error: error.message
 };
 }
 },

 // Récupérer le dossier complet d'un patient
 async getDossierComplet(id: number) {
 try {
 const response = await apiClient.get(`/patients/${id}/dossier_complet/`);
 return {
 success: true,
 data: response.data,
 message: 'Dossier complet récupéré avec succès'
 };
 } catch (error: any) {
 console.error(' Erreur récupération dossier:', error);
 return {
 success: false,
 message: error.response?.data?.detail || 'Erreur lors de la récupération du dossier',
 error: error.message
 };
 }
 },

 // Statistiques des patients
 async getStatistiques() {
 try {
 const response = await apiClient.get('/patients/statistiques/');
 return {
 success: true,
 data: response.data,
 message: 'Statistiques récupérées avec succès'
 };
 } catch (error: any) {
 console.error(' Erreur statistiques patients:', error);
 return {
 success: false,
 message: error.response?.data?.detail || 'Erreur lors de la récupération des statistiques',
 error: error.message
 };
 }
 },

 // --- SOUS-MODULES PATIENTS ---
 ajouterAllergie: async (id: number, data: any) => apiClient.post(`/patients/${id}/ajouter_allergie/`, data),
 ajouterAntecedent: async (id: number, data: any) => apiClient.post(`/patients/${id}/ajouter_antecedent/`, data),
 ajouterSuivi: async (id: number, data: any) => apiClient.post(`/patients/${id}/ajouter_suivi/`, data),

 adresses: {
 getAll: async (params?: any) => apiClient.get('/patients/adresses/', { params }),
 getById: async (id: number) => apiClient.get(`/patients/adresses/${id}/`),
 create: async (data: any) => apiClient.post('/patients/adresses/', data),
 update: async (id: number, data: any) => apiClient.patch(`/patients/adresses/${id}/`, data),
 delete: async (id: number) => apiClient.delete(`/patients/adresses/${id}/`),
 },
 allergies: {
 getAll: async (params?: any) => apiClient.get('/patients/allergies/', { params }),
 getById: async (id: number) => apiClient.get(`/patients/allergies/${id}/`),
 create: async (data: any) => apiClient.post('/patients/allergies/', data),
 update: async (id: number, data: any) => apiClient.patch(`/patients/allergies/${id}/`, data),
 delete: async (id: number) => apiClient.delete(`/patients/allergies/${id}/`),
 },
 antecedents: {
 getAll: async (params?: any) => apiClient.get('/patients/antecedents/', { params }),
 getById: async (id: number) => apiClient.get(`/patients/antecedents/${id}/`),
 create: async (data: any) => apiClient.post('/patients/antecedents/', data),
 update: async (id: number, data: any) => apiClient.patch(`/patients/antecedents/${id}/`, data),
 delete: async (id: number) => apiClient.delete(`/patients/antecedents/${id}/`),
 },
 assurances: {
 getAll: async (params?: any) => apiClient.get('/patients/assurances/', { params }),
 getById: async (id: number) => apiClient.get(`/patients/assurances/${id}/`),
 create: async (data: any) => apiClient.post('/patients/assurances/', data),
 update: async (id: number, data: any) => apiClient.patch(`/patients/assurances/${id}/`, data),
 delete: async (id: number) => apiClient.delete(`/patients/assurances/${id}/`),
 },
 contacts: {
 getAll: async (params?: any) => apiClient.get('/patients/contacts/', { params }),
 getById: async (id: number) => apiClient.get(`/patients/contacts/${id}/`),
 create: async (data: any) => apiClient.post('/patients/contacts/', data),
 update: async (id: number, data: any) => apiClient.patch(`/patients/contacts/${id}/`, data),
 delete: async (id: number) => apiClient.delete(`/patients/contacts/${id}/`),
 },
 suivis: {
 getAll: async (params?: any) => apiClient.get('/patients/suivis/', { params }),
 getById: async (id: number) => apiClient.get(`/patients/suivis/${id}/`),
 create: async (data: any) => apiClient.post('/patients/suivis/', data),
 update: async (id: number, data: any) => apiClient.patch(`/patients/suivis/${id}/`, data),
 delete: async (id: number) => apiClient.delete(`/patients/suivis/${id}/`),
 }
 },

 // ==================== RENDEZ-VOUS ====================
 rendezvous: {
 // Récupérer tous les rendez-vous
 async getAll(params?: { page?: number; date_debut?: string; date_fin?: string; medecin?: number; statut?: string }) {
 try {
 const response = await apiClient.get('/rendez-vous/', { params });
 return {
 success: true,
 data: response.data,
 message: 'Rendez-vous récupérés avec succès'
 };
 } catch (error: any) {
 console.error(' Erreur récupération rendez-vous:', error);
 return {
 success: false,
 message: error.response?.data?.detail || 'Erreur lors de la récupération des rendez-vous',
 error: error.message
 };
 }
 },

 // Créer un nouveau rendez-vous
 async create(rdvData: RendezVous) {
 try {
 const response = await apiClient.post('/rendez-vous/', rdvData);
 return {
 success: true,
 data: response.data,
 message: 'Rendez-vous créé avec succès'
 };
 } catch (error: any) {
 console.error(' Erreur création rendez-vous:', error);
 return {
 success: false,
 message: error.response?.data?.detail || 'Erreur lors de la création du rendez-vous',
 error: error.response?.data || error.message
 };
 }
 },

 // Mettre à jour un rendez-vous
 async update(id: number, rdvData: Partial<RendezVous>) {
 try {
 const response = await apiClient.put(`/rendez-vous/${id}/`, rdvData);
 return {
 success: true,
 data: response.data,
 message: 'Rendez-vous mis à jour avec succès'
 };
 } catch (error: any) {
 console.error(' Erreur mise à jour rendez-vous:', error);
 return {
 success: false,
 message: error.response?.data?.detail || 'Erreur lors de la mise à jour du rendez-vous',
 error: error.response?.data || error.message
 };
 }
 },

 // Confirmer un rendez-vous
 async confirmer(id: number) {
 try {
 const response = await apiClient.post(`/rendez-vous/${id}/confirmer/`);
 return {
 success: true,
 data: response.data,
 message: 'Rendez-vous confirmé avec succès'
 };
 } catch (error: any) {
 console.error(' Erreur confirmation rendez-vous:', error);
 return {
 success: false,
 message: error.response?.data?.detail || 'Erreur lors de la confirmation du rendez-vous',
 error: error.message
 };
 }
 },

 // Annuler un rendez-vous
 async annuler(id: number, raison?: string) {
 try {
 const response = await apiClient.post(`/rendez-vous/${id}/annuler/`, { raison });
 return {
 success: true,
 data: response.data,
 message: 'Rendez-vous annulé avec succès'
 };
 } catch (error: any) {
 console.error(' Erreur annulation rendez-vous:', error);
 return {
 success: false,
 message: error.response?.data?.detail || 'Erreur lors de l\'annulation du rendez-vous',
 error: error.message
 };
 }
 },

 // Récupérer les créneaux disponibles
 async getCreneauxDisponibles(medecin_id: number, date: string, duree: number = 30) {
 try {
 const response = await apiClient.get('/rendez-vous/creneaux_disponibles/', {
 params: { medecin_id, date, duree }
 });
 return {
 success: true,
 data: response.data,
 message: 'Créneaux disponibles récupérés avec succès'
 };
 } catch (error: any) {
 console.error(' Erreur créneaux disponibles:', error);
 return {
 success: false,
 message: error.response?.data?.detail || 'Erreur lors de la récupération des créneaux',
 error: error.message
 };
 }
 },

 // Récupérer les types de rendez-vous
 async getTypes() {
 try {
 const response = await apiClient.get('/rendez-vous/types/');
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur récupération types', error: error.message };
 }
 },

 // Récupérer les statuts de rendez-vous
 async getStatuts() {
 try {
 const response = await apiClient.get('/rendez-vous/statuts/');
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur récupération statuts', error: error.message };
 }
 },

 // Reporter un rendez-vous
 async reporter(id: number, nouvelle_date_heure: string) {
 try {
 const response = await apiClient.post(`/rendez-vous/${id}/reporter/`, { nouvelle_date_heure });
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur report rendez-vous', error: error.message };
 }
 },

 // Statistiques des rendez-vous
 async getStatistiques() {
 try {
 const response = await apiClient.get('/rendez-vous/statistiques/');
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur statistiques rendez-vous', error: error.message };
 }
 }
 },

 // ==================== MÉDECINS ====================
 medecins: {
 // Récupérer tous les médecins
 async getAll(params?: { page?: number; search?: string; specialite?: string }) {
 try {
 const response = await apiClient.get('/medical/medecins/', { params });
 return {
 success: true,
 data: response.data,
 message: 'Médecins récupérés avec succès'
 };
 } catch (error: any) {
 console.error(' Erreur récupération médecins:', error);
 return {
 success: false,
 message: error.response?.data?.detail || 'Erreur lors de la récupération des médecins',
 error: error.message
 };
 }
 },

 // Récupérer un médecin par son ID
 async getById(id: number) {
 try {
 const response = await apiClient.get(`/medical/medecins/${id}/`);
 return {
 success: true,
 data: response.data,
 message: 'Médecin récupéré avec succès'
 };
 } catch (error: any) {
 console.error(' Erreur récupération médecin:', error);
 return {
 success: false,
 message: error.response?.data?.detail || 'Erreur lors de la récupération du médecin',
 error: error.message
 };
 }
 },

 // Créer un nouveau médecin
 async create(medecinData: any) {
 try {
 let payload = medecinData;
 
 if (medecinData.photo instanceof File) {
 payload = new FormData();
 Object.keys(medecinData).forEach(key => {
 if (medecinData[key] !== null && medecinData[key] !== undefined) {
 if (Array.isArray(medecinData[key])) {
 medecinData[key].forEach((val: any) => payload.append(`${key}[]`, val));
 } else {
 payload.append(key, medecinData[key]);
 }
 }
 });
 }

 const response = await apiClient.post('/medical/medecins/', payload);
 return {
 success: true,
 data: response.data,
 message: 'Médecin créé avec succès'
 };
 } catch (error: any) {
 console.error(' Erreur création médecin:', error);
 return {
 success: false,
 message: error.response?.data?.detail || 'Erreur lors de la création du médecin',
 error: error.response?.data || error.message
 };
 }
 },

 // Statistiques d'un médecin
 async getStatistiques(id: number) {
 try {
 const response = await apiClient.get(`/medical/medecins/${id}/statistiques/`);
 return {
 success: true,
 data: response.data,
 message: 'Statistiques récupérées avec succès'
 };
 } catch (error: any) {
 console.error(' Erreur statistiques médecin:', error);
 return {
 success: false,
 message: error.response?.data?.detail || 'Erreur lors de la récupération des statistiques',
 error: error.message
 };
 }
 },

 // Récupérer les consultations d'un médecin
 async getConsultations(id: number) {
 try {
 const response = await apiClient.get(`/medical/medecins/${id}/consultations/`);
 return {
 success: true,
 data: response.data,
 message: 'Consultations récupérées avec succès'
 };
 } catch (error: any) {
 console.error(' Erreur consultations médecin:', error);
 return {
 success: false,
 message: error.response?.data?.detail || 'Erreur lors de la récupération des consultations',
 error: error.message
 };
 }
 },

 // Mettre à jour un médecin
 async update(id: number, medecinData: Partial<Medecin>) {
 try {
 const response = await apiClient.put(`/medical/medecins/${id}/`, medecinData);
 return {
 success: true,
 data: response.data,
 message: 'Médecin mis à jour avec succès'
 };
 } catch (error: any) {
 return { success: false, message: 'Erreur mise à jour médecin', error: error.message };
 }
 },

 // Supprimer un médecin
 async delete(id: number) {
 try {
 await apiClient.delete(`/medical/medecins/${id}/`);
 return { success: true, message: 'Médecin supprimé avec succès' };
 } catch (error: any) {
 return { success: false, message: 'Erreur suppression médecin', error: error.message };
 }
 }
 },

 // ==================== GROUPES SANGUINS ====================
 groupesSanguins: {
 async getAll() {
 try {
 const response = await apiClient.get('/medical/groupes-sanguins/');
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur récupération groupes sanguins', error: error.message };
 }
 },
 async getById(id: number) {
 try {
 const response = await apiClient.get(`/medical/groupes-sanguins/${id}/`);
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur récupération groupe sanguin', error: error.message };
 }
 }
 },

 // ==================== PRESCRIPTIONS ====================
 prescriptions: {
 async getAll(params?: any) {
 try {
 const response = await apiClient.get('/medical/prescriptions/', { params });
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur récupération prescriptions', error: error.message };
 }
 },
 async getById(id: number) {
 try {
 const response = await apiClient.get(`/medical/prescriptions/${id}/`);
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Prescription non trouvée', error: error.message };
 }
 },
 async create(data: any) {
 try {
 const response = await apiClient.post('/medical/prescriptions/', data);
 return { success: true, data: response.data, message: 'Prescription créée avec succès' };
 } catch (error: any) {
 return { success: false, message: 'Erreur création prescription', error: error.response?.data || error.message };
 }
 },
 async update(id: number, data: any) {
 try {
 const response = await apiClient.patch(`/medical/prescriptions/${id}/`, data);
 return { success: true, data: response.data, message: 'Prescription mise à jour avec succès' };
 } catch (error: any) {
 return { success: false, message: 'Erreur modification prescription', error: error.message };
 }
 },
 async delete(id: number) {
 try {
 await apiClient.delete(`/medical/prescriptions/${id}/`);
 return { success: true, message: 'Prescription supprimée avec succès' };
 } catch (error: any) {
 return { success: false, message: 'Erreur suppression prescription', error: error.message };
 }
 }
 },

 // ==================== CONSULTATIONS ====================
 consultations: {
 // Récupérer toutes les consultations
 async getAll(params?: { page?: number; patient?: number; medecin?: number; date_debut?: string; date_fin?: string }) {
 try {
 const response = await apiClient.get('/medical/consultations/', { params });
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur récupération consultations', error: error.message };
 }
 },

 // Récupérer une consultation par ID
 async getById(id: number) {
 try {
 const response = await apiClient.get(`/medical/consultations/${id}/`);
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur récupération consultation', error: error.message };
 }
 },

 // Créer une nouvelle consultation
 async create(consultationData: any) {
 try {
 const response = await apiClient.post('/medical/consultations/', consultationData);
 return { success: true, data: response.data, message: 'Consultation créée avec succès' };
 } catch (error: any) {
 return { success: false, message: 'Erreur création consultation', error: error.response?.data || error.message };
 }
 },

 // Mettre à jour une consultation
 async update(id: number, consultationData: any) {
 try {
 const response = await apiClient.put(`/medical/consultations/${id}/`, consultationData);
 return { success: true, data: response.data, message: 'Consultation mise à jour avec succès' };
 } catch (error: any) {
 return { success: false, message: 'Erreur modification consultation', error: error.message };
 }
 },

 // Supprimer une consultation
 async delete(id: number) {
 try {
 await apiClient.delete(`/medical/consultations/${id}/`);
 return { success: true, message: 'Consultation supprimée avec succès' };
 } catch (error: any) {
 return { success: false, message: 'Erreur suppression consultation', error: error.message };
 }
 },

 // Créer une ordonnance pour une consultation
 async creerOrdonnance(consultationId: number, ordonnanceData: any) {
 try {
 const response = await apiClient.post(`/medical/consultations/${consultationId}/creer_ordonnance/`, ordonnanceData);
 return { success: true, data: response.data, message: 'Ordonnance créée avec succès' };
 } catch (error: any) {
 return { success: false, message: 'Erreur création ordonnance', error: error.response?.data || error.message };
 }
 },

 // Prescrire un examen
 async prescrireExamen(consultationId: number, examenData: any) {
 try {
 const response = await apiClient.post(`/medical/consultations/${consultationId}/prescrire_examen/`, examenData);
 return { success: true, data: response.data, message: 'Examen prescrit avec succès' };
 } catch (error: any) {
 return { success: false, message: 'Erreur prescription examen', error: error.response?.data || error.message };
 }
 }
 },

 // ==================== ORDONNANCES ====================
 ordonnances: {
 async getAll(params?: any) {
 try {
 const response = await apiClient.get('/medical/ordonnances/', { params });
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur récupération ordonnances', error: error.message };
 }
 },
 async getById(id: number) {
 try {
 const response = await apiClient.get(`/medical/ordonnances/${id}/`);
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Ordonnance non trouvée', error: error.message };
 }
 },
 async create(ordonnanceData: any) {
 try {
 const response = await apiClient.post('/medical/ordonnances/', ordonnanceData);
 return { success: true, data: response.data, message: 'Ordonnance créée avec succès' };
 } catch (error: any) {
 return { success: false, message: 'Erreur création ordonnance', error: error.response?.data || error.message };
 }
 },
 async update(id: number, ordonnanceData: any) {
 try {
 const response = await apiClient.patch(`/medical/ordonnances/${id}/`, ordonnanceData);
 return { success: true, data: response.data, message: 'Ordonnance mise à jour avec succès' };
 } catch (error: any) {
 return { success: false, message: 'Erreur modification ordonnance', error: error.message };
 }
 },
 async delete(id: number) {
 try {
 await apiClient.delete(`/medical/ordonnances/${id}/`);
 return { success: true, message: 'Ordonnance supprimée avec succès' };
 } catch (error: any) {
 return { success: false, message: 'Erreur suppression ordonnance', error: error.message };
 }
 }
 },

 // ==================== EXAMENS ====================
 examens: {
 async getAll(params?: any) {
 try {
 const response = await apiClient.get('/medical/examens/', { params });
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur récupération examens', error: error.message };
 }
 },
 async updateResultat(id: number, data: { resultat: string; notes?: string }) {
 try {
 const response = await apiClient.post(`/medical/examens/${id}/ajouter_resultat/`, data);
 return { success: true, data: response.data, message: 'Résultat ajouté avec succès' };
 } catch (error: any) {
 return { success: false, message: 'Erreur ajout résultat', error: error.message };
 }
 }
 },

 // ==================== FACTURATION ====================
 facturation: {
 invoices: {
 async getAll(params?: any) {
 try {
 const response = await apiClient.get('/facturation/invoices/', { params });
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur récupération factures', error: error.message };
 }
 },
 async getById(id: number) {
 try {
 const response = await apiClient.get(`/facturation/invoices/${id}/`);
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Facture non trouvée', error: error.message };
 }
 }
 },
 paiements: {
 async getAll(params?: any) {
 try {
 const response = await apiClient.get('/facturation/paiements/', { params });
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur récupération paiements', error: error.message };
 }
 },
 async getStats() {
 try {
 const response = await apiClient.get('/facturation/paiements/statistiques/');
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur récupération statistiques paiements', error: error.message };
 }
 },
 async create(paiementData: any) {
 try {
 const response = await apiClient.post('/facturation/paiements/', paiementData);
 return { success: true, data: response.data, message: 'Paiement créé avec succès' };
 } catch (error: any) {
 return { success: false, message: 'Erreur création paiement', error: error.response?.data || error.message };
 }
 }
 },
 tarifs: {
 async getAll(params?: any) {
 try {
 const response = await apiClient.get('/facturation/tarifs-consultation/', { params });
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur récupération tarifs', error: error.message };
 }
 },
 async calculer(params: { specialite_id: number; urgenge?: boolean; nuit?: boolean; weekend?: boolean }) {
 try {
 const response = await apiClient.get('/facturation/tarifs-consultation/calculer_tarif/', { params });
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur calcul tarif', error: error.message };
 }
 }
 }
 },

 // ==================== ABONNEMENTS ====================
 abonnements: {
 async getAll(params?: any) {
 try {
 const response = await apiClient.get('/facturation/abonnements/', { params });
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur récupération abonnements', error: error.message };
 }
 },
 async getById(id: number) {
 try {
 const response = await apiClient.get(`/facturation/abonnements/${id}/`);
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Abonnement non trouvé', error: error.message };
 }
 },
 async create(data: any) {
 try {
 const response = await apiClient.post('/facturation/abonnements/', data);
 return { success: true, data: response.data, message: 'Abonnement créé avec succès' };
 } catch (error: any) {
 return { success: false, message: 'Erreur création abonnement', error: error.response?.data || error.message };
 }
 },
 async update(id: number, data: any) {
 try {
 const response = await apiClient.patch(`/facturation/abonnements/${id}/`, data);
 return { success: true, data: response.data, message: 'Abonnement mis à jour' };
 } catch (error: any) {
 return { success: false, message: 'Erreur modification abonnement', error: error.message };
 }
 },
 async delete(id: number) {
 try {
 await apiClient.delete(`/facturation/abonnements/${id}/`);
 return { success: true, message: 'Abonnement supprimé' };
 } catch (error: any) {
 return { success: false, message: 'Erreur suppression abonnement', error: error.message };
 }
 },
 async renouveler(id: number, data: { periode_mois: number }) {
 try {
 const response = await apiClient.post(`/facturation/abonnements/${id}/renouveler/`, data);
 return { success: true, data: response.data, message: 'Abonnement renouvelé' };
 } catch (error: any) {
 return { success: false, message: 'Erreur renouvellement', error: error.message };
 }
 }
 },

 // ==================== SPÉCIALITÉS ====================
 specialites: {
 async getAll() {
 try {
 const response = await apiClient.get('/medical/specialites/');
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur récupération spécialités', error: error.message };
 }
 },
 async getById(id: number) {
 try {
 const response = await apiClient.get(`/medical/specialites/${id}/`);
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur récupération spécialité', error: error.message };
 }
 },
 async create(data: any) {
 try {
 const response = await apiClient.post('/medical/specialites/', data);
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur création spécialité', error: error.message };
 }
 },
 async update(id: number, data: any) {
 try {
 const response = await apiClient.patch(`/medical/specialites/${id}/`, data);
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur modification spécialité', error: error.message };
 }
 },
 async delete(id: number) {
 try {
 await apiClient.delete(`/medical/specialites/${id}/`);
 return { success: true };
 } catch (error: any) {
 return { success: false, message: 'Erreur suppression spécialité', error: error.message };
 }
 }
 },

 // ==================== MÉDICAMENTS ====================
 medicaments: {
 // Récupérer tous les médicaments
 async getAll(params?: any) {
 try {
 const response = await apiClient.get('/medicaments/', { params });
 return {
 success: true,
 data: response.data,
 message: 'Médicaments récupérés avec succès'
 };
 } catch (error: any) {
 console.error(' Erreur récupération médicaments:', error);
 return { success: false, message: 'Erreur lors de la récupération des médicaments', error: error.message };
 }
 },

 // Récupérer un médicament par son ID
 async getById(id: number) {
 try {
 const response = await apiClient.get(`/medicaments/${id}/`);
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur récupération médicament', error: error.message };
 }
 },

 // Créer un nouveau médicament
 async create(medicamentData: Medicament) {
 try {
 const response = await apiClient.post('/medicaments/', medicamentData);
 return {
 success: true,
 data: response.data,
 message: 'Médicament créé avec succès'
 };
 } catch (error: any) {
 return { success: false, message: 'Erreur lors de la création du médicament', error: error.response?.data || error.message };
 }
 },

 // Mettre à jour un médicament
 async update(id: number, medicamentData: Partial<Medicament>) {
 try {
 const response = await apiClient.patch(`/medicaments/${id}/`, medicamentData);
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur modification médicament', error: error.message };
 }
 },

 // Supprimer un médicament
 async delete(id: number) {
 try {
 await apiClient.delete(`/medicaments/${id}/`);
 return { success: true };
 } catch (error: any) {
 return { success: false, message: 'Erreur suppression médicament', error: error.message };
 }
 },

 // Mettre à jour le stock d'un médicament (Action spéciale)
 async updateStock(id: number, data: { type_mouvement: string; quantite: number; motif?: string; prix_unitaire?: string }) {
 try {
 const response = await apiClient.post(`/medicaments/${id}/mettre_a_jour_stock/`, data);
 return {
 success: true,
 data: response.data,
 message: 'Stock mis à jour avec succès'
 };
 } catch (error: any) {
 return { success: false, message: 'Erreur lors de la mise à jour du stock', error: error.message };
 }
 },

 // Récupérer les statistiques
 async getStats(params?: any) {
 try {
 const response = await apiClient.get('/medicaments/statistiques/', { params });
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur récupération statistiques', error: error.message };
 }
 },

 // Récupérer les médicaments en stock faible
 async getStockBas(params?: any) {
 try {
 const response = await apiClient.get('/medicaments/stock_faible/', { params });
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur récupération stock bas', error: error.message };
 }
 },

 // Récupérer les médicaments en rupture
 async getRuptures(params?: any) {
 try {
 const response = await apiClient.get('/medicaments/rupture_stock/', { params });
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur récupération ruptures', error: error.message };
 }
 }
 },

 medicamentCategories: {
 // Récupérer toutes les catégories
 async getAll(params?: any) {
 try {
 const response = await apiClient.get('/medicaments/categories/', { params });
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur récupération catégories', error: error.message };
 }
 },

 // Récupérer une catégorie par ID
 async getById(id: number) {
 try {
 const response = await apiClient.get(`/medicaments/categories/${id}/`);
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur récupération catégorie', error: error.message };
 }
 },

 // Créer une catégorie
 async create(data: MedicamentCategorie) {
 try {
 const response = await apiClient.post('/medicaments/categories/', data);
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur création catégorie', error: error.message };
 }
 },

 // Mettre à jour une catégorie
 async update(id: number, data: Partial<MedicamentCategorie>) {
 try {
 const response = await apiClient.patch(`/medicaments/categories/${id}/`, data);
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur modification catégorie', error: error.message };
 }
 },

 // Supprimer une catégorie
 async delete(id: number) {
 try {
 await apiClient.delete(`/medicaments/categories/${id}/`);
 return { success: true };
 } catch (error: any) {
 return { success: false, message: 'Erreur suppression catégorie', error: error.message };
 }
 }
 },

 // ==================== RENDEZ-VOUS (DUPLICATE REMOVED) ====================
 // hospitalApi.rendezVous is now the preferred one aligned with backend /api/rendez-vous/
 rendezVous: {
 // Récupérer tous les rendez-vous
 async getAll(params?: { tenant?: number; patient?: number; medecin?: number; date_debut?: string; date_fin?: string; statut?: number; aujourdhui?: boolean; cette_semaine?: boolean }) {
 try {
 const response = await apiClient.get('/rendez-vous/', { params });
 return {
 success: true,
 data: response.data,
 message: 'Rendez-vous récupérés avec succès'
 };
 } catch (error: any) {
 return { success: false, message: 'Erreur récupération rendez-vous', error: error.message };
 }
 },

 async getById(id: number) {
 try {
 const response = await apiClient.get(`/rendez-vous/${id}/`);
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur récupération rdv', error: error.message };
 }
 },

 async create(rdvData: RendezVous) {
 try {
 const response = await apiClient.post('/rendez-vous/', rdvData);
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur création rdv', error: error.response?.data || error.message };
 }
 },

 async update(id: number, rdvData: Partial<RendezVous>) {
 try {
 const response = await apiClient.patch(`/rendez-vous/${id}/`, rdvData);
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur modification rdv', error: error.message };
 }
 },

 async delete(id: number) {
 try {
 await apiClient.delete(`/rendez-vous/${id}/`);
 return { success: true };
 } catch (error: any) {
 return { success: false, message: 'Erreur suppression rdv', error: error.message };
 }
 },

 async confirmer(id: number) {
 try {
 const response = await apiClient.post(`/rendez-vous/${id}/confirmer/`);
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur confirmation rdv', error: error.message };
 }
 },

 async annuler(id: number) {
 try {
 const response = await apiClient.post(`/rendez-vous/${id}/annuler/`);
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur annulation rdv', error: error.message };
 }
 },

 async reporter(id: number, nouvelle_date_heure: string) {
 try {
 const response = await apiClient.post(`/rendez-vous/${id}/reporter/`, { nouvelle_date_heure });
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur report rdv', error: error.message };
 }
 },

 async getCreneauxDisponibles(medecin_id: number, date: string, duree: number = 30) {
 try {
 const response = await apiClient.get('/rendez-vous/creneaux_disponibles/', {
 params: { medecin_id, date, duree }
 });
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur créneaux libres', error: error.message };
 }
 },

 async getTypes(params?: any) {
 try {
 const response = await apiClient.get('/rendez-vous/types/', { params });
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur types rdv', error: error.message };
 }
 },

 async getStatuts(params?: any) {
 try {
 const response = await apiClient.get('/rendez-vous/statuts/', { params });
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur statuts rdv', error: error.message };
 }
 },

 async getStats(params?: any) {
 try {
 const response = await apiClient.get('/rendez-vous/statistiques/', { params });
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur statistiques rdv', error: error.message };
 }
 }
 },

 // ==================== CONFIGURATION ====================
 config: {
 // Sauvegarder la configuration de l'hôpital
 async saveConfig(configData: any) {
 try {
 const response = await apiClient.post('/tenants/parametres/', configData)
 return {
 success: true,
 data: response.data,
 message: 'Configuration sauvegardée avec succès'
 }
 } catch (error: any) {
 console.error(' Erreur sauvegarde configuration:', error)
 return {
 success: false,
 message: error.response?.data?.detail || 'Erreur lors de la sauvegarde de la configuration',
 error: error.message
 }
 }
 },

 // Récupérer la configuration de l'hôpital
 async getConfig() {
 try {
 const response = await apiClient.get('/tenants/parametres/')
 return {
 success: true,
 data: response.data,
 message: 'Configuration récupérée avec succès'
 }
 } catch (error: any) {
 console.error(' Erreur récupération configuration:', error)
 return {
 success: false,
 message: error.response?.data?.detail || 'Erreur lors de la récupération de la configuration',
 error: error.message
 }
 }
 }
 },

 // ==================== TENANTS (Hôpitaux) ====================
 tenants: {
 async getAll(params?: any) {
 try {
 const response = await apiClient.get('/tenants/tenants/', { params });
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur récupération tenants', error: error.message };
 }
 },
 async getById(id: number) {
 try {
 const response = await apiClient.get(`/tenants/tenants/${id}/`);
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur récupération tenant', error: error.message };
 }
 },
 async create(data: any) {
 try {
 const response = await apiClient.post('/tenants/tenants/', data);
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur création tenant', error: error.message };
 }
 },
 async update(id: number, data: any) {
 try {
 const response = await apiClient.patch(`/tenants/tenants/${id}/`, data);
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur modification tenant', error: error.message };
 }
 },
 async delete(id: number) {
 try {
 await apiClient.delete(`/tenants/tenants/${id}/`);
 return { success: true };
 } catch (error: any) {
 return { success: false, message: 'Erreur suppression tenant', error: error.message };
 }
 },
 async getStatistiques(id: number) {
 try {
 const response = await apiClient.get(`/tenants/tenants/${id}/statistiques/`);
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur statistiques tenant', error: error.message };
 }
 },
 async verifierDocuments(id: number, data: { statut_verification: string; notes?: string }) {
 try {
 const response = await apiClient.patch(`/tenants/tenants/${id}/verifier_documents/`, data);
 return { success: true, data: response.data };
 } catch (error: any) {
 return { success: false, message: 'Erreur vérification documents', error: error.message };
 }
 }
 }
}

export default hospitalApi;
