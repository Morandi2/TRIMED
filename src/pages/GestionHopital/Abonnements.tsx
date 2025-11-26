import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { GestionAbonnements } from "./GestionAbonnements";

export default function Abonnements() {
  return (
    <div>
      <PageMeta
        title="TRIMED"
        description="Gestion hopital"
      />
      <PageBreadcrumb pageTitle="Abonnements" />

      <div className="">
        <div>
         <GestionAbonnements tenantId={1} />
        </div>
      </div>
    </div>
  );
}