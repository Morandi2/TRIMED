import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import GestionExamens from "./GestionExamens/GestionExamens";
import { useAuth } from "../../context/AuthContext";

export default function Examen() {
  const { user } = useAuth();

  return (
    <div>
      <PageMeta title="TRIMEDH" description="Gestion des examens médicaux" />
      <PageBreadcrumb pageTitle="Examens" />

      <div className="">
        <div>
          <GestionExamens
            tenantId={user?.hopital_id || 0}
            hopitalNom={user?.hopital_nom || ""}
          />
        </div>
      </div>
    </div>
  );
}
