import hospitalApi from '../../../../api/hospitalApi';
import apiClient from '../../../../api/apiConfig';
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
  patient_nom?: string;
  medecin_nom?: string;
}

export interface ConsultationFormData {
  consultation: any;
}

// Memory cache for names to avoid frequent lookups
const namesCache: { [key: string]: string } = {};

export class ConsultationService {
  private static instance: ConsultationService;
  public _patients: any[] = [];
  public _medecins: any[] = [];

  private constructor() {}

  public static getInstance(): ConsultationService {
    if (!ConsultationService.instance) {
      ConsultationService.instance = new ConsultationService();
    }
    return ConsultationService.instance;
  }

  public normaliserConsultation(c: any) {
    if (!c) return null;

    // The backend returns: id/consultation_id, patient (FK int or object), patient_id (read-only),
    // medecin (FK int or object), medecin_id (read-only), rendez_vous, date_consultation,
    // motif, diagnostic_principal, notes, created_at, updated_at
    const id = c.consultation_id || c.id || c.pk || 0;

    // Patient
    const pId = c.patient_id ?? (typeof c.patient === 'number' ? c.patient : (c.patient?.id ?? c.patient?.patient_id));
    let pNom = c.patient_nom ?? c.patient_name ?? null;
    if (!pNom && c.patient && typeof c.patient === 'object') {
      pNom = `${c.patient.prenom || ''} ${c.patient.nom || ''}`.trim() || c.patient.nom_complet || null;
    }

    // Médecin
    const mId = c.medecin_id ?? (typeof c.medecin === 'number' ? c.medecin : (c.medecin?.id ?? c.medecin?.medecin_id));
    let mNom = c.medecin_nom ?? c.medecin_name ?? null;
    if (!mNom && c.medecin && typeof c.medecin === 'object') {
      mNom = `Dr. ${c.medecin.prenom || ''} ${c.medecin.nom || ''}`.trim() || c.medecin.nom_complet || null;
    }

    // Rendez-vous
    const rdvId = typeof c.rendez_vous === 'object' ? c.rendez_vous?.id : (c.rendez_vous_id ?? c.rendez_vous);

    return {
      consultation_id: Number(id),
      tenant_id: Number(c.tenant_id || c.tenant || c.hopital || 0),
      patient_id: Number(pId) || 0,
      medecin_id: Number(mId) || 0,
      rendez_vous_id: rdvId ? Number(rdvId) : undefined,
      date_consultation: c.date_consultation || '',
      motif: c.motif || '',
      diagnostic_principal: c.diagnostic_principal || '',
      notes: c.notes || '',
      created_at: c.created_at || c.cree_le || '',
      updated_at: c.updated_at || '',
      cree_le: c.created_at || c.cree_le || '',
      patient_nom: pNom,
      medecin_nom: mNom,
    };
  }

  private consultationsCache: { data: any[], tenantId: number, fetchedAt: number } | null = null;
  private CACHE_TTL = 30 * 60 * 1000;

  // Obtenir toutes les consultations (toutes les pages)
  public async obtenirConsultationsParTenant(tenantId: number, signal?: AbortSignal) {
    if (this.consultationsCache && this.consultationsCache.tenantId === tenantId) {
      if (Date.now() - this.consultationsCache.fetchedAt < this.CACHE_TTL) {
        return this.consultationsCache.data;
      }
    }

    try {
      const response = await hospitalApi.consultations.getAll({ ordering: '-date_creation', page_size: 1000 } as any, { signal });
      if (!response.success || !response.data) {
        if (this.consultationsCache && this.consultationsCache.tenantId === tenantId) {
          return this.consultationsCache.data;
        }
        throw new Error((response as any).message || 'Erreur lors du chargement des consultations');
      }

      const rawData = response.data;
      let results: any[] = [];
      let nextUrl: string | null = null;

      if (rawData.results && Array.isArray(rawData.results)) {
        results = rawData.results; nextUrl = rawData.next || null;
      } else if (rawData.data?.results && Array.isArray(rawData.data.results)) {
        results = rawData.data.results; nextUrl = rawData.data.next || null;
      } else if (Array.isArray(rawData.data)) {
        results = rawData.data;
      } else if (Array.isArray(rawData)) {
        results = rawData;
      } else if (rawData) {
        results = [rawData];
      }

      while (nextUrl) {
        try {
          const next = await apiClient.get(nextUrl, { signal });
          if (next.data.results && Array.isArray(next.data.results)) {
            results = [...results, ...next.data.results];
            nextUrl = next.data.next || null;
          } else { nextUrl = null; }
        } catch { nextUrl = null; }
      }

      const normalized = results
        .map(c => this.normaliserConsultation(c))
        .filter((c): c is NonNullable<typeof c> => c !== null)
        .sort((a: any, b: any) => {
          const dA = a.cree_le ? new Date(a.cree_le).getTime() : 0;
          const dB = b.cree_le ? new Date(b.cree_le).getTime() : 0;
          const valA = !isNaN(dA) && dA > 0 ? dA : 0;
          const valB = !isNaN(dB) && dB > 0 ? dB : 0;
          
          if (valA === valB) {
            return (b.consultation_id || 0) - (a.consultation_id || 0);
          }
          return valB - valA;
        });

      this.consultationsCache = {
        data: normalized,
        tenantId,
        fetchedAt: Date.now()
      };

      return normalized;
    } catch (error) {
      if (this.consultationsCache && this.consultationsCache.tenantId === tenantId) {
        return this.consultationsCache.data;
      }
      throw error;
    }
  }

  public invalidateCache() {
    this.consultationsCache = null;
  }

