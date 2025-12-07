import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TenantConfig {
  tenant_id: number;
  nom: string;
  logo?: string;
  couleur_principale: string;
  langue_defaut: string;
  devise: string;
  fuseau_horaire: string;
  is_configured: boolean;
}

interface TenantContextType {
  tenantConfig: TenantConfig | null;
  setTenantConfig: (config: TenantConfig) => void;
  isConfigured: boolean;
  primaryColor: string;
  currency: string;
  language: string;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tenantConfig, setTenantConfigState] = useState<TenantConfig | null>(null);

  useEffect(() => {
    // Charger config depuis localStorage
    const savedConfig = localStorage.getItem('tenant_config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setTenantConfigState(config);
      applyTenantStyles(config);
    }
  }, []);

  const setTenantConfig = (config: TenantConfig) => {
    setTenantConfigState(config);
    localStorage.setItem('tenant_config', JSON.stringify(config));
    applyTenantStyles(config);
  };

  const applyTenantStyles = (config: TenantConfig) => {
    // Appliquer couleur principale
    document.documentElement.style.setProperty('--primary-color', config.couleur_principale);
    
    // Appliquer au body pour les composants
    const root = document.documentElement;
    root.style.setProperty('--brand-500', config.couleur_principale);
    root.style.setProperty('--brand-600', adjustColor(config.couleur_principale, -20));
    root.style.setProperty('--brand-700', adjustColor(config.couleur_principale, -40));
  };

  const adjustColor = (color: string, amount: number): string => {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };

  return (
    <TenantContext.Provider
      value={{
        tenantConfig,
        setTenantConfig,
        isConfigured: tenantConfig?.is_configured || false,
        primaryColor: tenantConfig?.couleur_principale || '#0066CC',
        currency: tenantConfig?.devise || 'HTG',
        language: tenantConfig?.langue_defaut || 'fr',
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
};
