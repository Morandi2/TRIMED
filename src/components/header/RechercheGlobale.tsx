import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, Search, Stethoscope, UserRound } from 'lucide-react';
import { lireOuNull, enListe } from '../../api/listes';
import { useUser } from '../../context/UserContext';

interface Resultat { cle: string; titre: string; detail?: string; lien: string; groupe: string }
type Icone = typeof UserRound;

// Sources interrogées selon les droits du compte : patients, médecins, médicaments.
const SOURCES: { groupe: string; icone: Icone; chemin: string; lien: string; droit: 'canViewPatients' | 'canViewMedecins' | 'canViewMedicaments';
  versResultat: (e: Record<string, string>) => { titre: string; detail?: string } }[] = [
  { groupe: 'Patients', icone: UserRound, chemin: '/patients/', lien: '/patient', droit: 'canViewPatients', versResultat: (p) => ({ titre: `${p.prenom} ${p.nom}`, detail: p.numero_dossier_medical }) },
  { groupe: 'Médecins', icone: Stethoscope, chemin: '/medical/medecins/', lien: '/medecin', droit: 'canViewMedecins', versResultat: (m) => ({ titre: `Dr ${m.prenom ?? ''} ${m.nom ?? m.nom_complet ?? ''}`.trim(), detail: m.specialite_nom || m.specialite }) },
  { groupe: 'Médicaments', icone: Pill, chemin: '/medicaments/', lien: '/medicament', droit: 'canViewMedicaments', versResultat: (m) => ({ titre: m.nom, detail: m.dosage_standard }) },
];
const ICONES: Record<string, Icone> = Object.fromEntries(SOURCES.map((s) => [s.groupe, s.icone]));

/** Recherche dans tout l’hôpital depuis l’en-tête (raccourci Ctrl+K ou ⌘K). */
export default function RechercheGlobale() {
  const { permissions, currentUserRole } = useUser();
  const navigate = useNavigate();
  const champ = useRef<HTMLInputElement>(null);
  const [terme, setTerme] = useState('');
  const [resultats, setResultats] = useState<Resultat[]>([]);
  const [ouvert, setOuvert] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [actif, setActif] = useState(0);

  const sources = SOURCES.filter((s) => currentUserRole !== 'admin-systeme' && permissions[s.droit]);

  // Raccourci clavier
  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); champ.current?.focus(); setOuvert(true); }
    };
    document.addEventListener('keydown', surTouche);
    return () => document.removeEventListener('keydown', surTouche);
  }, []);

  // Recherche avec un léger délai pendant la frappe
  useEffect(() => {
    const q = terme.trim();
    if (q.length < 2 || !sources.length) { setResultats([]); return; }
    let annule = false;
    setChargement(true);
    const minuteur = window.setTimeout(async () => {
      const lots = await Promise.all(sources.map(async (s) => {
        const data = await lireOuNull<unknown>(s.chemin, { search: q });
        return enListe<Record<string, string>>(data).slice(0, 4).map((e, i) => ({ ...s.versResultat(e), cle: `${s.groupe}-${i}`, groupe: s.groupe, lien: `${s.lien}?recherche=${encodeURIComponent(q)}` }));
      }));
      if (annule) return;
      setResultats(lots.flat());
      setActif(0);
      setChargement(false);
    }, 280);
    return () => { annule = true; clearTimeout(minuteur); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terme, currentUserRole]);

  const ouvrir = (r: Resultat) => { setOuvert(false); setTerme(''); champ.current?.blur(); navigate(r.lien); };

  const surClavier = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setOuvert(false); champ.current?.blur(); }
    if (!resultats.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActif((a) => (a + 1) % resultats.length); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActif((a) => (a - 1 + resultats.length) % resultats.length); }
    if (e.key === 'Enter') { e.preventDefault(); ouvrir(resultats[actif]); }
  };

  if (!sources.length) return null;
  const montrer = ouvert && terme.trim().length >= 2;

  return (
    <div className="relative" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOuvert(false); }}>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500 dark:text-gray-400" aria-hidden="true" />
      <input
        ref={champ}
        type="search"
        value={terme}
        onChange={(e) => { setTerme(e.target.value); setOuvert(true); }}
        onFocus={() => setOuvert(true)}
        onKeyDown={surClavier}
        placeholder="Rechercher dans l’hôpital…"
        aria-label="Recherche dans l’hôpital"
        aria-expanded={montrer}
        aria-controls="resultats-recherche"
        role="combobox"
        className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-16 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
      />
      <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[3px] text-xs text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">Ctrl K</kbd>

      {montrer && (
        <div id="resultats-recherche" role="listbox" className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-lg xl:w-[430px] dark:border-gray-800 dark:bg-gray-900">
          {chargement && !resultats.length ? <p className="px-4 py-3 text-sm text-gray-500">Recherche…</p>
            : !resultats.length ? <p className="px-4 py-3 text-sm text-gray-500">Aucun résultat pour « {terme.trim()} ».</p>
            : resultats.map((r, i) => {
                const Icone = ICONES[r.groupe];
                const premier = i === 0 || resultats[i - 1].groupe !== r.groupe;
                return (
                  <div key={r.cle}>
                    {premier && <p className="bg-gray-50 px-4 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:bg-white/5">{r.groupe}</p>}
                    <button type="button" role="option" aria-selected={i === actif} onMouseEnter={() => setActif(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => ouvrir(r)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left ${i === actif ? 'bg-brand-50 dark:bg-brand-500/10' : ''}`}>
                      <Icone className="h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate text-sm text-gray-900 dark:text-white">{r.titre}</span>
                      {r.detail && <span className="shrink-0 text-xs text-gray-500">{r.detail}</span>}
                    </button>
                  </div>
                );
              })}
        </div>
      )}
    </div>
  );
}
