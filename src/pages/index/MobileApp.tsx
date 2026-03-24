// components/MobileApp.js
import React from 'react';

const MobileApp = () => {
  return (
    <section id="mobile" className="mobile-section bg-gray-50 py-20">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mobile-grid grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Image App Mobile */}
          <div className="mobile-image text-center">
            <div className="phone-mockup bg-white rounded-3xl p-8 shadow-2xl inline-block">
              <div className="mockup-placeholder w-64 h-96 bg-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400 text-lg">
                <i className="fas fa-mobile-alt text-4xl mb-4"></i>
                <p>App TRIMEDH</p>
              </div>
            </div>
            
            {/* Badges de téléchargement */}
            <div className="download-badges mt-8 flex gap-4 justify-center">
              <button className="download-btn bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-all transform hover:-translate-y-1 flex items-center gap-2">
                <i className="fab fa-google-play"></i>
                Google Play
              </button>
              <button className="download-btn bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-all transform hover:-translate-y-1 flex items-center gap-2">
                <i className="fab fa-app-store"></i>
                App Store
              </button>
            </div>
          </div>

          {/* Contenu App Mobile */}
          <div className="mobile-content">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Votre hôpital dans votre poche</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              L'application mobile TRIMEDH permet aux médecins, infirmières et patients de rester connectés où qu'ils soient, même avec une connexion internet limitée.
            </p>

            <div className="mobile-features space-y-6 mb-8">
              {[
                {
                  icon: 'stethoscope',
                  title: 'Pour le Personnel Médical',
                  description: 'Accédez aux dossiers patients, émettez des ordonnances électroniques, recevez des alertes urgentes et consultez les résultats de laboratoire en temps réel.'
                },
                {
                  icon: 'user',
                  title: 'Pour les Patients',
                  description: 'Prenez rendez-vous facilement, consultez vos résultats médicaux, recevez des rappels de traitement et communiquez avec votre médecin en toute sécurité.'
                }
              ].map((feature, index) => (
                <div key={index} className="mobile-feature flex gap-4">
                  <div className="feature-icon w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-500 flex-shrink-0">
                    <i className={`fas fa-${feature.icon}`}></i>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h4>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mobile-highlights bg-white p-6 rounded-xl border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Fonctionnalités Mobile Incluses :</h4>
              <div className="highlights-grid grid grid-cols-2 gap-3">
                {['Mode hors-ligne', 'Notifications push', 'Scan de documents', 'Signature électronique'].map((item, index) => (
                  <div key={index} className="highlight flex items-center gap-2 text-gray-600">
                    <i className="fas fa-check text-emerald-500 text-sm"></i>
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileApp;
