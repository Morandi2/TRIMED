import React from 'react';
import { Patient } from '../services/PatientService';

interface DeleteConfirmationModalProps {
  patient: Patient | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  patient,
  onConfirm,
  onCancel
}) => {
  if (!patient) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onCancel}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6 shadow-2xl z-[100000] mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-red-600 dark:text-red-400">
              <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53223 19 5.07183 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Confirmer la suppression
            </h3>
          </div>
        </div>

        <p className="text-gray-700 dark:text-gray-400 mb-6">
          Êtes-vous sûr de vouloir supprimer le patient <strong>{patient.prenom} {patient.nom}</strong> (ID: #{patient.patient_id}) ? Cette action est irréversible.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};