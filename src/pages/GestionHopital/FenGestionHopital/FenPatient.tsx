/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import Badge from "../../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

// Interfaces TypeScript
interface Patient {
  patient_id: number;
  hopital_id: number;
  nom: string;
  prenom: string;
  date_naissance: string;
  sexe: 'M' | 'F';
  numero_dossier_medical: string;
  numero_identification_nationale?: string;
  telephone?: string;
  email?: string;
  groupe_sanguin?: string;
  cree_le: string;
  modifie_le: string;
}

interface AdressePatient {
  adresse_id: number;
  patient_id: number;
  pays: string;
  departement: string;
  ville: string;
  adresse_ligne1: string;
  adresse_ligne2?: string;
  code_postal: string;
  cree_le: string;
  modifie_le: string;
}

interface PersonneAContacter {
  contact_id: number;
  patient_id: number;
  nom: string;
  telephone: string;
  relation: string;
  cree_le: string;
}

interface AssurancePatient {
  assurance_id: number;
  patient_id: number;
  nom_assurance: string;
  numero_police: string;
  date_expiration: string;
  cree_le: string;
}

interface AllergiePatient {
  allergie_id: number;
  patient_id: number;
  nom_allergie: string;
  description?: string;
  cree_le: string;
}

interface AntecedentMedical {
  antecedent_id: number;
  patient_id: number;
  type_antecedent: 'maladie' | 'chirurgie' | 'autre';
  description: string;
  date_debut?: string;
  date_fin?: string;
  cree_le: string;
}

interface PatientFormData {
  patient: Omit<Patient, 'patient_id' | 'hopital_id' | 'cree_le' | 'modifie_le' | 'numero_dossier_medical'>;
  adresse: Omit<AdressePatient, 'adresse_id' | 'patient_id' | 'cree_le' | 'modifie_le'>;
  contacts: Omit<PersonneAContacter, 'contact_id' | 'patient_id' | 'cree_le'>[];
  assurances: Omit<AssurancePatient, 'assurance_id' | 'patient_id' | 'cree_le'>[];
  allergies: Omit<AllergiePatient, 'allergie_id' | 'patient_id' | 'cree_le'>[];
  antecedents: Omit<AntecedentMedical, 'antecedent_id' | 'patient_id' | 'cree_le'>[];
}

interface Hopital {
  tenant_id: number;
  nom: string;
  adresse: string;
  telephone: string;
}

// Service de gestion des patients
class PatientService {
  private patients: Patient[] = [];
  private adresses: AdressePatient[] = [];
  private contacts: PersonneAContacter[] = [];
  private assurances: AssurancePatient[] = [];
  private allergies: AllergiePatient[] = [];
  private antecedents: AntecedentMedical[] = [];

  constructor() {
    this.loadFromStorage();
    this.initializeSampleData();
  }

  private loadFromStorage() {
    try {
      this.patients = JSON.parse(localStorage.getItem('patients') || '[]');
      this.adresses = JSON.parse(localStorage.getItem('adresses_patient') || '[]');
      this.contacts = JSON.parse(localStorage.getItem('contacts_patient') || '[]');
      this.assurances = JSON.parse(localStorage.getItem('assurances_patient') || '[]');
      this.allergies = JSON.parse(localStorage.getItem('allergies_patient') || '[]');
      this.antecedents = JSON.parse(localStorage.getItem('antecedents_patient') || '[]');
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      this.patients = [];
      this.adresses = [];
      this.contacts = [];
      this.assurances = [];
      this.allergies = [];
      this.antecedents = [];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('patients', JSON.stringify(this.patients));
      localStorage.setItem('adresses_patient', JSON.stringify(this.adresses));
      localStorage.setItem('contacts_patient', JSON.stringify(this.contacts));
      localStorage.setItem('assurances_patient', JSON.stringify(this.assurances));
      localStorage.setItem('allergies_patient', JSON.stringify(this.allergies));
      localStorage.setItem('antecedents_patient', JSON.stringify(this.antecedents));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données:', error);
    }
  }

