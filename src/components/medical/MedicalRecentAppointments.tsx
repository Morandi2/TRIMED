import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import hospitalApi from "../../api/hospitalApi";

interface Appointment {
    id: number;
    patientName: string;
    doctorName: string;
    department: string;
    date: string;
    status: string;
    image: string;
}

export default function MedicalRecentAppointments() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            setLoading(true);
            try {
                const { user } = djangoAuthApi.verifierSession();
                const tenantId = user?.hopital_id || 0;
                
                // Using rendezvous.getAll with tenantId fallback
                const response = await hospitalApi.rendezvous.getAll({ 
                    page: 1, 
                    hopital_id: tenantId,
                    tenant: tenantId 
                } as any);

                if (response.success && response.data) {
                    const rawData = response.data.results || response.data || [];
                    const mapped: Appointment[] = (Array.isArray(rawData) ? rawData : []).slice(0, 5).map((rdv: any) => ({
                        id: rdv.rendez_vous_id || rdv.id,
                        patientName: `${rdv.patient_prenom || ''} ${rdv.patient_nom || ''}`.trim() || "Patient inconnu",
                        doctorName: `Dr. ${rdv.medecin_nom || ''}`.trim(),
                        department: rdv.type_nom || "Consultation",
                        date: rdv.date_heure ? new Date(rdv.date_heure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A",
                        status: rdv.statut_nom || (rdv.statut === 1 ? "Confirmé" : rdv.statut === 2 ? "En attente" : "Annulé"),
                        image: rdv.patient_photo || `https://ui-avatars.com/api/?name=${rdv.patient_prenom}+${rdv.patient_nom}&background=random`
                    }));
                    setAppointments(mapped);
                }
            } catch (error) {
                console.error("Error fetching recent appointments:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, []);

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 relative min-h-[400px]">
            {loading && <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 animate-pulse z-10 rounded-2xl" />}
            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Rendez-vous Récents
                    </h3>
                </div>
            </div>
            <div className="max-w-full overflow-x-auto">
                <Table>
                    <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                        <TableRow>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Patient
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Médecin / Service
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Heure
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Statut
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {appointments.map((appointment) => (
                            <TableRow key={appointment.id}>
                                <TableCell className="py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 overflow-hidden rounded-full">
                                            <img src={appointment.image} alt={appointment.patientName} />
                                        </div>
                                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                            {appointment.patientName}
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell className="py-3">
                                    <div>
                                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                            {appointment.doctorName}
                                        </p>
                                        <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                                            {appointment.department}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {appointment.date}
                                </TableCell>
                                <TableCell className="py-3">
                                    <Badge
                                        size="sm"
                                        color={
                                            appointment.status === "Confirmé" || appointment.status === "Siksè"
                                                ? "success"
                                                : appointment.status === "En attente" || appointment.status === "Pendan"
                                                    ? "warning"
                                                    : "error"
                                        }
                                    >
                                        {appointment.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {!loading && appointments.length === 0 && (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                        Aucun rendez-vous récent
                    </div>
                )}
            </div>
        </div>
    );
}
