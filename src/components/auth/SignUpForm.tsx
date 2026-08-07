import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import LoadingSpinner from "../ui/LoadingSpinner";
import { InscriptionData } from "../../api/types/auth.types";
import { Building2, MapPin, Phone, User, Settings, CreditCard, ChevronRight, ChevronLeft, CheckCircle2, Mail, ArrowRight } from "lucide-react";
import { validation } from "../../utils/validation";
import DragDropUpload from "../form/input/DragDropUpload";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";
import { djangoAuthApi } from "../../api/djangoAuthApi";

export default function SignUpForm() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // État du formulaire avec tous les nouveaux champs (Sync Backend)
  const [formData, setFormData] = useState<InscriptionData>({
    // ÉTAPE 1
    nom: "", // Replaces nomHopital
    nomHopital: "", // Keep for legacy
    raisonSociale: "",
    numeroEnregistrement: "",
    nif: "",
    typeEtablissement: "Privé",
    logo: null,
    siteWeb: "",
    description: "",
    documentsJustificatifs: [],

    // ÉTAPE 2
    pays: "Haïti",
    province: "",
    ville: "",
    adresseLigne1: "",
    adresseLigne2: "",
    codePostal: "",

    // ÉTAPE 3
    telephone: "",
    telephoneUrgence: "",
    email: "", // email_professionnel
    emailSupport: "",

    // ÉTAPE 4
    prenomAdmin: "",
    nomAdmin: "",
    adminEmail: "",
    adminTelephone: "",
    password: "",

    // ÉTAPE 5
    nombreLits: "",
    directeur: "",
    urgenceDisponible: false,
    laboratoireDisponible: false,
    pharmacieDisponible: false,
    radiologieDisponible: false,
    heureOuverture: "08:00",
    heureFermeture: "17:00",

    // ÉTAPE 6
    planAbonnement: "Basic",
    cycleFacturation: "Mensuel",

    // Legacy/Internal
    adresse: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);

  // const navigate = useNavigate(); // Removed as unused

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    let finalValue = val;
    if (typeof finalValue === 'string') {
      if (name === 'telephone' || name === 'telephoneUrgence' || name === 'adminTelephone') {
        finalValue = validation.formatHaitiPhone(finalValue);
      } else if (name === 'nif') {
        finalValue = validation.formatNIF(finalValue);
      } else if (name === 'nombreLits') {
        finalValue = finalValue.replace(/\D/g, '').slice(0, 5);
      } else if (name === 'codePostal') {
        finalValue = finalValue.toUpperCase().slice(0, 10);
      } else if (name === 'numeroEnregistrement') {
        finalValue = finalValue.toUpperCase();
      } else if (['nomHopital', 'prenomAdmin', 'nomAdmin', 'ville', 'province', 'raisonSociale'].includes(name)) {
        finalValue = validation.capitalize(finalValue);
      } else if (name === 'siteWeb' || name === 'email' || name === 'adminEmail') {
        finalValue = finalValue.trim().toLowerCase();
      }
    }

    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: finalValue,
        // Keep legacy fields in sync
        adresse: name === 'adresseLigne1' ? (typeof finalValue === 'string' ? finalValue : prev.adresse) : prev.adresse,
        directeur: (name === 'prenomAdmin' || name === 'nomAdmin')
          ? `${name === 'prenomAdmin' ? (typeof finalValue === 'string' ? finalValue : prev.prenomAdmin) : prev.prenomAdmin} ${name === 'nomAdmin' ? (typeof finalValue === 'string' ? finalValue : prev.nomAdmin) : prev.nomAdmin}`.trim()
          : prev.directeur
      };

      // Sync nom and nomHopital
      if (name === 'nom') updated.nomHopital = finalValue as string;
      if (name === 'nomHopital') updated.nom = finalValue as string;

      return updated;
    });
  };

  // Fonction pour remplir rapidement les champs (Test Uniquement)
  const fillTestData = () => {
    const randomSuffix = Math.floor(Math.random() * 10000);
    setFormData({
      nom: `Hôpital Test ${randomSuffix}`,
      nomHopital: `Hôpital Test ${randomSuffix}`,
      raisonSociale: "Santé Test S.A.",
      numeroEnregistrement: `HT-MSPP-${randomSuffix}`,
      nif: "111-111-111-1",
      typeEtablissement: "Privé",
      logo: null,
      siteWeb: "https://www.test-hopital.ht",
      description: "Hôpital de test généré automatiquement pour vérifier l'inscription.",
      documentsJustificatifs: [],
      pays: "Haïti",
      province: "Ouest",
      ville: "Port-au-Prince",
      adresseLigne1: "123 Rue de Test",
      adresseLigne2: "Suite 4B",
      codePostal: "HT-6110",
      telephone: "+509 3000-0000",
      telephoneUrgence: "+509 4000-0000",
      email: `contact${randomSuffix}@test.ht`,
      emailSupport: `support${randomSuffix}@test.ht`,
      prenomAdmin: "Admin",
      nomAdmin: "Testeur",
      adminEmail: `admin${randomSuffix}@test.ht`,
      adminTelephone: "+509 3000-0001",
      password: "Password123!",
      nombreLits: "50",
      directeur: "Dr. Admin Testeur",
      urgenceDisponible: true,
      laboratoireDisponible: true,
      pharmacieDisponible: true,
      radiologieDisponible: false,
      heureOuverture: "08:00",
      heureFermeture: "18:00",
      planAbonnement: "Pro",
      cycleFacturation: "Mensuel",
      adresse: "123 Rue de Test, Port-au-Prince"
    });
    setConfirmPassword("Password123!");
    setIsChecked(true);
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const validateStep = (step: number) => {
    setError(null);
    switch (step) {
      case 1:
        if (!formData.nomHopital || !formData.numeroEnregistrement) {
          setError("Veuillez remplir tous les champs obligatoires (*)");
          return false;
        }
        return true;
      case 2:
        if (!formData.ville || !formData.adresseLigne1) {
          setError("Veuillez fournir l'adresse complète");
          return false;
        }
        return true;
      case 3:
        if (!formData.telephone || !formData.email) {
          setError("Veuillez fournir les informations de contact");
          return false;
        }
        return true;
      case 4:
        if (!formData.prenomAdmin || !formData.nomAdmin || !formData.adminEmail || !formData.password) {
          setError("Veuillez remplir toutes les informations d'administration");
          return false;
        }
        if (formData.password !== confirmPassword) {
          setError("Les mots de passe ne correspondent pas");
          return false;
        }
        if (formData.password.length < 8) {
          setError("Le mot de passe doit contenir au moins 8 caractères");
          return false;
        }
        return true;
      case 5:
        return true;
      case 6:
        if (!isChecked) {
          setError("Vous devez accepter les termes et conditions");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const TOTAL_STEPS = 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Empêche toute soumission implicite (ex: touche Entrée dans un champ) avant
    // la dernière étape. Dans ce cas on avance simplement l'assistant au lieu de
    // déclencher l'inscription prématurément (bug: Submit se déclenchait avant le
    // choix du forfait).
    if (currentStep < TOTAL_STEPS) {
      nextStep();
      return;
    }

    if (!validateStep(TOTAL_STEPS)) return;

    setIsLoadingLocal(true);
    try {
      const result = await djangoAuthApi.inscription(formData);

      if (result.success) {
        setIsVerifying(true);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Une erreur est survenue lors de l'inscription. Veuillez réessayer.");
      console.error(err);
    } finally {
      setIsLoadingLocal(false);
    }
  };

  const steps = [
    { id: 1, title: "Identité", icon: Building2 },
    { id: 2, title: "Localisation", icon: MapPin },
    { id: 3, title: "Contact", icon: Phone },
    { id: 4, title: "Admin", icon: User },
    { id: 5, title: "Opérations", icon: Settings },
    { id: 6, title: "Forfait", icon: CreditCard },
  ];

  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8 bg-white/10 dark:bg-brand-900/20 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl animate-in zoom-in-95 duration-700 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 via-indigo-500 to-brand-500 animate-shimmer" />
        <div className="w-24 h-24 bg-brand-500/10 rounded-3xl flex items-center justify-center mb-8 border border-brand-500/20 group-hover:scale-110 transition-transform duration-500 text-brand-500">
          <Mail className="size-12 animate-bounce-slow" />
        </div>
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">Vérifiez votre boîte mail !</h2>
        <div className="space-y-6 max-w-lg">
          <p className="text-xl text-gray-700 dark:text-brand-100/80 leading-relaxed">
            Un lien d'activation a été envoyé à <br/>
            <span className="font-bold text-brand-600 dark:text-brand-400 select-all">{formData.adminEmail}</span>
          </p>
          <div className="p-6 bg-white/5 dark:bg-black/20 rounded-2xl border border-white/10 text-sm text-gray-500 dark:text-gray-400 flex items-start gap-4 text-left italic">
            <span className="text-brand-500 font-bold text-xl mt-[-4px]">ℹ</span>
            <p>Vérifiez vos spams si vous ne voyez rien après 2 minutes. Le lien expirera dans 24 heures.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
            <Link to="/signin" className="w-full">
              <Button className="w-full py-4 text-base font-bold shadow-xl shadow-brand-500/10 flex items-center justify-center gap-2">
                Aller à la connexion
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <button onClick={() => setIsVerifying(false)} className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-brand-500 transition-colors">
              Retour au formulaire
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col w-full py-4">
        {/* Progress Bar */}
        <div className="mb-12 relative">
          <div className="absolute top-5 left-0 w-full h-[2px] bg-gray-100 dark:bg-gray-800 -z-10" />
          <div 
            className="absolute top-5 left-0 h-[2px] bg-brand-500 transition-all duration-500 -z-10" 
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
          <div className="flex justify-between items-start">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center group">
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 border-2 z-10 ${currentStep >= step.id
                    ? "bg-brand-500 border-brand-500 text-white shadow-xl shadow-brand-500/30 scale-110"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-400 group-hover:border-brand-300"
                    }`}
                >
                  <step.icon size={20} />
                </div>
                <div className="h-0 flex justify-center">
                  <span className={`text-[10px] sm:text-[11px] mt-5 font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-500 ${currentStep >= step.id ? "text-brand-600 dark:text-brand-400 translate-y-1" : "text-gray-400"
                    }`}>
                    {step.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-10 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
                {steps[currentStep - 1].title}
              </h1>
              <p className="text-base text-gray-500 dark:text-gray-400 max-w-2xl">
                Étape {currentStep} sur {steps.length} — Remplissez les informations pour inscrire votre hôpital.
              </p>
            </div>
            {/* Bouton de remplissage auto (affiché en développement ou pour les tests) */}
            <button 
              type="button" 
              onClick={fillTestData}
              className="flex items-center gap-1 text-xs font-bold bg-brand-100/50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 hover:bg-brand-100 hover:scale-105 transition-all px-3 py-1.5 rounded-lg border border-brand-200 dark:border-brand-800 shadow-sm"
            >
              <span className="text-lg leading-none">⚡</span> Auto-Fill
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 text-sm text-red-600 bg-red-100/50 backdrop-blur-sm border border-red-200 rounded-xl animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* STEP 1: General Info */}
              {currentStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label>Nom de l'hôpital<span className="text-brand-500 font-bold ml-1">*</span></Label>
                    <Input name="nom" placeholder="Ex: Hôpital JCC de Carrefour" value={formData.nom} onChange={handleChange} required />
                  </div>
                  <div>
                    <Label>NIF<span className="text-brand-500 font-bold ml-1">*</span></Label>
                    <Input name="nif" placeholder="000-000-000-0" value={formData.nif} onChange={handleChange} required />
                  </div>
                  <div>
                    <Label>Enregistrement MSPP<span className="text-brand-500 font-bold ml-1">*</span></Label>
                    <Input name="numeroEnregistrement" placeholder="Ex: HT-MSPP-001" value={formData.numeroEnregistrement} onChange={handleChange} required />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Documents Justificatifs (Patente, Licence, etc.)<span className="text-brand-500 font-bold ml-1">*</span></Label>
                    <DragDropUpload 
                      files={formData.documentsJustificatifs || []}
                      onFilesSelected={(files) => setFormData(prev => ({ ...prev, documentsJustificatifs: files }))}
                    />
                  </div>
                  <div>
                    <Label>Type d'Établissement<span className="text-error-500">*</span></Label>
                    <select
                      name="typeEtablissement"
                      value={formData.typeEtablissement}
                      onChange={handleChange}
                      className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white"
                    >
                      <option value="Public">Public</option>
                      <option value="Privé">Privé</option>
                      <option value="Clinique">Clinique</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Site Web (URL)</Label>
                    <Input name="siteWeb" placeholder="https://www.hopital.ht" value={formData.siteWeb} onChange={handleChange} />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Description</Label>
                    <textarea
                      name="description"
                      placeholder="Décrivez votre hôpital..."
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white h-24"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Address */}
              {currentStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Pays<span className="text-error-500">*</span></Label>
                    <Input name="pays" value={formData.pays} disabled readOnly />
                  </div>
                  <div>
                    <Label>Département / Province</Label>
                    <Input name="province" placeholder="L'Ouest" value={formData.province} onChange={handleChange} />
                  </div>
                  <div>
                    <Label>Ville<span className="text-error-500">*</span></Label>
                    <Input name="ville" placeholder="Port-au-Prince" value={formData.ville} onChange={handleChange} required />
                  </div>
                  <div>
                    <Label>Code Postal</Label>
                    <Input name="codePostal" placeholder="HT-6110" value={formData.codePostal} onChange={handleChange} />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Adresse Ligne 1<span className="text-error-500">*</span></Label>
                    <Input name="adresseLigne1" placeholder="Numéro, Nom de rue..." value={formData.adresseLigne1} onChange={handleChange} required />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Adresse Ligne 2 (Optionnel)</Label>
                    <Input name="adresseLigne2" placeholder="Appartement, Étage, etc." value={formData.adresseLigne2} onChange={handleChange} />
                  </div>
                  <div className="md:col-span-2 p-4 bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-100 dark:border-brand-800 flex items-center gap-3">
                    <MapPin className="text-brand-500" size={20} />
                    <p className="text-xs text-brand-700 dark:text-brand-300">
                      Bientôt : Intégration de carte pour choisir votre position automatiquement.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 3: Contact */}
              {currentStep === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Téléphone Principal<span className="text-error-500">*</span></Label>
                    <Input type="tel" name="telephone" placeholder="+509 0000-0000" value={formData.telephone} onChange={handleChange} required />
                  </div>
                  <div>
                    <Label>Téléphone d'Urgence</Label>
                    <Input type="tel" name="telephoneUrgence" placeholder="+509 0000-0000" value={formData.telephoneUrgence} onChange={handleChange} />
                  </div>
                  <div>
                    <Label>E-mail Principal<span className="text-error-500">*</span></Label>
                    <Input type="email" name="email" placeholder="contact@hopital.ht" value={formData.email} onChange={handleChange} required />
                  </div>
                  <div>
                    <Label>E-mail de Support (Optionnel)</Label>
                    <Input type="email" name="emailSupport" placeholder="support@hopital.ht" value={formData.emailSupport} onChange={handleChange} />
                  </div>
                </div>
              )}

              {/* STEP 4: Admin Account */}
              {currentStep === 4 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Prénom<span className="text-error-500">*</span></Label>
                    <Input name="prenomAdmin" placeholder="Jean" value={formData.prenomAdmin} onChange={handleChange} required />
                  </div>
                  <div>
                    <Label>Nom<span className="text-error-500">*</span></Label>
                    <Input name="nomAdmin" placeholder="Dupont" value={formData.nomAdmin} onChange={handleChange} required />
                  </div>
                  <div className="md:col-span-2">
                    <Label>E-mail de l'Administrateur<span className="text-error-500">*</span></Label>
                    <Input type="email" name="adminEmail" placeholder="admin@hopital.ht" value={formData.adminEmail} onChange={handleChange} required />
                  </div>
                  <div>
                    <Label>Téléphone de l'Administrateur</Label>
                    <Input type="tel" name="adminTelephone" placeholder="+509 ..." value={formData.adminTelephone} onChange={handleChange} />
                  </div>
                  <div className="md:col-span-2 border-t border-gray-100 dark:border-gray-700 my-2 pt-4">
                    <p className="text-xs text-gray-500 mb-4 italic">Cet utilisateur sera créé avec le rôle SUPER_ADMIN.</p>
                  </div>
                  <div>
                    <Label>Mot de passe<span className="text-error-500">*</span></Label>
                    <div className="relative">
                      <Input name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPassword ? <EyeIcon width={18} height={18} /> : <EyeCloseIcon width={18} height={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label>Confirmer le Mot de passe<span className="text-error-500">*</span></Label>
                    <div className="relative">
                      <Input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showConfirmPassword ? <EyeIcon width={18} height={18} /> : <EyeCloseIcon width={18} height={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Operational Config */}
              {currentStep === 5 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Directeur de l'Établissement<span className="text-brand-500 font-bold ml-1">*</span></Label>
                    <Input name="directeur" placeholder="Dr. Jean Dupont" value={formData.directeur} onChange={handleChange} required />
                  </div>
                  <div>
                    <Label>Nombre de lits</Label>
                    <Input type="number" name="nombreLits" placeholder="0" value={formData.nombreLits} onChange={handleChange} />
                  </div>
                  <div className="space-y-4 md:col-span-2">
                    <Label>Services Disponibles</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                        <Checkbox checked={formData.urgenceDisponible} onChange={(val) => setFormData(p => ({ ...p, urgenceDisponible: val }))} />
                        <span className="text-sm">Service d'Urgence</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                        <Checkbox checked={formData.laboratoireDisponible} onChange={(val) => setFormData(p => ({ ...p, laboratoireDisponible: val }))} />
                        <span className="text-sm">Laboratoire</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                        <Checkbox checked={formData.pharmacieDisponible} onChange={(val) => setFormData(p => ({ ...p, pharmacieDisponible: val }))} />
                        <span className="text-sm">Pharmacie</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                        <Checkbox checked={formData.radiologieDisponible} onChange={(val) => setFormData(p => ({ ...p, radiologieDisponible: val }))} />
                        <span className="text-sm">Radiologie</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label>Heure d'Ouverture</Label>
                    <Input type="time" name="heureOuverture" value={formData.heureOuverture} onChange={handleChange} />
                  </div>
                  <div>
                    <Label>Heure de Fermeture</Label>
                    <Input type="time" name="heureFermeture" value={formData.heureFermeture} onChange={handleChange} />
                  </div>
                </div>
              )}

              {/* STEP 6: Subscription */}
              {currentStep === 6 && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {["Basic", "Pro", "Enterprise"].map((plan) => (
                      <div
                        key={plan}
                        onClick={() => setFormData(p => ({ ...p, planAbonnement: plan as "Basic" | "Pro" | "Enterprise" }))}
                        className={`cursor-pointer p-6 rounded-2xl border-2 transition-all text-center ${formData.planAbonnement === plan
                          ? "border-brand-500 bg-brand-50/50 dark:bg-brand-900/20"
                          : "border-gray-100 dark:border-gray-700 hover:border-brand-200"
                          }`}
                      >
                        <h3 className="font-bold text-lg mb-2">{plan}</h3>
                        <p className="text-xs text-gray-500">Choisissez ce forfait pour votre hôpital.</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center gap-8 p-4 bg-gray-50 dark:bg-gray-900/40 rounded-2xl">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="cycleFacturation"
                        value="Mensuel"
                        checked={formData.cycleFacturation === "Mensuel"}
                        onChange={handleChange}
                        className="text-brand-500 focus:ring-brand-500"
                      />
                      <span className="text-sm font-medium">Mensuel</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="cycleFacturation"
                        value="Annuel"
                        checked={formData.cycleFacturation === "Annuel"}
                        onChange={handleChange}
                        className="text-brand-500 focus:ring-brand-500"
                      />
                      <span className="text-sm font-medium">Annuel</span>
                    </label>
                  </div>

                  <div className="flex items-start gap-4 p-4 border border-brand-100 dark:border-brand-800 rounded-2xl bg-brand-50/30">
                    <Checkbox checked={isChecked} onChange={setIsChecked} className="mt-1" />
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      En cliquant ici, j'accepte les <span className="text-brand-600 font-semibold cursor-pointer">Termes et Conditions</span> ainsi que la <span className="text-brand-600 font-semibold cursor-pointer">Politique de Confidentialité</span> de TRIMEDH.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center gap-4 pt-8">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    <ChevronLeft size={18} />
                    Retour
                  </button>
                )}

                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-[2] flex items-center justify-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-brand-500/20"
                  >
                    Continuer
                    <ChevronRight size={18} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoadingLocal}
                    className="flex-[2] flex items-center justify-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-gray-400 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-brand-500/20"
                  >
                    {isLoadingLocal ? (
                      <LoadingSpinner message="" size="sm" />
                    ) : (
                      <>
                        Terminer l'Inscription
                        <CheckCircle2 size={18} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>

          <div className="mt-8 text-center sm:text-left">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Vous avez déjà un compte ?{" "}
              <Link to="/signin" className="text-brand-500 font-bold hover:underline">
                Connectez-vous ici
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

