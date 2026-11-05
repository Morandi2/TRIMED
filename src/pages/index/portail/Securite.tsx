import Symbole from '../../../components/brand/Symbole';
import Icone from './Icone';
import { SECURITE } from './contenu';
import Orbes from './Orbes';

export default function Securite() {
  return (
    <section id="securite" className="ptl-section">
      <Orbes liste={[{ haut: '20%', droite: '18%', taille: 230, teinte: 'indigo', vitesse: 0.09, opacite: 0.5 }, { haut: '62%', droite: '40%', taille: 160, teinte: 'vert', vitesse: -0.05, opacite: 0.55 }]} />
      <div className="relative ptl-cadre grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div data-apparition>
          <p className="ptl-surtitre">Sécurité</p>
          <h2 className="ptl-titre ptl-titre--l mt-4">Le gardien veille<br /><span className="attenue">sur vos données.</span></h2>
          <p className="ptl-texte mt-4">Un dossier médical est une information sensible. TRIMED la protège à chaque étape : à la connexion, dans l’hôpital et pendant les échanges.</p>
          <div className="relative mt-10 hidden h-56 lg:block" aria-hidden="true">
            <div className="absolute left-6 top-4 h-44 w-44 rounded-full border border-trimed-vert/40" data-vitesse="0.04" />
            <div className="absolute left-0 top-0 h-56 w-56 rounded-full border border-trimed-indigo/20" data-vitesse="-0.03" />
            <div className="absolute left-14 top-12" data-vitesse="0.08"><Symbole taille={120} vivant titre="" /></div>
          </div>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {SECURITE.map((s, i) => (
            <li key={s.titre} className="ptl-verre p-6" data-apparition data-inclinaison style={{ ['--delai' as string]: `${i * 90}ms` }}>
              <Icone nom={s.icone} />
              <h3 className="ptl-titre ptl-titre--m mt-4">{s.titre}</h3>
              <p className="ptl-texte mt-2 text-[0.95rem]">{s.texte}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
