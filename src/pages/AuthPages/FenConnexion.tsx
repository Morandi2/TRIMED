import React from "react";
import { Link } from "react-router-dom";
import Connexion from "../../components/auth/Connexion";
import { ChevronLeftIcon } from "../../icons";
import AuthLayout from "./AuthPageLayout";

function FenConnexion() {
  return (
    <AuthLayout>
      <div className="w-full h-full flex flex-col">
        <div className="w-full max-w-md pt-10 mx-auto">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronLeftIcon className="size-5" />
            Retourner au Dashboard
          </Link>
        </div>
        <Connexion />
      </div>
    </AuthLayout>
  );
}

export default FenConnexion;