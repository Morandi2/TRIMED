import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import FenMedecin from "./FenGestionHopital/FenMedecin";

export default function Medecin() {
  return (
    <div>
      <PageMeta
        title="TRIMED"
        description="Gestionn hopital"
      />
      <PageBreadcrumb pageTitle="Medecin" />


      <div className="">
        <div>
          <FenMedecin />
        </div>
      </div>


    </div>
  );
}
