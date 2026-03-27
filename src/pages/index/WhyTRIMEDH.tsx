import { Zap, Cloud, Smartphone } from 'lucide-react';

const WhyTRIMEDH = () => {
  const features = [
    {
      icon: <Zap className="w-8 h-8 text-blue-600" />,
      title: 'Déploiement Rapide',
      description: 'Mise en service en 24 heures maximum. Aucune interruption de vos activités courantes.'
    },
    {
      icon: <Cloud className="w-8 h-8 text-emerald-500" />,
      title: 'SaaS Cloud Sécurisé',
      description: 'Hébergement hautement sécurisé pour une latence minimale et une conformité totale aux normes locales.'
    },
    {
      icon: <Smartphone className="w-8 h-8 text-indigo-500" />,
      title: 'Haute Disponibilité',
      description: 'Accédez à votre plateforme partout, sur n\'importe quel appareil, de façon fluide et synchronisée.'
    }
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden" id="solutions" data-aos="fade-up">
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-sm font-bold text-blue-600 tracking-widest uppercase mb-3">
            La Différence
          </h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Pourquoi Choisir TRIMEDH ?
          </h3>
          <p className="text-lg text-slate-600 leading-relaxed">
            Une solution SaaS conçue spécifiquement pour répondre aux défis et aux exigences des hôpitaux et cliniques modernes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-50 transition-transform duration-300">
                {feature.icon}
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyTRIMEDH;
