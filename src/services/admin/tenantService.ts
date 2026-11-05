import apiClient from "../../api/apiConfig";

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
  statut_verification_document?: 'en_attente' | 'verifie' | 'rejete';
  type_abonnement: 'basic' | 'standard' | 'premium';
  cree_le: string;
  proprietaire_nom?: string;
}

// Le serveur identifie un hôpital par `tenant_id` ; l’interface utilise `id`.
const versTenant = (t: Record<string, unknown>): Tenant => ({ ...(t as unknown as Tenant), id: String(t.tenant_id ?? t.id) });

export const tenantService = {
  // Récupérer tous les tenants (réservé à l’équipe TRIMED)
  async getAllTenants(): Promise<Tenant[]> {
    const response = await apiClient.get('/tenants/tenants/');
    // Adaptation si le backend renvoie une pagination Django standard (.results)
    const liste = response.data.results || response.data;
    return (Array.isArray(liste) ? liste : []).map(versTenant);
  },

  // Mettre à jour le statut d'un hôpital (Approuver/Bloquer)
  async updateTenantStatus(tenantId: string, status: 'actif' | 'inactif' | 'suspendu'): Promise<Tenant> {
    const response = await apiClient.patch(`/tenants/tenants/${tenantId}/`, { statut: status });
    return versTenant(response.data);
  },

  // Récupérer le détail d'un hôpital spécifique
  async getTenantDetails(tenantId: string): Promise<Tenant> {
    const response = await apiClient.get(`/tenants/tenants/${tenantId}/`);
    return versTenant(response.data);
  }
};
