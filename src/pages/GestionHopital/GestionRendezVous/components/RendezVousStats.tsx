import React from 'react';
import { 
  Calendar,
  Clock,
  CalendarDays,
  BadgeCheck
} from 'lucide-react';
import { RendezVousStats as IRendezVousStats } from '../types/RendezVousTypes';

interface RendezVousStatsProps {
  stats: IRendezVousStats;
}

export const RendezVousStats: React.FC<RendezVousStatsProps> = ({ stats }) => {
  const statCards = [
    {
      label: 'Total Rendez-vous',
      value: stats.total,
      icon: Calendar,
      color: 'blue',
      gradient: 'from-blue-500/10 to-blue-600/5',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Aujourd\'hui',
      value: stats.aujourdhui,
      icon: CalendarDays,
      color: 'purple',
      gradient: 'from-purple-500/10 to-purple-600/5',
      iconColor: 'text-purple-600',
    },
    {
      label: 'Confirmés',
      value: stats.confirme,
      icon: BadgeCheck,
      color: 'green',
      gradient: 'from-green-500/10 to-green-600/5',
      iconColor: 'text-green-600',
    },
    {
      label: 'En attente / Planifié',
      value: stats.programme,
      icon: Clock,
      color: 'amber',
      gradient: 'from-amber-500/10 to-amber-600/5',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((card, index) => (
        <div 
          key={index}
          className={`relative overflow-hidden rounded-3xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-white/[0.03] backdrop-blur-xl p-6 shadow-sm group hover:shadow-md transition-all duration-300`}
        >
          <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.gradient} rounded-bl-[100px] -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform duration-500`} />
          
          <div className="relative flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-gray-800 shadow-sm transition-transform duration-300 group-hover:scale-110`}>
              <card.icon className={`h-6 w-6 ${card.iconColor}`} />
            </div>
            
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
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
