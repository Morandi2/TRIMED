import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import GestionConsultations from "./GestionConsultations/GestionConsultations";

export default function Consultation() {
  return (
    <div>
      <PageMeta
        title="TRIMED"
        description="Gestion des consultations"
      />
      <PageBreadcrumb pageTitle="Consultations" />

      <div className="">
        <div>
          <GestionConsultations />
        </div>
      </div>
    </div>
  );
}
