import React from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { GestionRendezVous } from "./GestionRendezVous/GestionRendezVous";
import { useAuth } from "../../context/AuthContext";

export default function RendezVous() {
  const { user } = useAuth();
  
  return (
    <div>
      <PageMeta
        title="TRIMEDH"
        description="Gestion des rendez-vous"
      />
      <PageBreadcrumb pageTitle="Rendez Vous" />

      <div className="">
        <div>
          <GestionRendezVous 
            tenantId={user?.hopital_id || 0} 
            hopitalNom={user?.hopital_nom || ""} 
          />
        </div>
      </div>
    </div>
  );
}
