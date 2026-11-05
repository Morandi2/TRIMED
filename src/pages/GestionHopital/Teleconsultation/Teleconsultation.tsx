import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus, DoorOpen, PlayCircle, Video } from 'lucide-react';
import PageMeta from '../../../components/common/PageMeta';
import PageBreadcrumb from '../../../components/common/PageBreadCrumb';
import { useAuth } from '../../../context/AuthContext';
import { lireTout } from '../../../api/listes';
import { moduleAbsent } from '../../../api/caisseApi';
import {
  LIBELLES_STATUT_TC, salleOuverte, teleconsultationApi, type Connexion, type Teleconsultation as TC,
} from '../../../api/teleconsultationApi';
import { alerte, bouton, boutonSecondaire, carte, champ, dateHeure, info, messageErreur, titreCarte, usePatients } from '../Caisse/ui';
import SalleVideo from './SalleVideo';
import { bornes, REGLES } from '../../../utils/contraintes';

interface Medecin { medecin_id: number; nom: string; prenom: string }

/** Téléconsultation : le patient entre dans la salle d'attente, le médecin démarre, la visite et la facture suivent. */
export default function Teleconsultation() {
  const { user } = useAuth();
  const role = user?.role;
  const estPatient = role === 'patient';
  const estMedecin = role === 'medecin';
  const peutPlanifier = !estPatient;
  const [liste, setListe] = useState<TC[] | null>(null);
  const [attente, setAttente] = useState<TC[]>([]);
  const [absent, setAbsent] = useState(false);
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');
  const [salle, setSalle] = useState<{ tc: TC; connexion: Connexion } | null>(null);
  const [modeAudio, setModeAudio] = useState<Record<number, boolean>>({});
  const [, setHorloge] = useState(0);

  const charger = useCallback(async () => {
    try {
      setListe(await teleconsultationApi.liste());
      if (estMedecin) setAttente(await teleconsultationApi.salleAttente());
    } catch (e) { if (moduleAbsent(e)) setAbsent(true); else setErreur(messageErreur(e, 'Les téléconsultations n’ont pas pu être chargées.')); }
  }, [estMedecin]);
  useEffect(() => { charger(); }, [charger]);
  // Salle d'attente rafraîchie toutes les 15 s ; l'horloge active « Rejoindre » à l'heure.
  useEffect(() => {
    const id = setInterval(() => { setHorloge((h) => h + 1); if (estMedecin && !salle) charger(); }, 15_000);
    return () => clearInterval(id);
  }, [charger, estMedecin, salle]);

  const agir = async (action: () => Promise<unknown>, succes: string) => {
    setErreur(''); setMessage('');
    try { await action(); setMessage(succes); await charger(); } catch (e) { setErreur(messageErreur(e, "L'opération n'a pas abouti.")); }
  };

  const entrer = async (tc: TC) => {
    setErreur('');
    try {
      if (estPatient && !tc.consentement_le) await teleconsultationApi.consentir(tc.id, !!modeAudio[tc.id]);
      if (estMedecin && tc.statut !== 'en_cours') await teleconsultationApi.demarrer(tc.id);
      setSalle({ tc, connexion: await teleconsultationApi.rejoindre(tc.id) });
    } catch (e) { setErreur(messageErreur(e, "Impossible d'entrer dans la salle.")); }
  };
  const quitter = useCallback(() => { setSalle(null); charger(); }, [charger]);

  // ---- Planification ----
  const { patients } = usePatients();
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  useEffect(() => { if (peutPlanifier) lireTout<Medecin>('/medical/medecins/').then(setMedecins).catch(() => setMedecins([])); }, [peutPlanifier]);
  const [form, setForm] = useState({ patient: '', medecin: '', date: '', motif: '' });
  const planifier = (e: FormEvent) => {
    e.preventDefault();
    agir(() => teleconsultationApi.planifier({ patient: Number(form.patient), medecin: Number(form.medecin), date_prevue: new Date(form.date).toISOString(), motif: form.motif }),
      'Téléconsultation planifiée.').then(() => setForm({ patient: '', medecin: '', date: '', motif: '' }));
  };

  if (salle) {
    return (
      <div className="space-y-3">
        <PageMeta title="Téléconsultation | TRIMED" description="Consultation à distance" />
        <p className="text-sm text-gray-600 dark:text-gray-400">{estMedecin ? salle.tc.patient_nom : salle.tc.medecin_nom}{salle.tc.motif ? `, ${salle.tc.motif}` : ''}</p>
        <SalleVideo connexion={salle.connexion} onQuitter={quitter}
          onTerminer={estMedecin ? () => { teleconsultationApi.terminer(salle.tc.id).catch(() => undefined).finally(quitter); } : undefined} />
        {estMedecin && <p className="text-sm text-gray-600 dark:text-gray-400">La consultation que vous rédigez pendant ou après l'appel est rattachée à cette téléconsultation. <Link to="/consultation" target="_blank" className="text-brand-600 hover:underline">Ouvrir les consultations</Link></p>}
      </div>
    );
  }

  const aVenir = (liste ?? []).filter((t) => t.statut !== 'terminee' && t.statut !== 'annulee');
  const passees = (liste ?? []).filter((t) => t.statut === 'terminee' || t.statut === 'annulee').slice(-10).reverse();
  return (
    <div>
      <PageMeta title="Téléconsultation | TRIMED" description="Consultation à distance" />
      <PageBreadcrumb pageTitle="Téléconsultation" />
      {absent ? (
        <p className="rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center text-sm text-gray-600 dark:border-gray-800 dark:text-gray-400">La téléconsultation sera disponible dès la mise à jour du serveur.</p>
      ) : (
        <div className="space-y-5">
          {message && <p role="status" className={info}>{message}</p>}
          {erreur && <p role="alert" className={alerte}>{erreur}</p>}

          {estMedecin && (
            <section className={carte}>
              <h2 className={`${titreCarte} mb-3 flex items-center gap-2`}><DoorOpen className="h-5 w-5" aria-hidden="true" /> Salle d'attente</h2>
              {attente.length === 0 ? <p className="text-sm text-gray-500">Aucun patient en attente.</p> : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {attente.map((t) => (
                    <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                      <span><strong>{t.patient_nom}</strong> <span className="text-sm text-gray-500">arrivé(e) {dateHeure(t.patient_arrive_le)}{t.mode_audio ? ', audio seulement' : ''}</span></span>
                      <button type="button" className={bouton} onClick={() => entrer(t)}><PlayCircle className="h-4 w-4" aria-hidden="true" /> Démarrer</button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          <section className={carte}>
            <h2 className={`${titreCarte} mb-3 flex items-center gap-2`}><Video className="h-5 w-5" aria-hidden="true" /> {estPatient ? 'Mes téléconsultations' : 'Téléconsultations à venir'}</h2>
            {liste === null ? <div className="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" /> : aVenir.length === 0 ? <p className="text-sm text-gray-500">Aucune téléconsultation prévue.</p> : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {aVenir.map((t) => {
                  const ouverte = salleOuverte(t);
                  return (
                    <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{estPatient ? t.medecin_nom : `${t.patient_nom}, ${t.medecin_nom}`}</p>
                        <p className="text-sm text-gray-500">{dateHeure(t.date_prevue)}, {LIBELLES_STATUT_TC[t.statut].toLowerCase()}{t.motif ? `, ${t.motif}` : ''}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {estPatient && !t.consentement_le && (
                          <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                            <input type="checkbox" checked={!!modeAudio[t.id]} onChange={(e) => setModeAudio({ ...modeAudio, [t.id]: e.target.checked })} /> Connexion faible : audio seulement
                          </label>
                        )}
                        {(estPatient || (estMedecin && t.statut !== 'planifiee')) && (
                          <button type="button" disabled={!ouverte} className={bouton} onClick={() => entrer(t)} title={ouverte ? '' : "La salle ouvre 15 minutes avant l'heure."}>
                            {estPatient ? (t.consentement_le ? 'Rejoindre' : "J'accepte et je rejoins") : 'Démarrer'}
                          </button>
                        )}
                        {t.statut === 'planifiee' && (
                          <button type="button" className={boutonSecondaire} onClick={() => agir(() => teleconsultationApi.annuler(t.id), 'Téléconsultation annulée.')}>Annuler</button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            {estPatient && aVenir.some((t) => !t.consentement_le) && (
              <p className="mt-3 text-xs text-gray-500">En rejoignant, vous acceptez une consultation à distance par vidéo avec le médecin. Elle n'est pas enregistrée. Choisissez un endroit calme et privé.</p>
            )}
          </section>

          {peutPlanifier && (
            <section className={carte}>
              <h2 className={`${titreCarte} mb-3 flex items-center gap-2`}><CalendarPlus className="h-5 w-5" aria-hidden="true" /> Planifier une téléconsultation</h2>
              <form onSubmit={planifier} className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <select className={champ} value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} required>
                  <option value="">Patient</option>
                  {patients.slice(0, 300).map((p) => <option key={p.patient_id} value={p.patient_id}>{p.prenom} {p.nom}</option>)}
                </select>
                <select className={champ} value={form.medecin} onChange={(e) => setForm({ ...form, medecin: e.target.value })} required>
                  <option value="">Médecin</option>
                  {medecins.map((m) => <option key={m.medecin_id} value={m.medecin_id}>Dr {m.prenom} {m.nom}</option>)}
                </select>
                <input type="datetime-local" aria-label="Date et heure" className={champ} {...bornes(REGLES.teleconsultation, 'datetime-local')} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                <input className={champ} placeholder="Motif" value={form.motif} onChange={(e) => setForm({ ...form, motif: e.target.value })} />
                <div className="sm:col-span-2 lg:col-span-4 flex justify-end"><button type="submit" className={bouton}>Planifier</button></div>
              </form>
              <p className="mt-2 text-xs text-gray-500">Le patient doit avoir un compte TRIMED pour rejoindre la salle depuis son téléphone ou son ordinateur.</p>
            </section>
          )}

          {passees.length > 0 && (
            <details className={carte}>
              <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-200">Téléconsultations passées ({passees.length})</summary>
              <ul className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {passees.map((t) => <li key={t.id}>{dateHeure(t.date_prevue)}, {estPatient ? t.medecin_nom : t.patient_nom} : {LIBELLES_STATUT_TC[t.statut].toLowerCase()}</li>)}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
