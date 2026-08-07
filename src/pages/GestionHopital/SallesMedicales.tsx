import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import GestionSallesMedicales from "./GestionSallesMedicales/GestionSallesMedicales";
import { useAuth } from "../../context/AuthContext";

export default function SallesMedicales() {
  const { user } = useAuth();

  return (
    <div>
      <PageMeta title="TRIMEDH" description="Gestion des salles médicales" />
      <PageBreadcrumb pageTitle="Salles médicales" />

      <div className="">
        <div>
          <GestionSallesMedicales
            tenantId={user?.hopital_id || 0}
            hopitalNom={user?.hopital_nom || ""}
          />
        </div>
      </div>
    </div>
  );
}
