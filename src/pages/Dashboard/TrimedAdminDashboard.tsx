import React from "react";
import { Building2, Users, Activity, CreditCard, UserCheck, Clock, AlertCircle, ArrowUpRight } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";

export default function TrimedAdminDashboard() {
  const stats = [
    { name: "Total Hôpitaux", value: "24", icon: Building2, color: "blue", change: "+12%" },
    { name: "Utilisateurs Actifs", value: "1,432", icon: Users, color: "purple", change: "+8%" },
    { name: "Abonnements Pro", value: "18", icon: CreditCard, color: "green", change: "+4%" },
    { name: "En Attente", value: "3", icon: Clock, color: "orange", change: "" },
  ];

  const recentHospitals = [
    { id: 1, name: "Hôpital Sacré-Cœur", date: "2 heures", status: "actif", plan: "Premium" },
    { id: 2, name: "Clinique Espoir", date: "5 heures", status: "en_attente", plan: "Basic" },
    { id: 3, name: "Hôpital Universitaire de la Paix", date: "Hier", status: "actif", plan: "Standard" },
  ];

  return (
    <>
      <PageMeta
        title="Admin Portal | TRIMED"
        description="Portail d'administration globale de l'écosystème TRIMED."
      />

      <div className="space-y-8 font-outfit">
        {/* Header Banner */}
        <div className="relative p-8 rounded-3xl bg-gradient-to-r from-brand-600 to-indigo-600 overflow-hidden shadow-2xl shadow-brand-500/20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="absolute right-0 top-0 h-full w-1/2 bg-white/10 skew-x-12 translate-x-20" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Bienvenue, Admin TRIMED</h1>
              <p className="text-brand-100 opacity-90 max-w-xl">Supervision globale du réseau hospitalier, gestion des licences et monitoring des performances système.</p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-3">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-white text-sm font-medium">
                <Activity className="w-4 h-4 text-green-300 animate-pulse" />
                Système Opérationnel
              </div>
            </div>
          </div>
        </div>

        {/* Metric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.name} 
                className="group bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200/60 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-in zoom-in-95 duration-500"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-xl ${
                    stat.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                    stat.color === 'purple' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' :
                    stat.color === 'green' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                    'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                  } group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  {stat.change && (
                    <span className="flex items-center text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
                      <ArrowUpRight className="w-3 h-3 mr-0.5" /> {stat.change}
                    </span>
                  )}
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Recent Hospitals */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/60 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="font-bold text-gray-900 dark:text-white">Dernières Inscriptions</h2>
              <button className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">Voir tout</button>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentHospitals.map(hospital => (
                <div key={hospital.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-brand-500">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{hospital.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Plan {hospital.plan} • Il y a {hospital.date}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    hospital.status === 'actif' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {hospital.status === 'actif' ? 'Actif' : 'En Attente'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Tasks / Quick Actions */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/60 dark:border-gray-800 p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 dark:text-white mb-6">Raccourcis Administratifs</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-brand-300 dark:hover:border-brand-800 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition-all group text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-lg group-hover:scale-110 transition-transform">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Valider les comptes</span>
                </div>
                <span className="text-xs font-bold bg-brand-500 text-white px-2 py-0.5 rounded-md">3</span>
              </button>

              <button className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-800 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-all group text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg group-hover:scale-110 transition-transform">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Journal d'Alertes</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
