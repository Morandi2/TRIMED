import { ETUDE } from './contenu';

export default function Etude() {
  return (
    <section className="ptl-section">
      <div className="ptl-cadre">
        <div className="ptl-verre ptl-verre--fort overflow-hidden p-7 sm:p-10" data-apparition>
          <p className="ptl-surtitre">Étude de faisabilité</p>
          <h2 className="ptl-titre ptl-titre--l mt-4">{ETUDE.titre}</h2>
          <dl className="mt-8 grid gap-6 md:grid-cols-3">
            {ETUDE.chiffres.map((c) => (
              <div key={c.legende} className="border-t border-trimed-indigo/15 pt-5">
                <dt className="sr-only">{c.legende}</dt>
                <dd>
                  <span className="font-marque text-[2rem] font-extrabold tracking-tight text-trimed-indigo">{c.valeur}</span>
                  <span className="ml-2 text-sm font-medium text-trimed-encre">{c.unite}</span>
                  <p className="ptl-texte mt-2 text-[0.95rem]" aria-hidden="true">{c.legende}</p>
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 text-xs text-trimed-encre-douce">{ETUDE.source}</p>
        </div>
      </div>
    </section>
  );
}
