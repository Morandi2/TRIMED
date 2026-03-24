import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { HospitalConfig } from '../types/ConfigTypes';

interface Props {
 config: Partial<HospitalConfig>;
 setConfig: React.Dispatch<React.SetStateAction<Partial<HospitalConfig>>>;
}

interface Service {
 id: string;
 nom: string;
 description: string;
 enabled: boolean;
}

export const ServicesConfigStep: React.FC<Props> = ({ config: _config, setConfig: _setConfig }) => {
 const [services, setServices] = useState<Service[]>([
 { id: 'consultation', nom: 'Consultations', description: 'Consultations médicales générales', enabled: true },
 { id: 'urgence', nom: 'Urgences', description: 'Service d\'urgences 24/7', enabled: true },
 { id: 'chirurgie', nom: 'Chirurgie', description: 'Interventions chirurgicales', enabled: true },
 { id: 'laboratoire', nom: 'Laboratoire', description: 'Analyses et tests médicaux', enabled: true },
 { id: 'radiologie', nom: 'Radiologie', description: 'Imagerie médicale', enabled: false },
 { id: 'pharmacie', nom: 'Pharmacie', description: 'Dispensation de médicaments', enabled: true },
 { id: 'maternite', nom: 'Maternité', description: 'Soins obstétriques', enabled: false },
 { id: 'pediatrie', nom: 'Pédiatrie', description: 'Soins pédiatriques', enabled: true },
 { id: 'cardiologie', nom: 'Cardiologie', description: 'Soins cardiaques', enabled: false },
 { id: 'dentaire', nom: 'Dentaire', description: 'Soins dentaires', enabled: false },
 ]);

 const toggleService = (id: string) => {
 setServices((prev) =>
 prev.map((service) =>
 service.id === id ? { ...service, enabled: !service.enabled } : service
 )
 );
 };

 return (
 <div className="space-y-6">
 <div>
 <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
 Services Médicaux
 </h2>
 <p className="text-gray-600 dark:text-gray-400">
 Sélectionnez les services disponibles dans votre hôpital
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {services.map((service) => (
 <div
 key={service.id}
 onClick={() => toggleService(service.id)}
 className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${service.enabled
 ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
 : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
 }`}
 >
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
 {service.nom}
 </h3>
 <p className="text-sm text-gray-600 dark:text-gray-400">
 {service.description}
 </p>
 </div>
 <div
 className={`w-6 h-6 rounded-full flex items-center justify-center ${service.enabled
 ? 'bg-blue-600 text-white'
 : 'border-2 border-gray-300 dark:border-gray-600'
 }`}
 >
 {service.enabled && <Check className="w-4 h-4" />}
 </div>
 </div>
 </div>
 ))}
 </div>

 <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
 <p className="text-sm text-green-800 dark:text-green-300">
 <strong>Services sélectionnés:</strong>{' '}
 {services.filter((s) => s.enabled).length} / {services.length}
 </p>
 <p className="text-xs text-green-700 dark:text-green-400 mt-1">
 Vous pourrez ajouter ou modifier ces services plus tard dans les paramètres
 </p>
 </div>
 </div>
 );
};
