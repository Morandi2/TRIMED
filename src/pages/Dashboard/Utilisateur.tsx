import { useAuth } from "../../context/AuthContext";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { GestionUtilisateur } from "../GestionHopital/GestionUtilisateur";

export default function Blank() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  }

  return (
    <div>
      <PageMeta
        title="TRIMEDH"
        description="Gestion hopital"
      />
      <PageBreadcrumb pageTitle="Utilisateurs" />

      {/* <User /> */}
      <GestionUtilisateur tenantId={user?.hopital_id || 0} />


    </div>
  );
}
