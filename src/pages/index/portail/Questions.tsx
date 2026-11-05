import { Plus } from 'lucide-react';
import { QUESTIONS } from './contenu';
import Orbes from './Orbes';

export default function Questions() {
  return (
    <section id="questions" className="ptl-section">
      <Orbes liste={[{ haut: '30%', droite: '8%', taille: 210, teinte: 'menthe', vitesse: 0.08 }]} />
      <div className="relative ptl-cadre grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <header className="ptl-entete-section self-start" data-apparition>
          <p className="ptl-surtitre">Questions</p>
          <h2 className="ptl-titre ptl-titre--l">Ce qu’on<br /><span className="attenue">nous demande.</span></h2>
        </header>
        <div className="grid gap-3">
          {QUESTIONS.map((q, i) => (
            <details key={q.q} className="ptl-verre px-6 py-5" data-apparition style={{ ['--delai' as string]: `${i * 60}ms` }}>
              <summary className="flex items-center justify-between gap-4 font-medium text-trimed-encre">
                {q.q}
                <Plus className="ptl-plus h-5 w-5 shrink-0 text-trimed-indigo" aria-hidden="true" />
              </summary>
              <p className="ptl-texte mt-3 text-[0.95rem]">{q.r}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
