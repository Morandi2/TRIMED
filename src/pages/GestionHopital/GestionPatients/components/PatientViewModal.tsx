import React from 'react';
import { Patient, patientService } from '../services/PatientService';
import { calculateAge, formatDateFR } from '../../../../utils/dateUtils';
import ParcoursPatient from './ParcoursPatient';
import { SaisieSignesVitaux } from './SaisieSignesVitaux';
import { useUser } from '../../../../context/UserContext';

interface PatientViewModalProps {
  patient: Patient | null;
  onClose: () => void;
  onPrint?: (patient: Patient) => void;
}

export const PatientViewModal: React.FC<PatientViewModalProps> = ({
  patient,
  onClose,
  onPrint
}) => {
  const [patientComplet, setPatientComplet] = React.useState<any>(null);
  const [version, setVersion] = React.useState(0);
  // Le médecin et l'infirmier relèvent les constantes (le serveur refuse les autres rôles).
  const { currentUserRole } = useUser();
  const peutSaisirConstantes = currentUserRole === 'medecin' || currentUserRole === 'infirmier';

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
  }, [patient, version]);

  if (!patientComplet) {
    return (
      <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 flex flex-col items-center justify-center shadow-2xl z-[100000]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
          <p className="mt-4 text-sm font-bold text-gray-500">Chargement des détails...</p>
        </div>
      </div>
    );
  }

  const getSexeText = (sexe: string) => {
    switch (sexe) {
      case 'M': return 'Masculin';
      case 'F': return 'Féminin';
      default: return sexe;
    }
  };

  const formatDate = (dateStr?: string) => {
    return formatDateFR(dateStr);
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl z-[100000] mx-4 flex flex-col max-h-[90vh]">
        
        <div className="overflow-y-auto w-full h-full flex flex-col">
          {/* Blue Header Section */}
          <div className="relative bg-brand-600 dark:bg-brand-700 h-36 px-6 py-5 flex items-start justify-between shrink-0">
            <span className="text-white text-xs font-bold tracking-widest uppercase">Patient</span>
            <button onClick={onClose} className="text-white/80 hover:text-white mt-1 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Overlapping Content Section */}
          <div className="relative px-8 pb-8 bg-white dark:bg-gray-800 shrink-0">
            {/* Profile Card & Info */}
            <div className="flex items-end gap-5 -mt-16 mb-8 relative z-10">
              <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center text-brand-600 dark:text-brand-400 font-extrabold text-3xl border-[3px] border-white dark:border-gray-800 shrink-0 overflow-hidden">
                {(patientComplet.patient.prenom || 'P').charAt(0)}{(patientComplet.patient.nom || 'A').charAt(0)}
              </div>
            <div className="pb-1">
              <h2 className="text-gray-900 dark:text-white font-bold text-xl leading-tight truncate">
                {patientComplet.patient.prenom} {patientComplet.patient.nom}
              </h2>
              <span className="inline-block mt-1 px-3 py-0.5 text-[10px] font-bold uppercase rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                Patient
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Primary Details Block - styled like the image */}
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 flex-1">
              <div>
                <label className="block text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-1.5">Prénom</label>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{patientComplet.patient.prenom}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-1.5">Nom</label>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{patientComplet.patient.nom}</p>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-1.5">Adresse Email</label>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{patientComplet.patient.email || 'Non renseigné'}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-1.5">Téléphone</label>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{patientComplet.patient.telephone || 'Non renseigné'}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-1.5">Date de naissance</label>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{formatDate(patientComplet.patient.date_naissance)} ({calculateAge(patientComplet.patient.date_naissance)} ans)</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-1.5">Sexe</label>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{getSexeText(patientComplet.patient.sexe)}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-1.5">ID Utilisateur</label>
                <span className="inline-block bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-white text-xs font-bold px-3 py-1.5 rounded-md text-center border border-gray-200 dark:border-white/10">
                  #{patientComplet.patient.patient_id}
                </span>
              </div>
            </div>

            {/* Extended Medical Details Dropdown area */}
            <div className="flex-1 space-y-4">
              <div className="p-4 bg-brand-50 dark:bg-brand-900/10 rounded-2xl border border-brand-100 dark:border-brand-900/30">
                <label className="block text-[10px] font-bold text-brand-500 uppercase tracking-widest mb-1.5">Dossier Médical</label>
                <p className="text-sm font-bold text-brand-900 dark:text-brand-100">{patientComplet.patient.numero_dossier_medical}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">NIF / CIN</label>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{patientComplet.patient.numero_identification_nationale || 'Non spécifié'}</p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
                <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1.5">Groupe Sanguin</label>
                <p className="text-lg font-bold text-red-700 dark:text-red-400">
                  {patientComplet.patient.groupe_sanguin || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Secondary Details (Addresses, Contacts, Allergies) */}
          <div className="mt-8 space-y-4 pt-6 border-t border-gray-100 dark:border-white/5">
            {/* Adresse */}
            {patientComplet.adresse && (
              <div>
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Adresse
                </h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 dark:bg-white/5 p-4 rounded-xl">
                  <div><span className="block text-[10px] uppercase font-bold text-gray-400">Pays</span><span className="text-sm font-semibold">{patientComplet.adresse.pays}</span></div>
                  <div><span className="block text-[10px] uppercase font-bold text-gray-400">Dép.</span><span className="text-sm font-semibold">{patientComplet.adresse.departement}</span></div>
                  <div><span className="block text-[10px] uppercase font-bold text-gray-400">Ville</span><span className="text-sm font-semibold">{patientComplet.adresse.ville}</span></div>
                  <div><span className="block text-[10px] uppercase font-bold text-gray-400">Rue</span><span className="text-sm font-semibold truncate">{patientComplet.adresse.adresse_ligne1}</span></div>
                </div>
              </div>
            )}

            {/* Contacts */}
            {patientComplet.contacts.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-3 flex items-center gap-2 mt-6">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  Contacts d'urgence
                </h4>
                <div className="flex flex-col gap-3">
                  {patientComplet.contacts.map((contact: any, index: number) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 dark:bg-white/5 p-4 rounded-xl">
                      <div>
                        <p className="font-bold text-sm">{contact.nom}</p>
                        <span className="text-xs text-gray-500 font-medium uppercase">{contact.relation}</span>
                      </div>
                      <span className="font-mono text-sm font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-3 py-1 rounded-lg">{contact.telephone}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Allergies */}
            {patientComplet.allergies.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-3 flex items-center gap-2 mt-6">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  Allergies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {patientComplet.allergies.map((allergie: any, index: number) => (
                    <span key={index} className="inline-flex items-center px-4 py-2 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-xl text-sm font-bold border border-red-100 dark:border-red-900/30">
                      {allergie.nom_allergie} 
                      {allergie.description && <span className="ml-2 py-0.5 px-2 bg-red-100 dark:bg-red-900/50 rounded-md text-[10px]">{allergie.description}</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Antécédents */}
            {patientComplet.antecedents.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-3 flex items-center gap-2 mt-6">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Antécédents
                </h4>
                <ul className="space-y-2">
                  {patientComplet.antecedents.map((a: any, index: number) => (
                    <li key={index} className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl text-sm">
                      <span className="font-bold">{a.type_antecedent}</span> : {a.description}
                      {a.en_cours ? <span className="ml-2 text-xs text-amber-700">en cours</span> : null}
                      {a.date_debut ? <span className="ml-2 text-xs text-gray-500">depuis le {formatDate(a.date_debut)}</span> : null}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Signes vitaux (derniers suivis) */}
            {((patientComplet.suivis ?? []).length > 0 || peutSaisirConstantes) && (
              <div>
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-3 flex items-center gap-2 mt-6">
                  <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                  Signes vitaux
                </h4>
                {(patientComplet.suivis ?? []).length === 0 && <p className="text-sm text-gray-500">Aucun relevé pour l’instant.</p>}
                <div className={(patientComplet.suivis ?? []).length ? 'overflow-x-auto' : 'hidden'}>
                  <table className="w-full min-w-[480px] text-sm">
                    <thead><tr className="text-left text-[10px] uppercase text-gray-400"><th className="py-1">Date</th><th>T°</th><th>TA</th><th>Pouls</th><th>Poids</th><th>Observations</th></tr></thead>
                    <tbody>
                      {[...patientComplet.suivis].sort((x: any, y: any) => String(y.date_suivi).localeCompare(String(x.date_suivi))).slice(0, 5).map((s: any) => (
                        <tr key={s.suivi_id} className="border-t border-gray-100 dark:border-white/5">
                          <td className="py-1.5">{formatDate(s.date_suivi)}</td>
                          <td>{s.temperature ?? ''}</td>
                          <td>{s.tension_arterielle_systolique ? s.tension_arterielle_systolique + '/' + s.tension_arterielle_diastolique : ''}</td>
                          <td>{s.pouls ?? ''}</td>
                          <td>{s.poids ?? ''}</td>
                          <td className="max-w-[200px] truncate">{s.observations ?? ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {peutSaisirConstantes && (
                  <SaisieSignesVitaux patientId={patientComplet.patient.patient_id} onEnregistre={() => setVersion((v) => v + 1)} />
                )}
              </div>
            )}

            <ParcoursPatient patientId={patientComplet.patient.patient_id} />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 mt-10 pt-6 border-t border-gray-100 dark:border-white/5 shrink-0">
            <button 
              onClick={() => {
                if (patient && onPrint) {
                  onClose();
                  onPrint(patient);
                }
              }}
              className="flex items-center gap-2 bg-brand-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-brand-600/30 hover:bg-brand-700 transition active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimer
            </button>
            <button 
              onClick={onClose}
              className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white px-8 py-3.5 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition active:scale-95"
            >
              Fermer
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};