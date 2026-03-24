import React from 'react';

interface PatientPrintPageProps {
  patientComplet: any;
  hopitalNom: string;
  onClose: () => void;
}

export const PatientPrintPage: React.FC<PatientPrintPageProps> = ({
  patientComplet,
  hopitalNom,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-white">
      {/* Header pour écran seulement */}
      <div className="print:hidden bg-gray-100 p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Aperçu d'impression - Dossier Patient</h2>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
            </svg>
            Imprimer
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Contenu à imprimer */}
      <div className="p-8 max-w-4xl mx-auto text-black">
        {/* En-tête du document */}
        <div className="text-center mb-12 border-b border-gray-300 pb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">{hopitalNom}</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Dossier Médical Patient</h2>
          <p className="text-sm text-gray-600">
            Imprimé le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
          </p>
        </div>

        {/* Informations du patient */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Informations Personnelles
          </h3>
          <div className="grid grid-cols-2 gap-6 text-black">
            <div>
              <p className="text-black"><strong className="text-black">Nom:</strong> {patientComplet.patient.nom}</p>
              <p className="text-black"><strong className="text-black">Prénom:</strong> {patientComplet.patient.prenom}</p>
              <p className="text-black"><strong className="text-black">Date de naissance:</strong> {new Date(patientComplet.patient.date_naissance).toLocaleDateString('fr-FR')}</p>
              <p className="text-black"><strong className="text-black">Sexe:</strong> {patientComplet.patient.sexe === 'M' ? 'Masculin' : 'Féminin'}</p>
            </div>
            <div>
              <p className="text-black"><strong className="text-black">Numéro dossier:</strong> {patientComplet.patient.numero_dossier_medical}</p>
              <p className="text-black"><strong className="text-black">NIF/CIN:</strong> {patientComplet.patient.numero_identification_nationale || 'Non renseigné'}</p>
              <p className="text-black"><strong className="text-black">Téléphone:</strong> {patientComplet.patient.telephone || 'Non renseigné'}</p>
              <p className="text-black"><strong className="text-black">Email:</strong> {patientComplet.patient.email || 'Non renseigné'}</p>
              <p className="text-black"><strong className="text-black">Groupe sanguin:</strong> {patientComplet.patient.groupe_sanguin || 'Non renseigné'}</p>
            </div>
          </div>
        </div>

        {/* Adresse */}
        {patientComplet.adresse && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              Adresse
            </h3>
            <div className="grid grid-cols-2 gap-6 text-black">
              <div>
                <p className="text-black"><strong className="text-black">Pays:</strong> {patientComplet.adresse.pays}</p>
                <p className="text-black"><strong className="text-black">Département:</strong> {patientComplet.adresse.departement}</p>
                <p className="text-black"><strong className="text-black">Ville:</strong> {patientComplet.adresse.ville}</p>
              </div>
              <div>
                <p className="text-black"><strong className="text-black">Code Postal:</strong> {patientComplet.adresse.code_postal}</p>
                <p className="text-black"><strong className="text-black">Adresse:</strong> {patientComplet.adresse.adresse_ligne1}
                  {patientComplet.adresse.adresse_ligne2 && `, ${patientComplet.adresse.adresse_ligne2}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Contacts d'urgence */}
        {patientComplet.contacts.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              Personnes à Contacter
            </h3>
            <div className="space-y-3">
              {patientComplet.contacts.map((contact: any, index: number) => (
                <div key={index} className="border-b border-gray-100 pb-3 mb-3 last:border-b-0">
                  <div className="grid grid-cols-3 gap-4 text-black">
                    <p className="text-black"><strong className="text-black">Nom:</strong> {contact.nom}</p>
                    <p className="text-black"><strong className="text-black">Téléphone:</strong> {contact.telephone}</p>
                    <p className="text-black"><strong className="text-black">Relation:</strong> {contact.relation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assurances */}
        {patientComplet.assurances.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              Assurances
            </h3>
            <div className="space-y-3">
              {patientComplet.assurances.map((assurance: any, index: number) => (
                <div key={index} className="border-b border-gray-100 pb-3 mb-3 last:border-b-0">
                  <div className="grid grid-cols-3 gap-4 text-black">
                    <p className="text-black"><strong className="text-black">Assurance:</strong> {assurance.nom_assurance}</p>
                    <p className="text-black"><strong className="text-black">Numéro Police:</strong> {assurance.numero_police}</p>
                    <p className="text-black"><strong className="text-black">Expiration:</strong> {assurance.date_expiration ? new Date(assurance.date_expiration).toLocaleDateString('fr-FR') : 'Non renseignée'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Allergies */}
        {patientComplet.allergies.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              Allergies
            </h3>
            <div className="space-y-3">
              {patientComplet.allergies.map((allergie: any, index: number) => (
                <div key={index} className="border-b border-gray-100 pb-3 mb-3 last:border-b-0 text-black">
                  <p className="text-black"><strong className="text-black">Allergie:</strong> {allergie.nom_allergie}</p>
                  {allergie.description && <p className="text-black"><strong className="text-black">Description:</strong> {allergie.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Antécédents */}
        {patientComplet.antecedents.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              Antécédents Médicaux
            </h3>
            <div className="space-y-3">
              {patientComplet.antecedents.map((antecedent: any, index: number) => (
                <div key={index} className="border-b border-gray-100 pb-3 mb-3 last:border-b-0 text-black">
                  <p className="text-black"><strong className="text-black">Type:</strong> {
                    antecedent.type_antecedent === 'maladie' ? 'Maladie' : 
                    antecedent.type_antecedent === 'chirurgie' ? 'Chirurgie' : 'Autre'
                  }</p>
                  <p className="text-black"><strong className="text-black">Description:</strong> {antecedent.description}</p>
                  {antecedent.date_debut && (
                    <p className="text-black"><strong className="text-black">Date début:</strong> {new Date(antecedent.date_debut).toLocaleDateString('fr-FR')}</p>
                  )}
                  {antecedent.date_fin && (
                    <p className="text-black"><strong className="text-black">Date fin:</strong> {new Date(antecedent.date_fin).toLocaleDateString('fr-FR')}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pied de page */}
        <div className="mt-12 pt-6 border-t-2 border-gray-300 text-center text-sm text-gray-600">
          <p>Ce document est confidentiel et destiné uniquement à un usage médical.</p>
          <p>Généré automatiquement par le système de gestion hospitalière TRIMEDH</p>
        </div>
      </div>
    </div>
  );
};
