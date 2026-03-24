import React from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { ConfigurationWizard } from "./Configuration/ConfigurationWizard";

export default function Configuration() {
  return (
    <div>
      <PageMeta
        title="TRIMEDH - Configuration"
        description="Configuration initiale du système"
      />
      <PageBreadcrumb pageTitle="Configuration Système" />

      <div className="">
        <ConfigurationWizard />
      </div>
    </div>
  );
}
