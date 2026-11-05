import PageMeta from "../../components/common/PageMeta";
import { ConfigurationWizard } from "./Configuration/ConfigurationWizard";

export default function Configuration() {
  return (
    <div>
      <PageMeta
        title="TRIMED - Paramètres de l’hôpital"
        description="Informations, chambres, équipe et préférences de l’hôpital"
      />
      <ConfigurationWizard />
    </div>
  );
}
