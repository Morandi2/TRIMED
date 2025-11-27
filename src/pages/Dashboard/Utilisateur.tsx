import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { GestionUtilisateur } from "../GestionHopital/GestionUtilisateur";

export default function Blank() {
  return (
    <div>
      <PageMeta
        title="TRIMED"
        description="Gestionn hopital"
      />
      <PageBreadcrumb pageTitle="Utilisateurs" />
      
          {/* <User /> */}
          <GestionUtilisateur tenantId={0}/>
       
    
    </div>
  );
}
