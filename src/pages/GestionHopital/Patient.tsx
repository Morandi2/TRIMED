import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import GestionPatients from "./GestionPatients/GestionPatiens";

export default function Patient() {
  return (
    <div>
      <PageMeta
        title="TRIMED"
        description="Gestion Patient"
      />
      <PageBreadcrumb pageTitle="Gestion Patient" />

      <div className="">
        <GestionPatients />
      </div>
    </div>
  );
}