import React from 'react';
import { Link } from "react-router-dom";
import { CalendarPlus2, FileText, MessageSquare, CreditCard, Download } from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const modules = [
    { name: 'Mes Rendez-vous', path: '/rendezvous', icon: <CalendarPlus2 className="w-8 h-8" />, color: 'bg-orange-500' },
    { name: 'Mes Prescriptions', path: '/ordonnance', icon: <FileText className="w-8 h-8" />, color: 'bg-purple-500' },
    { name: 'Résultats Tests', path: '/consultation', icon: <Download className="w-8 h-8" />, color: 'bg-green-500' },
    { name: 'Messages', path: '/home', icon: <MessageSquare className="w-8 h-8" />, color: 'bg-blue-500' },
    { name: 'Mes Factures', path: '/paiement', icon: <CreditCard className="w-8 h-8" />, color: 'bg-green-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Bienvenue Patient</h2>
        <p className="text-gray-600 dark:text-gray-400">Consultez vos informations médicales et gérez vos rendez-vous</p>
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
