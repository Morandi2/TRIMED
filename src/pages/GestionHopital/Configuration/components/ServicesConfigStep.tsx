import React from 'react';
import { Database, ShieldCheck, Zap, Globe } from 'lucide-react';
import { HospitalConfig } from '../types/ConfigTypes';
import Label from '../../../../components/form/Label';

interface Props {
  config: Partial<HospitalConfig>;
  setConfig: React.Dispatch<React.SetStateAction<Partial<HospitalConfig>>>;
}

export const ServicesConfigStep: React.FC<Props> = ({ config, setConfig }) => {
  const handleChange = (field: keyof HospitalConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* System Preferences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-brand-500/10 rounded-lg flex items-center justify-center text-brand-500">
                <Globe size={16} />
             </div>
             <h3 className="font-bold text-gray-900 dark:text-white">Préférences Globale</h3>
          </div>
          
          <div className="space-y-4">
             <div>
                <Label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-400">Format de Date</Label>
                <select 
                  value={config.format_date}
                  onChange={(e) => handleChange('format_date', e.target.value)}
                  className="w-full h-11 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (25/12/2026)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (12/25/2026)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (2026-12-25)</option>
                </select>
             </div>
             
             <div className="p-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                   <ShieldCheck size={14} className="text-brand-500" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">Auto-Backup</span>
                </div>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                   Les sauvegardes automatiques sont activées par défaut pour votre instance Tenant. Vos données sont chiffrées en AES-256.
                </p>
             </div>
          </div>
        </div>

        {/* Architectural Visual Summary */}
        <div className="bg-brand-500/5 dark:bg-brand-500/10 border border-brand-500/20 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center group">
           <div className="relative mb-6">
              <div className="absolute inset-0 bg-brand-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
              <div className="relative w-20 h-20 bg-brand-500 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-brand-500/40">
                 <Database size={32} />
              </div>
           </div>
           
           <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 underline decoration-brand-500/30 underline-offset-4">Architecture Initiale</h3>
           <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-6">Prêt pour Déploiement</p>
           
           <div className="grid grid-cols-2 gap-4 w-full">
              <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-white dark:border-gray-700">
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Tenant ID</p>
                 <p className="text-xs font-mono font-bold text-brand-600">TH-8829</p>
              </div>
              <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-white dark:border-gray-700">
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Status</p>
                 <p className="text-xs font-bold text-green-500 uppercase tracking-widest flex items-center justify-center gap-1.5 line-clamp-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                    Actif
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* Integration Message */}
      <div className="p-6 bg-brand-600 rounded-[2rem] text-white flex items-center justify-between relative overflow-hidden shadow-2xl shadow-brand-500/20">
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <Zap size={80} />
        </div>
        <div className="relative z-10">
           <h4 className="text-lg font-bold mb-1">Dernière vérification...</h4>
           <p className="text-xs text-brand-100 max-w-sm">
             En cliquant sur "Activer", vous finalisez la structure pivot de votre système. Toutes les données seront synchronisées avec votre base de données centrale.
           </p>
        </div>
        <div className="relative z-10 w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
           <ShieldCheck size={24} />
        </div>
      </div>
    </div>
  );
};
