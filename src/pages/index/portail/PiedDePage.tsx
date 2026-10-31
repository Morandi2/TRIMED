import { Link } from 'react-router-dom';
import Logotype from '../../../components/brand/Logotype';
import { CONTACT, NAVIGATION } from './contenu';

export default function PiedDePage({ accueil = true }: { accueil?: boolean }) {
  const lien = (ancre: string) => (accueil ? ancre : `/${ancre}`);
  return (
    <footer className="relative z-[1] border-t border-trimed-indigo/10 bg-white/60 backdrop-blur-md">
      <div className="ptl-cadre grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logotype taille="md" slogan />
          <p className="ptl-texte mt-4 text-sm">La plateforme de gestion hospitalière pensée pour les hôpitaux d’Haïti.</p>
        </div>
        <nav aria-label="Plateforme">
          <h2 className="text-sm font-semibold text-trimed-encre">Plateforme</h2>
          <ul className="mt-4 grid gap-2 text-sm text-trimed-encre-douce">
            {NAVIGATION.slice(0, 5).map((n) => <li key={n.ancre}><a href={lien(n.ancre)} className="hover:text-trimed-indigo">{n.libelle}</a></li>)}
          </ul>
        </nav>
        <nav aria-label="Ressources">
          <h2 className="text-sm font-semibold text-trimed-encre">Ressources</h2>
          <ul className="mt-4 grid gap-2 text-sm text-trimed-encre-douce">
            <li><Link to="/centre-aide" className="hover:text-trimed-indigo">Centre d’aide</Link></li>
            <li><Link to="/politique-de-confidentialite" className="hover:text-trimed-indigo">Confidentialité</Link></li>
            <li><Link to="/conditions-utilisation" className="hover:text-trimed-indigo">Conditions d’utilisation</Link></li>
            <li><Link to="/signin" className="hover:text-trimed-indigo">Se connecter</Link></li>
          </ul>
        </nav>
        <div>
          <h2 className="text-sm font-semibold text-trimed-encre">Contact</h2>
          <ul className="mt-4 grid gap-2 text-sm text-trimed-encre-douce">
            <li><a href={`mailto:${CONTACT.email}`} className="hover:text-trimed-indigo">{CONTACT.email}</a></li>
            {CONTACT.telephones.map((t) => <li key={t}><a href={`tel:${t.replace(/\s/g, '')}`} className="hover:text-trimed-indigo">{t}</a></li>)}
            <li>Port-au-Prince, Haïti</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-trimed-indigo/10">
        <p className="ptl-cadre py-5 text-xs text-trimed-encre-douce">
          © 2025 TRIMED · Projet de fin d’études, Université de Technologie d’Haïti (UNITECH)
        </p>
      </div>
    </footer>
  );
}
