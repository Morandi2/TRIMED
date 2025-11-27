import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { GestionRendezVous } from "./GestionRendezVous/GestionRendezVous";


export default function RendezVous() {
  return (
    <div>
      <PageMeta
        title="TRIMED"
        description="Gestion des rendez-vous"
      />
      <PageBreadcrumb pageTitle="Rendez Vous" />

      <div className="">
        <div>
          <GestionRendezVous tenantId={0} />
        </div>
      </div>
    </div>
  );
}
