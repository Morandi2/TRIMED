import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Building2, Users, Stethoscope, Check } from 'lucide-react';
import { useTenant } from '../../../context/TenantContext';
import { HospitalInfoStep } from './components/HospitalInfoStep';
import { BranchConfigStep } from './components/BranchConfigStep';
import { ServicesConfigStep } from './components/ServicesConfigStep';
import { HospitalConfig } from './types/ConfigTypes';

const steps = [
  { id: 1, title: 'Informations Hôpital', icon: Building2, description: 'Informations de base' },
  { id: 2, title: 'Branches & Capacité', icon: Users, description: 'Configuration des branches' },
  { id: 3, title: 'Services Médicaux', icon: Stethoscope, description: 'Services disponibles' },
];

export const ConfigurationWizard: React.FC = () => {
  const navigate = useNavigate();
  const { setTenantConfig } = useTenant();
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState<Partial<HospitalConfig>>({
    branches: [],
    couleur_principale: '#0066CC',
    langue_defaut: 'fr',
    fuseau_horaire: 'America/Port-au-Prince',
    devise: 'HTG',
    format_date: 'DD/MM/YYYY',
  });

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Sauvegarder config tenant
      const tenantConfig = {
        tenant_id: 1, // TODO: Récupérer depuis API
        nom: config.nom || '',
        logo: config.logo,
        couleur_principale: config.couleur_principale || '#0066CC',
        langue_defaut: config.langue_defaut || 'fr',
        devise: config.devise || 'HTG',
        fuseau_horaire: config.fuseau_horaire || 'America/Port-au-Prince',
        is_configured: true,
      };
      
      setTenantConfig(tenantConfig);
      
      // TODO: Envoyer à l'API
      // await configService.saveConfig(config);
      
      alert('Configuration enregistrée avec succès! Redirection vers le dashboard...');
      navigate('/home');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ⚙️ Configuration Initiale
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configurez votre hôpital en quelques étapes simples
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-500 dark:bg-gray-700'
                      }`}
                    >
                      {isCompleted ? <Check className="w-6 h-6" /> : <StepIcon className="w-6 h-6" />}
                    </div>
                    <p
                      className={`text-sm font-medium ${
                        isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-4 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
          {currentStep === 1 && <HospitalInfoStep config={config} setConfig={setConfig} />}
          {currentStep === 2 && <BranchConfigStep config={config} setConfig={setConfig} />}
          {currentStep === 3 && <ServicesConfigStep config={config} setConfig={setConfig} />}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>

          {currentStep < steps.length ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Terminer la Configuration
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
