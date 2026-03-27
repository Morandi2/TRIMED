/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Patient, patientService } from '../services/PatientService';

interface PatientViewModalProps {
  patient: Patient | null;
  onClose: () => void;
  hopitalNom?: string;
  onPrint?: (patient: Patient) => void;
}

export const PatientViewModal: React.FC<PatientViewModalProps> = ({
  patient,
  onClose,
  hopitalNom = "Hôpital Général",
  onPrint
}) => {
  const [patientComplet, setPatientComplet] = React.useState<any>(null);

  React.useEffect(() => {
    const loadPatient = async () => {
      if (patient) {
        try {
          const complet = await patientService.obtenirPatientComplet(patient.patient_id);
          setPatientComplet(complet);
        } catch (error) {
          console.error("Erreur chargement détails patient:", error);
        }
      }
    };
    loadPatient();
  }, [patient]);

  if (!patientComplet) return null;

  const getSexeText = (sexe: string) => {
    switch (sexe) {
      case 'M': return 'Masculin';
      case 'F': return 'Féminin';
      default: return sexe;
    }
  };

  const calculateAge = (dateNaissance?: string) => {
    if (!dateNaissance) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    if (isNaN(birthDate.getTime())) return 'N/A';

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl z-[100000] mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Détails du Patient
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (patient && onPrint) {
                  onClose();
                  onPrint(patient);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
              </svg>
              Imprimer
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          <div className="grid grid-cols-1 gap-6">
            {/* Informations Personnelles */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-4 text-lg">Informations Personnelles</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-700 dark:text-gray-400">ID Patient:</span>
                  <p className="font-mono font-medium text-gray-800 dark:text-white/90">#{patientComplet.patient.patient_id}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-700 dark:text-gray-400">Nom complet:</span>
                  <p className="font-medium text-gray-800 dark:text-white/90">{patientComplet.patient.prenom} {patientComplet.patient.nom}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-700 dark:text-gray-400">Email:</span>
                  <p className="font-medium text-gray-800 dark:text-white/90">{patientComplet.patient.email || 'Non renseigné'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-700 dark:text-gray-400">Téléphone:</span>
                  <p className="font-medium text-gray-800 dark:text-white/90">{patientComplet.patient.telephone || 'Non renseigné'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-700 dark:text-gray-400">Sexe:</span>
                  <p className="font-medium text-gray-800 dark:text-white/90">{getSexeText(patientComplet.patient.sexe)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-700 dark:text-gray-400">Âge:</span>
                  <p className="font-medium text-gray-800 dark:text-white/90">{calculateAge(patientComplet.patient.date_naissance)} ans</p>
                </div>
                <div>
                  <span className="text-sm text-gray-700 dark:text-gray-400">Date naissance:</span>
                  <p className="font-medium text-gray-800 dark:text-white/90">
                    {formatDate(patientComplet.patient.date_naissance)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-700 dark:text-gray-400">Groupe sanguin:</span>
                  <p className="font-medium text-gray-800 dark:text-white/90">{patientComplet.patient.groupe_sanguin || 'Non renseigné'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-700 dark:text-gray-400">Numéro dossier:</span>
                  <p className="font-mono font-medium text-gray-800 dark:text-white/90">{patientComplet.patient.numero_dossier_medical}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-700 dark:text-gray-400">NIF/CIN:</span>
                  <p className="font-medium text-gray-800 dark:text-white/90">{patientComplet.patient.numero_identification_nationale || 'Non renseigné'}</p>
                </div>
              </div>
            </div>

            {/* Adresse */}
            {patientComplet.adresse && (
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                <h4 className="font-semibold text-green-800 dark:text-green-300 mb-4 text-lg">Adresse</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-700 dark:text-gray-400">Pays:</span>
                    <p className="font-medium text-gray-800 dark:text-white/90">{patientComplet.adresse.pays}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-700 dark:text-gray-400">Département:</span>
                    <p className="font-medium text-gray-800 dark:text-white/90">{patientComplet.adresse.departement}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-700 dark:text-gray-400">Ville:</span>
                    <p className="font-medium text-gray-800 dark:text-white/90">{patientComplet.adresse.ville}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-700 dark:text-gray-400">Code Postal:</span>
                    <p className="font-medium text-gray-800 dark:text-white/90">{patientComplet.adresse.code_postal}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-gray-700 dark:text-gray-400">Adresse:</span>
                    <p className="font-medium text-gray-800 dark:text-white/90">
                      {patientComplet.adresse.adresse_ligne1}
                      {patientComplet.adresse.adresse_ligne2 && `, ${patientComplet.adresse.adresse_ligne2}`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Contacts */}
            {patientComplet.contacts.length > 0 && (
              <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-4 text-lg">Personnes à Contacter</h4>
                <div className="space-y-4">
                  {patientComplet.contacts.map((contact: any, index: number) => (
                    <div key={index} className="border border-purple-200 dark:border-purple-800 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-700 dark:text-gray-400">Nom:</span>
                          <p className="font-medium text-gray-800 dark:text-white/90">{contact.nom}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-700 dark:text-gray-400">Téléphone:</span>
                          <p className="font-medium text-gray-800 dark:text-white/90">{contact.telephone}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-sm text-gray-700 dark:text-gray-400">Relation:</span>
                          <p className="font-medium text-gray-800 dark:text-white/90">{contact.relation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assurances */}
            {patientComplet.assurances.length > 0 && (
              <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg">
                <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-4 text-lg">Assurances</h4>
                <div className="space-y-4">
                  {patientComplet.assurances.map((assurance: any, index: number) => (
                    <div key={index} className="border border-orange-200 dark:border-orange-800 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-700 dark:text-gray-400">Nom Assurance:</span>
                          <p className="font-medium text-gray-800 dark:text-white/90">{assurance.nom_assurance}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-700 dark:text-gray-400">Numéro Police:</span>
                          <p className="font-medium text-gray-800 dark:text-white/90">{assurance.numero_police}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-700 dark:text-gray-400">Date Expiration:</span>
                          <p className="font-medium text-gray-800 dark:text-white/90">
                            {assurance.date_expiration ? new Date(assurance.date_expiration).toLocaleDateString('fr-FR') : 'Non renseignée'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Allergies */}
            {patientComplet.allergies.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
                <h4 className="font-semibold text-red-800 dark:text-red-300 mb-4 text-lg">Allergies</h4>
                <div className="space-y-4">
                  {patientComplet.allergies.map((allergie: any, index: number) => (
                    <div key={index} className="border border-red-200 dark:border-red-800 p-4 rounded-lg">
                      <div className="grid grid-cols-1 gap-2">
                        <div>
                          <span className="text-sm text-gray-700 dark:text-gray-400">Nom Allergie:</span>
                          <p className="font-medium text-gray-800 dark:text-white/90">{allergie.nom_allergie}</p>
                        </div>
                        {allergie.description && (
                          <div>
                            <span className="text-sm text-gray-700 dark:text-gray-400">Description:</span>
                            <p className="font-medium text-gray-800 dark:text-white/90">{allergie.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Antécédents */}
            {patientComplet.antecedents.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-4 text-lg">Antécédents Médicaux</h4>
                <div className="space-y-4">
                  {patientComplet.antecedents.map((antecedent: any, index: number) => (
                    <div key={index} className="border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                      <div className="grid grid-cols-1 gap-2">
                        <div>
                          <span className="text-sm text-gray-700 dark:text-gray-400">Type:</span>
                          <p className="font-medium text-gray-800 dark:text-white/90">
                            {antecedent.type_antecedent === 'maladie' ? 'Maladie' : 
                             antecedent.type_antecedent === 'chirurgie' ? 'Chirurgie' : 'Autre'}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-700 dark:text-gray-400">Description:</span>
                          <p className="font-medium text-gray-800 dark:text-white/90">{antecedent.description}</p>
                        </div>
                        {(antecedent.date_debut || antecedent.date_fin) && (
                          <div className="grid grid-cols-2 gap-4">
                            {antecedent.date_debut && (
                              <div>
                                <span className="text-sm text-gray-700 dark:text-gray-400">Date Début:</span>
                                <p className="font-medium text-gray-800 dark:text-white/90">
                                  {new Date(antecedent.date_debut).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                            )}
                            {antecedent.date_fin && (
                              <div>
                                <span className="text-sm text-gray-700 dark:text-gray-400">Date Fin:</span>
                                <p className="font-medium text-gray-800 dark:text-white/90">
                                  {new Date(antecedent.date_fin).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end bg-white dark:bg-gray-800">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
      

    </div>
  );
};