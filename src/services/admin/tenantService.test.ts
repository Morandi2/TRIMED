import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../api/apiConfig';
import { tenantService } from './tenantService';

vi.mock('../../api/apiConfig', () => ({
  __esModule: true,
  default: { get: vi.fn(), patch: vi.fn() },
}));

describe('tenantService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('utilise tenant_id du serveur comme identifiant', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { results: [{ tenant_id: 4, nom: 'Hôpital A' }, { tenant_id: 1, nom: 'Hôpital B' }] } });
    const liste = await tenantService.getAllTenants();
    expect(liste.map((t) => t.id)).toEqual(['4', '1']);
  });

  it('suspend le bon hôpital', async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({ data: { tenant_id: 4, statut: 'suspendu' } });
    const t = await tenantService.updateTenantStatus('4', 'suspendu');
    expect(apiClient.patch).toHaveBeenCalledWith('/tenants/tenants/4/', { statut: 'suspendu' });
    expect(t.id).toBe('4');
  });
});
