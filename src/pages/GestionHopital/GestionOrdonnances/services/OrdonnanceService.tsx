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
  
  patient_nom?: string;
  medecin_nom?: string;
}

export interface OrdonnanceFormData {
  ordonnance: Omit<Ordonnance, 'ordonnance_id' | 'tenant_id' | 'created_at' | 'updated_at'>;
}

export class OrdonnanceService {
  private static instance: OrdonnanceService;
  private _patients: Patient[] = [];
  private _medecins: Medecin[] = [];
  private _consultations: Consultation[] = [];

  private constructor() {}

  public static getInstance(): OrdonnanceService {
    if (!OrdonnanceService.instance) {
      OrdonnanceService.instance = new OrdonnanceService();
    }
    return OrdonnanceService.instance;
  }

  private findField(obj: any, targetField: string | string[]): any {
    if (!obj || typeof obj !== 'object') return null;
    
    if (Array.isArray(targetField)) {
        for (const field of targetField) {
            const found = this.findField(obj, field);
            if (found !== undefined && found !== null) return found;
        }
        return null;
    }

    if (obj[targetField] !== undefined) return obj[targetField];

    const restrictedKeys = ['hopital', 'user', 'tenant'];
    for (const key in obj) {
      if (typeof obj[key] === 'object' && !restrictedKeys.includes(key)) {
        const found = this.findField(obj[key], targetField);
        if (found !== undefined && found !== null) return found;
      }
    }
    return null;
  }

  public normaliserOrdonnance(data: any): Ordonnance {
    if (!data) return {} as Ordonnance;
    const find = (f: string | string[]) => this.findField(data, f);
    
    const fields = data.fields || data;
    const patient = data.patient || fields.patient || {};
    const medecin = data.medecin || fields.medecin || {};
    
    const patientId = typeof patient === 'object' ? (patient.id || patient.patient_id) : (fields.patient_id || fields.patient || data.patient);
    const medecinId = typeof medecin === 'object' ? (medecin.id || medecin.medecin_id) : (fields.medecin_id || fields.medecin || data.medecin);
    const consultationId = typeof data.consultation === 'object' ? data.consultation?.id : (fields.consultation_id || fields.consultation || data.consultation);

    const dateOrd = find(['date_ordonnance', 'date', 'created_at', 'cree_le']);

    const pNom = (typeof patient === 'object' && patient) 
      ? `${patient.prenom || ''} ${patient.nom || ''}`.trim() || patient.nom_complet 
      : (fields.patient_nom || fields.patient_nom_complet || null);
    const mNom = (typeof medecin === 'object' && medecin) 
      ? `Dr. ${medecin.prenom || ''} ${medecin.nom || ''}`.trim() || medecin.nom_complet 
      : (fields.medecin_nom || fields.medecin_nom_complet || null);

    return {
      ...fields,
      ordonnance_id: Number(data.ordonnance_id || data.id || data.pk || 0),
      tenant_id: Number(data.tenant_id || data.tenant || data.hopital || 0),
      consultation_id: Number(consultationId || 0),
      patient_id: Number(patientId) || 0,
      medecin_id: Number(medecinId) || 0,
      date_ordonnance: dateOrd || fields.date_ordonnance || '',
      recommandations: fields.recommandations || fields.notes || null,
      validite: fields.validite || fields.duree_validite || null,
      prescriptions: fields.prescriptions || data.prescriptions || [],
      created_at: fields.created_at || fields.cree_le || '',
      updated_at: fields.updated_at || fields.modifie_le || '',
      patient_nom: pNom,
      medecin_nom: mNom,
    };
  }

