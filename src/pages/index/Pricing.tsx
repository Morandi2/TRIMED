// components/Pricing.tsx
import { Check } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: 'Basique',
      description: 'Parfait pour les petites cliniques',
      price: '5 000',
      period: 'HTG/mois',
      popular: false,
      features: [
        { included: true, text: "Jusqu'à 500 patients actifs" },
        { included: true, text: 'Gestion des rendez-vous' },
        { included: true, text: 'Dossiers patients de base' },
        { included: false, text: 'Application mobile' },
        { included: false, text: 'Support prioritaire' }
      ],
      buttonText: 'Commencer',
      primary: false
    },
    {
      name: 'Professionnel',
      description: 'Idéal pour les hôpitaux moyens',
      price: '10 000',
      period: 'HTG/mois',
      popular: true,
      features: [
        { included: true, text: 'Patients illimités' },
        { included: true, text: 'Toutes les fonctionnalités' },
        { included: true, text: 'Application mobile incluse' },
        { included: true, text: 'Support prioritaire 24/7' },
        { included: true, text: 'Formation sur mesure' }
      ],
      buttonText: 'Essai Gratuit 30 Jours',
      primary: true
    },
    {
      name: 'Entreprise',
      description: 'Pour les grands ensembles',
      price: '15 000',
      period: 'HTG/mois',
      popular: false,
      features: [
        { included: true, text: 'Multi-établissements' },
        { included: true, text: 'API personnalisée' },
        { included: true, text: 'Formation sur site' },
        { included: true, text: 'Gestionnaire Dédié' },
        { included: true, text: 'Analytics avancés' }
      ],
      buttonText: 'Nous Contacter',
      primary: false
    }
  ];

  const includedFeatures = [
    'Déploiement gratuit',
    'Sécurité des données',
    'Mises à jour incluses',
    'Support technique'
  ];

  return (
    <section id="prix" className="py-24 bg-white relative" data-aos="fade-up">
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-slate-50 -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-sm font-bold text-indigo-600 tracking-widest uppercase mb-3">
            Investissement Rentable
          </h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Des tarifs adaptés à chaque établissement
          </h3>
          <p className="text-lg text-slate-600">
            Choisissez la formule qui correspond parfaitement aux objectifs de votre hôpital, sans frais cachés.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`relative bg-white rounded-3xl p-8 transition-all duration-300 ${
                plan.popular 
                  ? 'ring-2 ring-blue-600 shadow-xl scale-100 lg:scale-105 z-10' 
                  : 'border border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide shadow-sm">
                    Recommandé
                  </span>
                </div>
              )}
              
              <div className="mb-8 border-b border-slate-100 pb-8">
                <h4 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h4>
                <p className="text-slate-500 text-sm h-10">{plan.description}</p>
                <div className="mt-6 flex flex-col items-center sm:items-baseline sm:flex-row text-slate-900 justify-center sm:justify-start">
                  <span className="text-4xl lg:text-5xl font-extrabold tracking-tight">{plan.price}</span>
                  <span className="text-slate-500 sm:ml-2 mt-1 font-medium">{plan.period}</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className={`mt-0.5 rounded-full p-0.5 ${feature.included ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-300'}`}>
                      <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    </div>
                    <span className={feature.included ? 'text-slate-700 font-medium' : 'text-slate-400'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
              
              <button className={`w-full py-3.5 rounded-xl font-bold transition-all ${
                plan.popular
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20'
                  : 'bg-slate-50 text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}>
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center bg-slate-50 rounded-2xl p-6 border border-slate-100 max-w-4xl mx-auto">
          <p className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Tous les forfaits incluent</p>
          <div className="flex flex-wrap gap-4 sm:gap-8 justify-center">
            {includedFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;