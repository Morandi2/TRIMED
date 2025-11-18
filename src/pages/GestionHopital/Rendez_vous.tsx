import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import FenRendezVous from "./FenGestionHopital/FenRendezVous";

export default function Medecin() {
  return (
    <div>
      <PageMeta
        title="TRIMED"
        description="Gestionn hopital"
      />
      <PageBreadcrumb pageTitle="Ordonnance" />


      <div className="">
        <div>
          <FenRendezVous />
        </div>
      </div>


    </div>
  );
}
