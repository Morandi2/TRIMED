import React from 'react';
import { Users, UserCheck, Heart, Stethoscope, PieChart } from 'lucide-react';
import { Medecin, Specialite } from '../services/MedecinService';

interface MedecinStatsProps {
  medecins: Medecin[];
  specialites: Specialite[];
}

export const MedecinStats: React.FC<MedecinStatsProps> = ({ medecins, specialites }) => {
  const safeMedecins = Array.isArray(medecins) ? medecins : [];
  const safeSpecialites = Array.isArray(specialites) ? specialites : [];

  const totalMedecins = safeMedecins.length;
  const medecinsHommes = safeMedecins.filter(m => m.sexe === 'M').length;
  const medecinsFemmes = safeMedecins.filter(m => m.sexe === 'F').length;

  const statsSpecialites = safeSpecialites.map(specialite => ({
    nom: specialite.nom_specialite,
    count: safeMedecins.filter(m => {
      const mId = Number((m as any).specialite_principale_id);
      const sId = Number(specialite.specialite_id);
      if (mId > 0 && sId > 0 && mId === sId) return true;
      const mNom = ((m as any).specialite_principale_nom || '').toLowerCase().trim();
      const sNom = specialite.nom_specialite.toLowerCase().trim();
      return mNom.length > 0 && mNom === sNom;
    }).length
  })).filter(s => s.count > 0);

  const medecinsSansSpecialite = safeMedecins.filter(
    m => !m.specialite_principale_id || Number(m.specialite_principale_id) === 0
  ).length;

  const maxCount = Math.max(...statsSpecialites.map(s => s.count), 1);
  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500'];

  return (
    <div className="space-y-8 mb-10">
      {/* Cards Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Médecins', value: totalMedecins, icon: Users, color: 'blue', sub: 'Actifs' },
          { label: 'Hommes', value: medecinsHommes, icon: UserCheck, color: 'emerald', sub: `${totalMedecins > 0 ? Math.round((medecinsHommes/totalMedecins)*100) : 0}%` },
          { label: 'Femmes', value: medecinsFemmes, icon: Heart, color: 'pink', sub: `${totalMedecins > 0 ? Math.round((medecinsFemmes/totalMedecins)*100) : 0}%` },
          { label: 'Spécialités', value: statsSpecialites.length + (medecinsSansSpecialite > 0 ? 1 : 0), icon: Stethoscope, color: 'purple', sub: 'Domaines' }
        ].map((card, i) => (
          <div key={i} className="bg-white/40 dark:bg-white/[0.02] backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/20 dark:border-white/[0.05] shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
            <div className={`absolute -right-4 -top-4 w-20 h-20 bg-${card.color}-500/10 rounded-full blur-2xl group-hover:bg-${card.color}-500/20 transition-all duration-700`} />
            <div className="relative z-10">
              <div className={`w-12 h-12 bg-${card.color}-50 dark:bg-${card.color}-900/20 rounded-2xl flex items-center justify-center mb-4 text-${card.color}-600 dark:text-${card.color}-400 transition-transform group-hover:scale-110 duration-500 shadow-sm`}>
                <card.icon className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-1">{card.label}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{card.value}</h3>
                <span className="text-xs font-bold text-gray-400 italic">{card.sub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Distribution Section */}
      {statsSpecialites.length > 0 && (
        <div className="relative overflow-hidden bg-white/40 dark:bg-white/[0.01] backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-[3rem] p-8 lg:p-10 shadow-sm group">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.25em] flex items-center gap-4">
                <div className="w-1.5 h-8 bg-blue-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)]"></div>
                Répartition Spécialités
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">Analyse visuelle de la charge par département médical</p>
            </div>
            
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/20 shadow-inner">
              <PieChart className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest">{totalMedecins} Médecins Total</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8">
            {statsSpecialites
              .sort((a, b) => b.count - a.count)
              .map((stat, index) => (
                <div key={index} className="flex flex-col gap-3 group/item">
                  <div className="flex justify-between items-end">
                    <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400 group-hover/item:text-blue-500 transition-colors uppercase tracking-wider truncate max-w-[80%]">
                      {stat.nom}
                    </span>
                    <span className="text-sm font-black text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-lg min-w-[2rem] text-center">{stat.count}</span>
                  </div>
                  <div className="h-2.5 bg-gray-200/50 dark:bg-white/5 rounded-full p-0.5 shadow-inner">
                    <div
                      className={`h-full rounded-full ${colors[index % colors.length]} shadow-lg transition-all duration-1000 ease-out group-hover/item:brightness-110 relative`}
                      style={{ width: `${(stat.count / maxCount) * 100}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            
            {medecinsSansSpecialite > 0 && (
              <div className="flex flex-col gap-3 group/item grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
                <div className="flex justify-between items-end">
                  <span className="text-[11px] font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wider">Non assigné / Généraliste</span>
                  <span className="text-sm font-black text-gray-500">{medecinsSansSpecialite}</span>
                </div>
                <div className="h-2.5 bg-gray-200/50 dark:bg-white/5 rounded-full p-0.5 shadow-inner">
                  <div
                    className="h-full rounded-full bg-gray-400 dark:bg-gray-600 transition-all duration-1000"
                    style={{ width: `${(medecinsSansSpecialite / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};