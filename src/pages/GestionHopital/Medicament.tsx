import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import FenMedicament from "./FenGestionHopital/FenMedicament";

export default function Medecin() {
  return (
    <div>
      <PageMeta
        title="TRIMED"
        description="Gestionn hopital"
      />
      <PageBreadcrumb pageTitle="Medicament" />


      <div className="">
        <div>
          <FenMedicament />
        </div>
      </div>


    </div>
  );
}
