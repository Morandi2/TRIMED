import React from 'react';
import { 
  Pill, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle 
} from 'lucide-react';
import { Medicament } from '../types/MedicamentTypes';

interface MedicamentStatsProps {
  medicaments: Medicament[];
}

export const MedicamentStats: React.FC<MedicamentStatsProps> = ({ medicaments }) => {
  const safeMedicaments = Array.isArray(medicaments) ? medicaments : [];
  
  const stats = {
    total: safeMedicaments.length,
    disponible: safeMedicaments.filter(m => m.statut_stock?.niveau === "normal").length,
    stockBas: safeMedicaments.filter(m => m.statut_stock?.niveau === "faible").length,
    rupture: safeMedicaments.filter(m => m.statut_stock?.niveau === "rupture").length
  };

  const statCards = [
    {
      label: 'Total Produits',
      value: stats.total,
      icon: Pill,
      gradient: 'from-blue-500/10 to-blue-600/5',
      iconColor: 'text-blue-600',
    },
    {
      label: 'En Stock',
      value: stats.disponible,
      icon: CheckCircle2,
      gradient: 'from-green-500/10 to-green-600/5',
      iconColor: 'text-green-600',
    },
    {
      label: 'Stock Bas',
      value: stats.stockBas,
      icon: AlertTriangle,
      gradient: 'from-amber-500/10 to-amber-600/5',
      iconColor: 'text-amber-600',
    },
    {
      label: 'Rupture',
      value: stats.rupture,
      icon: XCircle,
      gradient: 'from-red-500/10 to-red-600/5',
      iconColor: 'text-red-600',
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