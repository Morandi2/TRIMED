import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import FenConsultation from "./FenGestionHopital/FenConsultation";

export default function Medecin() {
  return (
    <div>
      <PageMeta
        title="TRIMED"
        description="Gestionn hopital"
      />
      <PageBreadcrumb pageTitle="Consultation" />


      <div className="">
        <div>
          <FenConsultation/>
        </div>
      </div>


    </div>
  );
}
