import { Link } from 'react-router-dom';
import { ArrowRight, Mail } from 'lucide-react';
import Symbole from '../../../components/brand/Symbole';
import { APPEL, CONTACT } from './contenu';

export default function Appel() {
  return (
    <section className="ptl-section pt-0">
      <div className="ptl-cadre">
        <div className="relative overflow-hidden rounded-[28px] bg-trimed-indigo px-7 py-12 text-white sm:px-12 sm:py-16" data-apparition>
          <div className="pointer-events-none absolute -right-16 -top-20 opacity-90" data-vitesse="-0.06" aria-hidden="true">
            <Symbole taille={300} corps="rgba(255,255,255,0.08)" visage="rgba(255,255,255,0.18)" titre="" />
          </div>
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-trimed-vert/40 blur-3xl" aria-hidden="true" />
          <div className="relative max-w-xl">
            <h2 className="ptl-titre ptl-titre--l !text-white">{APPEL.titre[0]}<br />{APPEL.titre[1]}</h2>
            <p className="mt-4 text-white/85">{APPEL.texte}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/contact" className="ptl-bouton !bg-white !text-trimed-indigo hover:!bg-trimed-brume">
                Demander une démonstration <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a href={`mailto:${CONTACT.email}`} className="ptl-bouton-clair !border-white/30 !bg-white/10 !text-white hover:!bg-white/20">
                <Mail className="h-4 w-4" aria-hidden="true" /> Écrire à l’équipe
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
