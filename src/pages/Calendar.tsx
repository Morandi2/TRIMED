import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import type { EventClickArg, EventInput } from "@fullcalendar/core";
import { CalendarPlus2, Clock, RefreshCw, Stethoscope, UserRound } from "lucide-react";
import { Modal } from "../components/ui/modal";
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import { lireTout } from "../api/listes";
import { useUser } from "../context/UserContext";
import { COULEURS } from "./Dashboard/tableau/Graphiques";
import { COULEURS_STATUTS } from "./Dashboard/tableau/elements";
import type { RendezVousL } from "./Dashboard/tableau/donnees";

const heure = (iso?: string) => (iso ? new Date(iso).toLocaleTimeString("fr-HT", { hour: "2-digit", minute: "2-digit" }) : "");
const couleurDe = (r: RendezVousL) => COULEURS_STATUTS[r.statut_nom ?? ""] ?? r.statut_couleur ?? COULEURS.gris;

// Calendrier des rendez-vous réels de l’hôpital (le médecin ne voit que les siens).
// La création et la modification se font dans le module Rendez-vous, qui vérifie les créneaux.
export default function Calendar() {
  const { currentUserRole, permissions } = useUser();
  const [rdv, setRdv] = useState<RendezVousL[] | null>(null);
  const [erreur, setErreur] = useState(false);
  const [version, setVersion] = useState(0);
  const [choisi, setChoisi] = useState<RendezVousL | null>(null);

  useEffect(() => {
    let annule = false;
    setErreur(false);
    (async () => {
      let filtre: Record<string, unknown> = {};
      if (currentUserRole === "medecin") {
        const moi = (await lireTout<{ medecin_id: number }>("/medical/medecins/", {}, { maxPages: 1 }))[0];
        filtre = moi ? { medecin: moi.medecin_id } : {};
      }
      return lireTout<RendezVousL>("/rendez-vous/", { ordering: "-date_heure", ...filtre }, { maxPages: 30 });
    })()
      .then((liste) => { if (!annule) setRdv(liste); })
      .catch(() => { if (!annule) setErreur(true); });
    return () => { annule = true; };
  }, [currentUserRole, version]);

  const evenements: EventInput[] = useMemo(() => (rdv ?? []).map((r) => ({
    id: String(r.rendez_vous_id),
    title: `${r.patient_prenom ?? ""} ${r.patient_nom ?? ""}`.trim() || r.motif || "Rendez-vous",
    start: r.date_heure,
    end: r.date_fin,
    backgroundColor: couleurDe(r),
    borderColor: couleurDe(r),
    textColor: "#ffffff",
    extendedProps: r,
  })), [rdv]);

  const statuts = useMemo(() => [...new Set((rdv ?? []).map((r) => r.statut_nom).filter(Boolean))] as string[], [rdv]);
  const surClic = (info: EventClickArg) => setChoisi(info.event.extendedProps as RendezVousL);

  return (
    <>
      <PageMeta title="Calendrier | TRIMED" description="Les rendez-vous de l’hôpital, jour par jour." />
      <PageBreadcrumb pageTitle="Calendrier" />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
          {statuts.map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: COULEURS_STATUTS[s] ?? COULEURS.gris }} />{s}</span>
          ))}
          {rdv && <span className="text-gray-400">· {rdv.length} rendez-vous</span>}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setVersion((v) => v + 1)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"><RefreshCw className="h-4 w-4" aria-hidden="true" /> Actualiser</button>
          {permissions.canEditRendezVous && (
            <Link to="/rendezvous" className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-500 px-3.5 text-sm font-medium text-white hover:bg-brand-600"><CalendarPlus2 className="h-4 w-4" aria-hidden="true" /> Nouveau rendez-vous</Link>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-2 sm:p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        {erreur && <p className="p-6 text-center text-sm text-gray-500">Les rendez-vous n’ont pas pu être chargés. Actualisez dans un instant.</p>}
        {!rdv && !erreur && <div className="h-[520px] animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />}
        {rdv && (
          <div className="custom-calendar">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale={frLocale}
              headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay" }}
              events={evenements}
              eventClick={surClic}
              eventTimeFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
              eventDisplay="block"
              dayMaxEvents={3}
              height="auto"
            />
          </div>
        )}
      </div>

      <Modal isOpen={!!choisi} onClose={() => setChoisi(null)} className="max-w-[520px] p-6 lg:p-8">
        {choisi && (
          <div>
            <span className="inline-flex rounded-full px-2.5 py-1 text-xs text-white" style={{ background: couleurDe(choisi) }}>{choisi.statut_nom ?? "Rendez-vous"}</span>
            <h2 className="mt-3 font-marque text-xl text-gray-900 dark:text-white">{choisi.type_nom || choisi.motif || "Rendez-vous"}</h2>
            <ul className="mt-5 space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-center gap-3"><Clock className="h-4 w-4 text-brand-500" aria-hidden="true" />{new Date(choisi.date_heure).toLocaleDateString("fr-HT", { weekday: "long", day: "numeric", month: "long" })}, {choisi.date_fin ? `de ${heure(choisi.date_heure)} à ${heure(choisi.date_fin)}` : `à ${heure(choisi.date_heure)}`}</li>
              <li className="flex items-center gap-3"><UserRound className="h-4 w-4 text-brand-500" aria-hidden="true" />{choisi.patient_prenom} {choisi.patient_nom}</li>
              {choisi.medecin_nom && <li className="flex items-center gap-3"><Stethoscope className="h-4 w-4 text-brand-500" aria-hidden="true" />Dr {choisi.medecin_prenom} {choisi.medecin_nom}</li>}
            </ul>
            {choisi.motif && <p className="mt-4 rounded-xl bg-gray-50 p-3 text-sm text-gray-700 dark:bg-white/5 dark:text-gray-300">{choisi.motif}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setChoisi(null)} className="rounded-xl px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5">Fermer</button>
              {permissions.canViewRendezVous && (
                <Link to={`/rendezvous?recherche=${encodeURIComponent(`${choisi.patient_nom ?? ""}`)}`} className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">Ouvrir dans Rendez-vous</Link>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