  public async obtenirConsultation(id: number) {
    const response = await hospitalApi.consultations.getById(id);
    if (response.success && response.data) {
      return this.normaliserConsultation(response.data);
    }
    return null;
  }

  // Créer une consultation
  public async creerConsultation(formData: ConsultationFormData, tenantId: number) {
    // Only send fields the API accepts per swagger schema
    const c = formData.consultation;
    const payload: any = {
      patient: c.patient_id,
      medecin: c.medecin_id,
      date_consultation: c.date_consultation,
      motif: c.motif,
    };
    if (c.diagnostic_principal) payload.diagnostic_principal = c.diagnostic_principal;
    if (c.notes) payload.notes = c.notes;
    if (c.rendez_vous_id) payload.rendez_vous = c.rendez_vous_id;

    const response = await hospitalApi.consultations.create(payload) as any;

    let newConsultation = undefined;
    if (response.success && response.data) {
      newConsultation = this.normaliserConsultation(response.data);
      this.invalidateCache();
      
      // Optimistic update
      if (this.consultationsCache && this.consultationsCache.tenantId === tenantId) {
        this.consultationsCache.data.unshift(newConsultation);
      }
    }

    return {
      success: response.success,
      data: newConsultation,
      errors: response.success ? undefined : [(response as any).message || (response as any).error || "Erreur inconnue"]
    };
  }

  // Modifier une consultation
  public async modifierConsultation(consultationId: number, formData: ConsultationFormData, tenantId: number) {
    const c = formData.consultation;
    const payload: any = {
      patient: c.patient_id,
      medecin: c.medecin_id,
      date_consultation: c.date_consultation,
      motif: c.motif,
    };
    if (c.diagnostic_principal !== undefined) payload.diagnostic_principal = c.diagnostic_principal;
    if (c.notes !== undefined) payload.notes = c.notes;
    if (c.rendez_vous_id) payload.rendez_vous = c.rendez_vous_id;

    const response = await (hospitalApi.consultations as any).update(consultationId, payload);
    
    let updatedConsultation = undefined;
    if (response.success && response.data) {
      updatedConsultation = this.normaliserConsultation(response.data);
      this.invalidateCache();

      // Optimistic update
      if (this.consultationsCache && this.consultationsCache.tenantId === tenantId) {
        const index = this.consultationsCache.data.findIndex(item => item.consultation_id === consultationId);
        if (index !== -1) {
          this.consultationsCache.data[index] = updatedConsultation;
        }
      }
    }

    return {
      success: response.success,
      data: updatedConsultation,
      errors: response.success ? undefined : [(response as any).message || "Erreur inconnue"]
    };
  }

  // Supprimer une consultation
  public async supprimerConsultation(consultationId: number) {
    const response = await (hospitalApi.consultations as any).delete(consultationId);
    if (response.success) {
      this.invalidateCache();
      if (this.consultationsCache) {
        this.consultationsCache.data = this.consultationsCache.data.filter(c => c.consultation_id !== consultationId);
      }
    }
    return response.success;
  }

  // Créer une ordonnance pour une consultation
  public async creerOrdonnance(consultationId: number, ordonnanceData: any) {
    const response = await hospitalApi.consultations.creerOrdonnance(consultationId, ordonnanceData);
    return {
      success: response.success,
      data: response.data,
      errors: response.success ? undefined : [(response as any).message || "Erreur inconnue"]
    };
  }

  // Prescrire un examen
  public async prescrireExamen(consultationId: number, examenData: any) {
    const response = await hospitalApi.consultations.prescrireExamen(consultationId, examenData);
    return {
      success: response.success,
      data: response.data,
      errors: response.success ? undefined : [(response as any).message || "Erreur inconnue"]
    };
  }

  // Obtenir les ordonnances
  public async obtenirOrdonnances(params?: any) {
    const response = await hospitalApi.ordonnances.getAll(params);
    if (response.success) {
      return response.data.results || response.data;
    }
    return [];
  }

  // Obtenir les examens
  public async obtenirExamens(params?: any) {
    const response = await hospitalApi.examens.getAll(params);
    if (response.success) {
      return response.data.results || response.data;
    }
    return [];
  }

  // Mettre à jour le résultat d'un examen
  public async ajouterResultatExamen(examenId: number, data: { resultat: string; notes?: string }) {
    const response = await hospitalApi.examens.updateResultat(examenId, data);
    return {
      success: response.success,
      message: response.message,
      errors: response.success ? undefined : [(response as any).message || "Erreur inconnue"]
    };
  }

  // Helpers pour les noms
  public obtenirNomPatient(patientId: number) {
    return namesCache[`patient_${patientId}`] || `Patient #${patientId}`;
  }

  public obtenirNomMedecin(medecinId: number) {
    return namesCache[`medecin_${medecinId}`] || `Dr. #${medecinId}`;
  }

  // Méthode pour charger et mettre en cache les noms
  public async loadCache(tenantId: number) {
    const [patients, medecins] = await Promise.all([
      patientService.obtenirPatientsParHopital(tenantId),
      medecinService.obtenirMedecinsParHopital(tenantId)
    ]);

    patients.forEach((p: any) => {
      namesCache[`patient_${p.patient_id}`] = `${p.prenom} ${p.nom}`.trim();
    });
    this._patients = patients;

    medecins.forEach((m: any) => {
      namesCache[`medecin_${m.medecin_id}`] = `Dr. ${m.prenom} ${m.nom}`.trim();
    });
    this._medecins = medecins;
  }

  public obtenirPatients() {
    return this._patients;
  }

  public obtenirMedecins() {
    return this._medecins;
  }
}

export const consultationService = ConsultationService.getInstance();
