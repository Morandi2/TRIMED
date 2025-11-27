import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import GestionOrdonnances from "./GestionOrdonnances/GestionOrdonnances";

export default function Ordonnance() {
  return (
    <div>
      <PageMeta
        title="TRIMED"
        description="Gestion des ordonnances"
      />
      <PageBreadcrumb pageTitle="Ordonnances" />

      <div className="">
        <div>
          <GestionOrdonnances />
        </div>
      </div>
    </div>
  );
}
