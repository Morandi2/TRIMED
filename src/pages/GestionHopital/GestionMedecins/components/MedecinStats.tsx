import React from 'react';
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
  
  // Statistiques par spécialité
  const statsSpecialites = safeSpecialites.map(specialite => ({
    nom: specialite.nom_specialite,
    count: safeMedecins.filter(m => m.specialite_principale_id === specialite.specialite_id).length
  }));

  const medecinsSansSpecialite = safeMedecins.filter(m => !m.specialite_principale_id).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total médecins */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total médecins</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalMedecins}</p>
          </div>
        </div>
      </div>

      {/* Médecins hommes */}
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hommes</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{medecinsHommes}</p>
          </div>
        </div>
      </div>

      {/* Médecins femmes */}
      <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-pink-100 dark:bg-pink-800 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Femmes</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{medecinsFemmes}</p>
          </div>
        </div>
      </div>

      {/* Spécialités */}
      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Spécialités</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{specialites.length}</p>
          </div>
        </div>
      </div>

      {/* Répartition par spécialité */}
      {statsSpecialites.length > 0 && (
        <div className="col-span-full">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Répartition par spécialité
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {statsSpecialites.map((stat, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-center">
                <p className="text-xs text-gray-600 dark:text-gray-400">{stat.nom}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{stat.count}</p>
              </div>
            ))}
            {medecinsSansSpecialite > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-center">
                <p className="text-xs text-gray-600 dark:text-gray-400">Sans spécialité</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{medecinsSansSpecialite}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};