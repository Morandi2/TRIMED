import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { useState, useEffect } from "react";
import hospitalApi from "../../api/hospitalApi";
import { djangoAuthApi } from "../../api/djangoAuthApi";

export default function HospitalActivityChart() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [series, setSeries] = useState([
        {
            name: "Consultations",
            data: [0, 0, 0, 0, 0, 0, 0],
        },
        {
            name: "Nouveaux Patients",
            data: [0, 0, 0, 0, 0, 0, 0],
        },
    ]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { user } = djangoAuthApi.verifierSession();
                const tenantId = user?.hopital_id || 0;
                
                // On récupère les stats des rendez-vous et des patients
                const [rdvRes, patientRes] = await Promise.all([
                    hospitalApi.rendezVous.getStats({ tenant: tenantId }),
                    hospitalApi.patients.getStatistiques()
                ]);

                if (rdvRes.success && rdvRes.data) {
                    const rdvData = rdvRes.data.evolution || [0, 0, 0, 0, 0, 0, 0];
                    const patientData = (patientRes.success && patientRes.data?.evolution) || [0, 0, 0, 0, 0, 0, 0];
                    
                    setSeries([
                        { name: "Consultations", data: rdvData },
                        { name: "Nouveaux Patients", data: patientData },
                    ]);
                } else {
                    setSeries([
                        { name: "Consultations", data: [0, 0, 0, 0, 0, 0, 0] },
                        { name: "Nouveaux Patients", data: [0, 0, 0, 0, 0, 0, 0] },
                    ]);
                }
            } catch (error) {
                console.error("[HospitalActivityChart] Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const options: ApexOptions = {
        colors: ["#465fff", "#9cb1ff"],
        chart: {
            fontFamily: "Outfit, sans-serif",
            type: "line",
            height: 310,
            toolbar: {
                show: false,
            },
            zoom: {
                enabled: false,
            },
        },
        stroke: {
            curve: "smooth",
            width: [4, 4],
        },
        grid: {
            show: true,
            borderColor: "#E5E7EB",
            strokeDashArray: 3,
            xaxis: {
                lines: {
                    show: false,
                },
            },
            yaxis: {
                lines: {
                    show: true,
                },
            },
            padding: {
                top: -20,
                right: 0,
                bottom: -10,
                left: 10,
            },
        },
        markers: {
            size: 0,
            strokeColors: "#fff",
            strokeWidth: 2,
            hover: {
                size: 6,
            },
        },
        xaxis: {
            categories: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
            labels: {
                style: {
                    colors: "#6B7280",
                    fontSize: "12px",
                },
            },
        },
        yaxis: {
            labels: {
                style: {
                    colors: "#6B7280",
                    fontSize: "12px",
                },
            },
        },
        legend: {
            show: true,
            position: "top",
            horizontalAlign: "left",
            fontFamily: "Outfit",
        },
        tooltip: {
            x: {
                show: false,
            },
        },
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-3 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6 relative">
            {loading && <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 animate-pulse z-10 rounded-2xl" />}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Activité de l'Hôpital
                    </h3>
                    <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
                        Suivi des consultations et nouveaux patients cette semaine
                    </p>
                </div>
                <div className="relative inline-block">
                    <button className="dropdown-toggle" onClick={() => setIsOpen(!isOpen)}>
                        <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
                    </button>
                    <Dropdown
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                        className="w-40 p-2"
                    >
                        <DropdownItem
                            onItemClick={() => setIsOpen(false)}
                            className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                        >
                            Voir détails
                        </DropdownItem>
                    </Dropdown>
                </div>
            </div>

            <div className="max-w-full overflow-x-auto custom-scrollbar">
                <div className="-ml-5 min-w-[650px] xl:min-w-full">
                    <Chart options={options} series={series} type="line" height={310} />
                </div>
            </div>
        </div>
    );
}
