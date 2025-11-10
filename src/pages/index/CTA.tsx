// components/CTA.js
import React from 'react';

const CTA = () => {
  return (
    <section className="cta-section bg-gradient-to-br from-emerald-500 to-emerald-600 text-white py-20">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="cta-content text-center">
          <h2 className="text-4xl font-bold mb-4">Prêt à transformer votre hôpital ?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Rejoignez les établissements de santé haïtiens qui améliorent déjà leurs services avec TRIMED
          </p>
          <div className="cta-actions flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary bg-white text-emerald-600 px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2 justify-center">
              <i className="fas fa-calendar-check"></i>
              Planifier une Démo Personnalisée
            </button>
            <button className="btn-secondary-white border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-emerald-600 transition-all flex items-center gap-2 justify-center">
              <i className="fas fa-phone-alt"></i>
              Nous Contacter
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;