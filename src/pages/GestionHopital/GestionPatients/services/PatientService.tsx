/* eslint-disable @typescript-eslint/no-explicit-any */
import hospitalApi from '../../../../api/hospitalApi';

// Re-exporting interfaces for compatibility with components
export interface Patient {
  patient_id: number;
  hopital_id: number;
  nom: string;
  prenom: string;
  date_naissance: string;
  sexe: 'M' | 'F' | 'Autre';
  numero_dossier_medical: string;
  numero_identification_nationale?: string;
  telephone?: string;
  email?: string;
  groupe_sanguin?: string;
  cree_le: string;
  modifie_le: string;
}

export interface Hopital {
  tenant_id: number;
  nom: string;
  adresse: string;
  telephone: string;
}

export interface PatientFormData {
  patient: any;
  adresse: any;
  contacts: any[];
  assurances: any[];
  allergies: any[];
  antecedents: any[];
}

export const patientService = {
  // Obtenir tous les patients d'un hôpital
  obtenirPatientsParHopital: async (hopitalId: number) => {
    const response = await hospitalApi.patients.getAll({ hopital_id: hopitalId } as any);
    if (response.success && response.data) {
      let rawData = response.data;
      // Support results (DRF pagination), data (Custom wrap), or the array itself
      // Handle possible deep nesting: response.data.results, response.data.data.results, response.data.data
      if (rawData.data && typeof rawData.data === 'object') {
        if (rawData.data.results && Array.isArray(rawData.data.results)) {
          rawData = rawData.data.results;
        } else if (rawData.data.data && Array.isArray(rawData.data.data)) {
           rawData = rawData.data.data;
        } else if (Array.isArray(rawData.data)) {
          rawData = rawData.data;
        }
      } else if (rawData.results && Array.isArray(rawData.results)) {
        rawData = rawData.results;
      } else if (rawData.data && Array.isArray(rawData.data)) {
        rawData = rawData.data;
      }

      const patients = Array.isArray(rawData) ? rawData : (rawData && typeof rawData === 'object' && (rawData.id || rawData.patient_id) ? [rawData] : []);
      
      return patients.map((p: any) => ({
        ...p, // PRESERVE ALL ORIGINAL FIELDS
        patient_id: p.id || p.patient_id || 0,
        nom: p.nom || p.last_name || p.nom || '',
        prenom: p.prenom || p.first_name || p.prenom || '',
        sexe: p.sexe || p.gender || p.sexe || '',
        date_naissance: p.date_naissance || p.birth_date || p.date_naissance || '',
        telephone: p.telephone || p.phone || p.telephone || '',
        email: p.email || '',
        numero_dossier_medical: p.numero_dossier_medical || p.file_number || p.numero_dossier || p.numero_dossier_medical || ''
      }));
    }
    return [];
  },

  // Obtenir le dossier complet
  obtenirPatientComplet: async (patientId: number) => {
    const response = await hospitalApi.patients.getDossierComplet(patientId);
    if (response.success) {
      const data = response.data;
      return {
        patient: data,
        adresse: data.adresses?.[0] || data.adresses_detail?.[0],
        contacts: data.contacts || data.contacts_detail || [],
        assurances: data.assurances || data.assurances_detail || [],
        allergies: data.allergies || data.allergies_detail || [],
        antecedents: data.antecedents || data.antecedents_detail || []
      };
    }
    return null;
  },

  // Créer un patient complet
  creerPatientComplet: async (formData: PatientFormData, hopitalId: number) => {
    // Générer un numéro de dossier médical s'il n'existe pas
    const numero_dossier = formData.patient.numero_dossier_medical || `PAT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    const payload = {
      ...formData.patient,
      numero_dossier_medical: numero_dossier,
      hopital: hopitalId, // Le backend attend 'hopital' pas 'hopital_id'
      // The backend PatientSerializer expects these fields for nested creation
      adresse: formData.adresse, 
      contacts: formData.contacts,
      assurances: formData.assurances,
      allergies: formData.allergies,
      antecedents: formData.antecedents
    };
    
    const response = await hospitalApi.patients.create(payload);
    return {
      success: response.success,
      data: response.data,
      errors: response.success ? undefined : [response.message]
    };
  },

  // Modifier un patient complet
  modifierPatientComplet: async (patientId: number, formData: PatientFormData) => {
    const payload = {
      ...formData.patient,
      // Le backend peut exiger le numéro de dossier même en update
      ...(formData.patient.numero_dossier_medical && { numero_dossier_medical: formData.patient.numero_dossier_medical }),
      // On inclut aussi hopital si présent dans formData, sinon le backend utilise l'existant
      adresse: formData.adresse,
      contacts: formData.contacts,
      assurances: formData.assurances,
      allergies: formData.allergies,
      antecedents: formData.antecedents
    };
    
    const response = await hospitalApi.patients.update(patientId, payload);
    return {
      success: response.success,
      data: response.data,
      errors: response.success ? undefined : [response.message]
    };
  },

  // Supprimer un patient
  supprimerPatient: async (patientId: number) => {
    const response = await hospitalApi.patients.delete(patientId);
    return response.success;
  }
};