import { Utilisateur, UtilisateurFormData, UtilisateurStats, UtilisateurRole, UtilisateurStatut } from '../types/UtilisateurTypes';
import { djangoAuthApi } from '../../../../api/djangoAuthApi';

class UtilisateurService {
  private roles: UtilisateurRole[] = [
    { role_id: 1, nom: 'Administrateur Systeme', description: 'Accès total à la plateforme' },
    { role_id: 2, nom: 'Proprietaire hopital', description: 'Gérant de l\'hôpital' },
    { role_id: 3, nom: 'Medecin', description: 'Accès aux dossiers patients' },
    { role_id: 4, nom: 'Infirmier', description: 'Saisie des constantes et soins' },
    { role_id: 5, nom: 'Secretaire', description: 'Accueil et rendez-vous' },
    { role_id: 6, nom: 'Personnel', description: 'Accès limité au service' }
  ];
  
  private statuts: UtilisateurStatut[] = [
    { statut_id: 1, nom: 'Actif', description: 'Utilisateur actif' },
    { statut_id: 2, nom: 'Inactif', description: 'Utilisateur inactif' },
    { statut_id: 3, nom: 'Suspendu', description: 'Compte suspendu' }
  ];

  private utilisateursCache: { data: Utilisateur[]; tenantId: number; fetchedAt: number } | null = null;
  private readonly CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.loadCacheFromStorage();
  }

  private loadCacheFromStorage() {
    try {
      const stored = localStorage.getItem('utilisateurs_cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() - parsed.fetchedAt < this.CACHE_TTL_MS) {
          this.utilisateursCache = parsed;
        } else {
          localStorage.removeItem('utilisateurs_cache');
        }
      }
    } catch (e) {}
  }

  private saveCacheToStorage() {
    try {
      if (this.utilisateursCache) {
        localStorage.setItem('utilisateurs_cache', JSON.stringify(this.utilisateursCache));
      }
    } catch (e) {}
  }

  public invalidateCache(): void {
    this.utilisateursCache = null;
    try {
      localStorage.removeItem('utilisateurs_cache');
    } catch (e) {}
  }
  
  private clean(val: any): string | null {
    if (!val || typeof val !== 'string') return null;
    const cleaned = val.trim();
    if (cleaned === '' || cleaned === '-') return null;
    return cleaned;
  }

  // Convertit un utilisateur Django en format local de l'application
  private mapDjangoUserToLocal(u: any): Utilisateur {
    const hopitalInfo = u.hopital && typeof u.hopital === 'object' ? u.hopital : null;
    
    const rawNom = this.clean(u.nom) || this.clean(u.last_name) || this.clean(u.nom_famille);
    const rawPrenom = this.clean(u.prenom) || this.clean(u.first_name) || this.clean(u.petit_nom);
    const rawNomComplet = this.clean(u.nom_complet) || this.clean(u.full_name) || this.clean(u.name);

    const prenom = rawPrenom || (rawNomComplet ? rawNomComplet.split(' ')[0] : (u.email ? u.email.split('@')[0] : ''));
    const nom = rawNom || (rawNomComplet ? rawNomComplet.split(' ').slice(1).join(' ') : (u.last_name || ''));
    
    return {
      utilisateur_id: Number(u.id || u.utilisateur_id || u.pk || 0),
      // ... same ...
      nom_complet: rawNomComplet || `${prenom} ${nom}`.trim() || u.username || u.email || '',
      nom: nom,
      prenom: prenom,
      email: u.email || u.username || '',
      telephone: u.telephone || u.phone || u.mobile || '',
      role_id: this.mapRoleToId(u.role || u.role_name || (u.groups && u.groups[0]?.name) || u.user_role),
      statut_id: u.is_active === false ? 2 : 1, 
      created_at: u.date_joined || u.created_at || u.created || u.date_creation || u.cree_le || u.timestamp || new Date().toISOString(),
      updated_at: u.updated_at || u.modified_at || u.modifie_le || new Date().toISOString(),
      last_login: u.last_login || u.derniere_connexion || u.login_at || u.last_seen || null,
      tenant_id: Number(
        (hopitalInfo ? (hopitalInfo.id || hopitalInfo.tenant_id || hopitalInfo.hopital_id || hopitalInfo.hospital_id) : null) || 
        u.hopital || u.hopital_id || u.hospital || u.hospital_id || u.tenant || u.tenant_id || 0
      ),
      hopital_nom: hopitalInfo ? (hopitalInfo.nom || hopitalInfo.name) : (this.clean(u.hopital_nom) || (typeof u.hopital === 'string' ? u.hopital : null))
    };
  }

  // Gère et unifie le format des erreurs renvoyées par Django
  private parseDjangoErrors(response: any, defaultMessage: string): { fieldErrors?: Record<string, string>; message: string } {
    const fieldErrors: Record<string, string> = {};
    const errorData = response.error as any;
    let detailMessage = response.message || defaultMessage;

    if (errorData && typeof errorData === 'object') {
       Object.keys(errorData).forEach(key => {
         const errorValue = Array.isArray(errorData[key]) ? errorData[key][0] : String(errorData[key]);
         
         if (key === 'first_name') fieldErrors.prenom = errorValue;
         else if (key === 'last_name') fieldErrors.nom = errorValue;
         else fieldErrors[key] = errorValue;
       });

       if (Object.keys(fieldErrors).length > 0 && detailMessage === defaultMessage) {
         detailMessage = Object.entries(fieldErrors)
           .map(([key, val]) => `${key}: ${val}`)
           .join(', ');
       }
    }

    return { 
      fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
      message: detailMessage
    };
  }

  async obtenirTousUtilisateurs(tenantId: number): Promise<Utilisateur[]> {
    if (this.utilisateursCache && this.utilisateursCache.tenantId === tenantId) {
      if (Date.now() - this.utilisateursCache.fetchedAt < this.CACHE_TTL_MS) {
        return this.utilisateursCache.data;
      }
    }

    let allRawResults: any[] = [];
    let nextUrl: string | null = '/comptes/utilisateurs/';
    const maxPages = 10; // Sécurité pour éviter les boucles infinies
    let pageCount = 0;

    try {
      while (nextUrl && pageCount < maxPages) {
        // Ajout du cache-buster _t pour forcer le navigateur à ne pas utiliser la version en cache
        const separator = nextUrl.includes('?') ? '&' : '?';
        const urlWithCacheBuster = nextUrl.includes('_t=') ? nextUrl : `${nextUrl}${separator}_t=${Date.now()}`;
        
        const response: any = await djangoAuthApi.getUtilisateurs(urlWithCacheBuster);
        console.log(`[UtilisateurService] Page ${pageCount + 1} de réponse API:`, response);

        if (response.success && response.data) {
          const data = response.data as any;
          const pageResults = data.results || data.data || (Array.isArray(data) ? data : []);
          
          if (Array.isArray(pageResults)) {
            allRawResults = [...allRawResults, ...pageResults];
          } else if (typeof pageResults === 'object' && pageResults.id) {
            allRawResults.push(pageResults);
          }

          // DRF renvoie souvent le lien complet dans "next"
          nextUrl = data.next ? data.next : null;
          pageCount++;
          
          // Si le backend renvoie tout d'un coup (pas de pagination results/next)
          if (!data.next && !data.results) break;
        } else {
          break;
        }
      }

      const allMappedUsers = allRawResults.map((u: any) => this.mapDjangoUserToLocal(u));
      
      console.log(`[UtilisateurService] Total itilizatè yo jwenn (tout paj): ${allMappedUsers.length}`);
      console.log(`[UtilisateurService] Lopital ID n ap chèche: ${tenantId}`);
      
      const filtered = allMappedUsers.filter(u => {
        // Enforce tenant isolation
        const tenantMatch = !tenantId || Number(tenantId) === 0 || Number(u.tenant_id) === Number(tenantId);
        
        // EXCLUSION DES COMPTES EFFACÉS uniquement (PAS les inactifs)
        // Les utilisateurs inactifs sont un statut légitime que l'admin doit voir
        const rawUser = allRawResults.find(raw => Number(raw.id || raw.utilisateur_id || raw.pk) === Number(u.utilisateur_id));
        
        // Seulement exclure les comptes explicitement supprimés
        const isDeleted = rawUser ? (rawUser.deleted === true || rawUser.is_deleted === true || String(rawUser.deleted) === 'true' || String(rawUser.is_deleted) === 'true') : false;

        if (!tenantMatch) {
          console.log(`[UtilisateurService] ❌ Filtre Tenant: "${u.nom_complet}"`);
          return false;
        }
        
        if (isDeleted) {
          console.log(`[UtilisateurService] ❌ Filtre Effacé: "${u.nom_complet}"`);
          return false;
        }

        return true;
      });

      console.log(`[UtilisateurService] Kantite itilizatè k ap parèt aprè filtraj: ${filtered.length}`);

      this.utilisateursCache = {
        data: filtered,
        tenantId,
        fetchedAt: Date.now()
      };
      this.saveCacheToStorage();

      return filtered;
    } catch (error) {
      console.error('[UtilisateurService] Erreur lors de la récupération des utilisateurs:', error);
      return [];
    }
  }

  private mapRoleToId(roleName: string): number {
    if (!roleName) return 6;
    
    // Normalisation pour gérer les accents, espaces et majuscules
    const normalized = String(roleName).toLowerCase()
      .normalize("NFD").replace(/[-\u0300-\u036f]/g, "") // Enlève accents et tirets
      .replace(/[^a-z0-9]/g, ''); // Enlève caractères spéciaux
    
    console.log(`[UtilisateurService] Mapping role: "${roleName}" -> normalized: "${normalized}"`);

    switch (normalized) {
      case 'adminsysteme': 
      case 'superuser':
      case 'administrator': 
      case 'admin': return 1;
      
      case 'proprietairehopital': 
      case 'proprietaire': 
      case 'owner': return 2;
      
      case 'medecin': 
      case 'doctor': 
      case 'dr': return 3;
      
      case 'infirmier': 
      case 'infirmiere': 
      case 'nurse': return 4;
      
      case 'secretaire': 
      case 'receptionniste': 
      case 'secretary': 
      case 'receptionist': return 5;
      
      case 'personnel': 
      case 'staff': return 6;
      
      default: return 6;
    }
  }

  private mapIdToRole(roleId: number): string {
    switch (roleId) {
      case 1: return 'admin-systeme';
      case 2: return 'proprietaire-hopital';
      case 3: return 'medecin';
      case 4: return 'infirmier';
      case 5: return 'secretaire';
      case 6: return 'personnel';
      default: return 'personnel';
    }
  }

  async creerUtilisateur(data: UtilisateurFormData, tenantId: number): Promise<{ success: boolean; data?: Utilisateur; fieldErrors?: Record<string, string>; message?: string }> {
    if (!tenantId || tenantId === 0) {
      console.error('Erreur: ID Hôpital manquant (tenantId=0)');
      return { 
        success: false, 
        message: "Erreur de configuration : ID d'hôpital non trouvé. Veuillez vous reconnecter." 
      };
    }

    // Utilisation de l'endpoint d'inscription pour garantir le bon hachage des mots de passe
    const apiData = {
      email: data.email,
      username: data.email,
      nom_complet: data.nom_complet,
      role: this.mapIdToRole(data.role_id),
      role_id: Number(data.role_id),
      password: data.password,
      password_confirm: data.password_confirm,
      mot_de_passe: data.password,
      mot_de_passe_confirm: data.password_confirm,
      password1: data.password,
      password2: data.password_confirm,
      is_active: data.statut_id === 1,
      hopital: tenantId,
      hopital_id: tenantId,
      telephone: data.telephone,
    };

    console.log('[UtilisateurService] Envoi création utilisateur:', apiData);

    const response = await djangoAuthApi.creerUtilisateur(apiData);
    console.log('[UtilisateurService] Réponse création utilisateur:', response);
    
    if (response.success && response.data) {
      const newUser = this.mapDjangoUserToLocal(response.data);
      this.invalidateCache();
      
      // Optimisation: ajouter directement au cache en mémoire pour une mise à jour instantanée
      if (this.utilisateursCache && Array.isArray(this.utilisateursCache.data)) {
        this.utilisateursCache.data.unshift(newUser);
      }
      
      return {
        success: true,
        data: newUser
      };
    }

    const errors = this.parseDjangoErrors(response, 'Erreur lors de la création');
    return { success: false, ...errors };
  }

  // Ces méthodes doivent être implémentées côté API pour fonctionner de bout en bout
  async modifierUtilisateur(id: number, data: UtilisateurFormData, originalEmail?: string): Promise<{ success: boolean; data?: Utilisateur; fieldErrors?: Record<string, string>; message?: string }> {
    const apiData: any = {
      nom_complet: data.nom_complet,
      first_name: data.nom_complet.split(' ')[0] || '',
      last_name: data.nom_complet.split(' ').slice(1).join(' ') || data.nom_complet,
      role: this.mapIdToRole(data.role_id),
      is_active: data.statut_id === 1,
      telephone: data.telephone
    };

    // Envoyer l'email uniquement s'il a changé pour éviter un conflit "Email déjà utilisé"
    if (!originalEmail || data.email !== originalEmail) {
      apiData.email = data.email;
    }

    console.log('[UtilisateurService] Envoi modification utilisateur:', apiData);

    const response = await djangoAuthApi.updateUtilisateur(id, apiData);
    console.log('[UtilisateurService] Réponse modification utilisateur:', response);
    
    if (response.success && response.data) {
      this.invalidateCache();
      return {
        success: true,
        data: this.mapDjangoUserToLocal(response.data)
      };
    }

    const errors = this.parseDjangoErrors(response, 'Erreur lors de la modification');
    return { success: false, ...errors };
  }

  async supprimerUtilisateur(id: number): Promise<{ success: boolean; fieldErrors?: Record<string, string>; message?: string }> {
    console.log('[UtilisateurService] Envoi suppression utilisateur ID:', id);
    const response = await djangoAuthApi.deleteUtilisateur(id);
    
    if (response.success) {
      this.invalidateCache();
    }
    
    return { 
      success: response.success, 
      message: response.message || 'Erreur lors de la suppression' 
    };
  }

  async obtenirStatistiques(tenantId: number): Promise<UtilisateurStats> {
    const utilisateurs = await this.obtenirTousUtilisateurs(tenantId);
    
    return {
      total: utilisateurs.length,
      actif: utilisateurs.filter(u => u.statut_id === 1).length,
      inactif: utilisateurs.filter(u => u.statut_id === 2).length,
      admin: utilisateurs.filter(u => u.role_id === 1 || u.role_id === 2).length,
      medecin: utilisateurs.filter(u => u.role_id === 3).length,
      infirmier: utilisateurs.filter(u => u.role_id === 4).length
    };
  }

  obtenirRoles(): UtilisateurRole[] {
    return this.roles;
  }

  obtenirStatuts(): UtilisateurStatut[] {
    return this.statuts;
  }
}

export const utilisateurService = new UtilisateurService();