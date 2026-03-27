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
            <div className="flex flex-col flex-1">
                <div className="w-full max-w-md pt-10 mx-auto">
                    <Link
                        to="/signin"
                        className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                        <ChevronLeftIcon className="size-5" />
                        Retour à la connexion
                    </Link>
                </div>
                <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto text-center">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Email envoyé !</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Si un compte existe pour <strong>{email}</strong>, vous recevrez un lien pour réinitialiser votre mot de passe sous peu.
                        </p>
                    </div>
                    <Link to="/signin" className="w-full">
                        <Button className="w-full" size="sm">
                            Retourner à la connexion
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1">
            <div className="w-full max-w-md pt-10 mx-auto">
                <Link
                    to="/signin"
                    className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                    <ChevronLeftIcon className="size-5" />
                    Retour à la connexion
                </Link>
            </div>
            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Mot de passe oublié ?</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Entrez votre adresse e-mail pour recevoir un lien de réinitialisation.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 text-sm text-red-600 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        <div>
                            <Label>Adresse e-mail <span className="text-error-500">*</span></Label>
                            <Input
                                type="email"
                                placeholder="votre-email@exemple.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <Button
                            className="w-full"
                            size="sm"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