  async creerOrdonnance(formData: OrdonnanceFormData, _tenantId: number): Promise<{ success: boolean; data?: Ordonnance; errors?: string[] }> {
    try {
      const { prescriptions, consultation_id, patient_id, medecin_id, ...rest } = formData.ordonnance;
      
      // Create ordonnance without nested prescriptions (backend doesn't accept them nested)
      const ordonnancePayload: any = {
        ...rest,
        consultation: consultation_id,
        patient: patient_id,
        medecin: medecin_id,
      };
      // Remove keys with empty/undefined values to avoid backend validation errors
      if (!ordonnancePayload.recommandations) delete ordonnancePayload.recommandations;
      if (!ordonnancePayload.validite) delete ordonnancePayload.validite;

      console.log('[OrdonnanceService] creerOrdonnance payload:', ordonnancePayload);
      const response = await hospitalApi.ordonnances.create(ordonnancePayload);
      
      if (!response.success) {
        console.error('[OrdonnanceService] Erreur ordonnance:', (response as any).error);
        return { success: false, errors: [(response as any).error ? JSON.stringify((response as any).error) : response.message || "Erreur lors de la création"] };
      }

      const createdOrdonnance = this.normaliserOrdonnance(response.data);
      const ordonnanceId = createdOrdonnance.ordonnance_id;

      // Create each prescription separately if there are any
      if (prescriptions && prescriptions.length > 0 && ordonnanceId) {
        for (const presc of prescriptions) {
          const { id: _id, ...prescData } = presc as any;
          const prescPayload = {
            ...prescData,
            ordonnance: ordonnanceId,
          };
          try {
            await hospitalApi.prescriptions.create(prescPayload);
          } catch (e) {
            console.warn('[OrdonnanceService] Erreur création prescription:', e);
          }
        }
        // Re-fetch ordonnance to get updated prescriptions
        const updated = await this.obtenirOrdonnance(ordonnanceId);
        if (updated) return { success: true, data: updated };
      }

      return { success: true, data: createdOrdonnance };
    } catch (error: any) {
      return { success: false, errors: [error.message] };
    }
  }

  async obtenirOrdonnancesParTenant(_tenantId: number): Promise<Ordonnance[]> {
    try {
      const response = await hospitalApi.ordonnances.getAll({ page_size: 1000 } as any);
      if (response.success && response.data) {
        let results: any[] = [];
        const rawData = response.data;
        if (rawData.results && Array.isArray(rawData.results)) results = rawData.results;
        else if (rawData.data?.results && Array.isArray(rawData.data.results)) results = rawData.data.results;
        else if (Array.isArray(rawData.data)) results = rawData.data;
        else if (Array.isArray(rawData)) results = rawData;

        return results.map(o => this.normaliserOrdonnance(o)).sort((a, b) => {
          const dateA = new Date(a.date_ordonnance).getTime();
          const dateB = new Date(b.date_ordonnance).getTime();
          return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
        });
      }
    } catch (e) { console.error('Error fetching ordonnances:', e); }
    return [];
  }

  async obtenirOrdonnance(ordonnanceId: number): Promise<Ordonnance | null> {
    const response = await hospitalApi.ordonnances.getById(ordonnanceId);
    if (response.success && response.data) {
      return this.normaliserOrdonnance(response.data);
    }
    return null;
  }

  async modifierOrdonnance(ordonnanceId: number, formData: OrdonnanceFormData): Promise<{ success: boolean; errors?: string[] }> {
    try {
      const { prescriptions: _prescriptions, consultation_id, patient_id, medecin_id, ...rest } = formData.ordonnance;
      const payload: any = {
        ...rest,
        consultation: consultation_id,
        patient: patient_id,
        medecin: medecin_id,
      };
      if (!payload.recommandations) delete payload.recommandations;
      const response = await hospitalApi.ordonnances.update(ordonnanceId, payload);
      return response.success ? { success: true } : { success: false, errors: [(response as any).error ? JSON.stringify((response as any).error) : response.message || "Erreur modification"] };
    } catch (error: any) {
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

  obtenirPatients(): Patient[] { return this._patients; }
  obtenirMedecins(): Medecin[] { return this._medecins; }
  obtenirConsultations(): Consultation[] { return this._consultations; }

  obtenirNomPatient(id?: number): string {
    if (!id) return "Non spécifié";
    const p = this._patients.find(p => p.patient_id === id);
    return p ? `${p.prenom} ${p.nom}` : `Patient #${id}`;
  }

  obtenirNomMedecin(id?: number): string {
    if (!id) return "Non spécifié";
    const m = this._medecins.find(m => m.medecin_id === id);
    return m ? `Dr. ${m.prenom} ${m.nom}` : `Dr. #${id}`;
  }

  obtenirConsultationInfo(id?: number): Consultation | undefined {
    if (!id) return undefined;
    return this._consultations.find(c => c.consultation_id === id);
  }
}

export const ordonnanceService = OrdonnanceService.getInstance();