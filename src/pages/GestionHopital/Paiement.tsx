import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import PaymentModule from "./FenGestionHopital/FenPaiement";

export default function Medecin() {
  return (
    <div>
      <PageMeta
        title="TRIMED"
        description="Gestionn hopital"
      />
      <PageBreadcrumb pageTitle="Paiement" />


      <div className="">
        <div>
          <PaymentModule adminId={1} currentPlan="basic" />
        </div>
      </div>


    </div>
  );
}
