import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { 
  Building2, 
  Users, 
  Stethoscope, 
  Check, 
  LayoutGrid, 
  UserPlus, 
  Settings2,
  ShieldCheck,
  Activity,
  Beaker,
  Pill,
  CreditCard,
  BedDouble
} from 'lucide-react';
import { useTenant } from '../../../context/TenantContext';
import { HospitalInfoStep } from './components/HospitalInfoStep';
import { BranchConfigStep } from './components/BranchConfigStep';
import { PhysicalLayoutStep } from './components/PhysicalLayoutStep';
import { StaffSetupStep } from './components/StaffSetupStep';
import { ServicesConfigStep } from './components/ServicesConfigStep';
import { HospitalConfig } from './types/ConfigTypes';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../../components/ui/button/Button';

const steps = [
  { id: 1, title: 'Hôpital', icon: Building2, description: 'Identité visuelle' },
  { id: 2, title: 'Structure', icon: LayoutGrid, description: 'Départements' },
  { id: 3, title: 'Physique', icon: BedDouble, description: 'Lits & Chambres' },
  { id: 4, title: 'Personnel', icon: UserPlus, description: 'Rôles & Staff' },
  { id: 5, title: 'Système', icon: Settings2, description: 'Configuration' },
];

const ModuleCard = ({ title, icon: Icon, color }: { title: string, icon: any, color: string }) => (
  <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border border-white/20 dark:border-gray-800 p-4 rounded-2xl flex items-center gap-4 transition-all hover:scale-105 hover:bg-white/60 dark:hover:bg-gray-900/60 shadow-lg shadow-black/5 group">
    <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-90 flex items-center justify-center group-hover:scale-110 transition-transform`}>
      <Icon className="w-5 h-5" />
    </div>
    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{title}</span>
  </div>
);

export const ConfigurationWizard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setTenantConfig } = useTenant();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [config, setConfig] = useState<Partial<HospitalConfig>>({
    branches: [],
    couleur_principale: '#2D32FF',
    langue_defaut: 'fr',
    fuseau_horaire: 'America/Port-au-Prince',
    devise: 'HTG',
    format_date: 'DD/MM/YYYY',
  });

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleComplete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const tenantConfig = {
        tenant_id: user?.hopital_id || 1, 
        nom: config.nom || '',
        logo: config.logo,
        couleur_principale: config.couleur_principale || '#2D32FF',
        langue_defaut: config.langue_defaut || 'fr',
        devise: config.devise || 'HTG',
        fuseau_horaire: config.fuseau_horaire || 'America/Port-au-Prince',
        is_configured: true,
      };

      setTenantConfig(tenantConfig);
      const { hospitalApi } = await import('../../../api/hospitalApi');
      const result = await hospitalApi.config.saveConfig(config);

      if (result.success) {
        navigate('/home');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 lg:p-12 bg-gray-50 dark:bg-gray-950 overflow-hidden font-sans">
      {/* Immersive Background Structure */}
      <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-[#2D32FF]/10 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[70%] h-[70%] bg-[#00D06C]/10 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          {/* Subtle ERD Overlay Mapping */}
          <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1]" style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10 L40 10 L40 40 L10 40 Z M60 60 L90 60 L90 90 L60 90 Z M40 25 L60 75' stroke='%232D32FF' fill='none' /%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px' 
          }}></div>
      </div>

      {/* Background Module Visuals (SaaS Architecture View) */}
      <div className="hidden xl:grid absolute inset-0 z-10 grid-cols-4 grid-rows-4 gap-8 p-12 pointer-events-none opacity-40">
        <div className="col-start-1 row-start-1"><ModuleCard title="Sécurité" icon={ShieldCheck} color="bg-blue-500" /></div>
        <div className="col-start-4 row-start-1 text-right"><ModuleCard title="Médical" icon={Activity} color="bg-green-500" /></div>
        <div className="col-start-1 row-start-4"><ModuleCard title="Pharmacie" icon={Pill} color="bg-purple-500" /></div>
        <div className="col-start-4 row-start-4 text-right"><ModuleCard title="Facturation" icon={CreditCard} color="bg-orange-500" /></div>
        <div className="col-start-1 row-start-2 ml-10"><ModuleCard title="Laboratoire" icon={Beaker} color="bg-indigo-500" /></div>
      </div>

      {/* Main Wizard Card */}
      <div className="relative z-20 w-full max-w-[900px] animate-in fade-in zoom-in-95 duration-1000">
        <div className="bg-white/70 dark:bg-gray-900/80 backdrop-blur-3xl rounded-[2.5rem] border border-white dark:border-gray-800 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] overflow-hidden">
          
          <div className="flex flex-col lg:flex-row min-h-[600px]">
            {/* Sidebar Steps */}
            <div className="lg:w-72 bg-gray-50/50 dark:bg-gray-800/20 border-r border-gray-100 dark:border-gray-800 p-8 flex flex-col justify-between">
              <div>
                <img src="/images/logo/logo.svg" alt="TRIMED" className="h-8 w-auto mb-12" />
                <nav className="space-y-6">
                  {steps.map((step) => {
                    const Icon = step.icon;
                    const isActive = currentStep === step.id;
                    const isDone = currentStep > step.id;
                    return (
                      <div key={step.id} className="group flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 border-2 ${
                          isActive ? "bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/20" : 
                          isDone ? "bg-green-500 border-green-500 text-white" : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-400"
                        }`}>
                          {isDone ? <Check size={18} /> : <Icon size={18} />}
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? "text-brand-600 dark:text-brand-400" : isDone ? "text-green-600" : "text-gray-400"}`}>
                            {step.title}
                          </span>
                          <span className="text-[10px] text-gray-500 dark:text-gray-500 leading-none mt-1">{step.description}</span>
                        </div>
                      </div>
                    )
                  })}
                </nav>
              </div>

              <div className="pt-8 mt-8 border-t border-gray-200 dark:border-gray-800">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                  Initialization Mode
                </p>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col p-8 lg:p-12 justify-between">
              <div className="animate-in slide-in-from-right-4 duration-500">
                <div className="mb-10">
                  <span className="text-[10px] font-bold text-brand-500 uppercase tracking-widest bg-brand-500/10 px-2.5 py-1 rounded-full mb-3 inline-block">
                    Étape {currentStep} sur {steps.length}
                  </span>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {steps[currentStep - 1].title}
                  </h1>
                </div>

                <div className="min-h-[300px]">
                  {currentStep === 1 && <HospitalInfoStep config={config} setConfig={setConfig} />}
                  {currentStep === 2 && <BranchConfigStep config={config} setConfig={setConfig} />}
                  {currentStep === 3 && <PhysicalLayoutStep config={config} setConfig={setConfig} />}
                  {currentStep === 4 && <StaffSetupStep config={config} setConfig={setConfig} />}
                  {currentStep === 5 && <ServicesConfigStep config={config} setConfig={setConfig} />}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-4 mt-12 pt-8 border-t border-gray-50 dark:border-gray-800/50">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="flex-1 px-6 py-4 border border-gray-200 dark:border-gray-800 rounded-2xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-30"
                >
                  Précédent
                </button>

                {currentStep < steps.length ? (
                  <Button
                    onClick={handleNext}
                    className="flex-[2] py-4 shadow-xl shadow-brand-500/10"
                  >
                    Suivant
                  </Button>
                ) : (
                  <Button
                    onClick={handleComplete}
                    disabled={isSubmitting}
                    className="flex-[2] py-4 bg-green-500 hover:bg-green-600 shadow-xl shadow-green-500/10"
                  >
                    {isSubmitting ? 'Initialisation...' : 'Activer le Système'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationWizard;
