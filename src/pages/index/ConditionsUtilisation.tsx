import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const ConditionsUtilisation = () => {
  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar />
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100" data-aos="fade-up">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-8 pb-4 border-b border-slate-100">
            Conditions d'Utilisation
          </h1>
          
          <div className="prose prose-slate max-w-none space-y-6 text-slate-600 leading-relaxed">
            <p className="font-medium text-slate-800">En utilisant TRIMEDH, vous acceptez les conditions ci-dessous.</p>
            
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">1. Service SaaS</h2>
              <p>
                TRIMEDH fournit un logiciel en tant que service (SaaS) pour la gestion d'établissements de santé. L'accès est conditionné par un abonnement valide (Basique, Pro ou Entreprise).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">2. Responsabilité de l'Établissement</h2>
              <p>
                L'hôpital client est responsable de la véracité des informations médicales saisies et de la sécurité des identifiants d'accès fournis à son personnel.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">3. Disponibilité du Service</h2>
              <p>
                Nous visons une disponibilité de 99.9%. Les interruptions pour maintenance seront communiquées 48h à l'avance, sauf urgence technique majeure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">4. Propriété Intellectuelle</h2>
              <p>
                La structure, le code et le design de la plateforme restent la propriété exclusive de TRIMEDH. Les données saisies restent la propriété exclusive de l'hôpital client.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">5. Résiliation</h2>
              <p>
                Chaque partie peut résilier l'abonnement moyennant un préavis de 30 jours. Les données pourront être exportées durant cette période.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ConditionsUtilisation;
