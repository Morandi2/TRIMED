import React from 'react';
import EnTete from './portail/EnTete';
import PiedDePage from './portail/PiedDePage';

const PolitiqueConfidentialite = () => {
  return (
    <div className="ptl min-h-screen">
      <EnTete accueil={false} />
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-8 pb-4 border-b border-slate-100">
            Politique de Confidentialité
          </h1>
          
          <div className="prose prose-slate max-w-none space-y-6 text-slate-600 leading-relaxed">
            <p className="font-medium text-slate-800">Dernière mise à jour : {new Date().toLocaleDateString()}</p>
            
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">1. Introduction</h2>
              <p>
                TRIMED s'engage à protéger la vie privée des utilisateurs de sa plateforme de gestion hospitalière. Cette politique explique comment nous collectons, utilisons et protégeons les informations personnelles et médicales.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">2. Données Médicales (Conformité HIPAA)</h2>
              <p>
                La sécurité des dossiers médicaux est notre priorité absolue. Les données de santé des patients sont :
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Protégées pendant leur transmission par une connexion sécurisée.</li>
                <li>Accessibles uniquement par le personnel autorisé de l'hôpital client.</li>
                <li>Hébergées en ligne : aucun serveur à installer à l’hôpital.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">3. Collecte des Informations</h2>
              <p>
                Nous collectons des informations lors de la création de compte établissement (nom de l'hôpital, contacts administratifs, identifiants des médecins). Nous ne vendons jamais vos données à des tiers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">4. Vos Droits</h2>
              <p>
                En tant que client TRIMED, vous conservez la pleine propriété des données de votre établissement. Vous pouvez demander une copie de vos dossiers ou la suppression définitive d'un compte.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">5. Contact</h2>
              <p>
                Pour toute question relative à vos données, contactez l'équipe TRIMED à : <span className="font-semibold text-blue-600">trimedht@gmail.com</span>
              </p>
            </section>
          </div>
        </div>
      </div>
      <PiedDePage accueil={false} />
    </div>
  );
};

export default PolitiqueConfidentialite;
