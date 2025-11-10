// components/Pricing.js
import React from 'react';

const Pricing = () => {
  const plans = [
    {
      name: 'Basique',
      description: 'Parfait pour les petites cliniques',
      price: '$99',
      period: '/mois',
      popular: false,
      features: [
        { included: true, text: 'Jusqu\'à 500 patients actifs' },
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
      price: '$199',
      period: '/mois',
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
      description: 'Pour les grands hôpitaux',
      price: '$399',
      period: '/mois',
      popular: false,
      features: [
        { included: true, text: 'Multi-établissements' },
        { included: true, text: 'API personnalisée' },
        { included: true, text: 'Formation sur site' },
        { included: true, text: 'Dédiée Manager' },
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
    <section id="prix" className="pricing-section bg-white py-20">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-header text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Des tarifs adaptés à chaque établissement</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choisissez la formule qui correspond parfaitement aux besoins et à la taille de votre hôpital
          </p>
        </div>

        <div className="pricing-grid grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <div key={index} className={`pricing-card bg-gray-50 p-8 rounded-xl border-2 transition-all hover:-translate-y-2 ${
              plan.popular 
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-emerald-500 scale-105' 
                : 'border-gray-200 hover:border-emerald-300'
            } relative`}>
              
              {plan.popular && (
                <div className="popular-badge absolute -top-3 right-6 bg-sky-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Plus Populaire
                </div>
              )}
              
              <div className="pricing-header text-center mb-8">
                <h3 className="text-2xl text-black font-bold mb-2">{plan.name}</h3>
                <p className={plan.popular ? 'text-emerald-100' : 'text-gray-600'}>{plan.description}</p>
              </div>
              
              <div className="pricing-price text-center mb-8">
                <span className="price text-5xl text-black font-bold">{plan.price}</span>
                <span className={`period text-lg ${plan.popular ? 'text-emerald-100' : 'text-gray-600'}`}>{plan.period}</span>
              </div>
              
              <ul className="pricing-features space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className={`flex items-center gap-3 ${
                    feature.included 
                      ? plan.popular ? 'text-white' : 'text-gray-900' 
                      : 'text-gray-400 line-through'
                  }`}>
                    <i className={`fas fa-${feature.included ? 'check' : 'times'} ${
                      feature.included 
                        ? plan.popular ? 'text-green-200' : 'text-emerald-500'
                        : 'text-gray-400'
                    }`}></i>
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>
              
              <button className={`pricing-btn w-full py-4 rounded-lg font-semibold transition-all ${
                plan.primary
                  ? 'bg-white text-emerald-600 hover:bg-gray-100'
                  : plan.popular
                  ? 'bg-white text-emerald-600 hover:bg-gray-100'
                  : 'bg-white text-gray-900 border border-gray-300 hover:bg-emerald-500 hover:text-white hover:border-emerald-500'
              }`}>
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        <div className="pricing-footer text-center">
          <p className="text-lg text-gray-900 mb-6">Tous les forfaits incluent :</p>
          <div className="included-features flex flex-wrap gap-6 justify-center">
            {includedFeatures.map((feature, index) => (
              <div key={index} className="included-feature flex items-center gap-2 text-gray-600">
                <i className="fas fa-check text-emerald-500"></i>
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