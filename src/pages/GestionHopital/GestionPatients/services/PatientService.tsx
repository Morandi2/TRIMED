/* eslint-disable @typescript-eslint/no-explicit-any */
import hospitalApi from '../../../../api/hospitalApi';

// Re-exporting interfaces for compatibility with components
export interface Patient {
  patient_id: number;
  hopital_id: number;
  nom: string;
  prenom: string;
  date_naissance: string;
  age?: number;
  sexe: 'M' | 'F' | 'Autre';
  numero_dossier_medical: string;
  numero_identification_nationale?: string;
  telephone?: string;
  email?: string;
  groupe_sanguin?: string;
  cree_le: string;
  modifie_le: string;
  created_at?: string;
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
        nom: p.nom || p.last_name || '',
        prenom: p.prenom || p.first_name || '',
        sexe: p.sexe || p.gender || '',
        age: p.age || null, // Capture de l'âge renvoyé par le backend
        date_naissance: p.date_naissance || p.birth_date || p.dob || p.date_de_naissance || '',
        telephone: p.telephone || p.phone || '',
        email: p.email || '',
        numero_dossier_medical: p.numero_dossier_medical || p.file_number || p.numero_dossier || p.dossier_medical || '',
        cree_le: p.cree_le || p.created_at || p.date_creation || p.created || p.date_joined || p.timestamp || ''
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

    const payload: any = {
      ...formData.patient,
      numero_dossier_medical: numero_dossier,
      // The backend PatientSerializer expects these fields for nested creation
      adresse: formData.adresse, 
      contacts: formData.contacts,
      assurances: formData.assurances,
      allergies: formData.allergies,
      antecedents: formData.antecedents
    };

    // Nettoyer les champs vides qui ont une contrainte d'unicité côté backend
    // DRF/PostgreSQL considère deux strings vides ("") comme des doublons.
    const optionalUniqueFields = ['numero_identification_nationale', 'email', 'telephone'];
    optionalUniqueFields.forEach(field => {
      if (payload[field] === '') {
        delete payload[field];
      }
    });

    
    // N'envoyer l'ID de l'hôpital que s'il est valide (> 0) pour éviter "Invalid pk 0".
    // Si absent, le backend devra l'inférer de l'utilisateur connecté s'il est requis.
    if (hopitalId && hopitalId > 0) {
      payload.hopital = hopitalId;
    } else if (formData.patient.hopital) {
      payload.hopital = formData.patient.hopital;
    }
    
    const response = await hospitalApi.patients.create(payload);
    return {
      success: response.success,
      data: response.data,
      errors: response.success ? undefined : [(response as any).message || "Erreur inconnue"]
    };
  },

  // Modifier un patient complet
  modifierPatientComplet: async (patientId: number, formData: PatientFormData) => {
    // Only extract the core fields for the patient patch request, 
    // omitting nested relationships and read-only fields that cause 400 Bad Request
    const allowedFields = [
      'nom', 'prenom', 'email', 'telephone', 'date_naissance', 
      'sexe', 'numero_identification_nationale',
      'groupe_sanguin', 'statut_matrimonial', 'profession'
    ];
    
    const payload: any = {};
    for (const key of allowedFields) {
      if (formData.patient[key] !== undefined && formData.patient[key] !== null) {
        payload[key] = formData.patient[key];
      }
    }

    // Nettoyer les champs vides qui ont une contrainte d'unicité côté backend
    // DRF/PostgreSQL considère deux strings vides ("") comme des doublons.
    const optionalUniqueFields = ['numero_identification_nationale', 'email', 'telephone'];
    optionalUniqueFields.forEach(field => {
      if (payload[field] === '') {
        delete payload[field];
      }
    });
    
    // On ne renvoie PAS le numero_dossier_medical lors d'un PATCH
    // car le backend signale une erreur d'unicité (Ce numéro de dossier médical existe déjà)
    // même s'il s'agit du même patient. Le numero_dossier_medical est read-only après création.
    
    // Si hopital est spécifié, l'inclure (S'assurer que c'est un ID, pas un objet)
    const hopitalVal = formData.patient.hopital || formData.patient.hopital_id;
    if (hopitalVal) {
      payload.hopital = typeof hopitalVal === 'object' ? (hopitalVal.id || hopitalVal.tenant_id || hopitalVal.hopital_id) : hopitalVal;
    }

    // Gestion de la photo: ne l'envoyer que si c'est un nouveau fichier
    if (formData.patient.photo instanceof File) {
      payload.photo = formData.patient.photo;
    }
    // Si la photo est une URL string, on l'omet pour éviter les erreurs de validation DRF
    
    
    // For nested data like adresse, contacts, assurances, etc., the backend usually expects
    // separate requests to specific endpoints (e.g. adresses: adresses.update, etc.) on update,
    // rather than processing them in the main Patient WritableNestedModelSerializer.
    // If they are required to be kept in sync, they should be done here via separate API calls.

    const response = await hospitalApi.patients.update(patientId, payload);
    return {
      success: response.success,
      data: (response as any).data,
      errors: response.success ? undefined : [(response as any).message || "Erreur inconnue"]
    };
  },

  // Supprimer un patient
  supprimerPatient: async (patientId: number) => {
    const response = await hospitalApi.patients.delete(patientId);
    return response.success;
  }
};
