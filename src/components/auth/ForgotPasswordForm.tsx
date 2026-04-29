import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeftIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // Simuler un appel API pour la démo
            await new Promise(resolve => setTimeout(resolve, 1500));
            setIsSubmitted(true);
        } catch (err) {
            setError("Une erreur est survenue. Veuillez réessayer.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="flex flex-col w-full text-center">
                 <div className="mb-6 flex justify-center">
                    <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/20 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Email envoyé !</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                    Si un compte existe pour <strong className="text-gray-900 dark:text-white">{email}</strong>, 
                    vous recevrez un lien de réinitialisation sous peu.
                </p>
                <Link to="/signin" className="w-full">
                    <Button className="w-full py-3.5 font-bold text-sm" size="sm">
                        Retourner à la connexion
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Mot de passe oublié ?
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Entrez votre e-mail pour recevoir un lien de réinitialisation.
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400 animate-in fade-in zoom-in-95 duration-300">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        Votre adresse e-mail
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
                
                <Button
                    className="w-full py-3.5 text-sm font-bold shadow-xl shadow-brand-500/10 hover:shadow-brand-500/20 transform active:scale-[0.98] transition-all"
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading ? (
                         <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Envoi...
                        </span>
                    ) : "Envoyer le lien"}
                </Button>

                 <div className="text-center mt-6">
                    <Link
                        to="/signin"
                        className="text-sm font-bold text-gray-500 hover:text-brand-500 transition-colors"
                    >
                        Annuler et retourner
                    </Link>
                </div>
            </form>
        </div>
    );
}
