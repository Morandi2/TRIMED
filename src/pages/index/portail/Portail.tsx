import { useRef } from 'react';
import './portail.css';
import Appel from './Appel';
import EnTete from './EnTete';
import Etude from './Etude';
import Mobile from './Mobile';
import Modules from './Modules';
import Parcours from './Parcours';
import PiedDePage from './PiedDePage';
import Questions from './Questions';
import Recit from './Recit';
import Securite from './Securite';
import Tarifs from './Tarifs';
import { useApparitions, useInclinaison, useMouvementReduit, useParallaxe } from './defilement';

// Portail (site vitrine) de TRIMED : le récit du robot gardien, puis la présentation de la plateforme.
export default function Portail() {
  const racine = useRef<HTMLDivElement>(null);
  const reduit = useMouvementReduit();
  useApparitions(racine);
  useParallaxe(racine, !reduit);
  useInclinaison(racine, !reduit);

  return (
    <div ref={racine} className="ptl min-h-screen">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2">
        Aller au contenu
      </a>
      <div className="ptl-decor" aria-hidden="true"><span /><span /></div>
      <EnTete />
      <main id="contenu" className="ptl-contenu">
        <Recit />
        <Modules />
        <Parcours />
        <Securite />
        <Tarifs />
        <Mobile />
        <Etude />
        <Questions />
        <Appel />
      </main>
      <PiedDePage />
    </div>
  );
}
