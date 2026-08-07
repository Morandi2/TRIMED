import hospitalApi from '../../../../api/hospitalApi';
import { collectAllPages } from '../../../../api/paginationHelper';
import { patientService } from '../../GestionPatients/services/PatientService';
import { medecinService } from '../../GestionMedecins/services/MedecinService';

// Catégories réelles d'examen (source: OPTIONS /medical/examens/ type_examen.choices)
export type ExamenType = 'biologie' | 'imagerie' | 'ecg' | 'radiologie' | 'scanner' | 'irm' | 'echographie' | 'endoscopie' | 'autre';

export const EXAMEN_TYPES: { value: ExamenType; label: string }[] = [
  { value: 'biologie', label: 'Biologie' },
  { value: 'imagerie', label: 'Imagerie' },
  { value: 'ecg', label: 'ECG' },
  { value: 'radiologie', label: 'Radiologie' },
  { value: 'scanner', label: 'Scanner' },
  { value: 'irm', label: 'IRM' },
  { value: 'echographie', label: 'Échographie' },
  { value: 'endoscopie', label: 'Endoscopie' },
  { value: 'autre', label: 'Autre' },
];

export interface Examen {
  examen_id: number;
  patient_id: number;
  patient_nom?: string;
  consultation_id?: number;
  medecin_prescripteur_id?: number;
  medecin_nom?: string;
  nom_examen: string;
  type_examen: ExamenType | '';
  date_examen: string;
  resultat?: string;
  date_resultat?: string;
  notes?: string;
}

export interface ExamenFormData {
  patient: number;
  consultation?: number;
  medecin_prescripteur?: number;
  nom_examen: string;
  type_examen: ExamenType | '';
  date_examen: string;
}

