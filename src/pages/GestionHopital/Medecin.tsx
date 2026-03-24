import React from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import GestionMedecins from "./GestionMedecins/GestionMedecins";
import { useAuth } from "../../context/AuthContext";

export default function Medecin() {
  const { user } = useAuth();
  
  return (
    <div>
      <PageMeta
        title="TRIMEDH"
        description="Gestion des médecins"
      />
      <PageBreadcrumb pageTitle="Médecins" />

      <div className="">
        <div>
          <GestionMedecins 
            tenantId={user?.hopital_id || 0} 
            hopitalNom={user?.hopital_nom || ""} 
          />
        </div>
      </div>
    </div>
  );
}
