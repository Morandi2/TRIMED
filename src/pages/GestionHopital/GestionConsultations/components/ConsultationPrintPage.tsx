import React from 'react';
import { Consultation, consultationService } from '../services/ConsultationService';

interface ConsultationPrintPageProps {
  consultation: Consultation | null;
  hopitalNom: string;
  onClose: () => void;
}

export const ConsultationPrintPage: React.FC<ConsultationPrintPageProps> = ({
  consultation,
  hopitalNom,
  onClose
}) => {
  if (!consultation) return null;

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
        <h2 className="text-xl font-bold text-gray-800">Aperçu d'impression - Fiche Consultation</h2>
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
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Fiche de Consultation</h2>
          <p className="text-sm text-gray-600">
            Imprimé le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
          </p>
        </div>

        {/* Informations principales */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Informations de la Consultation
          </h3>
          <div className="grid grid-cols-2 gap-6 text-black">
            <div>
              <p className="text-black"><strong className="text-black">ID Consultation:</strong> #{consultation.consultation_id}</p>
              <p className="text-black"><strong className="text-black">Patient:</strong> {consultationService.obtenirNomPatient(consultation.patient_id)}</p>
              <p className="text-black"><strong className="text-black">Médecin:</strong> {consultationService.obtenirNomMedecin(consultation.medecin_id)}</p>
            </div>
            <div>
              <p className="text-black"><strong className="text-black">Date et heure:</strong> {formatDate(consultation.date_consultation)}</p>
              <p className="text-black"><strong className="text-black">Créé le:</strong> {formatDate(consultation.created_at)}</p>
              {consultation.updated_at !== consultation.created_at && (
                <p className="text-black"><strong className="text-black">Modifié le:</strong> {formatDate(consultation.updated_at)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Motif de consultation */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Motif de la Consultation
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-black">{consultation.motif}</p>
          </div>
        </div>

        {/* Diagnostic principal */}
        {consultation.diagnostic_principal && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              Diagnostic Principal
            </h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-black">{consultation.diagnostic_principal}</p>
            </div>
          </div>
        )}

        {/* Notes médicales */}
        {consultation.notes && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              Notes Médicales
            </h3>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-black">{consultation.notes}</p>
            </div>
          </div>
        )}

        {/* Pied de page */}
        <div className="mt-12 pt-6 border-t-2 border-gray-300 text-center text-sm text-gray-600">
          <p>Ce document est confidentiel et destiné uniquement à un usage médical.</p>
          <p>Généré automatiquement par le système de gestion hospitalière TRIMED</p>
        </div>
      </div>
    </div>
  );
};