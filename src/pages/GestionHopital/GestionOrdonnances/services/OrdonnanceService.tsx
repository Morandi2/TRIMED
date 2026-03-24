/* eslint-disable @typescript-eslint/no-explicit-any */
import hospitalApi from '../../../../api/hospitalApi';
import { patientService } from '../../GestionPatients/services/PatientService';
import { medecinService } from '../../GestionMedecins/services/MedecinService';
import { consultationService } from '../../GestionConsultations/services/ConsultationService';

export interface Patient {
  patient_id: number;
  nom: string;
  prenom: string;
  sexe: 'M' | 'F' | 'Autre';
  date_naissance?: string;
  telephone?: string;
  adresse?: string;
  numero_identification?: string;
}

export interface Medecin {
  medecin_id: number;
  nom: string;
  prenom: string;
  specialite_principale_id?: number;
}

export interface Consultation {
  consultation_id: number;
  tenant_id: number;
  patient_id: number;
  medecin_id: number;
  date_consultation: string;
  motif: string;
}

export interface Prescription {
  id: number;
  medicament: string;
  dosage: string;
  duree: string;
  instructions: string;
}

export interface Ordonnance {
  ordonnance_id: number;
  tenant_id: number;
  consultation_id: number;
  patient_id: number;
  medecin_id: number;
  date_ordonnance: string;
  recommandations?: string;
  validite: string;
  prescriptions: Prescription[];
  created_at: string;
  updated_at: string;
  
  // Extra fields from API
  patient_nom?: string;
  patient_prenom?: string;
  medecin_nom?: string;
  medecin_prenom?: string;
}

export interface OrdonnanceFormData {
  ordonnance: Omit<Ordonnance, 'ordonnance_id' | 'tenant_id' | 'created_at' | 'updated_at'>;
}

// Map types from API to our interface if needed
const mapOrdonnance = (data: any): Ordonnance => ({
  ordonnance_id: data.ordonnance_id,
  tenant_id: data.tenant_id || data.tenant,
  consultation_id: data.consultation_id || data.consultation,
  patient_id: data.patient_id || data.patient,
  medecin_id: data.medecin_id || data.medecin,
  date_ordonnance: data.date_ordonnance,
  recommandations: data.recommandations,
  validite: data.validite,
  prescriptions: data.prescriptions || [],
  created_at: data.created_at,
  updated_at: data.updated_at,
  patient_nom: data.patient_nom,
  patient_prenom: data.patient_prenom,
  medecin_nom: data.medecin_nom,
  medecin_prenom: data.medecin_prenom
});

export class OrdonnanceService {
  private _patients: Patient[] = [];
  private _medecins: Medecin[] = [];
  private _consultations: Consultation[] = [];

  constructor() {}

  async creerOrdonnance(formData: OrdonnanceFormData, tenantId: number): Promise<{ success: boolean; data?: Ordonnance; errors?: string[] }> {
    try {
      const payload = {
        ...formData.ordonnance,
        tenant: tenantId,
        consultation: formData.ordonnance.consultation_id,
        patient: formData.ordonnance.patient_id,
        medecin: formData.ordonnance.medecin_id
      };
      
      const response = await hospitalApi.ordonnances.create(payload);
      
      if (response.success) {
        return { success: true, data: mapOrdonnance(response.data) };
      } else {
        return { success: false, errors: [response.message || "Erreur lors de la création"] };
      }
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'ordonnance:', error);
      return { success: false, errors: [error.message] };
    }
  }

  async obtenirToutesOrdonnances(tenantId: number): Promise<any[]> {
    const response = await hospitalApi.ordonnances.getAll();
    if (response.success && response.data) {
      let rawData = response.data;
      if (rawData.results && Array.isArray(rawData.results)) {
        rawData = rawData.results;
      } else if (rawData.data && Array.isArray(rawData.data)) {
        rawData = rawData.data;
      }
      return Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
    }
    return [];
  }

  async obtenirOrdonnancesParTenant(tenantId: number): Promise<Ordonnance[]> {
    const response = await hospitalApi.ordonnances.getAll({ tenant: tenantId });
    if (response.success) {
      const data = response.data.results || response.data;
      return Array.isArray(data) ? data.map(mapOrdonnance) : [];
    }
    return [];
  }

  async obtenirOrdonnance(ordonnanceId: number): Promise<Ordonnance | null> {
    const response = await hospitalApi.ordonnances.getById(ordonnanceId);
    if (response.success) {
      return mapOrdonnance(response.data);
    }
    return null;
  }

  async modifierOrdonnance(ordonnanceId: number, formData: OrdonnanceFormData): Promise<{ success: boolean; errors?: string[] }> {
    try {
      const payload = {
        ...formData.ordonnance,
        consultation: formData.ordonnance.consultation_id,
        patient: formData.ordonnance.patient_id,
        medecin: formData.ordonnance.medecin_id
      };
      
      const response = await hospitalApi.ordonnances.update(ordonnanceId, payload);
      
      if (response.success) {
        return { success: true };
      } else {
        return { success: false, errors: [response.message || "Erreur lors de la modification"] };
      }
    } catch (error: any) {
      console.error('Erreur lors de la modification de l\'ordonnance:', error);
      return { success: false, errors: [error.message] };
    }
  }

  async supprimerOrdonnance(ordonnanceId: number): Promise<boolean> {
    const response = await hospitalApi.ordonnances.delete(ordonnanceId);
    return response.success;
  }

  async loadMetadata(tenantId: number) {
    const [patients, medecins, consultations] = await Promise.all([
      patientService.obtenirPatientsParHopital(tenantId),
      medecinService.obtenirMedecinsParHopital(tenantId),
      consultationService.obtenirConsultationsParTenant(tenantId)
    ]);

    this._patients = patients;
    this._medecins = medecins;
    this._consultations = consultations;
  }

  obtenirPatients(): Patient[] {
    return this._patients;
  }

  obtenirMedecins(): Medecin[] {
    return this._medecins;
  }

  obtenirConsultations(): Consultation[] {
    return this._consultations;
  }

  obtenirNomPatient(patientId?: number): string {
    if (!patientId) return "Non spécifié";
    const patient = this._patients.find(p => p.patient_id === patientId);
    return patient ? `${patient.prenom} ${patient.nom}` : `Patient #${patientId}`;
  }

  obtenirNomMedecin(medecinId?: number): string {
    if (!medecinId) return "Non spécifié";
    const medecin = this._medecins.find(m => m.medecin_id === medecinId);
    return medecin ? `Dr. ${medecin.prenom} ${medecin.nom}` : `Dr. #${medecinId}`;
  }

  obtenirConsultationInfo(consultationId?: number): string {
    if (!consultationId) return "Non spécifiée";
    const consultation = this._consultations.find(c => c.consultation_id === consultationId);
    if (!consultation) return `Consultation #${consultationId}`;
    
    const patientNom = this.obtenirNomPatient(consultation.patient_id);
    const date = new Date(consultation.date_consultation).toLocaleDateString('fr-FR');
    return `${patientNom} - ${date}`;
  }
}

export const ordonnanceService = new OrdonnanceService();