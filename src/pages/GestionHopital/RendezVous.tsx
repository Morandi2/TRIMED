import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { GestionRendezVous } from "./GestionRendezVous";

export default function RendezVous() {
  return (
    <div>
      <PageMeta
        title="TRIMED"
        description="Gestion hopital"
      />
      <PageBreadcrumb pageTitle="Rendez-vous" />

      <div className="">
        <div>
          <GestionRendezVous tenantId={1} />
        </div>
      </div>
    </div>
  );
}