import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import { ChevronRight } from "lucide-react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";

const CLE_EMAIL = "trimed-adresse-memorisee";

const ESSAIS_DEMARRAGE = 6;
import { useAuth } from "../../context/AuthContext";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  // « Se souvenir de mon adresse » : seule l’adresse est gardée sur cet appareil, jamais le mot de passe.
  const memorisee = (() => { try { return localStorage.getItem(CLE_EMAIL) || ""; } catch { return ""; } })();
  const [isChecked, setIsChecked] = useState(!!memorisee);
  const [email, setEmail] = useState(memorisee);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [attente, setAttente] = useState<string | null>(null);
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Rediriger automatiquement si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setIsLoadingLocal(true);
    try {
      try { if (isChecked) localStorage.setItem(CLE_EMAIL, email.trim()); else localStorage.removeItem(CLE_EMAIL); } catch { /* stockage indisponible */ }
      // Le serveur gratuit (Render) s’endort sans activité : s’il démarre, on réessaie seul
      // toutes les 10 secondes pendant une minute, en le disant clairement.
      for (let essai = 0; essai <= ESSAIS_DEMARRAGE; essai++) {
        const result = await login(email, password);
        if (result.success) { setAttente(null); navigate(result.redirectTo || "/home"); return; }
        if (result.code !== "demarrage") { setAttente(null); setError(result.message); return; }
        if (essai === ESSAIS_DEMARRAGE) { setAttente(null); setError("Le serveur ne répond toujours pas. Vérifiez votre connexion, puis réessayez dans quelques minutes."); return; }
        for (let s = 10; s > 0; s--) {
          setAttente(`${result.message} Nouvel essai dans ${s} s.`);
          await new Promise((fin) => setTimeout(fin, 1000));
        }
        setAttente("Nouvel essai en cours…");
      }
    } catch (err) {
      setAttente(null);
      setError("La connexion n’a pas abouti. Réessayez dans un instant.");
      console.error(err);
    } finally {
      setIsLoadingLocal(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Bon retour !
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Veuillez entrer vos identifiants pour accéder à votre espace de travail.
        </p>
      </div>

      {attente && (
        <div role="status" className="mb-6 flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50 p-4 text-sm text-brand-700 dark:border-brand-800/50 dark:bg-brand-500/10 dark:text-brand-200">
          <span className="mt-0.5 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" aria-hidden="true" />
          <span>{attente}</span>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center">
             <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
             </svg>
             {error}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Email professionnel
          </Label>
          <Input
            type="email"
            placeholder="docteur@trimed.ht"
            className="w-full text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Mot de passe
            </Label>
            <Link
              to="/forgot-password"
              className="text-xs font-bold text-brand-500 hover:text-brand-600 dark:text-brand-400 transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="relative group">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full pr-12 text-sm transition-all duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors z-20"
            >
              {showPassword ? (
                <EyeIcon className="size-4" />
              ) : (
                <EyeCloseIcon className="size-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center py-2">
          <Checkbox 
            checked={isChecked} 
            onChange={setIsChecked}
            className="rounded border-gray-300 text-brand-500 focus:ring-brand-500"
          />
          <label className="ml-2.5 block text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer" onClick={() => setIsChecked(!isChecked)}>
            Se souvenir de mon adresse e-mail
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoadingLocal}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-brand-500 hover:bg-brand-600 disabled:bg-gray-400 text-white rounded-2xl text-sm font-bold transition-all shadow-xl shadow-brand-500/10 hover:shadow-brand-500/30 transform active:scale-[0.98]"
        >
          {isLoadingLocal ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connexion en cours...
            </span>
          ) : (
            <>
              Se connecter à l'espace
              <ChevronRight className="size-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Nouveau sur TRIMED ? {""}
          <Link
            to="/signup"
            className="font-bold text-brand-500 hover:text-brand-600 dark:text-brand-400 transition-colors"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
