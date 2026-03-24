// components/FinalCTA.js
import React from 'react';

const FinalCTA = () => {
  return (
    <section className="final-cta-section bg-gradient-to-br from-emerald-600 to-emerald-700 text-white py-20">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="final-cta-content text-center">
          
          {/* Titre principal */}
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Prêt à moderniser votre hôpital ?
          </h2>
          
          {/* Description */}
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90 leading-relaxed">
            Rejoignez les 50+ établissements de santé haïtiens qui font déjà confiance à TRIMEDH pour une gestion optimale.
          </p>

          {/* Boutons d'action */}
          <div className="final-cta-actions flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button className="bg-white text-emerald-600 px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-3 justify-center text-lg">
              <i className="fas fa-rocket"></i>
              Démarrer l'Essai Gratuit
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-emerald-600 transition-all flex items-center gap-3 justify-center text-lg">
              <i className="fas fa-calendar"></i>
              Planifier une Démo
            </button>
          </div>

          {/* Note d'information */}
          <div className="cta-note">
            <p className="text-sm opacity-80 flex flex-wrap justify-center gap-4">
              <span className="flex items-center gap-2">
                <i className="fas fa-check-circle text-green-300"></i>
                Essai de 30 jours
              </span>
              <span className="flex items-center gap-2">
                <i className="fas fa-credit-card text-green-300"></i>
                Aucune carte de crédit requise
              </span>
              <span className="flex items-center gap-2">
                <i className="fas fa-headset text-green-300"></i>
                Support complet inclus
              </span>
            </p>
          </div>

          {/* Statistiques supplémentaires */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">50+</div>
              <div className="text-emerald-100 text-sm">Hôpitaux Satisfaits</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-emerald-100 text-sm">Support Local</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">99%</div>
              <div className="text-emerald-100 text-sm">Taux de Satisfaction</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
