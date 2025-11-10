// components/WhyTrimed.js

const WhyTrimed = () => {
  const features = [
    {
      icon: 'bolt',
      title: 'Déploiement Rapide',
      description: 'Mise en service en 24 heures maximum. Aucune interruption de vos activités.'
    },
    {
      icon: 'cloud',
      title: 'SaaS Cloud Local',
      description: 'Hébergé en Haïti pour une latence minimale et une conformité aux données locales.'
    },
    {
      icon: 'mobile-alt',
      title: 'Fonctionne Hors-ligne',
      description: 'Continuez à travailler même pendant les coupures de courant ou internet.'
    }
  ];

  return (
    <>

        <section className="why-section bg-gray-50 py-20">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="section-header text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Pourquoi Choisir TRIMED ?</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Une solution conçue par des Haïtiens, pour les défis spécifiques du système de santé haïtien
              </p>
            </div>

            <div className="features-grid grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="feature-card bg-white p-8 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all hover:-translate-y-2 text-center">
                  <div className="feature-icon w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-6 text-emerald-500 text-2xl">
                    <i className={`fas fa-${feature.icon}`}></i>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
     






    </>
  );
};

export default WhyTrimed;