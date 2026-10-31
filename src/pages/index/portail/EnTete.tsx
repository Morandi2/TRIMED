import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logotype from '../../../components/brand/Logotype';
import { NAVIGATION } from './contenu';
import './portail.css';

// En-tête flottant en verre. Sur les pages secondaires, les ancres renvoient vers l’accueil.
export default function EnTete({ accueil = true }: { accueil?: boolean }) {
  const [defile, setDefile] = useState(false);
  const [ouvert, setOuvert] = useState(false);

  useEffect(() => {
    const maj = () => setDefile(window.scrollY > 24);
    maj();
    window.addEventListener('scroll', maj, { passive: true });
    return () => window.removeEventListener('scroll', maj);
  }, []);
  useEffect(() => {
    if (!ouvert) return;
    const echap = (e: KeyboardEvent) => e.key === 'Escape' && setOuvert(false);
    window.addEventListener('keydown', echap);
    return () => window.removeEventListener('keydown', echap);
  }, [ouvert]);

  const lien = (ancre: string) => (accueil ? ancre : `/${ancre}`);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        aria-label="Navigation principale"
        className={`ptl-verre mx-auto flex max-w-[1180px] items-center justify-between gap-4 !rounded-full px-3 py-2 sm:px-4 ${defile ? 'ptl-verre--fort' : ''}`}
      >
        <Link to="/" className="rounded-full pl-1" aria-label="TRIMED, accueil">
          <Logotype taille="sm" />
        </Link>
        <ul className="hidden items-center gap-1 lg:flex">
          {NAVIGATION.map((n) => (
            <li key={n.ancre}>
              <a href={lien(n.ancre)} className="rounded-full px-3 py-2 text-[0.88rem] text-trimed-encre-douce transition-colors hover:bg-white/70 hover:text-trimed-encre">
                {n.libelle}
              </a>
            </li>
          ))}
        </ul>
        <div className="hidden items-center gap-2 sm:flex">
          <Link to="/signin" className="ptl-bouton-clair !min-h-[40px] !px-4 !text-[0.88rem]">Se connecter</Link>
          <Link to="/contact" className="ptl-bouton !min-h-[40px] !px-4 !text-[0.88rem]">Demander une démo</Link>
        </div>
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-full text-trimed-encre lg:hidden"
          aria-expanded={ouvert}
          aria-controls="menu-mobile"
          aria-label={ouvert ? 'Fermer le menu' : 'Ouvrir le menu'}
          onClick={() => setOuvert((o) => !o)}
        >
          {ouvert ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {ouvert && (
        <div id="menu-mobile" className="ptl-verre ptl-verre--fort mx-auto mt-2 max-w-[1180px] p-4 lg:hidden">
          <ul className="grid gap-1">
            {NAVIGATION.map((n) => (
              <li key={n.ancre}>
                <a href={lien(n.ancre)} onClick={() => setOuvert(false)} className="block rounded-2xl px-4 py-3 text-trimed-encre hover:bg-white">
                  {n.libelle}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-3 grid gap-2 sm:hidden">
            <Link to="/signin" className="ptl-bouton-clair">Se connecter</Link>
            <Link to="/contact" className="ptl-bouton">Demander une démo</Link>
          </div>
        </div>
      )}
    </header>
  );
}
