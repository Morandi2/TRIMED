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
  
  private clean(val: any): string | null {
    if (!val || typeof val !== 'string') return null;
    const cleaned = val.trim();
    const upper = cleaned.toUpperCase();
    if (upper === 'N/A' || upper === 'NULL' || upper === '-' || upper === 'TRIMEDH' || upper === 'TRIMED') return null;
    return cleaned;
  }

  async obtenirTousUtilisateurs(_tenantId: number): Promise<Utilisateur[]> {
    const response = await djangoAuthApi.getUtilisateurs();
    console.log('[UtilisateurService] Réponse API obtenirTousUtilisateurs:', response);

    if (response.success && response.data) {
      let rawData: any = response.data;
      
      // Gérer les différents formats de réponse Django
      if (rawData.results && Array.isArray(rawData.results)) {
        rawData = rawData.results;
      } else if (rawData.data && Array.isArray(rawData.data)) {
        rawData = rawData.data;
      }

      if (!Array.isArray(rawData)) {
        console.error('[UtilisateurService] Format inattendu pour rawData (array attendu):', rawData);
        // Si c'est un seul objet, on le met dans un tableau
        if (rawData && typeof rawData === 'object' && rawData.id) {
          rawData = [rawData];
        } else {
          return [];
        }
      }

      // Mapping des données Django vers le format Utilisateur local
      return rawData.map((u: any) => {
        const hopitalInfo = u.hopital && typeof u.hopital === 'object' ? u.hopital : null;
        
        // Priorité aux champs spécifiques, sinon split du nom_complet
        const rawNom = this.clean(u.nom) || this.clean(u.last_name);
        const rawPrenom = this.clean(u.prenom) || this.clean(u.first_name);
        const rawNomComplet = this.clean(u.nom_complet);

        const prenom = rawPrenom || (rawNomComplet ? rawNomComplet.split(' ')[0] : (u.email ? u.email.split('@')[0] : ''));
        const nom = rawNom || (rawNomComplet ? rawNomComplet.split(' ').slice(1).join(' ') : '');
        
        return {
          utilisateur_id: u.id || u.utilisateur_id,
          nom_complet: rawNomComplet || `${prenom} ${nom}`.trim() || u.email || '',
          nom: nom,
          prenom: prenom,
          email: u.email || '',
          telephone: u.telephone || u.phone || '',
          role_id: this.mapRoleToId(u.role),
          statut_id: u.is_active ? 1 : 2,
          created_at: u.date_joined || u.created_at || u.created || u.date_creation || new Date().toISOString(),
          updated_at: u.updated_at || new Date().toISOString(),
          tenant_id: (hopitalInfo ? hopitalInfo.id : u.hopital) || 0,
          hopital_nom: hopitalInfo ? hopitalInfo.nom : (this.clean(u.hopital_nom) || (typeof u.hopital === 'string' ? u.hopital : null))
        };
      });
    }
    return [];
  }


  private mapRoleToId(roleName: string): number {
    switch (roleName) {
      case 'admin-systeme': return 1;
      case 'proprietaire-hopital': return 2;
      case 'medecin': return 3;
      case 'infirmier': return 4;
      case 'secretaire': return 5;
      case 'personnel': return 6;
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

    // Utiliser l'endpoint d'inscription qui appelle create_user() et hashage correctement le mot de passe
    // L'endpoint /comptes/utilisateurs/ (CRUD) peut ne pas hasher le mot de passe correctement
    const apiData = {
      email: data.email,
      nom_complet: data.nom_complet,
      nom: data.nom_complet.split(' ').slice(1).join(' ') || data.nom_complet,
      prenom: data.nom_complet.split(' ')[0] || '',
      first_name: data.nom_complet.split(' ')[0] || '',
      last_name: data.nom_complet.split(' ').slice(1).join(' ') || data.nom_complet,
      role: this.mapIdToRole(data.role_id),
      password: data.password,
      mot_de_passe: data.password, // Fallback JSON Server / Custom
      password_confirm: data.password_confirm,
      confirm_password: data.password_confirm,
      is_active: data.statut_id === 1,
      hopital: tenantId,
      hopital_id: tenantId, // Requis par InscriptionView pour Medecin
      tenant_id: tenantId,
      tenant: tenantId
    };

    console.log('[UtilisateurService] Envoi création utilisateur:', apiData);

    const response = await djangoAuthApi.creerUtilisateur(apiData);
    console.log('[UtilisateurService] Réponse création utilisateur:', response);
    
    if (response.success && response.data) {
      const u = response.data;
      return {
        success: true,
        data: {
          utilisateur_id: u.id,
          nom_complet: u.nom_complet || `${u.first_name || ''} ${u.last_name || ''}`.trim(),
          nom: u.nom || u.last_name || (u.nom_complet ? u.nom_complet.split(' ').slice(1).join(' ') : (u.nom_complet || '')),
          prenom: u.prenom || u.first_name || (u.nom_complet ? u.nom_complet.split(' ')[0] : ''),
          email: u.email,
          telephone: u.telephone,
          role_id: this.mapRoleToId(u.role),
          statut_id: u.is_active ? 1 : 2,
          created_at: u.date_joined || new Date().toISOString(),
          updated_at: u.updated_at || new Date().toISOString(),
          tenant_id: (u.hopital && typeof u.hopital === 'object' ? u.hopital.id : u.hopital) || 0,
          hopital_nom: u.hopital && typeof u.hopital === 'object' ? u.hopital.nom : u.hopital_nom
        }
      };
    }

    // Extraire les erreurs de champ
    const fieldErrors: Record<string, string> = {};
    const errorData = response.error as any;
    let detailMessage = response.message || 'Erreur lors de la création';

    if (errorData && typeof errorData === 'object') {
       Object.keys(errorData).forEach(key => {
         const errorValue = Array.isArray(errorData[key]) ? errorData[key][0] : String(errorData[key]);
         
         // Mapper les erreurs Django vers les champs locaux
         if (key === 'first_name') fieldErrors.prenom = errorValue;
         else if (key === 'last_name') fieldErrors.nom = errorValue;
         else fieldErrors[key] = errorValue;
       });

       // Si on a des erreurs de champ mais pas de message global clair, on les liste
       if (Object.keys(fieldErrors).length > 0 && detailMessage === 'Erreur lors de la création') {
         detailMessage = Object.entries(fieldErrors)
           .map(([key, val]) => `${key}: ${val}`)
           .join(', ');
       }
    }

    return { 
      success: false, 
      fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
      message: detailMessage
    };
  }

  // Pour l'instant, ces méthodes restent simulées ou à implémenter si l'API le permet
  async modifierUtilisateur(id: number, data: UtilisateurFormData, originalEmail?: string): Promise<{ success: boolean; data?: Utilisateur; fieldErrors?: Record<string, string>; message?: string }> {
    const apiData: any = {
      nom_complet: data.nom_complet,
      role: this.mapIdToRole(data.role_id),
      is_active: data.statut_id === 1
    };

    // N'envoyer l'email que s'il a changé pour éviter l'erreur "Email déjà utilisé" sur le backend
    if (originalEmail && data.email !== originalEmail) {
      apiData.email = data.email;
    } else if (!originalEmail) {
      apiData.email = data.email;
    }

    console.log('[UtilisateurService] Envoi modification utilisateur:', apiData);

    const response = await djangoAuthApi.updateUtilisateur(id, apiData);
    console.log('[UtilisateurService] Réponse modification utilisateur:', response);
    
    if (response.success && response.data) {
      const u = response.data;
      return {
        success: true,
        data: {
          utilisateur_id: u.id,
          nom_complet: u.nom_complet || `${u.first_name || ''} ${u.last_name || ''}`.trim(),
          nom: u.nom || u.last_name || (u.nom_complet ? u.nom_complet.split(' ').slice(1).join(' ') : (u.nom_complet || '')),
          prenom: u.prenom || u.first_name || (u.nom_complet ? u.nom_complet.split(' ')[0] : ''),
          email: u.email,
          telephone: u.telephone,
          role_id: this.mapRoleToId(u.role),
          statut_id: u.is_active ? 1 : 2,
          created_at: u.date_joined || new Date().toISOString(),
          updated_at: u.updated_at || new Date().toISOString(),
          tenant_id: (u.hopital && typeof u.hopital === 'object' ? u.hopital.id : u.hopital) || 0,
          hopital_nom: u.hopital && typeof u.hopital === 'object' ? u.hopital.nom : u.hopital_nom
        }
      };
    }

    // Extraire les erreurs de champ
    const fieldErrors: Record<string, string> = {};
    const errorData = response.error as any;
    let detailMessage = response.message || 'Erreur lors de la modification';

    if (errorData && typeof errorData === 'object') {
       Object.keys(errorData).forEach(key => {
         const errorValue = Array.isArray(errorData[key]) ? errorData[key][0] : String(errorData[key]);
         if (key === 'first_name') fieldErrors.prenom = errorValue;
         else if (key === 'last_name') fieldErrors.nom = errorValue;
         else fieldErrors[key] = errorValue;
       });

       if (Object.keys(fieldErrors).length > 0 && detailMessage === 'Erreur lors de la modification') {
         detailMessage = Object.entries(fieldErrors)
           .map(([key, val]) => `${key}: ${val}`)
           .join(', ');
       }
    }

    return { 
      success: false, 
      fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
      message: detailMessage
    };
  }

  async supprimerUtilisateur(id: number): Promise<{ success: boolean; fieldErrors?: Record<string, string>; message?: string }> {
    console.log('[UtilisateurService] Envoi suppression utilisateur ID:', id);
    const response = await djangoAuthApi.deleteUtilisateur(id);
    
    if (response.success) {
      return { success: true, message: response.message };
    }

    return { 
      success: false, 
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