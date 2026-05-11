/* eslint-disable @typescript-eslint/no-explicit-any */
import { djangoAuthApi } from '../../../../api/djangoAuthApi';
import hospitalApi from '../../../../api/hospitalApi';

export interface Specialite {
  specialite_id: number;
  nom_specialite: string;
  description?: string;
}

export interface Medecin {
  medecin_id: number;
  hopital_id: number;
  nom: string;
  prenom: string;
  sexe: 'M' | 'F' | 'Autre';
  date_naissance?: string;
  telephone?: string;
  email_professionnel?: string;
  numero_identification?: string;
  numero_matricule_professionnel?: string;
  specialite_principale_id?: number;
  specialite_principale_nom?: string;
  specialites_secondaires?: number[];
  photo?: string;
  statut?: string;
  age?: number;
  cree_le: string;
  modifie_le: string;
}

export interface MedecinFormData {
  medecin: any;
}

// ============================================================
// Cache structure: keyed by hopitalId for multi-tenant safety
// ============================================================
interface MedecinsCache {
  data: Medecin[];
  hopitalId: number;
  fetchedAt: number; // timestamp ms
}

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export class MedecinService {
  private static instance: MedecinService;

  // In-memory caches — survive component unmount/remount within the session
  private medecinsCache: MedecinsCache | null = null;
  private specialitesCache: Specialite[] | null = null;
  private specialitesPromise: Promise<Specialite[]> | null = null;

  private constructor() {
    this.loadCacheFromStorage();
  }

  private loadCacheFromStorage() {
    try {
      const stored = localStorage.getItem('medecins_cache_v10');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() - parsed.fetchedAt < CACHE_TTL_MS) {
          this.medecinsCache = parsed;
        } else {
          localStorage.removeItem('medecins_cache_v10');
        }
      }
      
      const storedSpec = localStorage.getItem('specialites_cache');
      if (storedSpec) {
        this.specialitesCache = JSON.parse(storedSpec);
      }
    } catch (e) {
      console.error('Erreur lecture localStorage', e);
    }
  }

  private saveCacheToStorage() {
    try {
      if (this.medecinsCache) {
        localStorage.setItem('medecins_cache_v10', JSON.stringify(this.medecinsCache));
      }
    } catch (e) {
      console.error('Erreur ecriture localStorage (quota dépasse ?)', e);
    }
  }

  private saveSpecialitesToStorage() {
    try {
      if (this.specialitesCache) {
        localStorage.setItem('specialites_cache', JSON.stringify(this.specialitesCache));
      }
    } catch (e) {
      console.error('Erreur ecriture localStorage specialites', e);
    }
  }

  public static getInstance(): MedecinService {
    if (!MedecinService.instance) {
      MedecinService.instance = new MedecinService();
    }
    return MedecinService.instance;
  }

  // ----------------------------------------------------------------
  // Cache helpers
  // ----------------------------------------------------------------
  private isMedecinsValid(hopitalId: number): boolean {
    if (!this.medecinsCache) return false;
    if (this.medecinsCache.hopitalId !== hopitalId) return false;
    return Date.now() - this.medecinsCache.fetchedAt < CACHE_TTL_MS;
  }

  /** Invalidate cache (call after create/update/delete) */
  public invalidateCache(): void {
    this.medecinsCache = null;
    try {
      localStorage.removeItem('medecins_cache_v10');
    } catch (e) { }
    // Do NOT clear specialites — they never change
  }

  // ----------------------------------------------------------------
  // Private helpers
  // ----------------------------------------------------------------
  private findField(obj: any, targetField: string | string[]): any {
    if (!obj || typeof obj !== 'object') return null;

    if (Array.isArray(targetField)) {
      for (const field of targetField) {
        const found = this.findField(obj, field);
        if (found !== undefined && found !== null && found !== '') return found;
      }
      return null;
    }

    const directVal = obj[targetField];
    if (directVal !== undefined && directVal !== null && directVal !== '') return directVal;

    for (const key in obj) {
      if (typeof obj[key] === 'object') {
        const found = this.findField(obj[key], targetField);
        if (found !== undefined && found !== null && found !== '') return found;
      }
    }
    return null;
  }

  // ----------------------------------------------------------------
  // Normalisation
  // ----------------------------------------------------------------
  public normaliserMedecin(m: any): Medecin {
    if (!m) return {} as Medecin;
    const find = (field: string | string[]) => this.findField(m, field);

    // Specialite principale
    let specialite_id = 0;
    let specialite_nom = '';

    if (typeof m.specialite_principale === 'object' && m.specialite_principale !== null) {
      specialite_id = m.specialite_principale?.specialite_id || m.specialite_principale?.id || 0;
      specialite_nom = m.specialite_principale?.nom_specialite || m.specialite_principale?.nom || '';
    } else if (typeof m.specialite_principale === 'number' && m.specialite_principale > 0) {
      specialite_id = m.specialite_principale;
    }

    if (!specialite_id) {
      specialite_id = Number(find(['specialite_principale_id', 'specialite_id'])) || 0;
    }
    if (!specialite_nom) {
      specialite_nom = find(['specialite_principale_nom', 'specialite_nom']) || '';
    }
    const specialite_finale_nom = specialite_nom || (specialite_id === 0 ? 'Généraliste' : '');

    const date_naissance = this.formaterDatePourInput(
      find(['date_naissance', 'dateNaissance', 'birth_date', 'birthDate', 'dob', 'date_of_birth', 'dateNaiss', 'date_naiss']) || ''
    );
    let cree_le =
      m.cree_le || 
      m.created_at || 
      m.date_creation || 
      m.date_joined || 
      m.createdAt || 
      find(['date_creation', 'dateCreation', 'created_at', 'createdAt', 'cree_le', 'creeLe', 'date_joined', 'dateJoined']) || '';

    let modifie_le = m.modifie_le || m.updated_at || find(['modifie_le', 'updated_at']) || '';

    // Log the first Medecin found to help debug the exact payload from the backend
    if (!this.medecinsCache && !localStorage.getItem('medecin_logged_v6')) {
      console.log('[DEBUG] Structure exacte payload API Médecin: ', JSON.stringify(m, null, 2));
      localStorage.setItem('medecin_logged_v6', 'true');
    }

    // ID resolution
    let medicId = m.medecin_id || find(['medecin_id', 'id_medecin', 'doctor_id']) || 0;
    if (!medicId && m.id) {
      if (m.role || m.is_staff !== undefined) {
        // user object — skip
      } else {
        medicId = m.id || m.pk;
      }
    }

    return {
      medecin_id: Number(medicId),
      hopital_id: m.hopital_id || find('hopital') || 0,
      nom: m.nom || m.last_name || m.nom_famille || '',
      prenom: m.prenom || m.first_name || m.name_first || '',
      sexe: m.sexe || find('gender') || 'M',
      date_naissance,
      telephone: m.telephone || find('phone') || find('phone_number') || '',
      email_professionnel: m.email_professionnel || m.email || find('email') || '',
      numero_identification: m.numero_identification || find('id_number') || '',
      numero_matricule_professionnel:
        m.numero_matricule_professionnel || find('license_number') || '',
      specialite_principale_id: specialite_id,
      specialite_principale_nom: specialite_finale_nom,
      specialites_secondaires: Array.isArray(m.specialites_secondaires)
        ? m.specialites_secondaires
        : [],
      photo: m.photo || find('profile_picture') || find('avatar') || '',
      statut: m.statut || (m.is_active !== false ? 'Actif' : 'Inactif'),
      cree_le: cree_le || modifie_le || new Date().toISOString(),
      modifie_le: modifie_le,
      age: find('age') || m.age || undefined,
    };
  }

  // ----------------------------------------------------------------
  // Fetch all doctors — WITH in-memory caching
  // ----------------------------------------------------------------

  private enrichMedecinsDeUtilisateur(medecins: Medecin[]) {
    try {
      const storedUsers = localStorage.getItem('utilisateurs_cache');
      if (!storedUsers) return;
      const parsed = JSON.parse(storedUsers);
      if (!parsed || !parsed.data || !Array.isArray(parsed.data)) return;
      
      medecins.forEach(m => {
        if (!m.cree_le || !m.date_naissance) {
          const emailActuel = (m.email_professionnel || (m as any).email || '').toLowerCase().trim();
          const phoneActuel = (m.telephone || '').replace(/\D/g, '');
          const prenomLower = (m.prenom || '').toLowerCase().trim();
          const nomLower = (m.nom || '').toLowerCase().trim();
          
          const matchedUser = parsed.data.find((u: any) => {
            if (emailActuel && u.email && u.email.toLowerCase().trim() === emailActuel) return true;
            if (phoneActuel && u.telephone && u.telephone.replace(/\D/g, '') === phoneActuel) return true;
            
            const uNomComplet = (u.nom_complet || `${u.prenom} ${u.nom}`).toLowerCase();
            if (prenomLower && nomLower && uNomComplet.includes(prenomLower) && uNomComplet.includes(nomLower)) return true;
            return false;
          });

          if (matchedUser) {
            if (!m.cree_le && matchedUser.created_at) m.cree_le = matchedUser.created_at;
            if (!m.date_naissance && matchedUser.date_naissance) m.date_naissance = matchedUser.date_naissance;
          }
        }
      });
    } catch(e) {}
  }

  async obtenirMedecinsParHopital(hopitalId: number): Promise<Medecin[]> {
    // --- Return from cache if still fresh ---
    if (this.isMedecinsValid(hopitalId)) {
      console.log('[MedecinService] Returning cached medecins');
      this.enrichMedecinsDeUtilisateur(this.medecinsCache!.data); // Dynamically enrich
      return this.medecinsCache!.data;
    }

    console.log('[MedecinService] Cache miss — fetching fresh data for hopital', hopitalId);

    try {
      // Fetch medecins list + specialites in parallel for speed
      const [profilesRes, specialitesData] = await Promise.all([
        hospitalApi.medecins.getAll({
          hopital_id: hopitalId,
          ordering: '-cree_le',
          page_size: 1000,
          _t: Date.now(), // Force le navigateur à ne pas utiliser la version en cache HTTP locale
        } as any),
        this.obtenirSpecialites(), // uses its own cache
      ]);

      if (!profilesRes.success || !profilesRes.data) return [];

      const rawProfiles = profilesRes.data.results || profilesRes.data || [];
      const profilesList: any[] = Array.isArray(rawProfiles) ? rawProfiles : [rawProfiles];

      // Build specialite lookup map O(N) once
      const specialitesMap = new Map<number, string>(
        specialitesData.map(s => [s.specialite_id, s.nom_specialite])
      );

      const medecinMap = new Map<string, Medecin>();

      for (const p of profilesList) {
        const m = this.normaliserMedecin(p);
        if (!m || (!m.nom && !m.prenom)) continue;

        // Resolve specialite nom from map if not already set
        if (m.specialite_principale_id && m.specialite_principale_id > 0 && !m.specialite_principale_nom) {
          m.specialite_principale_nom = specialitesMap.get(m.specialite_principale_id) || '';
        }

        const key = m.email_professionnel?.toLowerCase() || `id_${m.medecin_id}`;
        medecinMap.set(key, m);
      }

      const sorted = Array.from(medecinMap.values()).sort((a, b) => {
        const dateA = a.cree_le ? new Date(a.cree_le).getTime() : 0;
        const dateB = b.cree_le ? new Date(b.cree_le).getTime() : 0;
        if (dateA === 0 && dateB === 0) return (b.medecin_id || 0) - (a.medecin_id || 0);
        if (dateA === 0) return 1;
        if (dateB === 0) return -1;
        return dateB - dateA;
      });

      this.enrichMedecinsDeUtilisateur(sorted); // Enrich before saving

      // Store in cache
      this.medecinsCache = {
        data: sorted,
        hopitalId,
        fetchedAt: Date.now(),
      };
      
      this.saveCacheToStorage();

      console.log(`[MedecinService] Cached ${sorted.length} medecins et sauvegardé dans localStorage`);
      return sorted;
    } catch (error) {
      console.error('[MedecinService] Erreur fetch:', error);
      return [];
    }
  }

  // ----------------------------------------------------------------
  // Fetch single doctor (always fresh for edit/view detail)
  // ----------------------------------------------------------------
  async obtenirMedecin(medecinId: number): Promise<Medecin | null> {
    const response = await hospitalApi.medecins.getById(medecinId);
    if (response.success) {
      return this.normaliserMedecin(response.data);
    }
    return null;
  }

  // ----------------------------------------------------------------
  // Create — invalidates cache so next load is fresh
  // ----------------------------------------------------------------
  async creerMedecin(
    formData: MedecinFormData,
    tenantId: number
  ): Promise<{ success: boolean; data?: Medecin; errors?: string[] }> {
    try {
      const date_nais = formData.medecin.date_naissance
        ? new Date(formData.medecin.date_naissance).toISOString().split('T')[0]
        : '';

      const payload = {
        ...formData.medecin,
        date_naissance: date_nais,
        hopital: tenantId,
        hopital_id: tenantId, // Garantie d'attachement au locataire (tenant)
        is_active: true, // Pour éviter qu'il soit invisible par défaut
        statut: 'Actif',
        specialite_principale_id: Number(formData.medecin.specialite_principale_id),
      };

      const response = await hospitalApi.medecins.create(payload as any);

      if (response.success && response.data) {
        const newM = this.normaliserMedecin(response.data);
        this.invalidateCache();
        
        if (this.medecinsCache && Array.isArray(this.medecinsCache.data)) {
          this.medecinsCache.data.unshift(newM);
        }
        
        return { success: true, data: newM };
      }
      return { success: false, errors: [response.message || 'Erreur de création'] };
    } catch (error: any) {
      console.error('[MedecinService] Error creating medecin:', error);
      return { success: false, errors: [error.message || 'Erreur réseau'] };
    }
  }

  // ----------------------------------------------------------------
  // Update — invalidates cache
  // ----------------------------------------------------------------
  async modifierMedecin(
    id: number,
    formData: MedecinFormData
  ): Promise<{ success: boolean; data?: Medecin; errors?: string[] }> {
    try {
      const date_nais = formData.medecin.date_naissance
        ? new Date(formData.medecin.date_naissance).toISOString().split('T')[0]
        : '';

      const rawPayload: Record<string, any> = {
        ...formData.medecin,
        date_naissance: date_nais,
        specialite_principale_id: formData.medecin.specialite_principale_id ? Number(formData.medecin.specialite_principale_id) : undefined,
      };

      // Strip system / read-only fields
      delete rawPayload.medecin_id;
      delete rawPayload.cree_le;
      delete rawPayload.modifie_le;
      delete rawPayload.specialite_principale_nom;
      delete rawPayload.statut;
      delete rawPayload.age;
      delete rawPayload.hopital_id;

      // Build clean PATCH payload — ignore empty values
      const payload: Record<string, any> = {};
      for (const [key, value] of Object.entries(rawPayload)) {
        if (value === undefined || value === null || value === '') continue;
        if (Array.isArray(value) && value.length === 0 && key !== 'specialites_secondaires') continue;
        if (key === 'photo' && typeof value === 'string') continue;
        payload[key] = value;
      }

      const response = await hospitalApi.medecins.update(id, payload as any);

      if (response.success && (response as any).data) {
        this.invalidateCache();
        return { success: true, data: this.normaliserMedecin((response as any).data) };
      }
      return { success: false, errors: [response.message || 'Erreur de modification'] };
    } catch (error: any) {
      console.error('[MedecinService] Error modifying medecin:', error);
      return { success: false, errors: [error.message || 'Erreur réseau'] };
    }
  }

  // ----------------------------------------------------------------
  // Delete — invalidates cache
  // ----------------------------------------------------------------
  async supprimerMedecin(medecinId: number): Promise<boolean> {
    const response = await hospitalApi.medecins.delete(medecinId);
    if (response.success) {
      this.invalidateCache();
    }
    return response.success;
  }

  // ----------------------------------------------------------------
  // Specialites — cached indefinitely (static data)
  // ----------------------------------------------------------------
  async obtenirSpecialites(): Promise<Specialite[]> {
    if (this.specialitesCache) {
      return this.specialitesCache;
    }
    
    if (this.specialitesPromise) {
      return this.specialitesPromise;
    }

    this.specialitesPromise = (async () => {
      // THE BACKEND /medical/specialites/ IS THROWING A 500 ERROR 
      // Bypassing API to prevent 7-second retry delay until backend is fixed.
      const fallback: Specialite[] = [
        { specialite_id: 1, nom_specialite: 'Médecine Générale' },
        { specialite_id: 2, nom_specialite: 'Pédiatrie' },
        { specialite_id: 3, nom_specialite: 'Gynécologie' },
        { specialite_id: 4, nom_specialite: 'Chirurgie' },
        { specialite_id: 5, nom_specialite: 'Cardiologie' },
        { specialite_id: 6, nom_specialite: 'Ophtalmologie' },
        { specialite_id: 7, nom_specialite: 'Dermatologie' },
        { specialite_id: 8, nom_specialite: 'Urologie' },
        { specialite_id: 9, nom_specialite: 'Neurologie' },
        { specialite_id: 10, nom_specialite: 'Psychiatrie' }
      ];
      this.specialitesCache = fallback;
      return fallback;
    })();

    return this.specialitesPromise;
  }

  // ----------------------------------------------------------------
  // Utilities
  // ----------------------------------------------------------------
  formaterDatePourInput(dateStr?: string) {
    if (!dateStr) return '';
    if (dateStr.includes('T')) return dateStr.split('T')[0];
    return dateStr;
  }

  obtenirNomSpecialite(specialiteId?: number, specialites: Specialite[] = []) {
    if (!specialiteId) return 'Non spécifiée';
    const specialite = specialites.find(s => s.specialite_id === specialiteId);
    return specialite ? specialite.nom_specialite : 'Spécialité inconnue';
  }
}

// Singleton — lives for the entire browser session
export const medecinService = MedecinService.getInstance();

// Unused import kept for compatibility with files that import djangoAuthApi indirectly
void djangoAuthApi;