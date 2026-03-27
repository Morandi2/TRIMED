import { Users, CalendarCheck, Pill, Activity, Receipt, Shield } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      title: "Gestion des Patients",
      description: "Dossiers médicaux électroniques complets, centralisés et accessibles instantanément avec tout l'historique des soins."
    },
    {
      icon: <CalendarCheck className="w-6 h-6 text-emerald-500" />,
      title: "Rendez-vous Intelligents",
      description: "Système de réservation optimisé avec calendrier interactif et rappels automatiques pour réduire l'absentéisme."
    },
    {
      icon: <Pill className="w-6 h-6 text-amber-500" />,
      title: "Gestion Pharmacie",
      description: "Contrôle complet des stocks de l'hôpital en temps réel avec alertes de seuil et d'expiration."
    },
    {
      icon: <Activity className="w-6 h-6 text-rose-500" />,
      title: "Suivi des Consultations",
      description: "Saisie rapide des notes, signes vitaux, prescriptions et demandes d'examens lors des visites."
    },
    {
      icon: <Receipt className="w-6 h-6 text-indigo-500" />,
      title: "Facturation & Paiements",
      description: "Génération automatique de factures, suivi des paiements patients et rapports financiers clairs."
    },
    {
      icon: <Shield className="w-6 h-6 text-teal-500" />,
      title: "Sécurité & Contrôle",
      description: "Gestion granulaire des rôles (Médecins, Infirmiers, Administrateurs) avec traçabilité complète."
    }
  ];

  return (
    <section id="fonctionnalites" className="py-24 bg-slate-50 relative" data-aos="fade-up">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
           <h2 className="text-sm font-bold text-emerald-600 tracking-widest uppercase mb-3">
            Des Outils Puissants
          </h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Tout ce dont votre établissement a besoin
          </h3>
          <p className="text-lg text-slate-600">
             Une suite intégrée de modules conçue pour synchroniser chaque département de votre clinique.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100/50 hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -m-4 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
              
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3 block">
                  {feature.title}
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;