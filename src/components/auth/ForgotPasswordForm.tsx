import { Link } from "react-router-dom";
import { KeyRound, Mail, Phone, ShieldCheck } from "lucide-react";
import { CONTACT } from "../../pages/index/portail/contenu";

// Mot de passe oublié. Le serveur n’envoie pas encore de lien de réinitialisation par e-mail
// (BACKEND_MODIFICATIONS.md, point 14) : on indique qui peut redonner l’accès, sans simuler d’envoi.
export default function ForgotPasswordForm() {
  const sujet = encodeURIComponent("Mot de passe oublié sur TRIMED");
  return (
    <div className="flex w-full flex-col">
      <div className="mb-8">
        <h1 className="mb-2 font-marque text-2xl text-gray-900 dark:text-white">Mot de passe oublié ?</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Pour votre sécurité, un nouveau mot de passe est remis par une personne qui peut vérifier votre identité.</p>
      </div>

      <ol className="space-y-4">
        <li className="flex gap-4 rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300"><ShieldCheck className="h-5 w-5" aria-hidden="true" /></span>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Vous travaillez dans un hôpital</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Prévenez l’administrateur de votre hôpital : il confirme votre identité auprès de l’équipe TRIMED, qui vous remet un mot de passe provisoire.</p>
          </div>
        </li>
        <li className="flex gap-4 rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-trimed-brume text-trimed-vert-fonce dark:bg-trimed-vert/15 dark:text-trimed-menthe"><KeyRound className="h-5 w-5" aria-hidden="true" /></span>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Vous êtes administrateur ou propriétaire</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Écrivez ou appelez l’équipe TRIMED depuis l’adresse ou le numéro enregistrés pour votre établissement : elle vous remet un mot de passe provisoire.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={`mailto:${CONTACT.email}?subject=${sujet}`} className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-600"><Mail className="h-4 w-4" aria-hidden="true" /> {CONTACT.email}</a>
              <a href={`tel:${CONTACT.telephones[0].replace(/\s/g, "")}`} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200"><Phone className="h-4 w-4" aria-hidden="true" /> {CONTACT.telephones[0]}</a>
            </div>
          </div>
        </li>
      </ol>

      <div className="mt-8 text-center">
        <Link to="/signin" className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-300">Retour à la connexion</Link>
      </div>
    </div>
  );
}
