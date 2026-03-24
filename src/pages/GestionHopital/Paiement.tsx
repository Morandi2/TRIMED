import React from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import TenantPaiementModule from "./TenantPaiement/TenantPaiementModule";
import { useAuth } from "../../context/AuthContext";

export default function Paiement() {
  const { user } = useAuth();
  
  return (
    <div>
      <PageMeta
        title="TRIMEDH"
        description="Gestion hopital"
      />
      <PageBreadcrumb pageTitle="Paiement" />
      <div className="">
        <TenantPaiementModule 
          tenantId={user?.hopital_id || 0} 
          hopitalNom={user?.hopital_nom || ""}
        />
      </div>
    </div>
  );
}
