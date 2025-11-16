import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import FenOrdonnance from "./FenGestionHopital/FenOrdonnance";

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
          <FenOrdonnance />
        </div>
      </div>


    </div>
  );
}
