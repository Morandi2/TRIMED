import { PARCOURS } from './contenu';
import Orbes from './Orbes';

// Trois étapes, numérotées en grand : le chiffre tient le décor (comme dans le template Site Immersif).
export default function Parcours() {
  return (
    <section id="parcours" className="ptl-section">
      <Orbes liste={[{ haut: '45%', gauche: '38%', taille: 220, teinte: 'menthe', vitesse: 0.08 }]} />
      <div className="relative ptl-cadre">
        <header className="ptl-entete-section" data-apparition>
          <p className="ptl-surtitre">Démarrer</p>
          <h2 className="ptl-titre ptl-titre--l">Trois étapes,<br /><span className="attenue">et votre équipe est prête.</span></h2>
        </header>
        <ol className="grid gap-4 md:grid-cols-3">
          {PARCOURS.map((e, i) => (
            <li key={e.titre} className="ptl-verre relative overflow-hidden p-7" data-apparition data-inclinaison style={{ ['--delai' as string]: `${i * 110}ms` }}>
              <span className="pointer-events-none absolute -right-2 -top-6 select-none font-marque text-[7.5rem] font-extrabold leading-none text-trimed-indigo/[0.07]" data-vitesse="-0.06" aria-hidden="true">
                {i + 1}
              </span>
              <p className="font-marque text-sm font-bold text-trimed-indigo">Étape {i + 1}</p>
              <h3 className="ptl-titre ptl-titre--m mt-3">{e.titre}</h3>
              <p className="ptl-texte mt-2 text-[0.95rem]">{e.texte}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