interface ExamensCache {
  data: Examen[];
  tenantId: number;
  fetchedAt: number;
}

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export class ExamenService {
  private static instance: ExamenService;
  private examensCache: ExamensCache | null = null;
  private patientsMap = new Map<number, string>();
  private medecinsMap = new Map<number, string>();

  private constructor() {}

  public static getInstance(): ExamenService {
    if (!ExamenService.instance) {
      ExamenService.instance = new ExamenService();
    }
    return ExamenService.instance;
  }

  public invalidateCache(): void {
    this.examensCache = null;
  }

  /**
   * Précharge les patients et médecins pour résoudre les noms (id -> nom).
   * Best-effort: en cas d'échec on garde les maps existantes.
   */
  public async loadReferentiels(tenantId: number): Promise<void> {
    try {
      const [patients, medecins] = await Promise.all([
        patientService.obtenirPatientsParHopital(tenantId).catch(() => []),
        medecinService.obtenirMedecinsParHopital(tenantId).catch(() => []),
      ]);
      this.patientsMap = new Map(
        (patients || []).map((p: any) => [Number(p.patient_id), `${p.prenom || ''} ${p.nom || ''}`.trim()])
      );
      this.medecinsMap = new Map(
        (medecins || []).map((m: any) => [Number(m.medecin_id), `Dr. ${m.prenom || ''} ${m.nom || ''}`.trim()])
      );
    } catch {
      /* on garde les maps existantes */
    }
  }

  public normaliserExamen(e: any): Examen {
    const id = e.examen_id ?? e.id ?? e.pk ?? 0;

    const pId = e.patient_id ?? (typeof e.patient === 'number' ? e.patient : e.patient?.patient_id ?? e.patient?.id) ?? 0;
    let pNom = e.patient_nom ?? null;
    if (!pNom && e.patient && typeof e.patient === 'object') {
      pNom = `${e.patient.prenom || ''} ${e.patient.nom || ''}`.trim() || null;
    }
    if (!pNom) pNom = this.patientsMap.get(Number(pId)) || null;

    const mId = e.medecin_prescripteur_id
      ?? (typeof e.medecin_prescripteur === 'number' ? e.medecin_prescripteur : e.medecin_prescripteur?.medecin_id ?? e.medecin_prescripteur?.id)
      ?? 0;
    let mNom = e.medecin_nom ?? null;
    if (!mNom && e.medecin_prescripteur && typeof e.medecin_prescripteur === 'object') {
      mNom = `Dr. ${e.medecin_prescripteur.prenom || ''} ${e.medecin_prescripteur.nom || ''}`.trim() || null;
    }
    if (!mNom) mNom = this.medecinsMap.get(Number(mId)) || null;

    const cId = e.consultation_id ?? (typeof e.consultation === 'number' ? e.consultation : e.consultation?.consultation_id ?? e.consultation?.id);

    return {
      examen_id: Number(id),
      patient_id: Number(pId) || 0,
      patient_nom: pNom || undefined,
      consultation_id: cId ? Number(cId) : undefined,
      medecin_prescripteur_id: Number(mId) || undefined,
      medecin_nom: mNom || undefined,
      nom_examen: e.nom_examen || '',
      type_examen: (e.type_examen || '') as ExamenType | '',
      date_examen: e.date_examen || '',
      resultat: e.resultat || undefined,
      date_resultat: e.date_resultat || undefined,
      notes: e.notes || undefined,
    };
  }

  private isValid(tenantId: number): boolean {
    if (!this.examensCache) return false;
    if (this.examensCache.tenantId !== tenantId) return false;
    return Date.now() - this.examensCache.fetchedAt < CACHE_TTL_MS;
  }

  public async obtenirExamensParTenant(tenantId: number, signal?: AbortSignal): Promise<Examen[]> {
    if (this.isValid(tenantId)) {
      return this.examensCache!.data;
    }

    try {
      const response = await hospitalApi.examens.getAll({ ordering: '-date_examen', page_size: 1000 }, { signal });
      if (!response.success || !response.data) {
        if (this.examensCache?.tenantId === tenantId) return this.examensCache.data;
        throw new Error((response as any).message || 'Erreur lors du chargement des examens');
      }

      const rawData: any = response.data;
      let results: any[] = [];
      if (rawData.results && Array.isArray(rawData.results)) results = rawData.next ? await collectAllPages(rawData, signal) : rawData.results;
      else if (Array.isArray(rawData)) results = rawData;

      const normalized = results
        .map((e) => this.normaliserExamen(e))
        .sort((a, b) => {
          const dA = new Date(a.date_examen).getTime();
          const dB = new Date(b.date_examen).getTime();
          if (isNaN(dA) || isNaN(dB)) return b.examen_id - a.examen_id;
          return dB - dA;
        });

      this.examensCache = { data: normalized, tenantId, fetchedAt: Date.now() };
      return normalized;
    } catch (e) {
      if (this.examensCache?.tenantId === tenantId) return this.examensCache.data;
      throw e;
    }
  }

  public async prescrireExamen(formData: ExamenFormData, tenantId: number) {
    const payload: any = {
      patient: formData.patient,
      nom_examen: formData.nom_examen,
      date_examen: formData.date_examen,
      tenant: tenantId,
    };
    if (formData.type_examen) payload.type_examen = formData.type_examen;
    if (formData.consultation) payload.consultation = formData.consultation;
    if (formData.medecin_prescripteur) payload.medecin_prescripteur = formData.medecin_prescripteur;

    const response: any = await hospitalApi.examens.create(payload);
    if (response.success) this.invalidateCache();
    return {
      success: response.success,
      data: response.success ? this.normaliserExamen(response.data) : undefined,
      message: response.message,
      fieldErrors: response.success ? undefined : response.fieldErrors,
    };
  }

  public async ajouterResultat(examenId: number, resultat: string, notes?: string) {
    const response: any = await hospitalApi.examens.updateResultat(examenId, { resultat, notes });
    if (response.success) this.invalidateCache();
    return {
      success: response.success,
      message: response.message,
      fieldErrors: response.success ? undefined : response.fieldErrors,
    };
  }

  public async supprimerExamen(examenId: number): Promise<{ success: boolean; message?: string }> {
    const response = await hospitalApi.examens.delete(examenId);
    if (response.success) this.invalidateCache();
    return { success: response.success, message: response.success ? undefined : (response as any).message };
  }
}

export const examenService = ExamenService.getInstance();
