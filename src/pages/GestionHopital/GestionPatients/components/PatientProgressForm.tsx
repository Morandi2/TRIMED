import React, { useState, useEffect } from 'react';
import { PatientFormData, patientService } from '../services/PatientService';

interface PatientProgressFormProps {
    hopitalId: number;
    onSave: (formData: PatientFormData, isModifying: boolean) => void;
    onClose: () => void;
    patientId?: number;
}

export const PatientProgressForm: React.FC<PatientProgressFormProps> = ({
    hopitalId,
    onSave,
    onClose,
    patientId
}) => {
    const [currentStep, setCurrentStep] = useState(1);
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

    const [isModifying, setIsModifying] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        const loadPatientData = async () => {
            if (patientId) {
                setIsModifying(true);
                try {
                    const patientComplet = await patientService.obtenirPatientComplet(patientId);
                    if (patientComplet && patientComplet.patient) {
                        setFormData({
                            patient: {
                                nom: patientComplet.patient.nom || '',
                                prenom: patientComplet.patient.prenom || '',
                                date_naissance: patientComplet.patient.date_naissance || '',
                                sexe: patientComplet.patient.sexe || 'M',
                                numero_identification_nationale: patientComplet.patient.numero_identification_nationale || '',
                                telephone: patientComplet.patient.telephone || '',
                                email: patientComplet.patient.email || '',
                                groupe_sanguin: patientComplet.patient.groupe_sanguin || '',
                                numero_dossier_medical: patientComplet.patient.numero_dossier_medical || ''
                            },
                            adresse: patientComplet.adresse ? {
                                pays: patientComplet.adresse.pays || 'Haïti',
                                departement: patientComplet.adresse.departement || '',
                                ville: patientComplet.adresse.ville || '',
                                adresse_ligne1: patientComplet.adresse.adresse_ligne1 || '',
                                adresse_ligne2: patientComplet.adresse.adresse_ligne2 || '',
                                code_postal: patientComplet.adresse.code_postal || ''
                            } : {
                                pays: 'Haïti', departement: '', ville: '', adresse_ligne1: '', adresse_ligne2: '', code_postal: ''
                            },
                            contacts: patientComplet.contacts?.length > 0 ? patientComplet.contacts : [{ nom: '', telephone: '', relation: '' }],
                            assurances: patientComplet.assurances?.length > 0 ? patientComplet.assurances : [{ nom_assurance: '', numero_police: '', date_expiration: '' }],
                            allergies: patientComplet.allergies?.length > 0 ? patientComplet.allergies : [{ nom_allergie: '', description: '' }],
                            antecedents: patientComplet.antecedents?.length > 0 ? patientComplet.antecedents : [{ type_antecedent: 'maladie', description: '', date_debut: '', date_fin: '' }]
                        });
                    }
                } catch (error) {
                    console.error("Erreur de chargement du patient:", error);
                }
            } else {
                setIsModifying(false);
            }
        };

        loadPatientData();
    }, [patientId, hopitalId]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const totalSteps = 5;

    // Validation pour l'étape 1
    const validateStep1 = (): { isValid: boolean; newErrors: { [key: string]: string } } => {
        const { nom, prenom, date_naissance, sexe, email, telephone } = formData.patient;
        const newErrors: { [key: string]: string } = {};

        // Validasyon chan obligatwa
        if (!nom || nom.trim().length === 0) {
            newErrors.nom = 'Nom est obligatoire';
        }

        if (!prenom || prenom.trim().length === 0) {
            newErrors.prenom = 'Prénom est obligatoire';
        }

        if (!date_naissance || date_naissance.length === 0) {
            newErrors.date_naissance = 'Date de naissance est obligatoire';
        } else {
            const birthDate = new Date(date_naissance);
            const today = new Date();
            const minDate = new Date('1900-01-01');
            if (birthDate < minDate || birthDate > today) {
                newErrors.date_naissance = 'Date de naissance invalide';
            }
        }

        if (!sexe || sexe.length === 0) {
            newErrors.sexe = 'Sexe est obligatoire';
        }

        // Validasyon email
        if (email && email.trim().length > 0) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                newErrors.email = 'Format email invalide';
            }
        }

        // Validasyon telefòn
        if (telephone && telephone.trim().length > 0) {
            const cleanedPhone = telephone.replace(/\D/g, '');
            if (cleanedPhone.length !== 11) { // +509 + 8 chif = 11 chif
                newErrors.telephone = 'Le numéro doit avoir 8 chiffres après +509';
            }
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            newErrors
        };
    };

    const isStep1Valid = (): boolean => {
        const validation = validateStep1();
        return validation.isValid;
    };

    const handleFieldBlur = (fieldName: string) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));

        // Valide le champ immédiatement après la perte de focus
        if (currentStep === 1) {
            const validation = validateStep1();
            setErrors(validation.newErrors);
        }
    };

    const nextStep = () => {
        if (currentStep === 1) {
            const validation = validateStep1();
            setErrors(validation.newErrors);
            setTouched({
                nom: true, prenom: true, date_naissance: true,
                sexe: true, email: true, telephone: true
            });

            if (!validation.isValid) {
                return;
            }
        }

        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const updatePatientField = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            patient: { ...prev.patient, [field]: value }
        }));

        // Effacer les erreurs lors de la saisie
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
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

    const addListItem = (
        listName: 'contacts' | 'assurances' | 'allergies' | 'antecedents',
        template:
            | { nom: string; telephone: string; relation: string }
            | { nom_assurance: string; numero_police: string; date_expiration: string }
            | { nom_allergie: string; description: string }
            | { type_antecedent: string; description: string; date_debut: string; date_fin: string }
    ) => {
        setFormData(prev => ({
            ...prev,
            [listName]: [...prev[listName], template]
        }));
    };

    const removeListItem = (listName: 'contacts' | 'assurances' | 'allergies' | 'antecedents', index: number) => {
        setFormData(prev => ({
            ...prev,
            [listName]: prev[listName].filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = () => {
        const validation = validateStep1();
        setErrors(validation.newErrors);
        setTouched({
            nom: true, prenom: true, date_naissance: true,
            sexe: true, email: true, telephone: true
        });

        if (validation.isValid) {
            onSave(formData, isModifying);
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

    const formatTelephone = (value: string): string => {
        const cleaned = value.replace(/\D/g, '');

        // Si +509 est déjà présent, s'assurer qu'il y a 8 chiffres après
        if (cleaned.startsWith('509')) {
            const numbersAfter509 = cleaned.slice(3);
            if (numbersAfter509.length <= 8) {
                const formatted = numbersAfter509.replace(/(\d{2})(?=\d)/g, '$1 ');
                return `+509 ${formatted}`.trim();
            }
        }

        // Si seulement 8 chiffres, ajouter +509
        if (cleaned.length === 8) {
            const formatted = cleaned.replace(/(\d{2})(?=\d)/g, '$1 ');
            return `+509 ${formatted}`.trim();
        }

        return value;
    };

    const handleTelephoneChange = (value: string) => {
        let formatted = value;

        // Si l'utilisateur efface, ne pas formater
        if (value.length < 6) {
            updatePatientField('telephone', value);
            return;
        }

        // Formatage cohérent
        if (!value.startsWith('+509')) {
            const cleaned = value.replace(/\D/g, '');
            if (cleaned.length <= 8) {
                formatted = `+509 ${cleaned.replace(/(\d{2})(?=\d)/g, '$1 ')}`.trim();
            } else {
                // Supposer que +509 est déjà dans les données
                formatted = `+509 ${cleaned.slice(-8).replace(/(\d{2})(?=\d)/g, '$1 ')}`.trim();
            }
        } else {
            formatted = formatTelephone(value);
        }

        updatePatientField('telephone', formatted);
    };

    const validateDate = (date: string, field: string): boolean => {
        if (!date) return true;
        const selectedDate = new Date(date);
        const today = new Date();
        const minDate = new Date('1900-01-01');

        if (field === 'date_naissance') {
            return selectedDate >= minDate && selectedDate <= today;
        }
        if (field === 'date_expiration') {
            return selectedDate >= today;
        }
        return selectedDate >= minDate && selectedDate <= today;
    };

    // Gestion des dates
    const handleDateChange = (value: string, field: string, callback: (value: string) => void) => {
        if (validateDate(value, field)) {
            callback(value);
            // Effacer les erreurs s'il y en avait
            if (errors[field]) {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[field];
                    return newErrors;
                });
            }
        } else {
            // Afficher l'erreur immédiatement
            setErrors(prev => ({
                ...prev,
                [field]: field === 'date_naissance' ? 'Date de naissance invalide' : 'Date expiration invalide'
            }));
        }
    };

    const ProgressBar = () => (
        <div className="mb-6">
            <div className="flex justify-between mb-2">
                {[1, 2, 3, 4, 5].map(step => (
                    <button
                        key={step}
                        onClick={() => setCurrentStep(step)}
                        className={`flex flex-col items-center transition-all duration-200 ${step <= currentStep
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-400 dark:text-gray-500'
                            }`}
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${step <= currentStep
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400'
                                }`}
                        >
                            {step}
                        </div>
                        <span className="text-xs mt-1 font-medium">
                            {step === 1 && 'Information'}
                            {step === 2 && 'Adresse'}
                            {step === 3 && 'Contact'}
                            {step === 4 && 'Assurance'}
                            {step === 5 && 'Santé'}
                        </span>
                    </button>
                ))}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
            </div>
        </div>
    );

    const inputClass = "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white";
    const errorInputClass = "w-full px-4 py-3 border border-red-500 dark:border-red-400 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white";
    const errorTextClass = "text-red-500 dark:text-red-400 text-sm mt-1";

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center animate-fadeIn">
            <div className="absolute inset-0 bg-black/80" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl transform transition-all duration-300 scale-100 animate-slideUp z-[100000] mx-4">

                {/* Header - Fixed */}
                <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {isModifying ? 'Modifier Patient' : 'Nouveau Patient'} - Étape {currentStep}/{totalSteps}
                        </h2>
                        <button
                            onClick={onClose}
                            className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            aria-label="Fermer"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                    <ProgressBar />
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    <div className="p-6">
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-6">Informations Personnelles</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Nom <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.patient.nom}
                                                onChange={(e) => updatePatientField('nom', e.target.value)}
                                                onBlur={() => handleFieldBlur('nom')}
                                                className={errors.nom && touched.nom ? errorInputClass : inputClass}
                                                placeholder="Entrez le nom"
                                                required
                                            />
                                            {errors.nom && touched.nom && (
                                                <div className={errorTextClass}>{errors.nom}</div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Prénom <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.patient.prenom}
                                                onChange={(e) => updatePatientField('prenom', e.target.value)}
                                                onBlur={() => handleFieldBlur('prenom')}
                                                className={errors.prenom && touched.prenom ? errorInputClass : inputClass}
                                                placeholder="Entrez le prénom"
                                                required
                                            />
                                            {errors.prenom && touched.prenom && (
                                                <div className={errorTextClass}>{errors.prenom}</div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Date de naissance <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.patient.date_naissance}
                                                onChange={(e) => handleDateChange(
                                                    e.target.value,
                                                    'date_naissance',
                                                    (value) => updatePatientField('date_naissance', value)
                                                )}
                                                onBlur={() => handleFieldBlur('date_naissance')}
                                                className={errors.date_naissance && touched.date_naissance ? errorInputClass : inputClass}
                                                min="1900-01-01"
                                                max={new Date().toISOString().split('T')[0]}
                                                required
                                            />
                                            {errors.date_naissance && touched.date_naissance && (
                                                <div className={errorTextClass}>{errors.date_naissance}</div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Sexe <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={formData.patient.sexe}
                                                onChange={(e) => updatePatientField('sexe', e.target.value)}
                                                onBlur={() => handleFieldBlur('sexe')}
                                                className={errors.sexe && touched.sexe ? errorInputClass : inputClass}
                                                required
                                            >
                                                <option value="M">Masculin</option>
                                                <option value="F">Féminin</option>
                                            </select>
                                            {errors.sexe && touched.sexe && (
                                                <div className={errorTextClass}>{errors.sexe}</div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                NIF/CIN
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.patient.numero_identification_nationale}
                                                onChange={(e) => handleNIFCINChange(e.target.value)}
                                                className={inputClass}
                                                placeholder="000 000 000 000"
                                                maxLength={15}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Téléphone
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.patient.telephone}
                                                onChange={(e) => handleTelephoneChange(e.target.value)}
                                                onBlur={() => handleFieldBlur('telephone')}
                                                className={errors.telephone && touched.telephone ? errorInputClass : inputClass}
                                                placeholder="+509 00 00 00 00"
                                                maxLength={17}
                                            />
                                            {errors.telephone && touched.telephone && (
                                                <div className={errorTextClass}>{errors.telephone}</div>
                                            )}
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Format: +509 suivie de 8 chiffres
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={formData.patient.email}
                                                onChange={(e) => updatePatientField('email', e.target.value)}
                                                onBlur={() => handleFieldBlur('email')}
                                                className={errors.email && touched.email ? errorInputClass : inputClass}
                                                placeholder="exemple@email.com"
                                            />
                                            {errors.email && touched.email && (
                                                <div className={errorTextClass}>{errors.email}</div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Groupe sanguin
                                            </label>
                                            <select
                                                value={formData.patient.groupe_sanguin}
                                                onChange={(e) => updatePatientField('groupe_sanguin', e.target.value)}
                                                className={inputClass}
                                            >
                                                <option value="">Sélectionner</option>
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
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Lòt etap yo... */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-6">Adresse</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Pays
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.adresse.pays}
                                                onChange={(e) => updateAdresseField('pays', e.target.value)}
                                                className={inputClass}
                                                placeholder="Pays"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Département
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.adresse.departement}
                                                onChange={(e) => updateAdresseField('departement', e.target.value)}
                                                className={inputClass}
                                                placeholder="Département"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Ville
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.adresse.ville}
                                                onChange={(e) => updateAdresseField('ville', e.target.value)}
                                                className={inputClass}
                                                placeholder="Ville"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Code postal
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.adresse.code_postal}
                                                onChange={(e) => updateAdresseField('code_postal', e.target.value)}
                                                className={inputClass}
                                                placeholder="Code postal"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Adresse ligne 1
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.adresse.adresse_ligne1}
                                                onChange={(e) => updateAdresseField('adresse_ligne1', e.target.value)}
                                                className={inputClass}
                                                placeholder="Adresse ligne 1"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Adresse ligne 2
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.adresse.adresse_ligne2}
                                                onChange={(e) => updateAdresseField('adresse_ligne2', e.target.value)}
                                                className={inputClass}
                                                placeholder="Adresse ligne 2 (optionnel)"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-6">Contacts d'urgence</h3>

                                    {formData.contacts.map((contact, index) => (
                                        <div key={index} className="border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="font-medium text-purple-700 dark:text-purple-300">Contact {index + 1}</h4>
                                                {formData.contacts.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeListItem('contacts', index)}
                                                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                                                    >
                                                        Supprimer
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Nom
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={contact.nom}
                                                        onChange={(e) => updateListField('contacts', index, 'nom', e.target.value)}
                                                        className={inputClass}
                                                        placeholder="Nom du contact"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Téléphone
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        value={contact.telephone}
                                                        onChange={(e) => updateListField('contacts', index, 'telephone', e.target.value)}
                                                        className={inputClass}
                                                        placeholder="+509 00 00 00 00"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Relation
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={contact.relation}
                                                        onChange={(e) => updateListField('contacts', index, 'relation', e.target.value)}
                                                        className={inputClass}
                                                        placeholder="Relation (famille, ami...)"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={() => addListItem('contacts', { nom: '', telephone: '', relation: '' })}
                                        className="w-full py-3 border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
                                    >
                                        + Ajouter un autre contact
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-300 mb-6">Assurances</h3>

                                    {formData.assurances.map((assurance, index) => (
                                        <div key={index} className="border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="font-medium text-orange-700 dark:text-orange-300">Assurance {index + 1}</h4>
                                                {formData.assurances.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeListItem('assurances', index)}
                                                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                                                    >
                                                        Supprimer
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Nom de l'assurance
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={assurance.nom_assurance}
                                                        onChange={(e) => updateListField('assurances', index, 'nom_assurance', e.target.value)}
                                                        className={inputClass}
                                                        placeholder="Nom de l'assurance"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Numéro de police
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={assurance.numero_police}
                                                        onChange={(e) => updateListField('assurances', index, 'numero_police', e.target.value)}
                                                        className={inputClass}
                                                        placeholder="Numéro de police"
                                                    />
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Date d'expiration
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={assurance.date_expiration}
                                                        onChange={(e) => handleDateChange(
                                                            e.target.value,
                                                            'date_expiration',
                                                            (value) => updateListField('assurances', index, 'date_expiration', value)
                                                        )}
                                                        className={inputClass}
                                                        min={new Date().toISOString().split('T')[0]}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={() => addListItem('assurances', { nom_assurance: '', numero_police: '', date_expiration: '' })}
                                        className="w-full py-3 border-2 border-dashed border-orange-300 dark:border-orange-700 rounded-lg text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors"
                                    >
                                        + Ajouter une autre assurance
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 5 && (
                            <div className="space-y-6">
                                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-6">Informations de Santé</h3>

                                    {/* Allergies */}
                                    <div className="mb-8">
                                        <h4 className="text-md font-semibold text-red-700 dark:text-red-400 mb-4">Allergies</h4>

                                        {formData.allergies.map((allergie, index) => (
                                            <div key={index} className="border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h5 className="font-medium text-red-600 dark:text-red-400">Allergie {index + 1}</h5>
                                                    {formData.allergies.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeListItem('allergies', index)}
                                                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                                                        >
                                                            Supprimer
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Nom de l'allergie
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={allergie.nom_allergie}
                                                            onChange={(e) => updateListField('allergies', index, 'nom_allergie', e.target.value)}
                                                            className={inputClass}
                                                            placeholder="Nom de l'allergie"
                                                        />
                                                    </div>

                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Description
                                                        </label>
                                                        <textarea
                                                            value={allergie.description}
                                                            onChange={(e) => updateListField('allergies', index, 'description', e.target.value)}
                                                            className={inputClass}
                                                            placeholder="Description des symptômes ou réactions"
                                                            rows={3}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={() => addListItem('allergies', { nom_allergie: '', description: '' })}
                                            className="w-full py-3 border-2 border-dashed border-red-300 dark:border-red-700 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors mb-6"
                                        >
                                            + Ajouter une autre allergie
                                        </button>
                                    </div>

                                    {/* Antécédents médicaux */}
                                    <div>
                                        <h4 className="text-md font-semibold text-red-700 dark:text-red-400 mb-4">Antécédents médicaux</h4>

                                        {formData.antecedents.map((antecedent, index) => (
                                            <div key={index} className="border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h5 className="font-medium text-red-600 dark:text-red-400">Antécédent {index + 1}</h5>
                                                    {formData.antecedents.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeListItem('antecedents', index)}
                                                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                                                        >
                                                            Supprimer
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Type d'antécédent
                                                        </label>
                                                        <select
                                                            value={antecedent.type_antecedent}
                                                            onChange={(e) => updateListField('antecedents', index, 'type_antecedent', e.target.value)}
                                                            className={inputClass}
                                                        >
                                                            <option value="maladie">Maladie</option>
                                                            <option value="chirurgie">Chirurgie</option>
                                                            <option value="traitement">Traitement</option>
                                                            <option value="familial">Antécédent familial</option>
                                                            <option value="autre">Autre</option>
                                                        </select>
                                                    </div>

                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Description
                                                        </label>
                                                        <textarea
                                                            value={antecedent.description}
                                                            onChange={(e) => updateListField('antecedents', index, 'description', e.target.value)}
                                                            className={inputClass}
                                                            placeholder="Description de l'antécédent médical"
                                                            rows={3}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Date de début
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={antecedent.date_debut}
                                                            onChange={(e) => handleDateChange(
                                                                e.target.value,
                                                                'date_debut',
                                                                (value) => updateListField('antecedents', index, 'date_debut', value)
                                                            )}
                                                            className={inputClass}
                                                            max={new Date().toISOString().split('T')[0]}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Date de fin
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={antecedent.date_fin}
                                                            onChange={(e) => handleDateChange(
                                                                e.target.value,
                                                                'date_fin',
                                                                (value) => updateListField('antecedents', index, 'date_fin', value)
                                                            )}
                                                            className={inputClass}
                                                            max={new Date().toISOString().split('T')[0]}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={() => addListItem('antecedents', { type_antecedent: 'maladie', description: '', date_debut: '', date_fin: '' })}
                                            className="w-full py-3 border-2 border-dashed border-red-300 dark:border-red-700 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                        >
                                            + Ajouter un autre antécédent
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer - Fixed */}
                <div className="flex-shrink-0 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex justify-between items-center">
                        <button
                            type="button"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${currentStep === 1
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                                : 'bg-gray-600 text-white hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500'
                                }`}
                        >
                            Précédent
                        </button>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Annuler
                            </button>

                            {currentStep === totalSteps ? (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={!isStep1Valid()}
                                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${isStep1Valid()
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                                        }`}
                                >
                                    {isModifying ? 'Modifier' : 'Enregistrer'}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={!isStep1Valid()}
                                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${isStep1Valid()
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                                        }`}
                                >
                                    Suivant
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};