import React, { useState, useEffect, useCallback } from 'react';
import {
  RendezVous,
  RendezVousFormData,
  DUREES_CONSULTATION,
  RendezVousType,
  RendezVousStatut
} from '../types/RendezVousTypes';
import { nomAffiche, SearchableSelect } from './SearchableSelect';
import { rendezVousService } from '../services/RendezVousService';
import { bornes, REGLES, verifierDate, versChamp } from '../../../../utils/contraintes';

interface RendezVousProgressFormProps {
  tenantId: number;
  onSave: (formData: RendezVousFormData, isModifying: boolean) => void;
  onClose: () => void;
  /** Rendez-vous à modifier (absent : création). */
  rendezVous?: RendezVous | null;
  onSuccess?: (message: string) => void;
}

const idDe = (o: { type_id?: number; statut_id?: number; id?: number } | undefined, cle: 'type_id' | 'statut_id') => (o ? (o[cle] ?? o.id ?? 0) : 0);

/** Prochaine demi-heure, au moins 30 minutes après maintenant (créneau proposé pour un nouveau rendez-vous). */
const prochainCreneau = () => {
  const d = new Date(Date.now() + 30 * 60000);
  d.setMinutes(d.getMinutes() < 30 ? 30 : 60, 0, 0);
  return versChamp(d, 'datetime-local');
};

const vide = (types: RendezVousType[], statuts: RendezVousStatut[]): RendezVousFormData => ({
  patient_id: 0, patient_nom: '', patient_email: '', patient_phone: '',
  medecin_id: 0, medecin_nom: '', specialite: '',
  date_heure: prochainCreneau(),
  type_id: idDe(types[0], 'type_id'), type_nom: types[0]?.nom ?? '',
  statut_id: idDe(statuts[0], 'statut_id'), statut_nom: statuts[0]?.nom ?? '',
  motif: '', duree: 30, notes: '',
  // Champs hérités du type, sans équivalent côté serveur : ni affichés ni envoyés. Le paiement se fait à la caisse.
  salle: '', prix: 0, moyen_paiement: undefined, assurance_validee: false,
});

