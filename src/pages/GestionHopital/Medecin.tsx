import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import FenMedecin from "./FenGestionHopital/FenMedecin";


export default function Blank() {
  return (
    <div>
      <PageMeta
        title="TRIMED"
        description="Gestionn hopital"
      />
      <PageBreadcrumb pageTitle="Medecin" />
      
         
       <FenMedecin />
    
    </div>
  );
}
