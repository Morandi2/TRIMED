import { Utilisateur, UtilisateurFormData, UtilisateurStats, UtilisateurRole, UtilisateurStatut } from '../types/UtilisateurTypes';

class UtilisateurService {
  private utilisateurs: Utilisateur[] = [];
  private readonly STORAGE_KEY = 'utilisateurs_data';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      this.utilisateurs = JSON.parse(stored);
    } else {
      this.utilisateurs = [
        {
          utilisateur_id: 1,
          nom: 'Dupont',
          prenom: 'Jean',
          email: 'jean.dupont@hopital.com',
          telephone: '+509 3456-7890',
          role_id: 1,
          statut_id: 1,
          created_at: '2024-01-15T08:00:00Z',
          updated_at: '2024-01-15T08:00:00Z',
          tenant_id: 0
        },
        {
          utilisateur_id: 2,
          nom: 'Martin',
          prenom: 'Marie',
          email: 'marie.martin@hopital.com',
          telephone: '+509 2345-6789',
          role_id: 2,
          statut_id: 1,
          created_at: '2024-01-16T09:30:00Z',
          updated_at: '2024-01-16T09:30:00Z',
          tenant_id: 0
        },
        {
          utilisateur_id: 3,
          nom: 'Pierre',
          prenom: 'Paul',
          email: 'paul.pierre@hopital.com',
          telephone: '+509 1234-5678',
          role_id: 3,
          statut_id: 1,
          created_at: '2024-01-17T10:15:00Z',
          updated_at: '2024-01-17T10:15:00Z',
          tenant_id: 0
        }
      ];
      this.saveToStorage();
    }
  }

  private saveToStorage() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.utilisateurs));
  }
  private roles: UtilisateurRole[] = [
    { role_id: 1, nom: 'Administrateur', description: 'Accès complet au système' },
    { role_id: 2, nom: 'Médecin', description: 'Accès médical' },
    { role_id: 3, nom: 'Infirmier', description: 'Soins infirmiers' },
    { role_id: 4, nom: 'Réceptionniste', description: 'Accueil et rendez-vous' }
  ];
  private statuts: UtilisateurStatut[] = [
    { statut_id: 1, nom: 'Actif', description: 'Utilisateur actif' },
    { statut_id: 2, nom: 'Inactif', description: 'Utilisateur inactif' },
    { statut_id: 3, nom: 'Suspendu', description: 'Compte suspendu' }
  ];

  obtenirTousUtilisateurs(tenantId: number): Utilisateur[] {
    return this.utilisateurs.filter(u => u.tenant_id === tenantId);
  }

  obtenirUtilisateurParId(id: number): Utilisateur | undefined {
    return this.utilisateurs.find(u => u.utilisateur_id === id);
  }

  creerUtilisateur(data: UtilisateurFormData, tenantId: number): { success: boolean; data?: Utilisateur; errors?: string[] } {
    const errors: string[] = [];

    if (!data.nom.trim()) errors.push('Le nom est requis');
    if (!data.prenom.trim()) errors.push('Le prénom est requis');
    if (!data.email.trim()) errors.push('L\'email est requis');
    
    const emailRegex = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (data.email && !emailRegex.test(data.email)) {
      errors.push('Format d\'email invalide');
    }
    
    if (this.utilisateurs.some(u => u.email === data.email && u.tenant_id === tenantId)) {
      errors.push('Cet email existe déjà');
    }
    
    if (data.telephone && data.telephone.length < 10) {
      errors.push('Numéro de téléphone invalide');
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    const nouvelUtilisateur: Utilisateur = {
      utilisateur_id: Date.now(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tenant_id: tenantId
    };

    this.utilisateurs.push(nouvelUtilisateur);
    this.saveToStorage();
    return { success: true, data: nouvelUtilisateur };
  }

  modifierUtilisateur(id: number, data: UtilisateurFormData): { success: boolean; data?: Utilisateur; errors?: string[] } {
    const index = this.utilisateurs.findIndex(u => u.utilisateur_id === id);
    if (index === -1) {
      return { success: false, errors: ['Utilisateur non trouvé'] };
    }

    const errors: string[] = [];
    if (!data.nom.trim()) errors.push('Le nom est requis');
    if (!data.prenom.trim()) errors.push('Le prénom est requis');
    if (!data.email.trim()) errors.push('L\'email est requis');
    
    const emailRegex = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (data.email && !emailRegex.test(data.email)) {
      errors.push('Format d\'email invalide');
    }
    
    if (data.telephone && data.telephone.length < 10) {
      errors.push('Numéro de téléphone invalide');
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    this.utilisateurs[index] = {
      ...this.utilisateurs[index],
      ...data,
      updated_at: new Date().toISOString()
    };

    this.saveToStorage();
    return { success: true, data: this.utilisateurs[index] };
  }

  supprimerUtilisateur(id: number): { success: boolean; errors?: string[] } {
    const index = this.utilisateurs.findIndex(u => u.utilisateur_id === id);
    if (index === -1) {
      return { success: false, errors: ['Utilisateur non trouvé'] };
    }

    this.utilisateurs.splice(index, 1);
    this.saveToStorage();
    return { success: true };
  }

  obtenirStatistiques(tenantId: number): UtilisateurStats {
    const utilisateurs = this.obtenirTousUtilisateurs(tenantId);
    
    return {
      total: utilisateurs.length,
      actif: utilisateurs.filter(u => u.statut_id === 1).length,
      inactif: utilisateurs.filter(u => u.statut_id === 2).length,
      admin: utilisateurs.filter(u => u.role_id === 1).length,
      medecin: utilisateurs.filter(u => u.role_id === 2).length,
      infirmier: utilisateurs.filter(u => u.role_id === 3).length
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