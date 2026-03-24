const FeaturesSection = () => {
  const features = [
    {
      title: "Gestion des Patients",
      description: "Dossiers médicaux électroniques complets avec historique des soins"
    },
    {
      title: "Rendez-vous Intelligents",
      description: "Système de réservation optimisé avec rappels automatiques"
    },
    {
      title: "Gestion Pharmacie",
      description: "Contrôle complet des stocks avec alertes d'expiration"
    }
  ];

  return (
    <section id="fonctionnalites" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Fonctionnalités Complètes
          </h2>
          <p className="text-xl text-gray-600">
            Tout ce dont votre établissement de santé a besoin
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;