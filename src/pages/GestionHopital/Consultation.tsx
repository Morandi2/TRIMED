import React from 'react';
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import GestionConsultations from "./GestionConsultations/GestionConsultations";
import { useAuth } from "../../context/AuthContext";

export default function Consultation() {
  const { user } = useAuth();

  return (
    <div>
      <PageMeta
        title="TRIMEDH"
        description="Gestion des consultations"
      />
      <PageBreadcrumb pageTitle="Consultations" />

      <div className="">
        <div>
          <GestionConsultations
            tenantId={user?.hopital_id || 0}
            hopitalNom={user?.hopital_nom || ""}
          />
        </div>
      </div>
    </div>
  );
}
