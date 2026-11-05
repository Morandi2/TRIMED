import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BedDouble, Building2, Check, SlidersHorizontal, Users } from 'lucide-react';
import Symbole from '../../../components/brand/Symbole';
import { useAuth } from '../../../context/AuthContext';
import { useTenant } from '../../../context/TenantContext';
import hospitalApi from '../../../api/hospitalApi';
import { EtapeHopital } from './components/EtapeHopital';
import { EtapeChambres } from './components/EtapeChambres';
import { EtapeEquipe } from './components/EtapeEquipe';
import { EtapePreferences, usePreferences } from './components/EtapePreferences';
import { marquerHopitalConfigure } from './etat';

const ETAPES = [
  { titre: 'Votre hôpital', resume: 'Vérifier les informations', icone: Building2 },
  { titre: 'Chambres et lits', resume: 'Pour les admissions', icone: BedDouble },
  { titre: 'Votre équipe', resume: 'Comptes du personnel', icone: Users },
  { titre: 'Préférences', resume: 'Monnaie, consultations', icone: SlidersHorizontal },
];

// Assistant de configuration de l’hôpital, pour son administrateur (le propriétaire).
// Chaque étape enregistre directement sur le serveur ; la dernière enregistre les préférences,
// ce qui marque l’hôpital comme configuré.
export const ConfigurationWizard = () => {
  const { user } = useAuth();
  const { tenantConfig, setTenantConfig } = useTenant();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const premiere = params.get('premiere') === '1';
  const tenantId = user?.hopital_id || 0;

  const [etape, setEtape] = useState(0);
  const [vues, setVues] = useState<Set<number>>(() => new Set([0]));
  const { prefs, setPrefs, existe } = usePreferences();
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');

  const aller = (i: number) => {
    setEtape(i);
    setVues((v) => new Set(v).add(i));
    window.scrollTo({ top: 0 });
  };

  const terminer = async () => {
    setEnvoi(true);
    setErreur('');
    const res = await hospitalApi.config.saveParametres(tenantId, {
      devise: prefs.devise,
      duree_consultation_defaut: prefs.duree_consultation_defaut,
      fuseau_horaire: 'America/Port-au-Prince',
      ...(existe ? {} : { langue: 'fr' }),
    });
    if (!res.success) {
      setEnvoi(false);
      setErreur((res as { message?: string }).message || 'Les préférences n’ont pas pu être enregistrées.');
      return;
    }
    // La monnaie sert aussi à l’affichage des montants dans l’application.
    setTenantConfig({
      tenant_id: tenantId,
      nom: tenantConfig?.nom || user?.hopital_nom || '',
      logo: tenantConfig?.logo,
      couleur_principale: tenantConfig?.couleur_principale || '#2720FF',
      langue_defaut: tenantConfig?.langue_defaut || 'fr',
      fuseau_horaire: 'America/Port-au-Prince',
      devise: prefs.devise,
      is_configured: true,
    });
    marquerHopitalConfigure(tenantId);
    navigate('/home');
  };

  if (!tenantId) {
    return <p className="p-6 text-sm text-gray-600">Aucun hôpital n’est associé à ce compte. Reconnectez-vous ou contactez l’équipe TRIMED.</p>;
  }

  const derniere = etape === ETAPES.length - 1;

  return (
    <div className="mx-auto max-w-6xl font-texte">
      <header className="mb-8 flex items-center gap-5">
        <Symbole taille={64} vivant titre="" className="h-14 w-14 shrink-0 md:h-16 md:w-16" />
        <div>
          <h1 className="font-marque text-xl text-gray-900 md:text-2xl dark:text-white">
            {premiere ? 'Bienvenue sur TRIMED' : 'Paramètres de l’hôpital'}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {premiere
              ? 'Préparons votre hôpital en quatre étapes. Vous pourrez revenir ici à tout moment.'
              : `${user?.hopital_nom || 'Votre hôpital'} : informations, chambres, équipe et préférences.`}
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <nav aria-label="Étapes de la configuration">
          <ol className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {ETAPES.map((e, i) => {
              const Icone = e.icone;
              const active = i === etape;
              const faite = vues.has(i) && i < etape;
              return (
                <li key={e.titre} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => aller(i)}
                    aria-current={active ? 'step' : undefined}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors ${active ? 'bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800' : 'hover:bg-white dark:hover:bg-white/5'}`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${active ? 'bg-trimed-indigo text-white' : faite ? 'bg-trimed-vert text-white' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                      {faite ? <Check className="h-4 w-4" aria-hidden="true" /> : <Icone className="h-4 w-4" aria-hidden="true" />}
                    </span>
                    <span className="hidden sm:block">
                      <span className="block text-sm font-medium text-gray-900 dark:text-white">{e.titre}</span>
                      <span className="block text-xs text-gray-500">{e.resume}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <section className="rounded-3xl border border-gray-200 bg-white p-5 sm:p-8 dark:border-gray-800 dark:bg-gray-900" aria-labelledby="titre-etape">
          <p className="text-xs uppercase tracking-[0.2em] text-trimed-indigo">Étape {etape + 1} sur {ETAPES.length}</p>
          <h2 id="titre-etape" className="mt-1 mb-6 font-marque text-lg text-gray-900 dark:text-white">{ETAPES[etape].titre}</h2>

          {etape === 0 && <EtapeHopital tenantId={tenantId} nomConnu={user?.hopital_nom} />}
          {etape === 1 && <EtapeChambres tenantId={tenantId} />}
          {etape === 2 && <EtapeEquipe tenantId={tenantId} />}
          {etape === 3 && <EtapePreferences valeur={prefs} onChange={setPrefs} />}

          {erreur && <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">{erreur}</p>}

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-gray-100 pt-6 dark:border-gray-800">
            <button
              type="button"
              onClick={() => aller(etape - 1)}
              disabled={etape === 0}
              className="inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:invisible dark:text-gray-300 dark:hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Précédent
            </button>
            {derniere ? (
              <button
                type="button"
                onClick={terminer}
                disabled={envoi}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-trimed-vert px-5 text-sm font-medium text-white hover:bg-trimed-vert-fonce disabled:opacity-50"
              >
                <Check className="h-4 w-4" aria-hidden="true" /> {envoi ? 'Enregistrement…' : 'Enregistrer et terminer'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => aller(etape + 1)}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-trimed-indigo px-5 text-sm font-medium text-white hover:bg-trimed-indigo-fonce"
              >
                Suivant <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ConfigurationWizard;
