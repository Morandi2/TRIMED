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

    for (const key in obj) {
      if (typeof obj[key] === 'object') {
        const found = this.findField(obj[key], targetField);
        if (found !== undefined && found !== null) return found;
      }
    }
    return null;
  }

  public normaliserRendezVous(rv: any): any {
    if (!rv) return null;
    const find = (f: string | string[]) => this.findField(rv, f);

    const rdvId = find(['rendez_vous_id', 'id_rendezvous', 'id', 'pk', 'uid']) || 0;
    
    // Détection Patient
    let pId = find(['patient_id', 'id_patient']);
    let pNom = find(['patient_nom', 'patient_name']);
    if (typeof rv.patient === 'object' && rv.patient !== null) {
      pId = pId || rv.patient.id || rv.patient.patient_id;
      pNom = pNom || `${rv.patient.prenom || ''} ${rv.patient.nom || ''}`.trim();
    } else if (typeof rv.patient === 'number') {
      pId = pId || rv.patient;
    }

    // Détection Médecin
    let mId = find(['medecin_id', 'id_medecin', 'doctor_id']);
    let mNom = find(['medecin_nom', 'medecin_name', 'doctor_name']);

    if (typeof rv.medecin === 'object' && rv.medecin !== null) {
      mId = mId || rv.medecin.id || rv.medecin.medecin_id;
      mNom = mNom || `Dr. ${rv.medecin.prenom || ''} ${rv.medecin.nom || ''}`.trim();
    } else if (typeof rv.medecin === 'number') {
      mId = mId || rv.medecin;
    }

    // Détection Statut
    let sId = find(['statut_id', 'id_statut']);
    let sNom = find(['statut_nom', 'status_name', 'label_statut']);
    if (typeof rv.statut === 'object' && rv.statut !== null) {
      sId = sId || rv.statut.id || rv.statut.statut_id;
      sNom = sNom || rv.statut.nom;
    } else if (typeof rv.statut === 'number') {
      sId = sId || rv.statut;
    }

    // Détection Type
    let tId = find(['type_id', 'id_type']);
    let tNom = find(['type_nom', 'type_name']);
    if (typeof rv.type === 'object' && rv.type !== null) {
      tId = tId || rv.type.id || rv.type.type_id;
      tNom = tNom || rv.type.nom;
    } else if (typeof rv.type === 'number') {
      tId = tId || rv.type;
    }

    return {
      ...rv,
      rendez_vous_id: Number(rdvId),
      patient_id: pId,
      patient_nom: pNom || this.obtenirNomPatient(pId),
      medecin_id: mId,
      medecin_nom: mNom || this.obtenirNomMedecin(mId),
      statut_id: sId,
      statut_nom: sNom || 'Inconnu',
      type_id: tId,
      type_nom: tNom || 'Consultation',
      cree_le: find(['cree_le', 'created_at', 'date_creation']) || ''
    };
  }

  public async creeRendezVous(data: RendezVousFormData, tenantId: number): Promise<{ success: boolean; data?: any; errors?: string[] }> {
    try {
      // Map des IDs numériques vers les slugs que le backend Django attend
      const statutMap: Record<number, string> = {
        1: 'planifie',
        2: 'confirme',
        3: 'termine',
        4: 'annule'
      };

      const payload: any = {
        patient: data.patient_id,
        medecin: data.medecin_id,
        date_heure: data.date_heure,
        motif: data.motif || '',
        notes: data.notes || '',
        duree_minutes: data.duree || 30,
        statut: statutMap[data.statut_id] || 'PLANIFIE',
        hopital: tenantId,
        hopital_id: tenantId
      };

      console.log('[RendezVousService] Payload création RDV:', payload);

      const response = await hospitalApi.rendezVous.create(payload) as any;
      console.log('[RendezVousService] Réponse création RDV:', response);
      
      if (response.success) {
        return {
          success: true,
          data: this.normaliserRendezVous(response.data)
        };
      }
      
      // Extraire les messages d'erreur du backend
      const errorMessages: string[] = [];
      if (response.error && typeof response.error === 'object') {
        Object.entries(response.error).forEach(([key, val]) => {
          const msg = Array.isArray(val) ? val.join(', ') : String(val);
          errorMessages.push(`${key}: ${msg}`);
        });
      }
      if (errorMessages.length === 0) {
        errorMessages.push(response.message || 'Erreur lors de la création du rendez-vous');
      }
      
      return { success: false, errors: errorMessages };
    } catch (error: any) {
      console.error('[RendezVousService] Exception création RDV:', error);
      return { success: false, errors: [error.message || 'Erreur inattendue'] };
    }
  }

  public async modifierRendezVous(id: number, data: RendezVousFormData, tenantId?: number): Promise<{ success: boolean; data?: any; errors?: string[] }> {
    try {
      const statutMap: Record<number, string> = {
        1: 'planifie',
        2: 'confirme',
        3: 'termine',
        4: 'annule'
      };

      const payload: any = {
        patient: data.patient_id,
        medecin: data.medecin_id,
        date_heure: data.date_heure,
        motif: data.motif || '',
        notes: data.notes || '',
        duree_minutes: data.duree || 30,
        statut: statutMap[data.statut_id] || 'planifie'
      };

      if (tenantId) {
        payload.hopital = tenantId;
        payload.hopital_id = tenantId;
      }

      console.log('[RendezVousService] Payload modification RDV:', payload);

      const response = await hospitalApi.rendezVous.update(id, payload) as any;
      console.log('[RendezVousService] Réponse modification RDV:', response);
      
      if (response.success) {
        return {
          success: true,
          data: this.normaliserRendezVous(response.data)
        };
      }
      
      const errorMessages: string[] = [];
      if (response.error && typeof response.error === 'object') {
        Object.entries(response.error).forEach(([key, val]) => {
          const msg = Array.isArray(val) ? val.join(', ') : String(val);
          errorMessages.push(`${key}: ${msg}`);
        });
      }
      if (errorMessages.length === 0) {
        errorMessages.push(response.message || 'Erreur lors de la modification');
      }
      
      return { success: false, errors: errorMessages };
    } catch (error: any) {
      console.error('[RendezVousService] Exception modification RDV:', error);
      return { success: false, errors: [error.message || 'Erreur inattendue'] };
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
    try {
      const response = await hospitalApi.rendezVous.getAll({ ordering: '-date_creation', page_size: 1000, ...params } as any);
      if (!response.success || !response.data) return [];

      let results: any[] = [];
      const rawData = response.data;
      if (rawData.results && Array.isArray(rawData.results)) results = rawData.results;
      else if (rawData.data?.results && Array.isArray(rawData.data.results)) results = rawData.data.results;
      else if (Array.isArray(rawData.data)) results = rawData.data;
      else if (Array.isArray(rawData)) results = rawData;

      return results.map(rv => this.normaliserRendezVous(rv)).sort((a, b) => {
        const dA = new Date(a.date_heure).getTime();
        const dB = new Date(b.date_heure).getTime();
        return dB - dA;
      });
    } catch { return []; }
  }

  public async loadMetadata(tenantId?: number) {
    const params = tenantId ? { tenant: tenantId } : {};
    const [typesRes, statutsRes] = await Promise.all([
      hospitalApi.rendezVous.getTypes(params as any).catch(() => ({ success: false, data: [] })),
      hospitalApi.rendezVous.getStatuts(params as any).catch(() => ({ success: false, data: [] }))
    ]);

    if (typesRes.success && typesRes.data) {
      this._types = typesRes.data.results || typesRes.data || [];
    }
    if (statutsRes.success && statutsRes.data) {
      this._statuts = statutsRes.data.results || statutsRes.data || [];
    }

    // Defaults if empty
    if (this._types.length === 0) {
        this._types = [
            { id: 1, type_id: 1, nom: "Consultation standard", duree_estimee: 30, couleur: "#3b82f6" },
            { id: 2, type_id: 2, nom: "Suivi médical", duree_estimee: 15, couleur: "#10b981" }
        ] as any;
    }
    if (this._statuts.length === 0) {
        this._statuts = [
            { id: 1, statut_id: 1, nom: "Planifié", couleur: "#f59e0b" },
            { id: 2, statut_id: 2, nom: "Confirmé", couleur: "#10b981" },
            { id: 3, statut_id: 3, nom: "Terminé", couleur: "#3b82f6" },
            { id: 4, statut_id: 4, nom: "Annulé", couleur: "#ef4444" }
        ] as any;
    }
  }

  public async loadCache(tenantId: number) {
    const [patients, medecins] = await Promise.all([
      patientService.obtenirPatientsParHopital(tenantId),
      medecinService.obtenirMedecinsParHopital(tenantId)
    ]);
    this._patients = patients;
    this._medecins = medecins;
    patients.forEach(p => namesCache[`patient_${p.patient_id}`] = `${p.prenom} ${p.nom}`.trim());
    medecins.forEach(m => namesCache[`medecin_${m.medecin_id}`] = `Dr. ${m.prenom} ${m.nom}`.trim());
  }

  public rechercherPatients(term: string): any[] {
    const t = term.toLowerCase();
    return this._patients.filter(p => p.nom.toLowerCase().includes(t) || p.prenom.toLowerCase().includes(t));
  }

  public rechercherMedecins(term: string): any[] {
    const t = term.toLowerCase();
    return this._medecins.filter(m => m.nom.toLowerCase().includes(t) || m.prenom.toLowerCase().includes(t));
  }

  public formatPhoneNumber(phone?: string): string {
    if (!phone) return '';
    return phone; // Keep simple formatting, as actual formatting logic varies
  }

  public obtenirNomPatient(id: number): string { return namesCache[`patient_${id}`] || `Patient #${id}`; }
  public obtenirNomMedecin(id: number): string { return namesCache[`medecin_${id}`] || `Dr. #${id}`; }
  public obtenirTypes(): RendezVousType[] { return this._types; }
  public obtenirStatuts(): RendezVousStatut[] { return this._statuts; }

  public async obtenirStatistiques(tenantId: number): Promise<RendezVousStats> {
    const list = await this.obtenirTousRendezVous({ tenant: tenantId });
    const today = new Date().toISOString().split('T')[0];
    
    // Very basic this week check
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);
    
    return {
      total: list.length,
      programme: list.filter((r: any) => r.statut_nom?.toLowerCase().includes('planifié') || r.statut_nom?.toLowerCase().includes('programmé') || r.statut_id === 1).length,
      confirme: list.filter((r: any) => r.statut_nom?.toLowerCase().includes('confirmé') || r.statut_id === 2).length,
      termine: list.filter((r: any) => r.statut_nom?.toLowerCase().includes('terminé') || r.statut_id === 3).length,
      annule: list.filter((r: any) => r.statut_nom?.toLowerCase().includes('annulé') || r.statut_id === 4).length,
      aujourdhui: list.filter((r: any) => r.date_heure && r.date_heure.startsWith(today)).length,
      cette_semaine: list.filter((r: any) => {
        if (!r.date_heure) return false;
        const d = new Date(r.date_heure);
        return d >= startOfWeek && d <= endOfWeek;
      }).length
    };
  }
}

export const rendezVousService = RendezVousService.getInstance();