  private initializeSampleData() {
    if (this.patients.length === 0) {
      const samplePatients = [
        {
          patient_id: 1,
          hopital_id: 1,
          nom: "JEAN",
          prenom: "Pierre",
          date_naissance: "1985-03-15",
          sexe: 'M' as const,
          numero_dossier_medical: "H001P00001",
          numero_identification_nationale: "00123456789",
          telephone: "+50931234567",
          email: "pierre.jean@example.com",
          groupe_sanguin: "O+",
          cree_le: new Date().toISOString(),
          modifie_le: new Date().toISOString()
        },
        {
          patient_id: 2,
          hopital_id: 1,
          nom: "LAURENT",
          prenom: "Marie",
          date_naissance: "1990-07-22",
          sexe: 'F' as const,
          numero_dossier_medical: "H001P00002",
          numero_identification_nationale: "00234567890",
          telephone: "+50942234567",
          email: "marie.laurent@example.com",
          groupe_sanguin: "A+",
          cree_le: new Date().toISOString(),
          modifie_le: new Date().toISOString()
        },
        {
          patient_id: 3,
          hopital_id: 1,
          nom: "PIERRE",
          prenom: "Jean-Claude",
          date_naissance: "1978-11-30",
          sexe: 'M' as const,
          numero_dossier_medical: "H001P00003",
          numero_identification_nationale: "00345678901",
          telephone: "+50933214567",
          email: "jc.pierre@example.com",
          groupe_sanguin: "B+",
          cree_le: new Date().toISOString(),
          modifie_le: new Date().toISOString()
        },
        {
          patient_id: 4,
          hopital_id: 1,
          nom: "MARTIN",
          prenom: "Sophie",
          date_naissance: "1995-05-18",
          sexe: 'F' as const,
          numero_dossier_medical: "H001P00004",
          numero_identification_nationale: "00456789012",
          telephone: "+50937214568",
          email: "sophie.martin@example.com",
          groupe_sanguin: "AB+",
          cree_le: new Date().toISOString(),
          modifie_le: new Date().toISOString()
        }
      ];

      this.patients = samplePatients;
      this.saveToStorage();
    }
  }

  creerPatientComplet(formData: PatientFormData, hopitalId: number): { success: boolean; data?: Patient; errors?: string[] } {
    const errors: string[] = [];

    if (!formData.patient.nom?.trim()) errors.push("Nom est requis");
    if (!formData.patient.prenom?.trim()) errors.push("Prenom est requis");
    if (!formData.patient.date_naissance) errors.push("Date naissance est requise");

    // Validation NIF/CIN
    if (formData.patient.numero_identification_nationale) {
      const nifCin = formData.patient.numero_identification_nationale.replace(/\s/g, '');
      if (!/^\d{9,13}$/.test(nifCin)) {
        errors.push("Le NIF/CIN doit contenir entre 9 et 13 chiffres");
      }
    }

    if (errors.length > 0) return { success: false, errors };

    try {
      const nouveauPatient: Patient = {
        ...formData.patient,
        patient_id: Date.now(),
        hopital_id: hopitalId,
        numero_dossier_medical: this.genererNumeroDossierMedical(hopitalId),
        cree_le: new Date().toISOString(),
        modifie_le: new Date().toISOString()
      };
      this.patients.push(nouveauPatient);

      if (formData.adresse.adresse_ligne1) {
        const nouvelleAdresse: AdressePatient = {
          ...formData.adresse,
          adresse_id: Date.now() + 1,
          patient_id: nouveauPatient.patient_id,
          cree_le: new Date().toISOString(),
          modifie_le: new Date().toISOString()
        };
        this.adresses.push(nouvelleAdresse);
      }

      formData.contacts.forEach(contact => {
        if (contact.nom && contact.telephone) {
          const nouveauContact: PersonneAContacter = {
            ...contact,
            contact_id: Date.now() + Math.random(),
            patient_id: nouveauPatient.patient_id,
            cree_le: new Date().toISOString()
          };
          this.contacts.push(nouveauContact);
        }
      });

      formData.assurances.forEach(assurance => {
        if (assurance.nom_assurance) {
          const nouvelleAssurance: AssurancePatient = {
            ...assurance,
            assurance_id: Date.now() + Math.random(),
            patient_id: nouveauPatient.patient_id,
            cree_le: new Date().toISOString()
          };
          this.assurances.push(nouvelleAssurance);
        }
      });

      formData.allergies.forEach(allergie => {
        if (allergie.nom_allergie) {
          const nouvelleAllergie: AllergiePatient = {
            ...allergie,
            allergie_id: Date.now() + Math.random(),
            patient_id: nouveauPatient.patient_id,
            cree_le: new Date().toISOString()
          };
          this.allergies.push(nouvelleAllergie);
        }
      });

      formData.antecedents.forEach(antecedent => {
        if (antecedent.description) {
          const nouvelAntecedent: AntecedentMedical = {
            ...antecedent,
            antecedent_id: Date.now() + Math.random(),
            patient_id: nouveauPatient.patient_id,
            cree_le: new Date().toISOString()
          };
          this.antecedents.push(nouvelAntecedent);
        }
      });

      this.saveToStorage();
      return { success: true, data: nouveauPatient };

    } catch (error) {
      console.error('Erreur lors de la création du patient:', error);
      return { success: false, errors: ["Erreur lors de la création"] };
    }
  }

