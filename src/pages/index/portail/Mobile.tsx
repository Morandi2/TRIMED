import { Check } from 'lucide-react';
import Symbole from '../../../components/brand/Symbole';
import { MOBILE } from './contenu';

// Téléphone dessiné en verre : un pictogramme, pas une capture d’écran.
export default function Mobile() {
  return (
    <section className="ptl-section">
      <div className="ptl-cadre grid items-center gap-12 md:grid-cols-2">
        <div className="relative mx-auto h-[420px] w-[230px]" aria-hidden="true">
          <div className="absolute -left-10 top-16 h-40 w-40 rounded-full bg-trimed-menthe/70 blur-2xl" data-vitesse="-0.05" />
          <div className="absolute -right-12 bottom-10 h-36 w-36 rounded-full bg-trimed-indigo/20 blur-2xl" data-vitesse="0.05" />
          <div className="ptl-verre ptl-verre--fort absolute inset-0 !rounded-[2.4rem] p-4" data-vitesse="0.03">
            <div className="mx-auto h-1.5 w-16 rounded-full bg-trimed-encre/15" />
            <div className="mt-8 flex justify-center"><Symbole taille={64} vivant titre="" /></div>
            <div className="mt-8 grid gap-3">
              {[0.9, 0.7, 0.8].map((l, i) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl bg-white/80 p-3">
                  <span className={`h-8 w-8 rounded-xl ${i === 1 ? 'bg-trimed-vert/25' : 'bg-trimed-indigo/15'}`} />
                  <span className="h-2 rounded-full bg-trimed-encre/15" style={{ width: `${l * 100}px` }} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div data-apparition>
          <p className="ptl-surtitre">Application Android</p>
          <h2 className="ptl-titre ptl-titre--l mt-4">{MOBILE.titre}</h2>
          <p className="ptl-texte mt-4">{MOBILE.texte}</p>
          <ul className="mt-6 grid gap-3">
            {MOBILE.points.map((p) => (
              <li key={p} className="flex items-center gap-3"><Check className="h-4 w-4 text-trimed-vert-fonce" aria-hidden="true" />{p}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
