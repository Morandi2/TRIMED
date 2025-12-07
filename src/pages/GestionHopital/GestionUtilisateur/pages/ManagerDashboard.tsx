import React from 'react';
import { Link } from 'react-router';
import { UserRound, ScanHeart, Stethoscope, Asterisk, Pill, CalendarPlus2, Calendar, CreditCard, BarChart3 } from 'lucide-react';

export const ManagerDashboard: React.FC = () => {
  const modules = [
    { name: 'Patients', path: '/patient', icon: <UserRound className="w-8 h-8" />, color: 'bg-blue-500' },
    { name: 'Médecins', path: '/medecin', icon: <ScanHeart className="w-8 h-8" />, color: 'bg-teal-500' },
    { name: 'Médicaments', path: '/medicament', icon: <Pill className="w-8 h-8" />, color: 'bg-pink-500' },
    { name: 'Rendez-vous', path: '/rendezvous', icon: <CalendarPlus2 className="w-8 h-8" />, color: 'bg-orange-500' },
    { name: 'Calendrier', path: '/calendar', icon: <Calendar className="w-8 h-8" />, color: 'bg-indigo-500' },
    { name: 'Utilisateurs', path: '/Utilisateur', icon: <BarChart3 className="w-8 h-8" />, color: 'bg-gray-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Bienvenue Manager</h2>
        <p className="text-gray-600 dark:text-gray-400">Supervisez les services et gérez le personnel</p>
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
