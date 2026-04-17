import React from 'react';
import { Patient } from '../services/PatientService';
import { Users, User, Baby, UserCheck } from 'lucide-react';

interface PatientStatsProps {
  patients: Patient[];
}

export const PatientStats: React.FC<PatientStatsProps> = ({ patients }) => {
  const calculateAge = (dateNaissance: string) => {
    if (!dateNaissance) return -1; // -1 means unknown
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    if (isNaN(birthDate.getTime())) return -1;
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : -1;
  };

  const safePatients = Array.isArray(patients) ? patients : [];
  const patientsAvecAge = safePatients.filter(p => calculateAge(p.date_naissance) >= 0);

  const stats = {
    total: safePatients.length,
    masculin: safePatients.filter(p => p.sexe === "M").length,
    feminin: safePatients.filter(p => p.sexe === "F").length,
    enfants: patientsAvecAge.filter(p => calculateAge(p.date_naissance) < 18).length,
    adultes: patientsAvecAge.filter(p => calculateAge(p.date_naissance) >= 18).length
  };

  return (
    <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-5">
      {/* Total Patients */}
      <div className="bg-white dark:bg-white/[0.02] p-5 rounded-3xl border border-gray-100 dark:border-white/[0.05] shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500">
        <div className="absolute -right-2 -top-2 w-16 h-16 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors" />
        <div className="relative z-10 flex flex-col gap-3">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600">
            <Users className="h-5 w-5 stroke-[2.5px]" />
          </div>
          <div>
            <p className="text-[10px] font-black text-blue-600/60 dark:text-blue-400 uppercase tracking-widest mb-0.5">Total Patients</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{stats.total}</p>
          </div>
        </div>
      </div>

      {/* Hommes */}
      <div className="bg-white dark:bg-white/[0.02] p-5 rounded-3xl border border-gray-100 dark:border-white/[0.05] shadow-sm relative overflow-hidden group transition-all duration-500">
        <div className="relative z-10 flex flex-col gap-3">
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600">
            <User className="h-5 w-5 stroke-[2.5px]" />
          </div>
          <div>
            <p className="text-[10px] font-black text-emerald-600/60 dark:text-emerald-400 uppercase tracking-widest mb-0.5">Hommes</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{stats.masculin}</p>
          </div>
        </div>
      </div>

      {/* Femmes */}
      <div className="bg-white dark:bg-white/[0.02] p-5 rounded-3xl border border-gray-100 dark:border-white/[0.05] shadow-sm relative overflow-hidden group transition-all duration-500">
        <div className="relative z-10 flex flex-col gap-3">
          <div className="w-10 h-10 bg-pink-50 dark:bg-pink-900/20 rounded-xl flex items-center justify-center text-pink-600">
            <User className="h-5 w-5 stroke-[2.5px]" />
          </div>
          <div>
            <p className="text-[10px] font-black text-pink-600/60 dark:text-pink-400 uppercase tracking-widest mb-0.5">Femmes</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{stats.feminin}</p>
          </div>
        </div>
      </div>

      {/* Enfants */}
      <div className="bg-white dark:bg-white/[0.02] p-5 rounded-3xl border border-gray-100 dark:border-white/[0.05] shadow-sm relative overflow-hidden group transition-all duration-500">
        <div className="relative z-10 flex flex-col gap-3">
          <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center text-amber-600">
            <Baby className="h-5 w-5 stroke-[2.5px]" />
          </div>
          <div>
            <p className="text-[10px] font-black text-amber-600/60 dark:text-amber-400 uppercase tracking-widest mb-0.5">Enfants</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{stats.enfants}</p>
          </div>
        </div>
      </div>

      {/* Adultes */}
      <div className="bg-white dark:bg-white/[0.02] p-5 rounded-3xl border border-gray-100 dark:border-white/[0.05] shadow-sm relative overflow-hidden group transition-all duration-500">
        <div className="relative z-10 flex flex-col gap-3">
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600">
            <UserCheck className="h-5 w-5 stroke-[2.5px]" />
          </div>
          <div>
            <p className="text-[10px] font-black text-indigo-600/60 dark:text-indigo-400 uppercase tracking-widest mb-0.5">Adultes</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{stats.adultes}</p>
          </div>
        </div>
      </div>
    </div>
  );
};