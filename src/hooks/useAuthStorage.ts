// src/hooks/useAuthStorage.ts
import { useState, useEffect } from 'react';

export const useAuthStorage = () => {
  const [token, setToken] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    // Synchronisation avec localStorage au démarrage
    const token = localStorage.getItem('access_token');
    const tenant = localStorage.getItem('tenant_id');
    if (token) setToken(token);
    if (tenant) setTenantId(tenant);
  }, []);

  const saveAuthData = (data: { access: string; refresh: string; tenant_id: string }) => {
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    localStorage.setItem('tenant_id', data.tenant_id);
    setToken(data.access);
    setTenantId(data.tenant_id);
  };

  const clearAuthData = () => {
    localStorage.clear();
    setToken(null);
    setTenantId(null);
  };

  return { token, tenantId, saveAuthData, clearAuthData };
};