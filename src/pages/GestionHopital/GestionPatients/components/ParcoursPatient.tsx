import { useEffect, useState } from 'react';
import { Activity, BedDouble, CalendarClock, FileText, FlaskConical, LogOut, Pill, Repeat, Stethoscope } from 'lucide-react';
import apiClient from '../../../../api/apiConfig';

interface Evenement { type: string; date: string; titre: string; details: string }

const ICONES: Record<string, typeof Activity> = {
  rendez_vous: CalendarClock, consultation: Stethoscope, ordonnance: Pill, examen: FlaskConical, resultat: FileText,
  admission: BedDouble, sortie: LogOut, changement_lit: Repeat, suivi: Activity,
};
const quand = (iso: string) => new Date(iso).toLocaleString('fr-HT', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

/** Parcours du patient (rendez-vous, consultations, ordonnances, examens, hospitalisations, signes vitaux). */
export default function ParcoursPatient({ patientId }: { patientId: number }) {
  const [evenements, setEvenements] = useState<Evenement[] | null>(null);
  const [indisponible, setIndisponible] = useState(false);
  const [tout, setTout] = useState(false);

  useEffect(() => {
    let annule = false;
    apiClient.get('/visites/chronologie/', { params: { patient: patientId } })
      .then((r) => { if (!annule) setEvenements((r.data as { evenements: Evenement[] }).evenements); })
      .catch(() => { if (!annule) setIndisponible(true); });
    return () => { annule = true; };
  }, [patientId]);

  // Le serveur n'a pas encore la chronologie (ou le rôle n'y a pas accès) : la section ne s'affiche pas.
  if (indisponible) return null;
  const liste = (evenements ?? []).slice(0, tout ? 300 : 8);
  return (
    <div>
      <h4 className="mb-3 mt-6 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
        <span className="h-2 w-2 rounded-full bg-brand-500"></span> Parcours
      </h4>
      {evenements === null ? <div className="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5" /> : evenements.length === 0 ? (
        <p className="text-sm text-gray-500">Aucun soin enregistré pour l'instant.</p>
      ) : (
        <ol className="relative space-y-3 border-l border-gray-200 pl-5 dark:border-white/10">
          {liste.map((e, i) => {
            const Icone = ICONES[e.type] ?? Activity;
            return (
              <li key={`${e.type}-${i}`} className="relative">
                <span className="absolute -left-[29px] flex h-6 w-6 items-center justify-center rounded-full bg-white ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-white/10"><Icone className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" /></span>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{e.titre}</p>
                <p className="text-xs text-gray-500">{quand(e.date)}{e.details ? `, ${e.details}` : ''}</p>
              </li>
            );
          })}
        </ol>
      )}
      {evenements && evenements.length > 8 && (
        <button type="button" onClick={() => setTout(!tout)} className="mt-3 text-sm text-brand-600 hover:underline">{tout ? 'Réduire' : `Tout afficher (${evenements.length})`}</button>
      )}
    </div>
  );
}
