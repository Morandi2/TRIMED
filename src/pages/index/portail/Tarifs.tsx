import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { TARIFS } from './contenu';
import Orbes from './Orbes';

export default function Tarifs() {
  return (
    <section id="tarifs" className="ptl-section">
      <Orbes liste={[{ haut: '42%', gauche: '44%', taille: 280, teinte: 'indigo', vitesse: 0.07, opacite: 0.5 }, { haut: '70%', gauche: '6%', taille: 180, teinte: 'menthe', vitesse: -0.06 }]} />
      <div className="relative ptl-cadre">
        <header className="ptl-entete-section" data-apparition>
          <p className="ptl-surtitre">Tarifs</p>
          <h2 className="ptl-titre ptl-titre--l">Un abonnement,<br /><span className="attenue">pas d’investissement lourd.</span></h2>
          <p className="ptl-texte">{TARIFS.note}</p>
        </header>
        <ul className="grid items-stretch gap-4 md:grid-cols-3">
          {TARIFS.formules.map((f, i) => (
            <li
              key={f.nom}
              className={`ptl-verre flex flex-col p-7 ${f.conseille ? 'ptl-verre--fort ring-2 ring-trimed-indigo/70' : ''}`}
              data-apparition data-inclinaison style={{ ['--delai' as string]: `${i * 100}ms` }}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="ptl-titre ptl-titre--m">{f.nom}</h3>
                {f.conseille && <span className="rounded-full bg-trimed-indigo px-3 py-1 text-xs font-medium text-white">Conseillé</span>}
              </div>
              <p className="mt-1 text-sm text-trimed-encre-douce">{f.public}</p>
              <p className="mt-6 flex items-baseline gap-2">
                <span className="font-marque text-[2.2rem] font-extrabold tracking-tight text-trimed-encre">{f.prix}</span>
                <span className="text-sm text-trimed-encre-douce">HTG / mois</span>
              </p>
              <ul className="mb-8 mt-6 grid gap-3 text-[0.95rem]">
                {f.points.map((p) => (
                  <li key={p} className="flex items-start gap-3">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-trimed-vert-fonce" aria-hidden="true" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <Link to="/contact" className={`${f.conseille ? 'ptl-bouton' : 'ptl-bouton-clair'} mt-auto w-full`}>Choisir {f.nom}</Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
