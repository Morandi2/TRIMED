/* eslint-disable @typescript-eslint/no-explicit-any */
import hospitalApi, { RendezVous, RendezVousType, RendezVousStatut } from '../../../../api/hospitalApi';
import { patientService } from '../../GestionPatients/services/PatientService';
import { medecinService } from '../../GestionMedecins/services/MedecinService';

export interface RendezVousFormData {
  patient_id: number;
  patient_nom: string;
  patient_email: string;
  patient_phone: string;
  medecin_id: number;
  medecin_nom: string;
  specialite: string;
  date_heure: string;
  type_id: number | null;
  type_nom: string;
  statut_id: number;
  statut_nom: string;
  motif: string;
  duree: number;
  salle: string;
  prix: number;
  notes: string;
  moyen_paiement?: string;
  assurance_validee: boolean;
}

export interface RendezVousStats {
  total: number;
  programme: number;
  confirme: number;
  termine: number;
  annule: number;
  aujourdhui: number;
  cette_semaine: number;
}

// Memory cache for names and metadata
const namesCache: { [key: string]: string } = {};

export class RendezVousService {
  private static instance: RendezVousService;
  private _patients: any[] = [];
  private _medecins: any[] = [];
  private _types: RendezVousType[] = [];
  private _statuts: RendezVousStatut[] = [];

  private constructor() {}

  public static getInstance(): RendezVousService {
    if (!RendezVousService.instance) {
      RendezVousService.instance = new RendezVousService();
    }
    return RendezVousService.instance;
  }

  // CRUD operations pou rendez-vous
  public async creerRendezVous(data: RendezVousFormData, tenantId: number): Promise<{ success: boolean; data?: any; errors?: string[] }> {
    try {
      const payload: RendezVous = {
        patient: data.patient_id,
        medecin: data.medecin_id,
        date_heure: data.date_heure,
        type: data.type_id || undefined,
        statut: data.statut_id,
        motif: data.motif,
        notes: data.notes,
        duree: data.duree,
        tenant: tenantId // Adajoute tenant ID
      };

      const response = await hospitalApi.rendezVous.create(payload);
      return {
        success: response.success,
        data: (response as any).data,
        errors: response.success ? undefined : [(response as any).message || 'Erreur inconnue']
      };
    } catch (error: any) {
      return { success: false, errors: [error.message] };
    }
  }

  public async modifierRendezVous(id: number, data: RendezVousFormData): Promise<{ success: boolean; data?: any; errors?: string[] }> {
    try {
      const payload: Partial<RendezVous> = {
        patient: data.patient_id,
        medecin: data.medecin_id,
        date_heure: data.date_heure,
        type: data.type_id || undefined,
        statut: data.statut_id,
        motif: data.motif,
        notes: data.notes,
        duree: data.duree
      };

      const response = await hospitalApi.rendezVous.update(id, payload);
      return {
        success: response.success,
        data: (response as any).data,
        errors: response.success ? undefined : [(response as any).message || "Erreur inconnue"]
      };
    } catch (error: any) {
      return { success: false, errors: [error.message] };
    }
  }

  public async supprimerRendezVous(id: number): Promise<{ success: boolean; errors?: string[] }> {
    const response = await hospitalApi.rendezVous.delete(id);
    return {
      success: response.success,
      errors: response.success ? undefined : [(response as any).message || "Erreur inconnue"]
    };
  }

  public async obtenirTousRendezVous(params?: any): Promise<RendezVous[]> {
    const response = await hospitalApi.rendezVous.getAll();
    if (response.success && response.data) {
      let rawData = response.data;
      if (rawData.results && Array.isArray(rawData.results)) {
        rawData = rawData.results;
      } else if (rawData.data && Array.isArray(rawData.data)) {
        rawData = rawData.data;
      }
      const arrData = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
      return arrData.map((rv: any) => ({
        ...rv,
        patient_id: typeof rv.patient === 'object' ? rv.patient?.id || rv.patient?.patient_id : (rv.patient_id || rv.patient),
        medecin_id: typeof rv.medecin === 'object' ? rv.medecin?.id || rv.medecin?.medecin_id : (rv.medecin_id || rv.medecin),
        patient_nom: rv.patient_nom || (typeof rv.patient === 'object' ? (`${rv.patient?.prenom || ''} ${rv.patient?.nom || ''}`.trim() || rv.patient?.nom_complet) : undefined),
        medecin_nom: rv.medecin_nom || (typeof rv.medecin === 'object' ? (`Dr. ${rv.medecin?.prenom || ''} ${rv.medecin?.nom || ''}`.trim() || rv.medecin?.nom_complet) : undefined),
        statut_id: typeof rv.statut === 'object' ? rv.statut?.id || rv.statut?.statut_id : (rv.statut_id || rv.statut),
        statut_nom: typeof rv.statut === 'object' ? rv.statut?.nom : rv.statut_nom,
        type_id: typeof rv.type === 'object' ? rv.type?.id || rv.type?.type_id : (rv.type_id || rv.type),
        type_nom: typeof rv.type === 'object' ? rv.type?.nom : rv.type_nom,
        id: rv.id || rv.rendez_vous_id || rv.rendezvous_id
      }));
    }
    return [];
  }

