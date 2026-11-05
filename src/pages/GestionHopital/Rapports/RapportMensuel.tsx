import { useEffect, useState, type ReactNode } from 'react';
import { Download, Printer, X } from 'lucide-react';
import PageMeta from '../../../components/common/PageMeta';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import { moduleAbsent } from '../../../api/caisseApi';
import { moisPrecedent, rapportsApi, TYPES_EXAMEN, type RapportMensuel as Rapport } from '../../../api/rapportsApi';

const nombre = (n: number | null | undefined, suffixe = '') => (n === null || n === undefined ? 'non calculable' : `${n.toLocaleString('fr-HT')}${suffixe}`);
const moisCourant = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; };

function Section({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <section className="break-inside-avoid rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] print:rounded-none print:border-0 print:border-t print:p-0 print:pt-4">
      <h2 className="mb-3 font-marque text-base text-gray-900 dark:text-white print:text-black">{titre}</h2>
      {children}
    </section>
  );
}

function Chiffres({ valeurs }: { valeurs: [string, string][] }) {
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {valeurs.map(([libelle, valeur]) => (
        <div key={libelle} className="rounded-xl bg-gray-50 p-3 dark:bg-white/5 print:bg-transparent print:p-0">
          <dt className="text-xs text-gray-500 print:text-gray-700">{libelle}</dt>
          <dd className="mt-0.5 font-marque text-lg text-gray-900 dark:text-white print:text-black">{valeur}</dd>
        </div>
      ))}
    </dl>
  );
}

const th = 'border-b border-gray-200 px-2 py-1.5 text-left text-xs font-medium text-gray-500 dark:border-gray-700 print:text-gray-700';
const td = 'border-b border-gray-100 px-2 py-1.5 text-sm text-gray-900 dark:border-gray-800 dark:text-gray-100 print:text-black';

