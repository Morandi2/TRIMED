import Icone from './Icone';
import { MODULES } from './contenu';
import Orbes from './Orbes';

export default function Modules() {
  return (
    <section id="modules" className="ptl-section">
      <Orbes liste={[{ haut: '38%', droite: '6%', taille: 260, teinte: 'indigo', vitesse: 0.1, opacite: 0.55 }, { haut: '72%', gauche: '18%', taille: 200, teinte: 'menthe', vitesse: -0.06 }]} />
      <div className="relative ptl-cadre">
        <header className="ptl-entete-section" data-apparition>
          <p className="ptl-surtitre">Modules</p>
          <h2 className="ptl-titre ptl-titre--l">Tout l’hôpital,<br /><span className="attenue">sur un seul dossier.</span></h2>
          <p className="ptl-texte">Six modules qui partagent les mêmes informations : ce qui est saisi à l’accueil est aussitôt disponible au cabinet du médecin et à la pharmacie.</p>
        </header>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m, i) => (
            <li key={m.titre} className="ptl-verre p-6 sm:p-7" data-apparition data-inclinaison style={{ ['--delai' as string]: `${(i % 3) * 90}ms` }}>
              <Icone nom={m.icone} />
              <h3 className="ptl-titre ptl-titre--m mt-5">{m.titre}</h3>
              <p className="ptl-texte mt-2 text-[0.95rem]">{m.texte}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
