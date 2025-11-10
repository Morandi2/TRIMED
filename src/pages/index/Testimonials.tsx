// components/Testimonials.js
import React from 'react';

const Testimonials = () => {
  const testimonials = [
    {
      avatar: 'user-md',
      name: 'Dr. Jean-Louis',
      position: 'Hôpital Universitaire de la Paix',
      rating: 5,
      text: '"TRIMED a révolutionné notre façon de travailler. La gestion des patients est maintenant fluide et nous pouvons concentrer notre énergie sur les soins plutôt que sur l\'administration."'
    },
    {
      avatar: 'user-nurse',
      name: 'Marie L. Pierre',
      position: 'Directrice, Clinique Saint-François',
      rating: 5,
      text: '"Depuis l\'implémentation de TRIMED, nous avons réduit nos temps d\'attente de 60%. Les patients adorent pouvoir prendre rendez-vous via l\'application mobile."'
    },
    {
      avatar: 'clipboard-list',
      name: 'Dr. Marc Antoine',
      position: 'Pharmacien, Hôpital Général',
      rating: 5,
      text: '"Le module de gestion de pharmacie nous a sauvé de nombreuses ruptures de stock. Les alertes automatiques nous permettent de commander à temps."'
    }
  ];

  return (
    <section id="temoignages" className="testimonials-section bg-gray-50 py-20">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="section-header text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Ils nous font confiance</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez ce que les professionnels de santé haïtiens disent de TRIMED
          </p>
        </div>

        <div className="testimonials-grid grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card bg-white p-8 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all hover:-translate-y-2">
              <div className="testimonial-header flex items-center gap-4 mb-4">
                <div className="testimonial-avatar w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white text-lg">
                  <i className={`fas fa-${testimonial.avatar}`}></i>
                </div>
                <div className="testimonial-info">
                  <h4 className="text-lg font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-gray-600 text-sm">{testimonial.position}</p>
                </div>
              </div>
              
              <div className="testimonial-rating text-amber-400 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <i key={i} className="fas fa-star"></i>
                ))}
              </div>
              
              <p className="testimonial-text text-gray-600 italic leading-relaxed">
                {testimonial.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;