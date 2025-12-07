import React from 'react';
import { Link } from 'react-router';
import { UserRound, Stethoscope, Asterisk } from 'lucide-react';

export const TechnicienDashboard: React.FC = () => {
  const modules = [
    { name: 'Patients', path: '/patient', icon: <UserRound className="w-8 h-8" />, color: 'bg-blue-500' },
    { name: 'Consultations', path: '/consultation', icon: <Stethoscope className="w-8 h-8" />, color: 'bg-green-500' },
    { name: 'Ordonnances', path: '/ordonnance', icon: <Asterisk className="w-8 h-8" />, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Bienvenue Technicien(ne)</h2>
        <p className="text-gray-600 dark:text-gray-400">Enregistrez les résultats de tests et analyses</p>
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
