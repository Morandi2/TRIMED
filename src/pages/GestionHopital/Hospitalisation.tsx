import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import GestionHospitalisation from "./GestionHospitalisation/GestionHospitalisation";
import { useAuth } from "../../context/AuthContext";

export default function Hospitalisation() {
  const { user } = useAuth();

  return (
    <div>
      <PageMeta title="TRIMEDH" description="Gestion de l'hospitalisation" />
      <PageBreadcrumb pageTitle="Hospitalisation" />

      <div className="">
        <div>
          <GestionHospitalisation
            tenantId={user?.hopital_id || 0}
            hopitalNom={user?.hopital_nom || ""}
          />
        </div>
      </div>
    </div>
  );
}
