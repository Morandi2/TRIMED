import React from 'react';
import { Ordonnance, ordonnanceService } from '../services/OrdonnanceService';

interface OrdonnancePrintPageProps {
  ordonnance: Ordonnance | null;
  hopitalNom: string;
  onClose: () => void;
}

export const OrdonnancePrintPage: React.FC<OrdonnancePrintPageProps> = ({
  ordonnance,
  hopitalNom,
  onClose
}) => {
  if (!ordonnance) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-white flex flex-col">
      {/* Header pour écran seulement */}
      <div className="print:hidden bg-gray-100 p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Aperçu d'impression - Ordonnance Médicale</h2>
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
      <div className="p-8 max-w-4xl mx-auto text-black overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
        {/* En-tête du document */}
        <div className="text-center mb-12 border-b border-gray-300 pb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">{hopitalNom}</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Ordonnance Médicale</h2>
          <p className="text-sm text-gray-600">
            Imprimé le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
          </p>
        </div>

        {/* Informations principales */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Informations de l'Ordonnance
          </h3>
          <div className="grid grid-cols-2 gap-6 text-black">
            <div>
              <p className="text-black"><strong className="text-black">N° Ordonnance:</strong> #{ordonnance.ordonnance_id}</p>
              <p className="text-black"><strong className="text-black">Patient:</strong> {ordonnanceService.obtenirNomPatient(ordonnance.patient_id)}</p>
              <p className="text-black"><strong className="text-black">Médecin:</strong> {ordonnanceService.obtenirNomMedecin(ordonnance.medecin_id)}</p>
            </div>
            <div>
              <p className="text-black"><strong className="text-black">Date d'ordonnance:</strong> {formatDate(ordonnance.date_ordonnance)}</p>
              <p className="text-black"><strong className="text-black">Validité:</strong> {ordonnance.validite}</p>
              <p className="text-black"><strong className="text-black">Consultation:</strong> {ordonnanceService.obtenirConsultationInfo(ordonnance.consultation_id)}</p>
            </div>
          </div>
        </div>

        {/* Recommandations médicales */}
        {ordonnance.recommandations && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              Recommandations Médicales
            </h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-black whitespace-pre-wrap">{ordonnance.recommandations}</p>
            </div>
          </div>
        )}

        {/* Section pour les médicaments prescrits */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Médicaments Prescrits
          </h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            {ordonnance.prescriptions && ordonnance.prescriptions.length > 0 ? (
              <div className="space-y-4">
                {ordonnance.prescriptions.map((prescription, index) => (
                  <div key={index} className="border-b border-gray-300 pb-3 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-black text-lg">{prescription.medicament}</p>
                        <p className="text-black mt-1"><strong>Dosage:</strong> {prescription.dosage}</p>
                        <p className="text-black"><strong>Durée:</strong> {prescription.duree}</p>
                        <p className="text-black"><strong>Instructions:</strong> {prescription.instructions}</p>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        #{index + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="min-h-[200px]">
                <p className="text-gray-600 italic mb-4">À remplir par le médecin:</p>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="border-b border-gray-300 pb-2">
                      <p className="text-sm text-gray-500">Médicament {i}:</p>
                      <div className="h-6 border-b border-gray-300 mt-1"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Informations de validité */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Validité et Instructions
          </h3>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-black"><strong>Validité:</strong> {ordonnance.validite}</p>
            <p className="text-black mt-2"><strong>Instructions:</strong></p>
            <ul className="list-disc list-inside text-black mt-2 space-y-1">
              <li>Cette ordonnance est valide pour {ordonnance.validite}</li>
              <li>Respecter les dosages prescrits</li>
              <li>Consulter le médecin en cas d'effets secondaires</li>
              <li>Ne pas dépasser la date de validité</li>
            </ul>
          </div>
        </div>

        {/* Signature du médecin */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Signature du Médecin
          </h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-black"><strong>Médecin:</strong> {ordonnanceService.obtenirNomMedecin(ordonnance.medecin_id)}</p>
                <p className="text-black"><strong>Date:</strong> {formatDate(ordonnance.date_ordonnance)}</p>
              </div>
              <div className="text-center">
                <div className="w-48 h-20 border-2 border-gray-300 rounded-lg mb-2"></div>
                <p className="text-sm text-gray-600">Signature et cachet</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pied de page */}
        <div className="mt-12 pt-6 border-t-2 border-gray-300 text-center text-sm text-gray-600">
          <p>Cette ordonnance est confidentielle et destinée uniquement à un usage médical.</p>
          <p>Généré automatiquement par le système de gestion hospitalière TRIMED</p>
          <p className="mt-2"><strong>Créé le:</strong> {formatDate(ordonnance.created_at)}</p>
        </div>
      </div>
    </div>
  );
};