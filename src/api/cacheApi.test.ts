import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { avecCache, viderCacheApi } from './cacheApi';

const requete = (url: string, autres: Partial<InternalAxiosRequestConfig> = {}) =>
  ({ method: 'get', url, baseURL: '/api', params: { _t: Date.now() }, headers: { Authorization: 'Bearer compte-A' }, ...autres }) as unknown as InternalAxiosRequestConfig;

describe('mémoire partagée des lectures', () => {
  let base: ReturnType<typeof vi.fn<AxiosAdapter>>;
  beforeEach(() => {
    viderCacheApi();
    base = vi.fn<AxiosAdapter>(async (c) => ({ data: { url: c.url }, status: 200, statusText: 'OK', headers: {}, config: c }) as AxiosResponse);
  });

  it('ne refait pas une lecture récente', async () => {
    const adaptateur = avecCache(base);
    await adaptateur(requete('/patients/'));
    await adaptateur(requete('/patients/'));
    expect(base).toHaveBeenCalledTimes(1);
  });

  it('sépare les comptes', async () => {
    const adaptateur = avecCache(base);
    await adaptateur(requete('/patients/'));
    await adaptateur(requete('/patients/', { headers: { Authorization: 'Bearer compte-B' } } as never));
    expect(base).toHaveBeenCalledTimes(2);
  });

  it('une écriture vide la mémoire', async () => {
    const adaptateur = avecCache(base);
    await adaptateur(requete('/patients/'));
    await adaptateur(requete('/patients/', { method: 'post' }));
    await adaptateur(requete('/patients/'));
    expect(base).toHaveBeenCalledTimes(3);
  });

  it('une écriture refusée garde la mémoire', async () => {
    const adaptateur = avecCache(base);
    await adaptateur(requete('/patients/'));
    base.mockRejectedValueOnce(new Error('403'));
    await expect(adaptateur(requete('/patients/', { method: 'patch' }))).rejects.toThrow();
    await adaptateur(requete('/patients/'));
    expect(base).toHaveBeenCalledTimes(2);
  });
});