  public async obtenirRendezVous(id: number): Promise<any> {
    const response = await hospitalApi.rendezVous.getById(id);
    if (response.success && response.data) {
      const rv = response.data;
      return {
        ...rv,
        patient_id: typeof rv.patient === 'object' ? rv.patient?.id || rv.patient?.patient_id : (rv.patient_id || rv.patient),
        medecin_id: typeof rv.medecin === 'object' ? rv.medecin?.id || rv.medecin?.medecin_id : (rv.medecin_id || rv.medecin),
        patient_nom: rv.patient_nom || (typeof rv.patient === 'object' ? (`${rv.patient?.prenom || ''} ${rv.patient?.nom || ''}`.trim() || rv.patient?.nom_complet) : undefined),
        medecin_nom: rv.medecin_nom || (typeof rv.medecin === 'object' ? (`Dr. ${rv.medecin?.prenom || ''} ${rv.medecin?.nom || ''}`.trim() || rv.medecin?.nom_complet) : undefined),
        statut_id: typeof rv.statut === 'object' ? rv.statut?.id || rv.statut?.statut_id : (rv.statut_id || rv.statut),
        statut_nom: typeof rv.statut === 'object' ? rv.statut?.nom : rv.statut_nom,
        type_id: typeof rv.type === 'object' ? rv.type?.id || rv.type?.type_id : (rv.type_id || rv.type),
        type_nom: typeof rv.type === 'object' ? rv.type?.nom : rv.type_nom,
        id: rv.id || rv.rendez_vous_id || rv.rendezvous_id
      };
    }
    return null;
  }

  // Specialized actions
  public async confirmerRendezVous(id: number) {
    return await hospitalApi.rendezVous.confirmer(id);
  }

  public async annulerRendezVous(id: number) {
    return await hospitalApi.rendezVous.annuler(id);
  }

  public async reporterRendezVous(id: number, nouvelleDateHeure: string) {
    return await hospitalApi.rendezVous.reporter(id, nouvelleDateHeure);
  }

  // Metadata operations
  public async loadMetadata(tenantId?: number) {
    const params = tenantId ? { tenant: tenantId } : {};
    const [typesRes, statutsRes] = await Promise.all([
      hospitalApi.rendezVous.getTypes(params as any),
      hospitalApi.rendezVous.getStatuts(params as any)
    ]);

    if (typesRes.success) {
      this._types = typesRes.data.results || typesRes.data;
    }
    if (statutsRes.success) {
      this._statuts = statutsRes.data.results || statutsRes.data;
    }
  }

  public obtenirTypes(): RendezVousType[] {
    return this._types;
  }

  public obtenirStatuts(): RendezVousStatut[] {
    return this._statuts;
  }

  public async loadCache(tenantId: number) {
    const [patients, medecins] = await Promise.all([
      patientService.obtenirPatientsParHopital(tenantId),
      medecinService.obtenirMedecinsParHopital(tenantId)
    ]);

    this._patients = patients;
    this._patients.forEach(p => {
      namesCache[`patient_${p.patient_id}`] = `${p.prenom} ${p.nom}`.trim();
    });

    this._medecins = medecins;
    this._medecins.forEach(m => {
      namesCache[`medecin_${m.medecin_id}`] = `Dr. ${m.prenom} ${m.nom}`.trim();
    });
  }

  public rechercherPatients(term: string): any[] {
    if (!term.trim()) return [];
    return this._patients.filter(p => 
      `${p.prenom} ${p.nom}`.toLowerCase().includes(term.toLowerCase()) ||
      p.telephone.includes(term)
    );
  }

  public rechercherMedecins(term: string): any[] {
    if (!term.trim()) return [];
    return this._medecins.filter(m => 
      `${m.prenom} ${m.nom}`.toLowerCase().includes(term.toLowerCase()) ||
      m.telephone.includes(term)
    );
  }

  public obtenirNomPatient(id: number): string {
    return namesCache[`patient_${id}`] || `Patient #${id}`;
  }

  public obtenirNomMedecin(id: number): string {
    return namesCache[`medecin_${id}`] || `Dr. #${id}`;
  }

  // Fonksyon pou netwaye nimewo telefòn
  public cleanPhoneNumber(phone: string): string {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('509') && cleaned.length > 8) {
      return cleaned.substring(3);
    }
    return cleaned;
  }

  // Fonksyon pou fòmate nimewo telefòn pou afichaj
  public formatPhoneNumber(phone: string): string {
    const cleaned = this.cleanPhoneNumber(phone);
    if (cleaned.length === 8) {
      return `+509 ${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)} ${cleaned.substring(4, 6)} ${cleaned.substring(6, 8)}`;
    }
    return phone;
  }

  // Statistics
  public async obtenirStatistiques(tenantId?: number): Promise<RendezVousStats> {
    const rdv = await this.obtenirTousRendezVous(tenantId ? { tenant: tenantId } : undefined);
    const aujourdhui = new Date().toISOString().split('T')[0];
    
    // Simplification pour l'instant, le backend pourrait fournir ça
    return {
      total: rdv.length,
      programme: rdv.filter((r: any) => r.statut_nom === 'Planifié' || r.statut === 1).length,
      confirme: rdv.filter((r: any) => r.statut_nom === 'Confirmé' || r.statut === 2).length,
      termine: rdv.filter((r: any) => r.statut_nom === 'Terminé' || r.statut === 3).length,
      annule: rdv.filter((r: any) => r.statut_nom === 'Annulé' || r.statut === 4).length,
      aujourdhui: rdv.filter((r: any) => r.date_heure.split('T')[0] === aujourdhui).length,
      cette_semaine: rdv.length // Placeholder
    };
  }
}

export const rendezVousService = RendezVousService.getInstance();
