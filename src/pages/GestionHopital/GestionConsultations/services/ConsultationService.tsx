/* eslint-disable @typescript-eslint/no-explicit-any */
import hospitalApi from '../../../../api/hospitalApi';
import { patientService } from '../../GestionPatients/services/PatientService';
import { medecinService } from '../../GestionMedecins/services/MedecinService';

export interface Consultation {
  consultation_id: number;
  tenant_id: number;
  patient_id: number;
  medecin_id: number;
  rendez_vous_id?: number;
  date_consultation: string;
  motif: string;
  diagnostic_principal?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ConsultationFormData {
  consultation: any;
}

// Memory cache for names to avoid frequent lookups
const namesCache: { [key: string]: string } = {};

export const consultationService = {
  // Obtenir toutes les consultations
  obtenirConsultationsParTenant: async (tenantId: number) => {
    const response = await hospitalApi.consultations.getAll();
    if (response.success && response.data) {
      let rawData = response.data;
      if (rawData.results && Array.isArray(rawData.results)) {
        rawData = rawData.results;
      } else if (rawData.data && Array.isArray(rawData.data)) {
        rawData = rawData.data;
      }
      const arrData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
      return arrData.map((c: any) => ({
        ...c,
        consultation_id: c.consultation_id || c.id,
        patient_id: typeof c.patient === 'object' ? c.patient?.id || c.patient?.patient_id : (c.patient_id || c.patient),
        medecin_id: typeof c.medecin === 'object' ? c.medecin?.id || c.medecin?.medecin_id : (c.medecin_id || c.medecin),
        patient_nom: c.patient_nom || (typeof c.patient === 'object' ? (`${c.patient?.prenom || ''} ${c.patient?.nom || ''}`.trim() || c.patient?.nom_complet) : undefined),
        medecin_nom: c.medecin_nom || (typeof c.medecin === 'object' ? (`Dr. ${c.medecin?.prenom || ''} ${c.medecin?.nom || ''}`.trim() || c.medecin?.nom_complet) : undefined),
        tenant_id: c.tenant_id || c.tenant || c.hopital,
        rendez_vous_id: typeof c.rendez_vous === 'object' ? c.rendez_vous?.id : (c.rendez_vous_id || c.rendez_vous)
      }));
    }
    return [];
  },

  // Obtenir une consultation par ID
  obtenirConsultation: async (id: number) => {
    const response = await hospitalApi.consultations.getById(id);
    if (response.success && response.data) {
      const c = response.data;
      return {
        ...c,
        consultation_id: c.consultation_id || c.id,
        patient_id: typeof c.patient === 'object' ? c.patient?.id || c.patient?.patient_id : (c.patient_id || c.patient),
        medecin_id: typeof c.medecin === 'object' ? c.medecin?.id || c.medecin?.medecin_id : (c.medecin_id || c.medecin),
        patient_nom: c.patient_nom || (typeof c.patient === 'object' ? (`${c.patient?.prenom || ''} ${c.patient?.nom || ''}`.trim() || c.patient?.nom_complet) : undefined),
        medecin_nom: c.medecin_nom || (typeof c.medecin === 'object' ? (`Dr. ${c.medecin?.prenom || ''} ${c.medecin?.nom || ''}`.trim() || c.medecin?.nom_complet) : undefined),
        tenant_id: c.tenant_id || c.tenant || c.hopital,
        rendez_vous_id: typeof c.rendez_vous === 'object' ? c.rendez_vous?.id : (c.rendez_vous_id || c.rendez_vous)
      };
    }
    return null;
  },

  // Créer une consultation
  creerConsultation: async (formData: ConsultationFormData, tenantId: number) => {
    const payload = {
      hopital: tenantId,
      tenant_id: tenantId,
      ...formData.consultation,
      patient: formData.consultation.patient_id,
      medecin: formData.consultation.medecin_id,
      ...(formData.consultation.rendez_vous_id && { rendez_vous: formData.consultation.rendez_vous_id })
    };
    const response = await hospitalApi.consultations.create(payload as any);
    return {
      success: response.success,
      data: response.data,
      errors: response.success ? undefined : [(response as any).message || "Erreur inconnue"]
    };
  },

  // Modifier une consultation
  modifierConsultation: async (consultationId: number, formData: ConsultationFormData, tenantId: number) => {
    const payload = {
      hopital: tenantId,
      tenant_id: tenantId,
      ...formData.consultation,
      patient: formData.consultation.patient_id,
      medecin: formData.consultation.medecin_id,
      ...(formData.consultation.rendez_vous_id && { rendez_vous: formData.consultation.rendez_vous_id })
    };
    const response = await (hospitalApi.consultations as any).update(consultationId, payload);
    return {
      success: response.success,
      data: response.data,
      errors: response.success ? undefined : [(response as any).message || "Erreur inconnue"]
    };
  },

  // Supprimer une consultation
  supprimerConsultation: async (consultationId: number) => {
    const response = await (hospitalApi.consultations as any).delete(consultationId);
    return response.success;
  },

  // Créer une ordonnance pour une consultation
  creerOrdonnance: async (consultationId: number, ordonnanceData: any) => {
    const response = await hospitalApi.consultations.creerOrdonnance(consultationId, ordonnanceData);
    return {
      success: response.success,
      data: response.data,
      errors: response.success ? undefined : [(response as any).message || "Erreur inconnue"]
    };
  },

  // Prescrire un examen
  prescrireExamen: async (consultationId: number, examenData: any) => {
    const response = await hospitalApi.consultations.prescrireExamen(consultationId, examenData);
    return {
      success: response.success,
      data: response.data,
      errors: response.success ? undefined : [(response as any).message || "Erreur inconnue"]
    };
  },

  // Obtenir les ordonnances
  obtenirOrdonnances: async (params?: any) => {
    const response = await hospitalApi.ordonnances.getAll(params);
    if (response.success) {
      return response.data.results || response.data;
    }
    return [];
  },

  // Obtenir les examens
  obtenirExamens: async (params?: any) => {
    const response = await hospitalApi.examens.getAll(params);
    if (response.success) {
      return response.data.results || response.data;
    }
    return [];
  },

  // Mettre à jour le résultat d'un examen
  ajouterResultatExamen: async (examenId: number, data: { resultat: string; notes?: string }) => {
    const response = await hospitalApi.examens.updateResultat(examenId, data);
    return {
      success: response.success,
      message: response.message,
      errors: response.success ? undefined : [(response as any).message || "Erreur inconnue"]
    };
  },

  // Helpers pour les noms
  obtenirNomPatient: (patientId: number) => {
    return namesCache[`patient_${patientId}`] || `Patient #${patientId}`;
  },

  obtenirNomMedecin: (medecinId: number) => {
    return namesCache[`medecin_${medecinId}`] || `Dr. #${medecinId}`;
  },

  // Méthode pour charger et mettre en cache les noms
  loadCache: async (tenantId: number) => {
    const [patients, medecins] = await Promise.all([
      patientService.obtenirPatientsParHopital(tenantId),
      medecinService.obtenirMedecinsParHopital(tenantId)
    ]);

    patients.forEach((p: any) => {
      namesCache[`patient_${p.patient_id}`] = `${p.prenom} ${p.nom}`.trim();
    });
    (consultationService as any)._patients = patients;

    medecins.forEach((m: any) => {
      namesCache[`medecin_${m.medecin_id}`] = `Dr. ${m.prenom} ${m.nom}`.trim();
    });
    (consultationService as any)._medecins = medecins;
  },

  _patients: [] as any[],
  _medecins: [] as any[],

  obtenirPatients: () => {
    return (consultationService as any)._patients;
  },

  obtenirMedecins: () => {
    return (consultationService as any)._medecins;
  }
};
