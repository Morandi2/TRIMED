import hospitalApi from '../../../../api/hospitalApi';
import { collectAllPages } from '../../../../api/paginationHelper';

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

export interface PatientFormData {
  patient: any;
  adresse: any;
  contacts: any[];
  assurances: any[];
  allergies: any[];
  antecedents: any[];
}

interface PatientsCache {
  data: Patient[];
  hopitalId: number;
  fetchedAt: number;
}

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export class PatientService {
  private static instance: PatientService;
  private patientsCache: PatientsCache | null = null;

  private constructor() {
    this.loadCacheFromStorage();
  }

  private loadCacheFromStorage() {
    try {
      const stored = localStorage.getItem('patients_cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() - parsed.fetchedAt < CACHE_TTL_MS) {
          this.patientsCache = parsed;
        } else {
          localStorage.removeItem('patients_cache');
        }
      }
    } catch (e) {
      console.error('Erreur lecture localStorage patients', e);
    }
  }

  private saveCacheToStorage() {
    try {
      if (this.patientsCache) {
        localStorage.setItem('patients_cache', JSON.stringify(this.patientsCache));
      }
    } catch (e) {
      console.error('Erreur ecriture localStorage patients', e);
    }
  }

  private isPatientsValid(hopitalId: number): boolean {
    if (!this.patientsCache) return false;
    if (this.patientsCache.hopitalId !== hopitalId) return false;
    return Date.now() - this.patientsCache.fetchedAt < CACHE_TTL_MS;
  }

  public invalidateCache(): void {
    this.patientsCache = null;
    try {
      localStorage.removeItem('patients_cache');
    } catch (e) {}
  }

  public static getInstance(): PatientService {
    if (!PatientService.instance) {
      PatientService.instance = new PatientService();
    }
    return PatientService.instance;
  }

  /**
   * Récupère la première valeur non vide parmi les alias de champ fournis,
   * en ne lisant que les clés directes de l'objet pour éviter de capter
   * accidentellement la valeur d'un objet relationnel imbriqué.
   */
  private findField(obj: any, targetField: string | string[]): any {
    if (!obj || typeof obj !== 'object') return null;

    const fields = Array.isArray(targetField) ? targetField : [targetField];
    for (const field of fields) {
      const value = obj[field];
      if (value !== undefined && value !== null && value !== '') return value;
    }
    return null;
  }

  public normaliserPatient(p: any): Patient {
    if (!p) return {} as Patient;
    const find = (field: string | string[]) => this.findField(p, field);

    const patId = p.patient_id || p.id || p.pk || find(['patient_id', 'id_patient', 'id', 'uid']) || 0;
    
    return {
      patient_id: Number(patId),
      hopital_id: p.hopital_id || find('hopital') || 0,
      nom: find(['nom', 'last_name', 'family_name']) || p.nom || '',
      prenom: find(['prenom', 'first_name', 'given_name']) || p.prenom || '',
      sexe: this.normaliserSexe(p.sexe || find(['gender', 'sex']) || 'M'),
      age: p.age || null,
      date_naissance: this.formaterDatePourInput(find(['date_naissance', 'birth_date', 'dob']) || ''),
      telephone: find(['telephone', 'phone', 'phone_number']) || '',
      email: find(['email', 'mail']) || '',
      numero_dossier_medical: find(['numero_dossier_medical', 'file_number', 'patient_record']) || '',
      numero_identification_nationale: find(['numero_identification_nationale', 'nin', 'national_id']) || '',
      groupe_sanguin: find(['groupe_sanguin', 'blood_group', 'blood_type']) || '',
      cree_le: find(['cree_le', 'created_at', 'date_creation', 'timestamp']) || '',
      modifie_le: find(['modifie_le', 'updated_at', 'last_modified']) || '',
    };
  }

  private formaterDatePourInput(dateStr: string): string {
    if (!dateStr) return '';
    if (dateStr.includes('T')) return dateStr.split('T')[0];
    return dateStr;
  }

  private normaliserSexe(val: string): 'M' | 'F' | 'Autre' {
    if (!val) return 'M';
    const s = val.trim().toLowerCase();
    if (s === 'm' || s === 'male' || s === 'masculin' || s === 'homme') return 'M';
    if (s === 'f' || s === 'female' || s === 'feminin' || s === 'féminin' || s === 'femme') return 'F';
    if (s === 'autre' || s === 'other') return 'Autre';
    return 'M';
  }

  private nettoyerChampsUniques(payload: any): any {
    const fields = ['numero_identification_nationale', 'email', 'telephone'];
    fields.forEach(f => {
      if (payload[f] === '') delete payload[f];
    });
    return payload;
  }

  async obtenirPatientsParHopital(hopitalId: number, signal?: AbortSignal): Promise<Patient[]> {
    if (this.isPatientsValid(hopitalId)) {
      return this.patientsCache!.data;
    }

    try {
      const response = await hospitalApi.patients.getAll({
        hopital_id: hopitalId,
        ordering: '-date_creation',
        page_size: 1000,
      } as any, { signal });

      if (!response.success || !response.data) {
        // Repli sur le cache périmé si disponible, sinon on signale l'échec.
        if (this.patientsCache?.hopitalId === hopitalId && Array.isArray(this.patientsCache.data)) {
          return this.patientsCache.data;
        }
        throw new Error((response as any).message || 'Erreur lors du chargement des patients');
      }

      let results: any[] = [];
      const rawData = response.data;

      if (rawData.results && Array.isArray(rawData.results)) results = rawData.next ? await collectAllPages(rawData, signal) : rawData.results;
      else if (rawData.data?.results && Array.isArray(rawData.data.results)) results = rawData.data.results;
      else if (Array.isArray(rawData.data)) results = rawData.data;
      else if (Array.isArray(rawData)) results = rawData;

      const sorted = results
        .map(p => this.normaliserPatient(p))
        .sort((a, b) => {
          const dateA = new Date(a.cree_le).getTime();
          const dateB = new Date(b.cree_le).getTime();
          if (isNaN(dateA) || isNaN(dateB)) return (b.patient_id - a.patient_id);
          return dateB - dateA;
        });
      
      this.patientsCache = {
        data: sorted,
        hopitalId,
        fetchedAt: Date.now()
      };
      this.saveCacheToStorage();
      
      return sorted;
    } catch (e) {
      // On garde les données déjà chargées si elles existent (pas de blocage UI),
      // sinon on propage l'erreur pour que l'écran affiche un message clair.
      if (this.patientsCache?.hopitalId === hopitalId && Array.isArray(this.patientsCache.data)) {
        return this.patientsCache.data;
      }
      throw e;
    }
  }

  async obtenirPatientComplet(patientId: number) {
    const response = await hospitalApi.patients.getDossierComplet(patientId);
    if (response.success) {
      const data = response.data;
      return {
        patient: this.normaliserPatient(data),
        adresse: data.adresses?.[0] || data.adresses_detail?.[0],
        contacts: data.contacts || data.contacts_detail || [],
        assurances: data.assurances || data.assurances_detail || [],
        allergies: data.allergies || data.allergies_detail || [],
        antecedents: data.antecedents || data.antecedents_detail || []
      };
    }
    return null;
  }

  async creerPatientComplet(formData: PatientFormData, hopitalId: number) {
    const num = formData.patient.numero_dossier_medical || `PAT-${Date.now().toString().slice(-6)}`;
    let payload: any = {
      ...formData.patient,
      numero_dossier_medical: num,
      adresse: formData.adresse,
      contacts: formData.contacts,
      assurances: formData.assurances,
      allergies: formData.allergies,
      antecedents: formData.antecedents
    };
    payload = this.nettoyerChampsUniques(payload);
    if (hopitalId > 0) payload.hopital = hopitalId;

    const response: any = await hospitalApi.patients.create(payload);
    let newPatient = undefined;
    
    if (response.success && response.data) {
      newPatient = this.normaliserPatient(response.data);
      this.invalidateCache();
      
      if (this.patientsCache && Array.isArray(this.patientsCache.data)) {
        this.patientsCache.data.unshift(newPatient);
      }
    }
    
    return {
      success: response.success,
      data: newPatient,
      errors: response.success ? undefined : [response.message || "Erreur inconnue"],
      fieldErrors: response.success ? undefined : response.fieldErrors,
    };
  }

  async modifierPatientComplet(patientId: number, formData: PatientFormData) {
    const allowed = ['nom', 'prenom', 'email', 'telephone', 'date_naissance', 'sexe', 'numero_identification_nationale', 'groupe_sanguin'];
    let payload: any = {};
    allowed.forEach(f => {
      if (formData.patient[f] !== undefined) payload[f] = formData.patient[f];
    });
    payload = this.nettoyerChampsUniques(payload);

    const response: any = await hospitalApi.patients.update(patientId, payload);
    if (response.success) {
      this.invalidateCache();
    }
    return {
      success: response.success,
      data: response.success ? this.normaliserPatient(response.data) : undefined,
      errors: response.success ? undefined : [response.message || "Erreur inconnue"],
      fieldErrors: response.success ? undefined : response.fieldErrors,
    };
  }

  async supprimerPatient(patientId: number): Promise<{ success: boolean; message?: string }> {
    const response = await hospitalApi.patients.delete(patientId);
    if (response.success) {
      this.invalidateCache();
    }
    return { success: response.success, message: response.success ? undefined : response.message };
  }
}

export const patientService = PatientService.getInstance();
