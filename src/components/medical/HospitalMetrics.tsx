import React, { useEffect, useState } from 'react';
import {
    ArrowDownIcon,
    ArrowUpIcon,
    GroupIcon,
    CalenderIcon,
    UserCircleIcon,
    DocsIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";
import hospitalApi from "../../api/hospitalApi";
import { djangoAuthApi } from "../../api/djangoAuthApi";

export default function HospitalMetrics() {
    const [stats, setStats] = useState({
        patients: '0',
        appointments: '0',
        doctors: '0',
        consultations: '0',
        patientsTrend: '+0%',
        appointmentsTrend: '+0%',
        doctorsTrend: '+0%',
        consultationsTrend: '+0%'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            const { user } = djangoAuthApi.verifierSession();
            const tenantId = user?.hopital_id || 0;
            
            console.log(`[HospitalMetrics] Starting fetch for tenant: ${tenantId}...`);
            
            try {
                // Fetch stats independently using Promise.allSettled
                const results = await Promise.allSettled([
                    hospitalApi.patients.getStatistiques(), // 0
                    hospitalApi.rendezvous.getStatistiques(), // 1
                    hospitalApi.medecins.getAll({ hopital_id: tenantId } as any), // 2
                    hospitalApi.patients.getAll({ hopital_id: tenantId } as any), // 3 (Fallback count)
                    hospitalApi.rendezVous.getAll({ hopital_id: tenantId } as any), // 4 (Fallback count)
                ]);

                console.log("[HospitalMetrics] Raw results:", results);

                setStats(prev => {
                    const newStats = { ...prev };

                    const getResultData = (index: number) => {
                        const res = results[index];
                        if (res.status === 'fulfilled' && res.value.success && res.value.data) {
                            return res.value.data;
                        }
                        return null;
                    };

                    // 1. Patients
                    const patientStats = getResultData(0);
                    if (patientStats) {
                        console.log("[HospitalMetrics] Patient stats data:", patientStats);
                        newStats.patients = (patientStats.total_patients || patientStats.count || patientStats.total || 0).toLocaleString();
                        const trend = patientStats.evolution_pourcentage || 0;
                        newStats.patientsTrend = `${trend >= 0 ? '+' : ''}${trend}%`;
                    } 
                    
                    // Fallback Patients if stats failed or returned 0
                    if (newStats.patients === '0') {
                        const patientAll = getResultData(3);
                        if (patientAll) {
                            console.log("[HospitalMetrics] Patient fallback (getAll) data:", patientAll);
                            const count = patientAll.count || (Array.isArray(patientAll) ? patientAll.length : (Array.isArray(patientAll.results) ? patientAll.results.length : 0));
                            newStats.patients = count.toLocaleString();
                        }
                    }

                    // 2. Appointments
                    const rdvStats = getResultData(1);
                    if (rdvStats) {
                        console.log("[HospitalMetrics] RDV stats data:", rdvStats);
                        newStats.appointments = (rdvStats.total_rendez_vous || rdvStats.count || rdvStats.total || 0).toLocaleString();
                        const trend = rdvStats.evolution_pourcentage || 0;
                        newStats.appointmentsTrend = `${trend >= 0 ? '+' : ''}${trend}%`;
                    }
                    
                    // Fallback Appointments if stats failed or returned 0
                    if (newStats.appointments === '0') {
                        const rdvAll = getResultData(4);
                        if (rdvAll) {
                            console.log("[HospitalMetrics] RDV fallback (getAll) data:", rdvAll);
                            const count = rdvAll.count || (Array.isArray(rdvAll) ? rdvAll.length : (Array.isArray(rdvAll.results) ? rdvAll.results.length : 0));
                            newStats.appointments = count.toLocaleString();
                        }
                    }

                    // 3. Doctors
                    const medecinAll = getResultData(2);
                    if (medecinAll) {
                        console.log("[HospitalMetrics] Medecin data:", medecinAll);
                        const doctorsList = medecinAll.results || medecinAll.data || medecinAll || [];
                        const count = medecinAll.count || (Array.isArray(doctorsList) ? doctorsList.length : 0);
                        newStats.doctors = count.toLocaleString();
                    }

                    console.log("[HospitalMetrics] Final mapped stats:", newStats);
                    return newStats;
                });
            } catch (error) {
                console.error("Critical error in HospitalMetrics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
            {/* <!-- Metric Item Start --> */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 relative overflow-hidden">
                {loading && <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 animate-pulse z-10" />}
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                    <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
                </div>

                <div className="flex items-end justify-between mt-5">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Patients
                        </span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            {stats.patients}
                        </h4>
                    </div>
                    <Badge color={stats.patientsTrend.startsWith('-') ? "error" : "success"}>
                        {stats.patientsTrend.startsWith('-') ? <ArrowDownIcon /> : <ArrowUpIcon />}
                        {stats.patientsTrend.replace(/[+-]/, '')}
                    </Badge>
                </div>
            </div>
            {/* <!-- Metric Item End --> */}

            {/* <!-- Metric Item Start --> */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 relative overflow-hidden">
                {loading && <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 animate-pulse z-10" />}
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                    <CalenderIcon className="text-gray-800 size-6 dark:text-white/90" />
                </div>
                <div className="flex items-end justify-between mt-5">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Rendez-vous
                        </span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            {stats.appointments}
                        </h4>
                    </div>

                    <Badge color={stats.appointmentsTrend.startsWith('-') ? "error" : "success"}>
                        {stats.appointmentsTrend.startsWith('-') ? <ArrowDownIcon /> : <ArrowUpIcon />}
                        {stats.appointmentsTrend.replace(/[+-]/, '')}
                    </Badge>
                </div>
            </div>
            {/* <!-- Metric Item End --> */}

            {/* <!-- Metric Item Start --> */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 relative overflow-hidden">
                {loading && <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 animate-pulse z-10" />}
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                    <UserCircleIcon className="text-gray-800 size-6 dark:text-white/90" />
                </div>
                <div className="flex items-end justify-between mt-5">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Médecins
                        </span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            {stats.doctors}
                        </h4>
                    </div>

                    <Badge color="success">
                        <ArrowUpIcon />
                        {stats.doctorsTrend.replace(/[+-]/, '')}
                    </Badge>
                </div>
            </div>
            {/* <!-- Metric Item End --> */}

            {/* <!-- Metric Item Start --> */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 relative overflow-hidden">
                {loading && <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 animate-pulse z-10" />}
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                    <DocsIcon className="text-gray-800 size-6 dark:text-white/90" />
                </div>
                <div className="flex items-end justify-between mt-5">
                    <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Consultations
                        </span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            {stats.consultations}
                        </h4>
                    </div>

                    <Badge color="success">
                        <ArrowUpIcon />
                        {stats.consultationsTrend.replace(/[+-]/, '')}
                    </Badge>
                </div>
            </div>
            {/* <!-- Metric Item End --> */}
        </div>
    );
}
