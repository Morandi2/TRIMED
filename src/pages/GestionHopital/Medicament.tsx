import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import GestionMedicaments from "./GestionMedicaments/GestionMedicaments";

export default function Medicament() {
  return (
    <div>
      <PageMeta
        title="TRIMED"
        description="Gestion des médicaments"
      />
      <PageBreadcrumb pageTitle="Médicaments" />

      <div className="">
        <div>
          <GestionMedicaments tenantId={1} />
        </div>
      </div>
    </div>
  );
}
