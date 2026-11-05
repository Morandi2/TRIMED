import { Mail, Phone, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import EnTete from './portail/EnTete';
import PiedDePage from './portail/PiedDePage';
import { CONTACT, QUESTIONS } from './portail/contenu';

// Guides courts, repris du guide d’utilisation de l’application (annexe B du mémoire).
const GUIDES = [
  { titre: 'Se connecter', etapes: ['Ouvrez la page « Se connecter ».', 'Saisissez l’adresse e-mail et le mot de passe fournis par votre hôpital.', 'En cas d’oubli, choisissez « Mot de passe oublié ».'] },
  { titre: 'Enregistrer un patient', etapes: ['Menu Patients, puis « Ajouter ».', 'Renseignez au moins le nom, le prénom et le numéro de dossier.', 'Enregistrez : le dossier est aussitôt visible par le personnel autorisé.'] },
  { titre: 'Planifier un rendez-vous', etapes: ['Menu Rendez-vous, puis « Ajouter ».', 'Choisissez le patient, le médecin, la date et le type de rendez-vous.', 'Le statut passe ensuite de « Planifié » à « Confirmé », « Terminé » ou « Annulé ».'] },
  { titre: 'Créer une ordonnance', etapes: ['Ouvrez la consultation du patient.', 'Ajoutez chaque médicament avec sa posologie et sa durée.', 'Enregistrez, puis imprimez l’ordonnance.'] },
  { titre: 'Gérer les comptes du personnel', etapes: ['Réservé à l’administrateur de l’hôpital : menu Utilisateurs.', 'Ajoutez un membre et choisissez son rôle (médecin, infirmier, secrétaire…).', 'Chacun ne voit ensuite que ce que son rôle permet.'] },
  { titre: 'Suivre le stock de la pharmacie', etapes: ['Menu Médicaments.', 'Les produits passés sous leur seuil minimum sont signalés.', 'Mettez le stock à jour à chaque réception.'] }
];

const CentreAide = () => (
  <div className="ptl min-h-screen">
    <EnTete accueil={false} />
    <main className="ptl-contenu ptl-cadre pb-20 pt-32">
      <header className="mx-auto mb-12 max-w-2xl text-center">
        <p className="ptl-surtitre justify-center">Centre d’aide</p>
        <h1 className="ptl-titre ptl-titre--l mt-4">Comment pouvons-nous vous aider ?</h1>
        <p className="ptl-texte mx-auto mt-4">Les gestes de tous les jours, en quelques étapes. Pour le reste, l’équipe TRIMED vous répond.</p>
      </header>

      <section aria-labelledby="guides">
        <h2 id="guides" className="ptl-titre ptl-titre--m mb-5">Guides rapides</h2>
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {GUIDES.map((g) => (
            <li key={g.titre} className="ptl-verre p-6">
              <h3 className="font-medium text-trimed-encre">{g.titre}</h3>
              <ol className="mt-3 grid list-decimal gap-1.5 pl-5 text-[0.95rem] text-trimed-encre-douce">
                {g.etapes.map((e) => <li key={e}>{e}</li>)}
              </ol>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="faq" className="mt-16 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 id="faq" className="ptl-titre ptl-titre--m">Questions fréquentes</h2>
          <div className="ptl-verre mt-6 p-6">
            <h3 className="font-medium text-trimed-encre">Vous ne trouvez pas la réponse ?</h3>
            <ul className="mt-3 grid gap-2 text-[0.95rem]">
              <li><a href={`mailto:${CONTACT.email}`} className="inline-flex items-center gap-2 text-trimed-indigo hover:underline"><Mail className="h-4 w-4" aria-hidden="true" />{CONTACT.email}</a></li>
              {CONTACT.telephones.map((t) => (
                <li key={t}><a href={`tel:${t.replace(/\s/g, '')}`} className="inline-flex items-center gap-2 text-trimed-encre-douce hover:text-trimed-indigo"><Phone className="h-4 w-4" aria-hidden="true" />{t}</a></li>
              ))}
            </ul>
            <Link to="/contact" className="ptl-bouton mt-5 w-full">Écrire à l’équipe</Link>
          </div>
        </div>
        <div className="grid content-start gap-3">
          {QUESTIONS.map((q) => (
            <details key={q.q} className="ptl-verre px-6 py-5">
              <summary className="flex items-center justify-between gap-4 font-medium text-trimed-encre">
                {q.q}
                <Plus className="ptl-plus h-5 w-5 shrink-0 text-trimed-indigo" aria-hidden="true" />
              </summary>
              <p className="ptl-texte mt-3 text-[0.95rem]">{q.r}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
    <PiedDePage accueil={false} />
  </div>
);

export default CentreAide;
