import React from 'react';
import { HospitalConfig } from '../types/ConfigTypes';
import { validation } from '../../../../utils/validation';

interface Props {
 config: Partial<HospitalConfig>;
 setConfig: React.Dispatch<React.SetStateAction<Partial<HospitalConfig>>>;
}

export const HospitalInfoStep: React.FC<Props> = ({ config, setConfig }) => {
 const handleChange = (field: keyof HospitalConfig, value: any) => {
 setConfig((prev) => ({ ...prev, [field]: value }));
 };

 return (
 <div className="space-y-6">
 <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
 Informations de l'Hôpital
 </h2>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
 Nom de l'Hôpital *
 </label>
 <input
 type="text"
 value={config.nom || ''}
 onChange={(e) => handleChange('nom', e.target.value)}
 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
 placeholder="Hôpital Général de Port-au-Prince"
 required
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
 Téléphone *
 </label>
 <input
 type="tel"
 value={config.telephone || ''}
 onChange={(e) => handleChange('telephone', e.target.value)}
 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
 placeholder="+509 28 11 22 33"
 required
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
 Email *
 </label>
 <input
 type="email"
 value={config.email || ''}
 onChange={(e) => handleChange('email', e.target.value)}
 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
 placeholder="contact@hopital.ht"
 required
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
 Adresse *
 </label>
 <input
 type="text"
 value={config.adresse || ''}
 onChange={(e) => handleChange('adresse', e.target.value)}
 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
 placeholder="Port-au-Prince, Haïti"
 required
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
 Couleur Principale
 </label>
 <div className="flex gap-2">
 <input
 type="color"
 value={config.couleur_principale || '#0066CC'}
 onChange={(e) => handleChange('couleur_principale', e.target.value)}
 className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
 />
 <input
 type="text"
 value={config.couleur_principale || '#0066CC'}
 onChange={(e) => handleChange('couleur_principale', e.target.value)}
 className="flex-1 px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
 />
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
 Langue par Défaut
 </label>
 <select
 value={config.langue_defaut || 'fr'}
 onChange={(e) => handleChange('langue_defaut', e.target.value)}
 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
 >
 <option value="fr">Français</option>
 <option value="ht">Kreyòl</option>
 <option value="en">English</option>
 </select>
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
 Fuseau Horaire
 </label>
 <select
 value={config.fuseau_horaire || 'America/Port-au-Prince'}
 onChange={(e) => handleChange('fuseau_horaire', e.target.value)}
 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
 >
 <option value="America/Port-au-Prince">Port-au-Prince (GMT-5)</option>
 <option value="America/New_York">New York (GMT-5)</option>
 <option value="Europe/Paris">Paris (GMT+1)</option>
 </select>
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
 Devise
 </label>
 <select
 value={config.devise || 'HTG'}
 onChange={(e) => handleChange('devise', e.target.value)}
 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
 >
 <option value="HTG">Gourde Haïtienne (HTG)</option>
 <option value="USD">Dollar US (USD)</option>
 <option value="EUR">Euro (EUR)</option>
 </select>
 </div>
 </div>

 <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
 <p className="text-sm text-blue-800 dark:text-blue-300">
 <strong>Conseil:</strong> Ces informations seront affichées sur tous les documents officiels
 (factures, rapports, etc.). Assurez-vous qu'elles sont correctes.
 </p>
 </div>
 </div>
 );
};
