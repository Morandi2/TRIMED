import { describe, it, expect, vi, beforeEach } from 'vitest';
import { utilisateurService } from './UtilisateurService';
import { djangoAuthApi } from '../../../../api/djangoAuthApi';
import { normalizeRole, rolePermissions } from '../../../../types/userRoles';
import type { UtilisateurFormData } from '../types/UtilisateurTypes';

vi.mock('../../../../api/djangoAuthApi', () => ({
  djangoAuthApi: {
    creerUtilisateur: vi.fn(),
    updateUtilisateur: vi.fn(),
  },
}));

const formulaire = (role_id: number): UtilisateurFormData => ({
  nom_complet: 'Jean Robert', email: 'jean@hopital.ht', password: 'MotDePasse-123', password_confirm: 'MotDePasse-123',
  role_id, statut_id: 1, telephone: '',
});

describe('Rôles et droits', () => {
  beforeEach(() => vi.clearAllMocks());

  it('un rôle contenant « admin » ne devient pas administrateur TRIMED', () => {
    expect(normalizeRole('admin-hopital')).toBe('personnel');
    expect(normalizeRole('Administrateur')).toBe('personnel');
    expect(normalizeRole('superadmin')).toBe('personnel');
    expect(normalizeRole('admin-systeme')).toBe('admin-systeme');
  });

  it('seul le propriétaire peut configurer son hôpital', () => {
    const autorises = Object.entries(rolePermissions).filter(([, p]) => p.canConfigurerHopital).map(([r]) => r);
    expect(autorises).toEqual(['proprietaire-hopital']);
  });

  it('un hôpital ne propose que les rôles du personnel', () => {
    expect(utilisateurService.obtenirRolesAttribuables().map((r) => r.role_id)).toEqual([3, 4, 5, 6]);
  });

  it.each([1, 2, 7])('refuse de créer un compte avec le rôle %i sans appeler le serveur', async (role) => {
    const res = await utilisateurService.creerUtilisateur(formulaire(role), 1);
    expect(res.success).toBe(false);
    expect(djangoAuthApi.creerUtilisateur).not.toHaveBeenCalled();
  });

  it('crée un compte de médecin', async () => {
    vi.mocked(djangoAuthApi.creerUtilisateur).mockResolvedValue({ success: true, data: { id: 9, email: 'jean@hopital.ht', role: 'medecin' } } as never);
    const res = await utilisateurService.creerUtilisateur(formulaire(3), 1);
    expect(res.success).toBe(true);
    expect(vi.mocked(djangoAuthApi.creerUtilisateur).mock.calls[0][0]).toMatchObject({ role: 'medecin', hopital: 1 });
  });

  it('ne transmet pas le rôle quand on modifie un administrateur ou un propriétaire', async () => {
    vi.mocked(djangoAuthApi.updateUtilisateur).mockResolvedValue({ success: true, data: { id: 4, role: 'proprietaire-hopital' } } as never);
    await utilisateurService.modifierUtilisateur(4, formulaire(2), 'jean@hopital.ht');
    expect(vi.mocked(djangoAuthApi.updateUtilisateur).mock.calls[0][1]).not.toHaveProperty('role');
  });
});
