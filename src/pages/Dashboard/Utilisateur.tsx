import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import User from "../../components/UserProfile/User";

export default function Blank() {
  return (
    <div>
      <PageMeta
        title="TRIMED"
        description="Gestionn hopital"
      />
      <PageBreadcrumb pageTitle="Utilisateurs" />
      
          <User />
       
    
    </div>
  );
}
