import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import LoadingSpinner from "../ui/LoadingSpinner";
import { InscriptionData } from "../../api/types/auth.types";
import { Building2, MapPin, Phone, User, Settings, CreditCard, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import { validation } from "../../utils/validation";

export default function SignUpForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // État du formulaire avec tous les nouveaux champs
  const [formData, setFormData] = useState<InscriptionData>({
    // ÉTAPE 1
    nomHopital: "",
    raisonSociale: "",
    numeroEnregistrement: "",
    nif: "",
    typeEtablissement: "Privé",
    logo: null,
    siteWeb: "",
    description: "",

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
    email: "",
    emailSupport: "",

    // ÉTAPE 4
    prenomAdmin: "",
    nomAdmin: "",
    adminEmail: "",
    adminTelephone: "",
    password: "",

    // ÉTAPE 5
    nombreLits: "",
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
    directeur: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    let finalValue = val;
    if (typeof finalValue === 'string' && (name === 'telephone' || name === 'telephoneUrgence' || name === 'adminTelephone')) {
      finalValue = validation.formatHaitiPhone(finalValue);
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue,
      // Keep legacy fields in sync
      adresse: name === 'adresseLigne1' ? (typeof finalValue === 'string' ? finalValue : prev.adresse) : prev.adresse,
      directeur: (name === 'prenomAdmin' || name === 'nomAdmin')
        ? `${name === 'prenomAdmin' ? (typeof finalValue === 'string' ? finalValue : prev.prenomAdmin) : prev.prenomAdmin} ${name === 'nomAdmin' ? (typeof finalValue === 'string' ? finalValue : prev.nomAdmin) : prev.nomAdmin}`.trim()
        : prev.directeur
    }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(6)) return;

    setIsLoadingLocal(true);
    try {
      const { djangoAuthApi } = await import("../../api/djangoAuthApi");
      const result = await djangoAuthApi.inscription(formData);

      if (result.success) {
        setIsSubmitted(true);
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

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] text-center p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
        <div className="w-20 h-20 bg-success-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 className="text-white size-12" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Inscription réussie !</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mb-8">
          Félicitations ! L'hôpital <strong>{formData.nomHopital}</strong> a été créé avec succès.
          Actuellement, le compte est <span className="text-warning-500 font-bold">inactif</span>.
          Il sera activé dans moins de deux jours après la fin de notre vérification.
        </p>
        <button
          onClick={() => navigate("/signin")}
          className="px-8 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-brand-500/30"
        >
          Retourner à la page de connexion
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-3/5 no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-2xl mx-auto py-10 px-4">
        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${currentStep >= step.id
                    ? "bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/20"
                    : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-400"
                    }`}
                >
                  <step.icon size={18} />
                </div>
                <span className={`text-[10px] mt-2 font-medium uppercase tracking-wider hidden sm:block ${currentStep >= step.id ? "text-brand-600 dark:text-brand-400" : "text-gray-400"
                  }`}>
                  {step.title}
                </span>
              </div>
            ))}
            {/* Progress Bar Background (Removed) */}
          </div>
        </div>

        <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              {steps[currentStep - 1].title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Étape {currentStep} sur {steps.length} — Remplissez les informations pour inscrire votre hôpital.
            </p>
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
                    <Label>Nom de l'hôpital<span className="text-error-500">*</span></Label>
                    <Input name="nomHopital" placeholder="Hôpital de l'Espoir" value={formData.nomHopital} onChange={handleChange} required />
                  </div>
                  <div>
                    <Label>Raison Sociale</Label>
                    <Input name="raisonSociale" placeholder="S.A., Association, etc." value={formData.raisonSociale} onChange={handleChange} />
                  </div>
                  <div>
                    <Label>Numéro d'Enregistrement (MSPP)<span className="text-error-500">*</span></Label>
                    <Input name="numeroEnregistrement" placeholder="REG-123456" value={formData.numeroEnregistrement} onChange={handleChange} required />
                  </div>
                  <div>
                    <Label>Numéro Fiscal (NIF)</Label>
                    <Input name="nif" placeholder="000-000-000-0" value={formData.nif} onChange={handleChange} />
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
                  <div className="md:col-span-2">
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
                        onClick={() => setFormData(p => ({ ...p, planAbonnement: plan as any }))}
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

