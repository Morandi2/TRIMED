import React from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../context/AuthContext";
import GestionPatients from "./GestionPatients/GestionPatients";

export default function Patient() {
  const { user } = useAuth();
  
  return (
    <div>
      <PageMeta
        title="TRIMEDH"
        description="Gestion Patient"
      />
      <PageBreadcrumb pageTitle="Gestion Patient" />

      <div className="">
        <GestionPatients 
          tenantId={user?.hopital_id || 0} 
          hopitalNom={user?.hopital_nom || ""} 
        />
      </div>
    </div>
  );
}
