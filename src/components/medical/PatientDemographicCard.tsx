import { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import hospitalApi from "../../api/hospitalApi";

export default function PatientDemographicCard() {
    const [isOpen, setIsOpen] = useState(false);
    const [demographics, setDemographics] = useState([
        { label: "0-18 ans", count: 0, percentage: 0, color: "bg-blue-500" },
        { label: "19-45 ans", count: 0, percentage: 0, color: "bg-brand-500" },
        { label: "46-65 ans", count: 0, percentage: 0, color: "bg-orange-500" },
        { label: "65+ ans", count: 0, percentage: 0, color: "bg-red-500" },
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDemographics = async () => {
            setLoading(true);
            try {
                const { user } = djangoAuthApi.verifierSession();
                const tenantId = user?.hopital_id || 0;

                const response = await hospitalApi.patients.getStatistiques();
                if (response.success && response.data && response.data.repartition_age) {
                    const data = response.data.repartition_age;
                    setDemographics([
                        { label: "0-18 ans", count: data.enfant || data["0-18"] || 0, percentage: data.enfant_pourcentage || 0, color: "bg-blue-500" },
                        { label: "19-45 ans", count: data.adulte || data["19-45"] || 0, percentage: data.adulte_pourcentage || 0, color: "bg-brand-500" },
                        { label: "46-65 ans", count: data.senior || data["46-65"] || 0, percentage: data.senior_pourcentage || 0, color: "bg-orange-500" },
                        { label: "65+ ans", count: data.retraite || data["65+"] || 0, percentage: data.retraite_pourcentage || 0, color: "bg-red-500" },
                    ]);
                } else if (response.success && response.data && !response.data.repartition_age) {
                    // If we have data but no age repartition, maybe we can at least show total count if available
                    console.log("[PatientDemographicCard] Stats success but no repartition_age:", response.data);
                }
            } catch (error) {
                console.error("Error fetching patient demographics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDemographics();
    }, []);

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 relative min-h-[300px]">
            {loading && <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 animate-pulse z-10 rounded-2xl" />}
            <div className="flex justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Démographie des Patients
                    </h3>
                    <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
                        Répartition par tranche d'âge
                    </p>
                </div>
                <div className="relative inline-block">
                    <button className="dropdown-toggle" onClick={() => setIsOpen(!isOpen)}>
                        <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
                    </button>
                    <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-40 p-2">
                        <DropdownItem onItemClick={() => setIsOpen(false)}>En détails</DropdownItem>
                    </Dropdown>
                </div>
            </div>

            <div className="mt-8 space-y-6">
                {demographics.map((item, index) => (
                    <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                            <span className="text-sm font-semibold text-gray-800 dark:text-white">{item.count} patients</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative w-full h-2 bg-gray-100 rounded-full dark:bg-gray-800">
                                <div
                                    className={`absolute left-0 top-0 h-full rounded-full ${item.color}`}
                                    style={{ width: `${item.percentage}%` }}
                                ></div>
                            </div>
                            <span className="text-xs font-medium text-gray-500 w-8">{item.percentage}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