  obtenirPatientsParHopital(hopitalId: number): Patient[] {
    return this.patients.filter(p => p.hopital_id === hopitalId);
  }

  obtenirPatientComplet(patientId: number) {
    const patient = this.patients.find(p => p.patient_id === patientId);
    if (!patient) return null;

    const adresse = this.adresses.find(a => a.patient_id === patientId);
    const contacts = this.contacts.filter(c => c.patient_id === patientId);
    const assurances = this.assurances.filter(a => a.patient_id === patientId);
    const allergies = this.allergies.filter(a => a.patient_id === patientId);
    const antecedents = this.antecedents.filter(a => a.patient_id === patientId);

    return {
      patient,
      adresse,
      contacts,
      assurances,
      allergies,
      antecedents
    };
  }

  modifierPatient(patientId: number, updates: Partial<Patient>): { success: boolean; errors?: string[] } {
    const index = this.patients.findIndex(p => p.patient_id === patientId);
    if (index === -1) return { success: false, errors: ["Patient non trouvé"] };

    this.patients[index] = {
      ...this.patients[index],
      ...updates,
      modifie_le: new Date().toISOString()
    };

    this.saveToStorage();
    return { success: true };
  }

  supprimerPatient(patientId: number): boolean {
    const initialLength = this.patients.length;
    
    this.patients = this.patients.filter(p => p.patient_id !== patientId);
    this.adresses = this.adresses.filter(a => a.patient_id !== patientId);
    this.contacts = this.contacts.filter(c => c.patient_id !== patientId);
    this.assurances = this.assurances.filter(a => a.patient_id !== patientId);
    this.allergies = this.allergies.filter(a => a.patient_id !== patientId);
    this.antecedents = this.antecedents.filter(a => a.patient_id !== patientId);

    this.saveToStorage();
    return this.patients.length < initialLength;
  }

  genererNumeroDossierMedical(hopitalId: number): string {
    const patientsHopital = this.obtenirPatientsParHopital(hopitalId);
    const count = patientsHopital.length + 1;
    return `H${hopitalId.toString().padStart(3, '0')}P${count.toString().padStart(5, '0')}`;
  }
}

const patientService = new PatientService();

// Composant Progress Form
interface PatientProgressFormProps {
  hopitalId: number;
  onSave: (formData: PatientFormData) => void;
  onClose: () => void;
  patientId?: number;
}