export const RendezVousProgressForm: React.FC<RendezVousProgressFormProps> = ({ tenantId: _tenantId, onSave, onClose, rendezVous, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [dynamicTypes, setDynamicTypes] = useState<RendezVousType[]>([]);
  const [dynamicStatuts, setDynamicStatuts] = useState<RendezVousStatut[]>([]);
  const [formData, setFormData] = useState<RendezVousFormData>(() => vide([], []));
  const [dateInitiale, setDateInitiale] = useState<string | null>(null);
  const [isModifying, setIsModifying] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [selectedMedecinName, setSelectedMedecinName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const t = rendezVousService.obtenirTypes();
    const s = rendezVousService.obtenirStatuts();
    setDynamicTypes(t);
    setDynamicStatuts(s);

    if (rendezVous) {
      // Modification : le vrai rendez-vous, avec sa date en heure locale.
      setIsModifying(true);
      // Noms tels que la liste de choix les affiche (prénom et nom), retrouvés par identifiant.
      const fiche = rendezVousService.rechercherPatients('').find((p) => p.patient_id === rendezVous.patient_id);
      const docteur = rendezVousService.rechercherMedecins('').find((m) => m.medecin_id === rendezVous.medecin_id);
      const patient = fiche ? nomAffiche(fiche, 'patient') : (rendezVous.patient_nom ?? '');
      const medecin = docteur ? nomAffiche(docteur, 'medecin') : (rendezVous.medecin_nom ?? '');
      const date = rendezVous.date_heure ? versChamp(new Date(rendezVous.date_heure), 'datetime-local') : prochainCreneau();
      const typeId = typeof rendezVous.type_id === 'object' ? idDe(rendezVous.type_id, 'type_id') : Number(rendezVous.type_id) || 0;
      const statutId = typeof rendezVous.statut_id === 'object' ? idDe(rendezVous.statut_id, 'statut_id') : Number(rendezVous.statut_id) || 0;
      setFormData({
        ...vide(t, s),
        patient_id: rendezVous.patient_id, patient_nom: patient,
        medecin_id: rendezVous.medecin_id, medecin_nom: medecin, specialite: docteur?.specialite ?? '',
        patient_phone: fiche?.telephone ?? '', patient_email: fiche?.email ?? '',
        date_heure: date,
        type_id: typeId || idDe(t[0], 'type_id'), type_nom: rendezVous.type_nom ?? t.find((x) => idDe(x, 'type_id') === typeId)?.nom ?? '',
        statut_id: statutId || idDe(s[0], 'statut_id'), statut_nom: rendezVous.statut_nom ?? s.find((x) => idDe(x, 'statut_id') === statutId)?.nom ?? '',
        motif: rendezVous.motif ?? '', duree: rendezVous.duree_minutes || 30,
      });
      setDateInitiale(date);
      setSelectedPatientName(patient);
      setSelectedMedecinName(medecin);
    } else {
      setIsModifying(false);
      setFormData(vide(t, s));
      setDateInitiale(null);
      setSelectedPatientName('');
      setSelectedMedecinName('');
    }
  }, [rendezVous]);

  // Pré-remplissage depuis une autre page (fiche du patient, planning du médecin).
  useEffect(() => {
    const handlePatientSelected = (event: CustomEvent) => {
      const { patient_id, patient_nom, patient_email, patient_phone } = event.detail;
      setFormData((prev) => ({ ...prev, patient_id, patient_nom, patient_email, patient_phone }));
      setSelectedPatientName(patient_nom);
    };
    const handleMedecinSelected = (event: CustomEvent) => {
      const { medecin_id, medecin_nom, specialite } = event.detail;
      setFormData((prev) => ({ ...prev, medecin_id, medecin_nom, specialite }));
      setSelectedMedecinName(medecin_nom);
    };
    window.addEventListener('patientSelected', handlePatientSelected as EventListener);
    window.addEventListener('medecinSelected', handleMedecinSelected as EventListener);
    return () => {
      window.removeEventListener('patientSelected', handlePatientSelected as EventListener);
      window.removeEventListener('medecinSelected', handleMedecinSelected as EventListener);
    };
  }, []);

  const totalSteps = 4;

  /** Erreurs d'une étape. La date d'un rendez-vous existant n'est vérifiée que si elle a changé. */
  const erreursEtape = useCallback((step: number): Record<string, string> => {
    const e: Record<string, string> = {};
    if (step === 1 && !formData.patient_id) e.patient_nom = 'Choisissez le patient.';
    if (step === 2) {
      if (!formData.medecin_id) e.medecin_nom = 'Choisissez le médecin.';
      if (!formData.date_heure) e.date_heure = 'Indiquez la date et l’heure.';
      else if (formData.date_heure !== dateInitiale) {
        const m = verifierDate(formData.date_heure, REGLES.rendezVous);
        if (m) e.date_heure = m;
      }
    }
    if (step === 3) {
      if (!formData.motif?.trim()) e.motif = 'Indiquez le motif.';
      if (!formData.type_id) e.type_id = 'Aucun type de rendez-vous n’est configuré pour l’hôpital.';
    }
    if (step === 4 && !formData.statut_id) e.statut_id = 'Aucun statut de rendez-vous n’est configuré pour l’hôpital.';
    return e;
  }, [formData, dateInitiale]);

  const validateStep = (step: number) => {
    const e = erreursEtape(step);
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const isStepValid = (step: number) => Object.keys(erreursEtape(step)).length === 0;

  const nextStep = () => { if (currentStep < totalSteps && validateStep(currentStep)) setCurrentStep(currentStep + 1); };
  const prevStep = () => { if (currentStep > 1) { setCurrentStep(currentStep - 1); setErrors({}); } };
  // Les étapes précédentes et l'étape suivante restent accessibles ; on ne saute pas une étape incomplète.
  const allerA = (step: number) => {
    if (step <= currentStep) { setCurrentStep(step); setErrors({}); return; }
    for (let s = currentStep; s < step; s++) if (!validateStep(s)) { setCurrentStep(s); return; }
    setCurrentStep(step);
  };

  const updateRendezVousField = (field: keyof RendezVousFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const handlePatientChange = (patientName: string, patientId?: number) => {
    setSelectedPatientName(patientName);
    if (patientId) {
      const p = rendezVousService.rechercherPatients('').find((x) => x.patient_id === patientId);
      setFormData((prev) => ({ ...prev, patient_id: patientId, patient_nom: patientName, patient_phone: p?.telephone ?? '', patient_email: p?.email ?? '' }));
      setErrors((prev) => { const n = { ...prev }; delete n.patient_nom; return n; });
    }
  };

  const handleMedecinChange = (medecinName: string, medecinId?: number) => {
    setSelectedMedecinName(medecinName);
    if (medecinId) {
      const m = rendezVousService.rechercherMedecins('').find((x) => x.medecin_id === medecinId);
      setFormData((prev) => ({ ...prev, medecin_id: medecinId, medecin_nom: medecinName, specialite: m?.specialite ?? '' }));
      setErrors((prev) => { const n = { ...prev }; delete n.medecin_nom; return n; });
    }
  };

  const handleSubmit = async () => {
    if (isSaving) return;
    for (const s of [1, 2, 3, 4]) if (!validateStep(s)) { setCurrentStep(s); return; }
    setIsSaving(true);
    try {
      await onSave(formData, isModifying);
      onSuccess?.(isModifying ? 'Rendez-vous modifié avec succès' : 'Rendez-vous créé avec succès');
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du rendez-vous:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const ProgressBar = () => (
    <div className="mb-6">
      <div className="mb-2 flex justify-between">
        {[1, 2, 3, 4].map((step) => (
          <button key={step} type="button" onClick={() => allerA(step)}
            className={`flex flex-col items-center transition-all duration-200 ${step <= currentStep ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500'}`}>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-200 ${step <= currentStep ? 'border-brand-600 bg-brand-600 text-white' : 'border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-700'}`}>
              {step}
            </div>
            <span className="mt-1 text-xs font-medium">{['Patient', 'Médecin et horaire', 'Motif', 'Finalisation'][step - 1]}</span>
          </button>
        ))}
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
        <div className="h-2 rounded-full bg-brand-600 transition-all duration-500" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
      </div>
    </div>
  );

  const inputClass = 'w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white';
  const erreur = (cle: string) => errors[cle] && <p className="mt-1 text-sm text-red-500">{errors[cle]}</p>;
  const dateLisible = formData.date_heure ? new Date(formData.date_heure).toLocaleString('fr-HT', { dateStyle: 'full', timeStyle: 'short' }) : '';

  return (
    <div className="flex h-[90vh] w-full flex-col">
      <div className="flex-shrink-0 border-b border-gray-200 p-6 dark:border-gray-700">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isModifying ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'} : étape {currentStep} sur {totalSteps}
          </h2>
          <button type="button" onClick={onClose} aria-label="Fermer"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <ProgressBar />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="p-6">
          {currentStep === 1 && (
            <div className="rounded-lg bg-brand-50 p-6 dark:bg-brand-900/20">
              <h3 className="mb-6 text-lg font-semibold text-brand-800 dark:text-brand-300">Patient</h3>
              <SearchableSelect value={selectedPatientName} onChange={handlePatientChange} type="patient" required
                placeholder="Rechercher par nom, numéro de dossier ou téléphone" error={errors.patient_nom} />
              {formData.patient_id > 0 && (
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                  Téléphone : {formData.patient_phone || 'non renseigné dans le dossier'}
                  {formData.patient_email ? `, e-mail : ${formData.patient_email}` : ''}
                </p>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="rounded-lg bg-green-50 p-6 dark:bg-green-900/20">
              <h3 className="mb-6 text-lg font-semibold text-green-800 dark:text-green-300">Médecin et horaire</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <SearchableSelect value={selectedMedecinName} onChange={handleMedecinChange} type="medecin" required
                    placeholder="Rechercher par nom ou spécialité" error={errors.medecin_nom} />
                  {formData.specialite && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Spécialité : {formData.specialite}</p>}
                </div>
                <div>
                  <label htmlFor="rdv-date" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date et heure <span className="text-red-500">*</span>
                  </label>
                  <input id="rdv-date" type="datetime-local" value={formData.date_heure}
                    {...(formData.date_heure === dateInitiale ? {} : bornes(REGLES.rendezVous, 'datetime-local'))}
                    onChange={(e) => updateRendezVousField('date_heure', e.target.value)}
                    onBlur={() => { const m = formData.date_heure !== dateInitiale ? verifierDate(formData.date_heure, REGLES.rendezVous) : undefined; if (m) setErrors((p) => ({ ...p, date_heure: m })); }}
                    className={`${inputClass} ${errors.date_heure ? 'border-red-500' : ''}`} />
                  {erreur('date_heure')}
                </div>
                <div>
                  <label htmlFor="rdv-duree" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Durée</label>
                  <select id="rdv-duree" value={formData.duree} onChange={(e) => updateRendezVousField('duree', parseInt(e.target.value))} className={inputClass}>
                    {DUREES_CONSULTATION.map((d) => <option key={d} value={d}>{d} minutes</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="rounded-lg bg-yellow-50 p-6 dark:bg-yellow-900/20">
              <h3 className="mb-6 text-lg font-semibold text-yellow-800 dark:text-yellow-300">Motif</h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="rdv-type" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Type de rendez-vous</label>
                  <select id="rdv-type" value={formData.type_id || ''} className={inputClass}
                    onChange={(e) => { const val = parseInt(e.target.value); const t = dynamicTypes.find((x) => idDe(x, 'type_id') === val); if (t) { updateRendezVousField('type_id', val); updateRendezVousField('type_nom', t.nom); } }}>
                    {dynamicTypes.map((t) => <option key={idDe(t, 'type_id')} value={idDe(t, 'type_id')}>{t.nom}</option>)}
                  </select>
                  {erreur('type_id')}
                </div>
                <div>
                  <label htmlFor="rdv-motif" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Motif <span className="text-red-500">*</span>
                  </label>
                  <textarea id="rdv-motif" value={formData.motif} rows={3} maxLength={255} placeholder="Raison du rendez-vous"
                    onChange={(e) => updateRendezVousField('motif', e.target.value)} className={`${inputClass} ${errors.motif ? 'border-red-500' : ''}`} />
                  {erreur('motif')}
                </div>
                <div>
                  <label htmlFor="rdv-notes" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                  <textarea id="rdv-notes" value={formData.notes} rows={2} placeholder="Informations complémentaires"
                    onChange={(e) => updateRendezVousField('notes', e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6 rounded-lg bg-purple-50 p-6 dark:bg-purple-900/20">
              <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300">Finalisation</h3>
              <div>
                <label htmlFor="rdv-statut" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Statut</label>
                <select id="rdv-statut" value={formData.statut_id || ''} className={`${inputClass} md:w-1/2`}
                  onChange={(e) => { const val = parseInt(e.target.value); const s = dynamicStatuts.find((x) => idDe(x, 'statut_id') === val); if (s) { updateRendezVousField('statut_id', val); updateRendezVousField('statut_nom', s.nom); } }}>
                  {dynamicStatuts.map((s) => <option key={idDe(s, 'statut_id')} value={idDe(s, 'statut_id')}>{s.nom}</option>)}
                </select>
                {erreur('statut_id')}
              </div>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-2 rounded-lg bg-white p-4 text-sm dark:bg-gray-800 md:grid-cols-2">
                <div><dt className="text-gray-500">Patient</dt><dd className="font-medium text-gray-900 dark:text-white">{formData.patient_nom || 'À choisir'}</dd></div>
                <div><dt className="text-gray-500">Médecin</dt><dd className="font-medium text-gray-900 dark:text-white">{formData.medecin_nom || 'À choisir'}</dd></div>
                <div><dt className="text-gray-500">Date</dt><dd className="font-medium text-gray-900 first-letter:uppercase dark:text-white">{dateLisible}</dd></div>
                <div><dt className="text-gray-500">Durée et type</dt><dd className="font-medium text-gray-900 dark:text-white">{formData.duree} minutes, {formData.type_nom || 'sans type'}</dd></div>
                <div className="md:col-span-2"><dt className="text-gray-500">Motif</dt><dd className="font-medium text-gray-900 dark:text-white">{formData.motif || 'À préciser'}</dd></div>
              </dl>
              <p className="text-sm text-gray-600 dark:text-gray-400">Le paiement se fait à la caisse, le jour du rendez-vous.</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-gray-200 p-6 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <button type="button" onClick={prevStep} disabled={currentStep === 1}
            className={`rounded-lg px-6 py-3 font-medium transition-colors ${currentStep === 1 ? 'cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500' : 'bg-gray-600 text-white hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500'}`}>
            Précédent
          </button>
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
              Annuler
            </button>
            {currentStep === totalSteps ? (
              <button type="button" onClick={handleSubmit} disabled={isSaving}
                className={`flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium transition-all duration-200 ${!isSaving ? 'bg-green-600 text-white shadow-md hover:bg-green-700 active:scale-95' : 'cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400'}`}>
                {isSaving ? 'Enregistrement…' : isModifying ? 'Modifier' : 'Enregistrer'}
              </button>
            ) : (
              <button type="button" onClick={nextStep}
                className={`rounded-lg px-6 py-3 font-medium transition-colors ${isStepValid(currentStep) ? 'bg-brand-600 text-white hover:bg-brand-700' : 'bg-brand-600/60 text-white hover:bg-brand-600/70'}`}>
                Suivant
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
