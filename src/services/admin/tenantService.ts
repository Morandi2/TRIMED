import axiosInstance from "../../config/axios";

export interface Tenant {
  id: string;
  nom: string;
  adresse: string;
  telephone: string;
  email_professionnel: string;
  directeur: string;
  nombre_de_lits: number;
  numero_enregistrement: string;
  statut: 'actif' | 'inactif' | 'suspendu' | 'en_attente';
  type_abonnement: 'basic' | 'standard' | 'premium';
  cree_le: string;
  proprietaire_nom?: string;
}

export const tenantService = {
  // Récupérer tous les tenants (réservé aux Admins Globaux)
  async getAllTenants(): Promise<Tenant[]> {
    const response = await axiosInstance.get('/tenants/');
    // Adaptation si le backend renvoie une pagination Django standard (.results)
    return response.data.results || response.data;
  },

  // Mettre à jour le statut d'un hôpital (Approuver/Bloquer)
  async updateTenantStatus(tenantId: string, status: 'actif' | 'inactif' | 'suspendu'): Promise<Tenant> {
    const response = await axiosInstance.patch(`/tenants/${tenantId}/`, { statut: status });
    return response.data;
  },

  // Récupérer le détail d'un hôpital spécifique
  async getTenantDetails(tenantId: string): Promise<Tenant> {
    const response = await axiosInstance.get(`/tenants/${tenantId}/`);
    return response.data;
  }
};