/** Contenu du rapport, le même à l'écran et à l'impression. */
function Contenu({ r }: { r: Rapport }) {
  const c = r.consultations, m = r.morbidite, h = r.hospitalisation;
  return (
    <div className="space-y-5 print:space-y-4">
      <Section titre="Consultations externes">
        <Chiffres valeurs={[['Consultations', nombre(c.total)], ['Visites nouvelles', nombre(c.visites_nouvelles)], ['Revisites', nombre(c.revisites)],
          ['Urgences', nombre(c.urgences)]]} />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr><th className={th} rowSpan={2}>Âge</th><th className={th} colSpan={2}>Visites nouvelles</th><th className={th} colSpan={2}>Revisites</th><th className={th} rowSpan={2}>Total</th></tr>
              <tr><th className={th}>Masculin</th><th className={th}>Féminin</th><th className={th}>Masculin</th><th className={th}>Féminin</th></tr>
            </thead>
            <tbody>
              {c.par_age_sexe.map((g) => (
                <tr key={g.groupe}>
                  <td className={td}>{g.groupe}</td><td className={td}>{g.nouvelles_m}</td><td className={td}>{g.nouvelles_f}</td>
                  <td className={td}>{g.revisites_m}</td><td className={td}>{g.revisites_f}</td><td className={`${td} font-medium`}>{g.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-gray-500">Téléconsultations terminées : {c.teleconsultations}.</p>
      </Section>

      <Section titre="Morbidité (diagnostics CIM-10)">
        {m.principales.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">Aucune consultation codée ce mois-ci.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead><tr><th className={th}>Code</th><th className={th}>Diagnostic</th><th className={th}>Moins de 5 ans</th><th className={th}>5 ans et plus</th><th className={th}>Total</th></tr></thead>
              <tbody>
                {m.principales.map((p) => (
                  <tr key={p.code}><td className={`${td} font-mono`}>{p.code}</td><td className={td}>{p.libelle}</td><td className={td}>{p.moins_5_ans}</td><td className={td}>{p.cinq_ans_et_plus}</td><td className={`${td} font-medium`}>{p.total}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-2 text-xs text-gray-500">
          {m.consultations_codees} consultation{m.consultations_codees > 1 ? 's' : ''} codée{m.consultations_codees > 1 ? 's' : ''}, {m.consultations_non_codees} sans code CIM-10.
        </p>
      </Section>

      <Section titre="Santé maternelle">
        <Chiffres valeurs={[['Consultations prénatales', nombre(r.sante_maternelle.consultations_prenatales)], ['Accouchements', nombre(r.sante_maternelle.accouchements)],
          ['Dont césariennes', nombre(r.sante_maternelle.cesariennes)], ['Consultations postnatales', nombre(r.sante_maternelle.consultations_postnatales)]]} />
      </Section>

      <Section titre="Hospitalisation">
        <Chiffres valeurs={[['Admissions', nombre(h.admissions)], ['Sorties', nombre(h.sorties)], ['Transferts', nombre(h.transferts)],
          ['Hospitalisés en fin de mois', nombre(h.hospitalises_fin_de_mois)], ['Journées d’hospitalisation', nombre(h.journees)], ['Lits', nombre(h.lits)],
          ['Taux d’occupation', nombre(h.taux_occupation, ' %')], ['Durée moyenne de séjour', nombre(h.duree_moyenne_sejour, ' jours')]]} />
      </Section>

      <div className="grid gap-5 lg:grid-cols-3 print:grid-cols-1">
        <Section titre="Examens">
          <p className="text-sm text-gray-900 dark:text-gray-100 print:text-black">{r.examens.total} examen{r.examens.total > 1 ? 's' : ''}, dont {r.examens.avec_resultat} avec résultat.</p>
          <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300 print:text-black">
            {r.examens.par_type.map((x) => <li key={x.type_examen || 'np'}>{TYPES_EXAMEN[x.type_examen] ?? (x.type_examen || 'Type non précisé')} : {x.nombre}</li>)}
          </ul>
        </Section>
        <Section titre="Pharmacie">
          <p className="text-sm text-gray-900 dark:text-gray-100 print:text-black">{r.pharmacie.delivrances} délivrance{r.pharmacie.delivrances > 1 ? 's' : ''}, {r.pharmacie.unites} unités.</p>
          <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300 print:text-black">
            {r.pharmacie.principaux.map((x) => <li key={x.nom}>{x.nom} : {x.unites}</li>)}
          </ul>
          <p className="mt-2 text-xs text-gray-500">À la date du rapport : {r.pharmacie.ruptures} en rupture, {r.pharmacie.stock_faible} en stock faible.</p>
        </Section>
        <Section titre="Rendez-vous">
          <Chiffres valeurs={[['Prévus', nombre(r.rendez_vous.prevus)], ['Honorés', nombre(r.rendez_vous.honores)], ['Annulés', nombre(r.rendez_vous.annules)]]} />
        </Section>
      </div>

      <Section titre="Définitions">
        <ul className="list-disc space-y-1 pl-5 text-xs text-gray-600 dark:text-gray-400 print:text-gray-800">
          {r.definitions.map((d) => <li key={d}>{d}</li>)}
        </ul>
      </Section>
    </div>
  );
}

// Rapport mensuel d'activité de l'hôpital : à consulter, imprimer (ou enregistrer en PDF) et exporter pour un tableur.
export default function RapportMensuel() {
  const [mois, setMois] = useState(moisPrecedent());
  const [rapport, setRapport] = useState<Rapport | null>(null);
  const [etat, setEtat] = useState<'chargement' | 'pret' | 'absent' | 'erreur'>('chargement');
  const [message, setMessage] = useState('');
  const [impression, setImpression] = useState(false);

  useEffect(() => {
    let annule = false;
    setEtat('chargement');
    rapportsApi.mensuel(mois)
      .then((r) => { if (!annule) { setRapport(r); setEtat('pret'); } })
      .catch((e) => {
        if (annule) return;
        if (moduleAbsent(e)) { setEtat('absent'); return; }
        setMessage((e as { response?: { data?: { mois?: string[] } } })?.response?.data?.mois?.[0] ?? 'Le rapport n’a pas pu être calculé. Vérifiez la connexion puis réessayez.');
        setEtat('erreur');
      });
    return () => { annule = true; };
  }, [mois]);

  const exporter = async () => {
    try {
      const blob = await rapportsApi.exporter(mois);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `rapport-mensuel-${mois}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      setMessage('L’export n’a pas pu être téléchargé.');
    }
  };

  const enTete = rapport && (
    <div className="mb-5 border-b border-gray-200 pb-3 dark:border-gray-800">
      <p className="font-marque text-xl text-gray-900 dark:text-white print:text-black">{rapport.hopital.nom}</p>
      <p className="text-sm text-gray-600 first-letter:uppercase dark:text-gray-400 print:text-gray-800">
        Rapport mensuel d’activité, {rapport.periode.libelle}. Calculé le {new Date(rapport.genere_le).toLocaleString('fr-HT', { dateStyle: 'long', timeStyle: 'short' })}.
      </p>
    </div>
  );

  return (
    <>
      <PageMeta title="Rapport mensuel | TRIMED" description="Rapport mensuel d’activité de l’hôpital." />
      <PageBreadcrumb pageTitle="Rapport mensuel" />
      <div className="space-y-5">
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-end sm:justify-between dark:border-gray-800 dark:bg-white/[0.03]">
          <label className="text-sm text-gray-700 dark:text-gray-300">Mois
            <input type="month" value={mois} max={moisCourant()} min="2020-01" onChange={(e) => e.target.value && setMois(e.target.value)}
              className="mt-1 block h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
          </label>
          <div className="flex gap-2">
            <button type="button" disabled={etat !== 'pret'} onClick={() => setImpression(true)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"><Printer className="h-4 w-4" aria-hidden="true" /> Imprimer</button>
            <button type="button" disabled={etat !== 'pret'} onClick={exporter} className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-500 px-3.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-40"><Download className="h-4 w-4" aria-hidden="true" /> Exporter (CSV)</button>
          </div>
        </div>
        {mois === moisCourant() && etat === 'pret' && <p className="text-sm text-amber-700 dark:text-amber-300">Le mois en cours n’est pas terminé : les chiffres sont provisoires.</p>}
        {etat === 'chargement' && <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />)}</div>}
        {etat === 'absent' && <p className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">Le rapport mensuel sera disponible dès la mise à jour du serveur.</p>}
        {etat === 'erreur' && <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</p>}
        {etat === 'pret' && rapport && <>{enTete}<Contenu r={rapport} /></>}
      </div>

      {impression && rapport && (
        <div className="fixed inset-0 z-[99999] flex flex-col bg-white">
          <div className="flex items-center justify-between border-b bg-gray-100 p-4 print:hidden">
            <p className="text-lg font-semibold text-gray-800">Rapport mensuel, {rapport.periode.libelle}</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-white"><Printer className="h-4 w-4" aria-hidden="true" /> Imprimer</button>
              <button type="button" onClick={() => setImpression(false)} className="inline-flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white"><X className="h-4 w-4" aria-hidden="true" /> Fermer</button>
            </div>
          </div>
          <div className="mx-auto w-full max-w-4xl flex-1 overflow-auto p-8 text-black">{enTete}<Contenu r={rapport} /></div>
        </div>
      )}
    </>
  );
}
