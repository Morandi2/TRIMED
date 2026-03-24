import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import { EventInput, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import PageMeta from "../components/common/PageMeta";

interface CalendarEvent extends EventInput {
 extendedProps: {
 calendar: string;
 patient?: string;
 doctor?: string;
 room?: string;
 };
}

const Calendar: React.FC = () => {
 const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
 null
 );
 const [eventTitle, setEventTitle] = useState("");
 const [eventPatient, setEventPatient] = useState("");
 const [eventDoctor, setEventDoctor] = useState("");
 const [eventRoom, setEventRoom] = useState("");
 const [eventStartDate, setEventStartDate] = useState("");
 const [eventEndDate, setEventEndDate] = useState("");
 const [eventLevel, setEventLevel] = useState("Routine");
 const [events, setEvents] = useState<CalendarEvent[]>([]);
 const calendarRef = useRef<FullCalendar>(null);
 const { isOpen, openModal, closeModal } = useModal();

 const calendarsEvents = {
 Urgent: "danger",
 Routine: "success",
 Suivi: "primary",
 Spécialisé: "warning",
 };

 useEffect(() => {
 // Initialisation avec des rendez-vous médicaux
 setEvents([
 {
 id: "1",
 title: "Chirurgie Cardiaque",
 start: new Date().toISOString().split("T")[0],
 extendedProps: {
 calendar: "Urgent",
 patient: "Jean Dupont",
 doctor: "Dr. Valmé",
 room: "Bloc A"
 },
 },
 {
 id: "2",
 title: "Consultation Routine",
 start: new Date(Date.now() + 86400000).toISOString().split("T")[0],
 extendedProps: {
 calendar: "Routine",
 patient: "Marie Louise",
 doctor: "Dr. Pierre",
 room: "Salle 102"
 },
 },
 {
 id: "3",
 title: "Examen Labo",
 start: new Date(Date.now() + 172800000).toISOString().split("T")[0],
 end: new Date(Date.now() + 259200000).toISOString().split("T")[0],
 extendedProps: {
 calendar: "Suivi",
 patient: "Luc Desir",
 doctor: "Dr. Jean-Baptiste",
 room: "Laboratoire"
 },
 },
 ]);
 }, []);

 const handleDateSelect = (selectInfo: DateSelectArg) => {
 resetModalFields();
 setEventStartDate(selectInfo.startStr);
 setEventEndDate(selectInfo.endStr || selectInfo.startStr);
 openModal();
 };

 const handleEventClick = (clickInfo: EventClickArg) => {
 const event = clickInfo.event;
 setSelectedEvent(event as unknown as CalendarEvent);
 setEventTitle(event.title);
 setEventPatient(event.extendedProps.patient || "");
 setEventDoctor(event.extendedProps.doctor || "");
 setEventRoom(event.extendedProps.room || "");
 setEventStartDate(event.start?.toISOString().split("T")[0] || "");
 setEventEndDate(event.end?.toISOString().split("T")[0] || "");
 setEventLevel(event.extendedProps.calendar);
 openModal();
 };

 const handleAddOrUpdateEvent = () => {
 if (selectedEvent) {
 // Mettre à jour le rendez-vous
 setEvents((prevEvents) =>
 prevEvents.map((event) =>
 event.id === selectedEvent.id
 ? {
 ...event,
 title: eventTitle,
 start: eventStartDate,
 end: eventEndDate,
 extendedProps: {
 calendar: eventLevel,
 patient: eventPatient,
 doctor: eventDoctor,
 room: eventRoom
 },
 }
 : event
 )
 );
 } else {
 // Ajouter un nouveau rendez-vous
 const newEvent: CalendarEvent = {
 id: Date.now().toString(),
 title: eventTitle,
 start: eventStartDate,
 end: eventEndDate,
 allDay: true,
 extendedProps: {
 calendar: eventLevel,
 patient: eventPatient,
 doctor: eventDoctor,
 room: eventRoom
 },
 };
 setEvents((prevEvents) => [...prevEvents, newEvent]);
 }
 closeModal();
 resetModalFields();
 };

 const resetModalFields = () => {
 setEventTitle("");
 setEventPatient("");
 setEventDoctor("");
 setEventRoom("");
 setEventStartDate("");
 setEventEndDate("");
 setEventLevel("Routine");
 setSelectedEvent(null);
 };

 return (
 <>
 <PageMeta
 title="Calendrier Médical | TRIMEDH"
 description="Gestion des rendez-vous et plannings médicaux pour TRIMEDH."
 />
 <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
 <div className="custom-calendar">
 <FullCalendar
 ref={calendarRef}
 plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
 initialView="dayGridMonth"
 locale={frLocale}
 locales={[frLocale]}
 headerToolbar={{
 left: "prev,next addEventButton",
 center: "title",
 right: "dayGridMonth,timeGridWeek,timeGridDay",
 }}
 events={events}
 selectable={true}
 select={handleDateSelect}
 eventClick={handleEventClick}
 eventContent={renderEventContent}
 customButtons={{
 addEventButton: {
 text: "Nouveau RDV +",
 click: openModal,
 },
 }}
 />
 </div>
 <Modal
 isOpen={isOpen}
 onClose={closeModal}
 className="max-w-[700px] p-6 lg:p-10"
 >
 <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
 <div>
 <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
 {selectedEvent ? "Modifier le Rendez-vous" : "Nouveau Rendez-vous"}
 </h5>
 <p className="text-sm text-gray-500 dark:text-gray-400">
 Planifiez vos consultations et interventions pour un suivi optimal des patients.
 </p>
 </div>
 <div className="mt-8">
 <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
 <div className="sm:col-span-2">
 <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
 Sujet du Rendez-vous
 </label>
 <input
 type="text"
 value={eventTitle}
 onChange={(e) => setEventTitle(e.target.value)}
 placeholder="Ex: Consultation Cardiologie"
 className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
 />
 </div>

 <div>
 <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
 Patient
 </label>
 <input
 type="text"
 value={eventPatient}
 onChange={(e) => setEventPatient(e.target.value)}
 placeholder="Nom du patient"
 className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
 />
 </div>

 <div>
 <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
 Médecin
 </label>
 <input
 type="text"
 value={eventDoctor}
 onChange={(e) => setEventDoctor(e.target.value)}
 placeholder="Nom du médecin"
 className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
 />
 </div>

 <div>
 <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
 Salle / Lieu
 </label>
 <input
 type="text"
 value={eventRoom}
 onChange={(e) => setEventRoom(e.target.value)}
 placeholder="Ex: Salle 104"
 className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
 />
 </div>

 <div>
 <label className="block mb-4 text-sm font-medium text-gray-700 dark:text-gray-400">
 Priorité / Type
 </label>
 <div className="flex flex-wrap items-center gap-4">
 {Object.entries(calendarsEvents).map(([key, value]) => (
 <label key={key} className="flex items-center text-sm text-gray-700 cursor-pointer dark:text-gray-400">
 <input
 type="radio"
 name="event-level"
 value={key}
 checked={eventLevel === key}
 onChange={() => setEventLevel(key)}
 className="sr-only"
 />
 <span className={`flex items-center justify-center w-5 h-5 mr-2 border border-gray-300 rounded-full dark:border-gray-800 ${eventLevel === key ? "ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-dark-900" : ""}`}>
 <span className={`h-2.5 w-2.5 rounded-full ${value === "danger" ? "bg-red-500" :
 value === "success" ? "bg-green-500" :
 value === "primary" ? "bg-blue-500" : "bg-yellow-500"
 }`}></span>
 </span>
 {key}
 </label>
 ))}
 </div>
 </div>

 <div>
 <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
 Date de début
 </label>
 <input
 type="date"
 value={eventStartDate}
 onChange={(e) => setEventStartDate(e.target.value)}
 className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 dark:border-gray-700 dark:text-white"
 />
 </div>

 <div>
 <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
 Date de fin
 </label>
 <input
 type="date"
 value={eventEndDate}
 onChange={(e) => setEventEndDate(e.target.value)}
 className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 dark:border-gray-700 dark:text-white"
 />
 </div>
 </div>
 </div>
 <div className="flex items-center gap-3 mt-8 modal-footer sm:justify-end">
 <button
 onClick={closeModal}
 type="button"
 className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 sm:w-auto"
 >
 Annuler
 </button>
 <button
 onClick={handleAddOrUpdateEvent}
 type="button"
 className="flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
 >
 {selectedEvent ? "Enregistrer" : "Créer le RDV"}
 </button>
 </div>
 </div>
 </Modal>
 </div>
 </>
 );
};

const renderEventContent = (eventInfo: any) => {
 const calendarType = eventInfo.event.extendedProps.calendar;
 const colorMap: Record<string, string> = {
 Urgent: "bg-red-500/10 text-red-500 border-red-500",
 Routine: "bg-green-500/10 text-green-500 border-green-500",
 Suivi: "bg-blue-500/10 text-blue-500 border-blue-500",
 Spécialisé: "bg-yellow-500/10 text-yellow-500 border-yellow-500",
 };
 const colorClass = colorMap[calendarType] || "bg-brand-500/10 text-brand-500 border-brand-500";

 return (
 <div className={`flex flex-col w-full p-1.5 border-l-4 rounded-r-md ${colorClass} overflow-hidden`}>
 <span className="text-[10px] font-bold uppercase mb-0.5">{calendarType}</span>
 <div className="text-xs font-semibold truncate leading-tight">{eventInfo.event.title}</div>
 {eventInfo.event.extendedProps.patient && (
 <div className="text-[10px] truncate opacity-80 mt-0.5"> {eventInfo.event.extendedProps.patient}</div>
 )}
 </div>
 );
};


export default Calendar;
