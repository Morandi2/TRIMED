import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import TenantPaiementModule from "./TenantPaiement/TenantPaiementModule";

export default function Paiement() {
  return (
    <div>
      <PageMeta
        title="TRIMED"
        description="Gestion hopital"
      />
      <PageBreadcrumb pageTitle="Paiement" />
      <div className="">
        <TenantPaiementModule tenantId={0} />
      </div>
    </div>
  );
}