const PatientProgressForm: React.FC<PatientProgressFormProps> = ({
  hopitalId,
  onSave,
  onClose,
  patientId
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [canScroll, setCanScroll] = useState(false);
  const [formData, setFormData] = useState<PatientFormData>({
    patient: {
      nom: '',
      prenom: '',
      date_naissance: '',
      sexe: 'M',
      numero_identification_nationale: '',
      telephone: '',
      email: '',
      groupe_sanguin: ''
    },
    adresse: {
      pays: 'Haïti',
      departement: '',
      ville: '',
      adresse_ligne1: '',
      adresse_ligne2: '',
      code_postal: ''
    },
    contacts: [{ nom: '', telephone: '', relation: '' }],
    assurances: [{ nom_assurance: '', numero_police: '', date_expiration: '' }],
    allergies: [{ nom_allergie: '', description: '' }],
    antecedents: [{ type_antecedent: 'maladie', description: '', date_debut: '', date_fin: '' }]
  });

  useEffect(() => {
    if (patientId) {
      const patientComplet = patientService.obtenirPatientComplet(patientId);
      if (patientComplet) {
        setFormData({
          patient: {
            nom: patientComplet.patient.nom,
            prenom: patientComplet.patient.prenom,
            date_naissance: patientComplet.patient.date_naissance,
            sexe: patientComplet.patient.sexe,
            numero_identification_nationale: patientComplet.patient.numero_identification_nationale || '',
            telephone: patientComplet.patient.telephone || '',
            email: patientComplet.patient.email || '',
            groupe_sanguin: patientComplet.patient.groupe_sanguin || ''
          },
          adresse: patientComplet.adresse ? {
            pays: patientComplet.adresse.pays,
            departement: patientComplet.adresse.departement,
            ville: patientComplet.adresse.ville,
            adresse_ligne1: patientComplet.adresse.adresse_ligne1,
            adresse_ligne2: patientComplet.adresse.adresse_ligne2 || '',
            code_postal: patientComplet.adresse.code_postal
          } : {
            pays: 'Haïti',
            departement: '',
            ville: '',
            adresse_ligne1: '',
            adresse_ligne2: '',
            code_postal: ''
          },
          contacts: patientComplet.contacts.length > 0 ? patientComplet.contacts : [{ nom: '', telephone: '', relation: '' }],
          assurances: patientComplet.assurances.length > 0 ? patientComplet.assurances : [{ nom_assurance: '', numero_police: '', date_expiration: '' }],
          allergies: patientComplet.allergies.length > 0 ? patientComplet.allergies : [{ nom_allergie: '', description: '' }],
          antecedents: patientComplet.antecedents.length > 0 ? patientComplet.antecedents : [{ type_antecedent: 'maladie', description: '', date_debut: '', date_fin: '' }]
        });
      }
    }
  }, [patientId, hopitalId]);

  const totalSteps = 5;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      setCanScroll(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setCanScroll(false);
    }
  };

  const updatePatientField = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      patient: { ...prev.patient, [field]: value }
    }));
  };

  const updateAdresseField = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      adresse: { ...prev.adresse, [field]: value }
    }));
  };

  const updateListField = (listName: 'contacts' | 'assurances' | 'allergies' | 'antecedents', index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [listName]: prev[listName].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addListItem = (listName: 'contacts' | 'assurances' | 'allergies' | 'antecedents', template: any) => {
    setFormData(prev => ({
      ...prev,
      [listName]: [...prev[listName], template]
    }));
    setCanScroll(true);
  };

  const removeListItem = (listName: 'contacts' | 'assurances' | 'allergies' | 'antecedents', index: number) => {
    setFormData(prev => ({
      ...prev,
      [listName]: prev[listName].filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.patient.nom && formData.patient.prenom && formData.patient.date_naissance);
      default:
        return true;
    }
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      onSave(formData);
    }
  };

  const formatNIFCIN = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{3})(?=\d)/g, '$1 ');
    return formatted.trim();
  };

  const handleNIFCINChange = (value: string) => {
    const formatted = formatNIFCIN(value);
    updatePatientField('numero_identification_nationale', formatted);
  };

  const ProgressBar = () => (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        {[1, 2, 3, 4, 5].map(step => (
          <button
            key={step}
            onClick={() => {
              setCurrentStep(step);
              setCanScroll(false);
            }}
            className={`flex flex-col items-center ${
              step <= currentStep ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              {step}
            </div>
            <span className="text-xs mt-1">
              {step === 1 && 'Information'}
              {step === 2 && 'Adresse'}
              {step === 3 && 'Contact'}
              {step === 4 && 'Assurance'}
              {step === 5 && 'Santé'}
            </span>
          </button>
        ))}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[8000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
              {patientId ? 'Modifier Patient' : 'Nouveau Patient'} - Étape {currentStep}/{totalSteps}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <ProgressBar />
        </div>

        <div 
          className={`p-6 ${canScroll ? 'overflow-y-auto' : 'overflow-y-hidden'}`} 
          style={{ maxHeight: 'calc(85vh - 160px)' }}
        >
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Informations Personnelles</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Nom *</label>
                  <input
                    type="text"
                    value={formData.patient.nom}
                    onChange={(e) => updatePatientField('nom', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Prénom *</label>
                  <input
                    type="text"
                    value={formData.patient.prenom}
                    onChange={(e) => updatePatientField('prenom', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Date Naissance *</label>
                  <input
                    type="date"
                    value={formData.patient.date_naissance}
                    onChange={(e) => updatePatientField('date_naissance', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Sexe *</label>
                  <select
                    value={formData.patient.sexe}
                    onChange={(e) => updatePatientField('sexe', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">NIF/CIN</label>
                  <input
                    type="text"
                    value={formData.patient.numero_identification_nationale}
                    onChange={(e) => handleNIFCINChange(e.target.value)}
                    placeholder="123 456 789"
                    maxLength={15}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Format: 9 à 13 chiffres (ex: 001 234 567 89)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.patient.telephone}
                    onChange={(e) => updatePatientField('telephone', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  value={formData.patient.email}
                  onChange={(e) => updatePatientField('email', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Adresse (Facultatif)</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Pays</label>
                <input
                  type="text"
                  value={formData.adresse.pays}
                  onChange={(e) => updateAdresseField('pays', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Département</label>
                  <input
                    type="text"
                    value={formData.adresse.departement}
                    onChange={(e) => updateAdresseField('departement', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Ville</label>
                  <input
                    type="text"
                    value={formData.adresse.ville}
                    onChange={(e) => updateAdresseField('ville', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Adresse Ligne 1</label>
                <input
                  type="text"
                  value={formData.adresse.adresse_ligne1}
                  onChange={(e) => updateAdresseField('adresse_ligne1', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Adresse Ligne 2</label>
                <input
                  type="text"
                  value={formData.adresse.adresse_ligne2}
                  onChange={(e) => updateAdresseField('adresse_ligne2', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Code Postal</label>
                <input
                  type="text"
                  value={formData.adresse.code_postal}
                  onChange={(e) => updateAdresseField('code_postal', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Personnes à Contacter (Facultatif)</h3>
              
              {formData.contacts.map((contact, index) => (
                <div key={index} className="border border-gray-300 dark:border-gray-600 p-6 rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-800 dark:text-white/90">Contact {index + 1}</h4>
                    {formData.contacts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeListItem('contacts', index)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Nom</label>
                      <input
                        type="text"
                        value={contact.nom}
                        onChange={(e) => updateListField('contacts', index, 'nom', e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Téléphone</label>
                      <input
                        type="tel"
                        value={contact.telephone}
                        onChange={(e) => updateListField('contacts', index, 'telephone', e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Relation</label>
                    <input
                      type="text"
                      value={contact.relation}
                      onChange={(e) => updateListField('contacts', index, 'relation', e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="ex: Parent, Conjoint, Ami..."
                    />
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => addListItem('contacts', { nom: '', telephone: '', relation: '' })}
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-6 py-3 rounded-lg text-gray-700 dark:text-gray-300 font-medium transition-colors"
              >
                + Ajouter un Contact
              </button>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Assurances (Facultatif)</h3>
              
              {formData.assurances.map((assurance, index) => (
                <div key={index} className="border border-gray-300 dark:border-gray-600 p-6 rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-800 dark:text-white/90">Assurance {index + 1}</h4>
                    {formData.assurances.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeListItem('assurances', index)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Nom Assurance</label>
                    <input
                      type="text"
                      value={assurance.nom_assurance}
                      onChange={(e) => updateListField('assurances', index, 'nom_assurance', e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Numéro Police</label>
                      <input
                        type="text"
                        value={assurance.numero_police}
                        onChange={(e) => updateListField('assurances', index, 'numero_police', e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Date Expiration</label>
                      <input
                        type="date"
                        value={assurance.date_expiration}
                        onChange={(e) => updateListField('assurances', index, 'date_expiration', e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => addListItem('assurances', { nom_assurance: '', numero_police: '', date_expiration: '' })}
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-6 py-3 rounded-lg text-gray-700 dark:text-gray-300 font-medium transition-colors"
              >
                + Ajouter une Assurance
              </button>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Informations de Santé (Facultatif)</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Groupe Sanguin</label>
                  <select
                    value={formData.patient.groupe_sanguin}
                    onChange={(e) => updatePatientField('groupe_sanguin', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner groupe sanguin</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <h4 className="font-medium text-gray-800 dark:text-white/90">Allergies</h4>
                
                {formData.allergies.map((allergie, index) => (
                  <div key={index} className="border border-gray-300 dark:border-gray-600 p-6 rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-800 dark:text-white/90">Allergie {index + 1}</h4>
                      {formData.allergies.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeListItem('allergies', index)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Nom Allergie</label>
                      <input
                        type="text"
                        value={allergie.nom_allergie}
                        onChange={(e) => updateListField('allergies', index, 'nom_allergie', e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="ex: Pénicilline, Poussière, Aliment..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Description</label>
                      <textarea
                        value={allergie.description}
                        onChange={(e) => updateListField('allergies', index, 'description', e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => addListItem('allergies', { nom_allergie: '', description: '' })}
                  className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-6 py-3 rounded-lg text-gray-700 dark:text-gray-300 font-medium transition-colors"
                >
                  + Ajouter une Allergie
                </button>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Antécédents Médicaux (Facultatif)</h3>
                
                {formData.antecedents.map((antecedent, index) => (
                  <div key={index} className="border border-gray-300 dark:border-gray-600 p-6 rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-800 dark:text-white/90">Antécédent {index + 1}</h4>
                      {formData.antecedents.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeListItem('antecedents', index)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Type Antécédent</label>
                      <select
                        value={antecedent.type_antecedent}
                        onChange={(e) => updateListField('antecedents', index, 'type_antecedent', e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="maladie">Maladie</option>
                        <option value="chirurgie">Chirurgie</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Description</label>
                      <textarea
                        value={antecedent.description}
                        onChange={(e) => updateListField('antecedents', index, 'description', e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Date Début</label>
                        <input
                          type="date"
                          value={antecedent.date_debut}
                          onChange={(e) => updateListField('antecedents', index, 'date_debut', e.target.value)}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Date Fin</label>
                        <input
                          type="date"
                          value={antecedent.date_fin}
                          onChange={(e) => updateListField('antecedents', index, 'date_fin', e.target.value)}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => addListItem('antecedents', { type_antecedent: 'maladie', description: '', date_debut: '', date_fin: '' })}
                  className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-6 py-3 rounded-lg text-gray-700 dark:text-gray-300 font-medium transition-colors"
                >
                  + Ajouter un Antécédent
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              currentStep === 1 
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Précédent
          </button>
          
          <div className="flex gap-3">
            {currentStep === 1 && (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
            )}
            
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Suivant
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!validateStep(1)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  validateStep(1)
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-green-300 dark:bg-green-800 text-white cursor-not-allowed'
                }`}
              >
                {patientId ? 'Modifier' : 'Créer'} Patient
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant Tooltip
const Tooltip = ({ 
  children, 
  text 
}: { 
  children: React.ReactNode;
  text: string;
}) => {
  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap shadow-lg">
        {text}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
};

// Composant principal GestionPatients
const hopitalCourant: Hopital = {
  tenant_id: 1,
  nom: "Hôpital Général de Port-au-Prince",
  adresse: "Port-au-Prince",
  telephone: "+509 28 11 22 33"
};

const GestionPatients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | "view" | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedPatientComplet, setSelectedPatientComplet] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [formErrors, setFormErrors] = useState<string[]>([]);
  
  const patientsPerPage = 5;
  const hopitalId = hopitalCourant.tenant_id;

  useEffect(() => {
    loadPatients();
  }, [hopitalId]);

  useEffect(() => {
    if (modalType) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [modalType]);

  const loadPatients = () => {
    const patientsData = patientService.obtenirPatientsParHopital(hopitalId);
    setPatients(patientsData);
  };

  const handleCreatePatient = (formData: PatientFormData) => {
    const result = patientService.creerPatientComplet(formData, hopitalId);
    
    if (result.success) {
      loadPatients();
      setModalType(null);
      setFormErrors([]);
    } else {
      setFormErrors(result.errors || ["Erreur lors de la création"]);
    }
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setModalType("edit");
    setFormErrors([]);
  };

  const handleViewPatient = (patient: Patient) => {
    const patientComplet = patientService.obtenirPatientComplet(patient.patient_id);
    setSelectedPatientComplet(patientComplet);
    setModalType("view");
  };

  const handleDeleteClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setModalType("delete");
  };

  const handleDeleteConfirm = () => {
    if (selectedPatient) {
      const success = patientService.supprimerPatient(selectedPatient.patient_id);
      if (success) {
        loadPatients();
      }
      setModalType(null);
      setSelectedPatient(null);
    }
  };

  const handleAddPatient = () => {
    setSelectedPatient(null);
    setModalType("add");
    setFormErrors([]);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedPatient(null);
    setSelectedPatientComplet(null);
    setFormErrors([]);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    if (modalType) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [modalType]);

  const filteredPatients = patients.filter(patient =>
    `${patient.nom} ${patient.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.numero_dossier_medical.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.telephone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentPatients = filteredPatients.slice(
    (currentPage - 1) * patientsPerPage,
    currentPage * patientsPerPage
  );

  const _totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const getSexeText = (sexe: string) => {
    switch (sexe) {
      case 'M': return 'Masculin';
      case 'F': return 'Féminin';
      default: return sexe;
    }
  };

  const getSexeColor = (sexe: string) => {
    switch (sexe) {
      case 'M': return 'info';
      case 'F': return 'warning';
      default: return 'info';
    }
  };

  const calculateAge = (dateNaissance: string) => {
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const _stats = {
    total: patients.length,
    masculin: patients.filter(p => p.sexe === "M").length,
    feminin: patients.filter(p => p.sexe === "F").length
  };

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Gestion des Patients - {hopitalCourant.nom}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gérez les dossiers patients de votre hôpital
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Tooltip text="Ajouter un nouveau patient">
              <button 
                onClick={handleAddPatient}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-blue-700"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 3.33331V12.6666"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3.33301 8H12.6663"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Nouveau Patient
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Patients Masculins</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.masculin}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
                <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Patients Féminins</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.feminin}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 mb-6 lg:flex-row">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher par nom, prénom, numéro dossier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pl-10 text-theme-sm text-gray-800 placeholder:text-gray-600 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-gray-400 dark:focus:border-blue-500"
              />
              <svg
                className="absolute left-3 top-3 h-4 w-4 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader className="py-3 font-medium text-gray-600 text-start text-theme-xs dark:text-gray-400">
                  ID
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-600 text-start text-theme-xs dark:text-gray-400">
                  Patient
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-600 text-start text-theme-xs dark:text-gray-400">
                  Dossier Medical
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-600 text-start text-theme-xs dark:text-gray-400">
                  Âge
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-600 text-start text-theme-xs dark:text-gray-400">
                  Sexe
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-600 text-start text-theme-xs dark:text-gray-400">
                  Téléphone
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-600 text-start text-theme-xs dark:text-gray-400">
                  Date Création
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-600 text-start text-theme-xs dark:text-gray-400">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {currentPatients.map((patient) => (
                <TableRow key={patient.patient_id}>
                  <TableCell className="py-3">
                    <div className="font-mono text-gray-600 text-theme-sm dark:text-gray-400">
                      #{patient.patient_id}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {patient.prenom} {patient.nom}
                    </div>
                    <div className="text-gray-600 text-theme-xs dark:text-gray-400">
                      {patient.email}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="font-mono text-gray-800 text-theme-sm dark:text-white/90">
                      {patient.numero_dossier_medical}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="text-gray-800 text-theme-sm dark:text-white/90">
                      {calculateAge(patient.date_naissance)} ans
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      size="sm"
                      color={getSexeColor(patient.sexe)}
                    >
                      {getSexeText(patient.sexe)}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="text-gray-800 text-theme-sm dark:text-white/90">
                      {patient.telephone || 'Non renseigné'}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="text-gray-600 text-theme-xs dark:text-gray-400">
                      {new Date(patient.cree_le).toLocaleDateString('fr-FR')}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <Tooltip text="Voir les détails">
                        <button 
                          onClick={() => handleViewPatient(patient)}
                          className="rounded p-1.5 text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </Tooltip>
                      <Tooltip text="Modifier">
                        <button 
                          onClick={() => handleEditPatient(patient)}
                          className="rounded p-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M7.33301 1.33331H5.99967C2.66634 1.33331 1.33301 2.66665 1.33301 5.99998V9.99998C1.33301 13.3333 2.66634 14.6666 5.99967 14.6666H9.99967C13.333 14.6666 14.6663 13.3333 14.6663 9.99998V8.66665"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M10.6933 2.01332L5.43992 7.26665C5.23992 7.46665 5.03992 7.85999 4.99992 8.14665L4.71325 10.1533C4.60659 10.88 5.11992 11.3867 5.84659 11.2867L7.85325 11C8.13325 10.96 8.52659 10.76 8.73325 10.56L13.9866 5.30665C14.8933 4.39999 15.3199 3.34665 13.9866 2.01332C12.6533 0.679985 11.5999 1.10665 10.6933 2.01332Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeMiterlimit="10"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </Tooltip>
                      <Tooltip text="Supprimer">
                        <button 
                          onClick={() => handleDeleteClick(patient)}
                          className="rounded p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M13.3337 3.98666C11.2203 3.76666 9.10033 3.65332 6.98699 3.65332C5.66699 3.65332 4.34699 3.71999 3.02699 3.85332L2.66699 3.98666"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M5.66699 3.31333L5.81366 2.44C5.92033 1.80667 6.00033 1.33333 7.12699 1.33333H8.87366C10.0003 1.33333 10.0869 1.83333 10.187 2.44667L10.3337 3.31333"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12.5663 6.09332L12.133 12.8067C12.0597 13.8533 11.9997 14.6667 10.1397 14.6667H5.85967C3.99967 14.6667 3.93967 13.8533 3.86634 12.8067L3.43301 6.09332"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredPatients.length === 0 && (
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">
              Aucun patient trouvé
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-800 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                >
                  Suivant
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-400">
                    Affichage de <span className="font-medium">{(currentPage - 1) * patientsPerPage + 1}</span> à <span className="font-medium">
                      {Math.min(currentPage * patientsPerPage, filteredPatients.length)}
                    </span> sur <span className="font-medium">{filteredPatients.length}</span> patients
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-600 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 dark:text-gray-400 dark:ring-gray-600 dark:hover:bg-gray-700"
                    >
                      <span className="sr-only">Précédent</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          currentPage === page
                            ? 'bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:text-gray-100 dark:ring-gray-600 dark:hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-600 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 dark:text-gray-400 dark:ring-gray-600 dark:hover:bg-gray-700"
                    >
                      <span className="sr-only">Suivant</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5-4.25a.75.75 0 010 1.08l4.5-4.25a.75.75 0 111.04 1.08l-3.938 3.71 3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06-.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {modalType && (
        <div className="fixed inset-0 z-[8000] flex items-center justify-center">
          {modalType === "add" || modalType === "edit" ? (
            <PatientProgressForm
              hopitalId={hopitalId}
              onSave={handleCreatePatient}
              onClose={closeModal}
              patientId={modalType === "edit" && selectedPatient ? selectedPatient.patient_id : undefined}
            />
          ) : modalType === "delete" && selectedPatient ? (
            <div className="fixed inset-0 z-[8000] flex items-center justify-center">
              <div className="absolute inset-0 bg-black/20" onClick={closeModal}></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6 shadow-2xl">
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
                  Êtes-vous sûr de vouloir supprimer le patient <strong>{selectedPatient.prenom} {selectedPatient.nom}</strong> (ID: #{selectedPatient.patient_id}) ? Cette action est irréversible.
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={closeModal}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ) : modalType === "view" && selectedPatientComplet ? (
            <div className="fixed inset-0 z-[8000] flex items-center justify-center">
              <div className="absolute inset-0 bg-black/20" onClick={closeModal}></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
                    Détails du Patient
                  </h3>
                  <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>

                <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 80px)' }}>
                  <div className="grid grid-cols-1 gap-6">
                    {/* Informations Personnelles */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-4 text-lg">Informations Personnelles</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-700 dark:text-gray-400">ID Patient:</span>
                          <p className="font-mono font-medium text-gray-800 dark:text-white/90">#{selectedPatientComplet.patient.patient_id}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-700 dark:text-gray-400">Nom complet:</span>
                          <p className="font-medium text-gray-800 dark:text-white/90">{selectedPatientComplet.patient.prenom} {selectedPatientComplet.patient.nom}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-700 dark:text-gray-400">Email:</span>
                          <p className="font-medium text-gray-800 dark:text-white/90">{selectedPatientComplet.patient.email || 'Non renseigné'}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-700 dark:text-gray-400">Téléphone:</span>
                          <p className="font-medium text-gray-800 dark:text-white/90">{selectedPatientComplet.patient.telephone || 'Non renseigné'}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-700 dark:text-gray-400">Sexe:</span>
                          <p className="font-medium text-gray-800 dark:text-white/90">{getSexeText(selectedPatientComplet.patient.sexe)}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-700 dark:text-gray-400">Âge:</span>
                          <p className="font-medium text-gray-800 dark:text-white/90">{calculateAge(selectedPatientComplet.patient.date_naissance)} ans</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-700 dark:text-gray-400">Date naissance:</span>
                          <p className="font-medium text-gray-800 dark:text-white/90">
                            {new Date(selectedPatientComplet.patient.date_naissance).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-700 dark:text-gray-400">Groupe sanguin:</span>
                          <p className="font-medium text-gray-800 dark:text-white/90">{selectedPatientComplet.patient.groupe_sanguin || 'Non renseigné'}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-700 dark:text-gray-400">Numéro dossier:</span>
                          <p className="font-mono font-medium text-gray-800 dark:text-white/90">{selectedPatientComplet.patient.numero_dossier_medical}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-700 dark:text-gray-400">NIF/CIN:</span>
                          <p className="font-medium text-gray-800 dark:text-white/90">{selectedPatientComplet.patient.numero_identification_nationale || 'Non renseigné'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Adresse */}
                    {selectedPatientComplet.adresse && (
                      <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                        <h4 className="font-semibold text-green-800 dark:text-green-300 mb-4 text-lg">Adresse</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-gray-700 dark:text-gray-400">Pays:</span>
                            <p className="font-medium text-gray-800 dark:text-white/90">{selectedPatientComplet.adresse.pays}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-700 dark:text-gray-400">Département:</span>
                            <p className="font-medium text-gray-800 dark:text-white/90">{selectedPatientComplet.adresse.departement}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-700 dark:text-gray-400">Ville:</span>
                            <p className="font-medium text-gray-800 dark:text-white/90">{selectedPatientComplet.adresse.ville}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-700 dark:text-gray-400">Code Postal:</span>
                            <p className="font-medium text-gray-800 dark:text-white/90">{selectedPatientComplet.adresse.code_postal}</p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-sm text-gray-700 dark:text-gray-400">Adresse:</span>
                            <p className="font-medium text-gray-800 dark:text-white/90">
                              {selectedPatientComplet.adresse.adresse_ligne1}
                              {selectedPatientComplet.adresse.adresse_ligne2 && `, ${selectedPatientComplet.adresse.adresse_ligne2}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Contacts */}
                    {selectedPatientComplet.contacts.length > 0 && (
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                        <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-4 text-lg">Personnes à Contacter</h4>
                        <div className="space-y-4">
                          {selectedPatientComplet.contacts.map((contact: any, index: number) => (
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
                    {selectedPatientComplet.assurances.length > 0 && (
                      <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg">
                        <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-4 text-lg">Assurances</h4>
                        <div className="space-y-4">
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          {selectedPatientComplet.assurances.map((assurance: any, index: number) => (
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
                    {selectedPatientComplet.allergies.length > 0 && (
                      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
                        <h4 className="font-semibold text-red-800 dark:text-red-300 mb-4 text-lg">Allergies</h4>
                        <div className="space-y-4">
                          {selectedPatientComplet.allergies.map((allergie: any, index: number) => (
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
                    {selectedPatientComplet.antecedents.length > 0 && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
                        <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-4 text-lg">Antécédents Médicaux</h4>
                        <div className="space-y-4">
                          {selectedPatientComplet.antecedents.map((antecedent: any, index: number) => (
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
                    onClick={closeModal}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default GestionPatients;