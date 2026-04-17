import React from 'react';
import { 
  FileText, 
  Sun, 
  Calendar, 
  BarChart3 
} from 'lucide-react';
import { Ordonnance } from '../services/OrdonnanceService';

interface OrdonnanceStatsProps {
  ordonnances: Ordonnance[];
}

export const OrdonnanceStats: React.FC<OrdonnanceStatsProps> = ({ ordonnances }) => {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const isValidDate = (dateStr: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return !isNaN(d.getTime());
  };

  const statsCount = {
    total: ordonnances.length,
    aujourdhui: ordonnances.filter(o => isValidDate(o.date_ordonnance) && new Date(o.date_ordonnance) >= startOfDay).length,
    semaine: ordonnances.filter(o => isValidDate(o.date_ordonnance) && new Date(o.date_ordonnance) >= startOfWeek).length,
    mois: ordonnances.filter(o => isValidDate(o.date_ordonnance) && new Date(o.date_ordonnance) >= startOfMonth).length
  };

  const statCards = [
    {
      label: 'Total Ordonnances',
      value: statsCount.total,
      icon: FileText,
      gradient: 'from-blue-500/10 to-blue-600/5',
      iconColor: 'text-blue-600',
    },
    {
      label: "Aujourd'hui",
      value: statsCount.aujourdhui,
      icon: Sun,
      gradient: 'from-orange-500/10 to-orange-600/5',
      iconColor: 'text-orange-600',
    },
    {
      label: 'Cette Semaine',
      value: statsCount.semaine,
      icon: Calendar,
      gradient: 'from-purple-500/10 to-purple-600/5',
      iconColor: 'text-purple-600',
    },
    {
      label: 'Ce Mois',
      value: statsCount.mois,
      icon: BarChart3,
      gradient: 'from-green-500/10 to-green-600/5',
      iconColor: 'text-green-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((card, index) => (
        <div 
          key={index}
          className="relative overflow-hidden rounded-3xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-white/[0.03] backdrop-blur-xl p-6 shadow-sm group hover:shadow-md transition-all duration-300"
        >
          <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.gradient} rounded-bl-[100px] -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform duration-500`} />
          
          <div className="relative flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-gray-800 shadow-sm transition-transform duration-300 group-hover:scale-110">
              <card.icon className={`h-6 w-6 ${card.iconColor}`} />
            </div>
            
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-0.5">
                {card.label}
              </p>
              <h4 className="text-2xl font-black text-gray-900 dark:text-white">
                {card.value}
              </h4>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};