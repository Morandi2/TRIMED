import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Symbole from '../../../components/brand/Symbole';
import type { EtatRobot } from '../../../components/brand/RobotGardien';
import { HISTOIRE, OUVERTURE } from './contenu';
import { progressionDe, useMouvementReduit } from './defilement';

// Three.js n’est chargé que sur l’accueil, après le premier affichage.
const RobotGardien = lazy(() => import('../../../components/brand/RobotGardien'));

// Le robot 3D n’est chargé que si l’appareil peut le porter : le symbole 2D reste affiché en mode
// « économie de données », en 2G, ou sur les téléphones à peu de mémoire ou de cœurs.
function appareilCapable() {
  const n = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string }; deviceMemory?: number };
  if (n.connection?.saveData) return false;
  if (['slow-2g', '2g'].includes(n.connection?.effectiveType ?? '')) return false;
  if (n.deviceMemory !== undefined && n.deviceMemory < 3) return false;
  if (n.hardwareConcurrency && n.hardwareConcurrency < 4) return false;
  return true;
}

// Ouverture + histoire du robot gardien : une scène épinglée de quatre écrans.
// Le robot reste à l’écran pendant que le texte change ; sa progression suit le défilement.
export default function Recit() {
  const section = useRef<HTMLElement>(null);
  const etat = useRef<EtatRobot>({ progression: 0 });
  const [chapitre, setChapitre] = useState(-1); // -1 : ouverture, 0 à 2 : chapitres de l’histoire
  const [sans3d, setSans3d] = useState(false);
  const [charger3d, setCharger3d] = useState(false);
  const [robotPret, setRobotPret] = useState(false);
  const reduit = useMouvementReduit();
  const indisponible = useCallback(() => setSans3d(true), []);
  const pret = useCallback(() => setRobotPret(true), []);

  // Le robot 3D attend que la page soit affichée et que le navigateur soit libre :
  // le texte et le symbole 2D apparaissent d’abord, sans attendre Three.js.
  useEffect(() => {
    if (!appareilCapable()) return;
    let annule = false, attente = 0, minuteur = 0;
    const w = window as Window & { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    const lancer = () => {
      if (w.requestIdleCallback) attente = w.requestIdleCallback(() => !annule && setCharger3d(true), { timeout: 2500 });
      else minuteur = window.setTimeout(() => !annule && setCharger3d(true), 1200);
    };
    if (document.readyState === 'complete') lancer();
    else window.addEventListener('load', lancer, { once: true });
    return () => {
      annule = true;
      window.removeEventListener('load', lancer);
      if (attente) w.cancelIdleCallback?.(attente);
      clearTimeout(minuteur);
    };
  }, []);

  useEffect(() => {
    let image = 0;
    const maj = () => {
      image = 0;
      if (!section.current) return;
      const p = progressionDe(section.current);
      etat.current.progression = p;
      const c = p < 0.2 ? -1 : p < 0.47 ? 0 : p < 0.73 ? 1 : 2;
      setChapitre((avant) => (avant === c ? avant : c));
    };
    const demander = () => { if (!image) image = requestAnimationFrame(maj); };
    maj();
    window.addEventListener('scroll', demander, { passive: true });
    window.addEventListener('resize', demander);
    return () => { cancelAnimationFrame(image); window.removeEventListener('scroll', demander); window.removeEventListener('resize', demander); };
  }, []);

  // Symbole 2D : affiché tout de suite, puis fondu sous le robot 3D quand celui-ci est prêt.
  const symbole2d = (
    <div className={`absolute inset-0 flex items-start justify-center pt-[13vh] transition-opacity duration-700 md:items-center md:justify-end md:pt-0 md:pr-[9vw] ${robotPret ? 'opacity-0' : 'opacity-100'}`} aria-hidden="true">
      <Symbole taille={260} vivant titre="" className="h-[150px] w-[150px] drop-shadow-[0_30px_50px_rgba(39,32,255,0.35)] md:h-[260px] md:w-[260px]" />
    </div>
  );

  return (
    <section ref={section} id="histoire" aria-label="Le robot gardien de TRIMED" className="relative h-[400vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Le robot */}
        <div className="absolute inset-0">
          {symbole2d}
          {charger3d && !sans3d && (
            <Suspense fallback={null}>
              <RobotGardien
                etat={etat} mouvementReduit={reduit} onIndisponible={indisponible} onPret={pret}
                className={`absolute inset-0 transition-opacity duration-700 [&>canvas]:block [&>canvas]:h-full [&>canvas]:w-full ${robotPret ? 'opacity-100' : 'opacity-0'}`}
              />
            </Suspense>
          )}
        </div>

        {/* Ouverture */}
        <div className="ptl-cadre relative flex h-full items-end pb-[12vh] md:items-center md:pb-0">
          <div className="ptl-chapitre max-w-[33rem]" data-actif={chapitre === -1}>
            <p className="ptl-surtitre">{OUVERTURE.surtitre}</p>
            <h1 className="ptl-titre ptl-titre--xl mt-5">
              {OUVERTURE.titre[0]}<br /><span className="attenue">{OUVERTURE.titre[1]}</span>
            </h1>
            <p className="ptl-texte ptl-texte--grand ptl-ouverture-texte mt-5">{OUVERTURE.texte}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/contact" className="ptl-bouton">Demander une démonstration <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              <Link to="/signin" className="ptl-bouton-clair">Se connecter</Link>
            </div>
          </div>
        </div>

        {/* Chapitres : le texte prend le côté opposé au robot */}
        {HISTOIRE.map((c, i) => (
          <div key={c.etiquette} className={`ptl-cadre pointer-events-none absolute inset-0 flex items-end pb-[8vh] md:items-center md:pb-0 ${i === 2 ? 'md:justify-start' : 'md:justify-end'}`}>
            <article className="ptl-chapitre ptl-verre ptl-verre--fort pointer-events-auto w-full max-w-[29rem] p-7 sm:p-8" data-actif={chapitre === i} aria-hidden={chapitre !== i}>
              <div className="flex items-center justify-between">
                <p className="ptl-surtitre">{c.etiquette}</p>
                <p className="font-marque text-xs text-trimed-encre-douce" aria-hidden="true">0{i + 1} / 03</p>
              </div>
              <h2 className="ptl-titre ptl-titre--l mt-4">{c.titre}</h2>
              <p className="ptl-texte mt-4">{c.texte}</p>
            </article>
          </div>
        ))}

        {/* Repères de progression */}
        <div className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2" aria-hidden="true">
          {chapitre === -1 ? (
            <div className="ptl-indice text-center text-[0.72rem] uppercase tracking-[0.25em] text-trimed-encre-douce">
              Faites défiler<span />
            </div>
          ) : (
            [0, 1, 2].map((i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all duration-500 ${chapitre === i ? 'w-8 bg-trimed-indigo' : 'w-1.5 bg-trimed-indigo/25'}`} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
