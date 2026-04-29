import React from 'react';
import { HospitalConfig } from '../types/ConfigTypes';
import { validation } from '../../../../utils/validation';
import Label from '../../../../components/form/Label';
import Input from '../../../../components/form/input/InputField';
import { Building2, Mail, Phone, Globe, MapPin, Palette } from 'lucide-react';

interface Props {
  config: Partial<HospitalConfig>;
  setConfig: React.Dispatch<React.SetStateAction<Partial<HospitalConfig>>>;
}

export const HospitalInfoStep: React.FC<Props> = ({ config, setConfig }) => {
  const handleChange = (field: keyof HospitalConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="md:col-span-2">
          <Label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Nom de l'Hôpital
          </Label>
          <Input
            name="nom"
            value={config.nom || ''}
            onChange={(e) => handleChange('nom', e.target.value)}
            placeholder="Hôpital de l'Espoir"
            className="w-full"
            required
          />
        </div>

        <div>
          <Label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Téléphone Professionnel
          </Label>
          <Input
            name="telephone"
            value={config.telephone || ''}
            onChange={(e) => handleChange('telephone', e.target.value)}
            placeholder="+509 2811-2233"
            className="w-full"
            required
          />
        </div>

        <div>
          <Label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Email de Support
          </Label>
          <Input
            name="email"
            type="email"
            value={config.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="support@hopital.ht"
            className="w-full"
            required
          />
        </div>

        <div className="md:col-span-2">
          <Label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Adresse Physique
          </Label>
          <Input
            name="adresse"
            value={config.adresse || ''}
            onChange={(e) => handleChange('adresse', e.target.value)}
            placeholder="123, Rue des Miracles, Port-au-Prince"
            className="w-full"
            required
          />
        </div>

        <div>
          <Label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Identité Visuelle (Couleur)
          </Label>
          <div className="flex gap-3">
            <div 
              className="w-12 h-12 rounded-xl border border-gray-200 dark:border-gray-800 shadow-inner flex-shrink-0"
              style={{ backgroundColor: config.couleur_principale || '#2D32FF' }}
            />
            <Input
              name="couleur_principale"
              value={config.couleur_principale || '#2D32FF'}
              onChange={(e) => handleChange('couleur_principale', e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        <div>
           <Label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Devise Locative
          </Label>
          <select
            value={config.devise || 'HTG'}
            onChange={(e) => handleChange('devise', e.target.value)}
            className="w-full h-11 rounded-lg border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none dark:text-white"
          >
            <option value="HTG">Gourde Haïtienne (HTG)</option>
            <option value="USD">Dollar US (USD)</option>
          </select>
        </div>
      </div>

      <div className="p-4 bg-brand-500/5 border border-brand-500/10 rounded-2xl flex gap-4 items-center">
        <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <Globe className="text-brand-500 w-5 h-5" />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          Ces informations serviront de base pour votre **Tenant ID** unique et seront affichées sur vos factures et documents officiels.
        </p>
      </div>
    </div>
  );
};
