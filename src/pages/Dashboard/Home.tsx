import HospitalMetrics from "../../components/medical/HospitalMetrics";
import ConsultationVolumeChart from "../../components/medical/ConsultationVolumeChart";
import HospitalActivityChart from "../../components/medical/HospitalActivityChart";
import MedicalRecentAppointments from "../../components/medical/MedicalRecentAppointments";
import PatientDemographicCard from "../../components/medical/PatientDemographicCard";
import PageMeta from "../../components/common/PageMeta";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Dashboard | TRIMEDH"
        description="Tablo bò TRIMEDH pou jesyon lopital ak klinik."
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <HospitalMetrics />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <HospitalActivityChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <ConsultationVolumeChart />
        </div>

        <div className="col-span-12 xl:col-span-4">
          <PatientDemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-8">
          <MedicalRecentAppointments />
        </div>
      </div>
    </>
  );
}
