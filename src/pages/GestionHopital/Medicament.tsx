import React from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import GestionMedicaments from "./GestionMedicaments/GestionMedicaments";
import { useAuth } from "../../context/AuthContext";

export default function Medicament() {
  const { user } = useAuth();
  
  return (
    <div>
      <PageMeta
        title="TRIMEDH"
        description="Gestion des médicaments"
      />
      <PageBreadcrumb pageTitle="Médicaments" />

      <div className="">
        <div>
          <GestionMedicaments 
            tenantId={user?.hopital_id || 0} 
            hopitalNom={user?.hopital_nom || ""} 
          />
        </div>
      </div>
    </div>
  );
}
