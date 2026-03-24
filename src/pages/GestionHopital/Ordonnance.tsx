import React from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import GestionOrdonnances from "./GestionOrdonnances/GestionOrdonnances";
import { useAuth } from "../../context/AuthContext";

export default function Ordonnance() {
  const { user } = useAuth();
  
  return (
    <div>
      <PageMeta
        title="TRIMEDH"
        description="Gestion des ordonnances"
      />
      <PageBreadcrumb pageTitle="Ordonnances" />

      <div className="">
        <div>
          <GestionOrdonnances 
            tenantId={user?.hopital_id || 0} 
            hopitalNom={user?.hopital_nom || ""} 
          />
        </div>
      </div>
    </div>
  );
}
