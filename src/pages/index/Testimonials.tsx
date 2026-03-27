import { Star } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      initials: 'JL',
      color: 'bg-blue-100 text-blue-600',
      name: 'Dr. Jean-Louis',
      position: 'Hôpital Universitaire de la Paix',
      text: '"TRIMEDH a complètement révolutionné notre façon de travailler. La gestion des dossiers patients est maintenant ultra fluide et nous pouvons concentrer notre énergie sur les soins, pas sur la paperasse."'
    },
    {
      initials: 'MP',
      color: 'bg-emerald-100 text-emerald-600',
      name: 'Marie L. Pierre',
      position: 'Directrice, Clinique Saint-François',
      text: '"Depuis l\'implémentation de la plateforme, nous avons réduit nos temps d\'attente de près de 60%. Nos patients adorent pouvoir interagir via les rappels automatisés."'
    },
    {
      initials: 'MA',
      color: 'bg-indigo-100 text-indigo-600',
      name: 'Dr. Marc Antoine',
      position: 'Pharmacien en Chef',
      text: '"Le module pharmacie nous a sauvé de nombreuses ruptures de stock critiques. Les alertes automatiques et l\'inventaire centralisé nous permettent de prévoir à l\'avance."'
    }
  ];

  return (
    <section id="temoignages" className="py-24 bg-slate-50 relative" data-aos="fade-up">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-sm font-bold text-blue-600 tracking-widest uppercase mb-3">
            Témoignages
          </h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Ils nous font confiance
          </h3>
          <p className="text-lg text-slate-600">
            Découvrez comment TRIMEDH aide les leaders de la santé à transformer leurs opérations au quotidien.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300">
              <div className="flex gap-1 mb-6 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-slate-600 italic mb-8 leading-relaxed text-sm">
                {test.text}
              </p>
              <div className="flex items-center gap-4 mt-auto">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${test.color}`}>
                  {test.initials}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{test.name}</h4>
                  <p className="text-slate-500 text-xs">{test.position}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
