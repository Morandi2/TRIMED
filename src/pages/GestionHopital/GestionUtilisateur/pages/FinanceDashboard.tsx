import React from 'react';
import { Link } from 'react-router';
import { UserRound, CreditCard, BarChart3 } from 'lucide-react';

export const FinanceDashboard: React.FC = () => {
  const modules = [
    { name: 'Patients', path: '/patient', icon: <UserRound className="w-8 h-8" />, color: 'bg-blue-500' },
    { name: 'Paiements', path: '/paiement', icon: <CreditCard className="w-8 h-8" />, color: 'bg-green-500' },
    { name: 'Rapports', path: '/home', icon: <BarChart3 className="w-8 h-8" />, color: 'bg-gray-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Bienvenue Service Finance</h2>
        <p className="text-gray-600 dark:text-gray-400">Gérez les paiements et la facturation</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <Link
            key={module.path}
            to={module.path}
            className="group rounded-lg border border-gray-200 bg-white p-6 transition-all hover:shadow-lg dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <div className={`inline-flex rounded-lg ${module.color} p-3 text-white mb-4`}>
              {module.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {module.name}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  );
};
