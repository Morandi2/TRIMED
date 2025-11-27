import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import GestionMedecins from "./GestionMedecins/GestionMedecins";

export default function Medecin() {
  return (
    <div>
      <PageMeta
        title="TRIMED"
        description="Gestion des médecins"
      />
      <PageBreadcrumb pageTitle="Médecins" />

      <div className="">
        <div>
          <GestionMedecins />
        </div>
      </div>
    </div>
  );
}
