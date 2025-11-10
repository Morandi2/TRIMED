import { useState } from "react";
import { Link } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      {/* <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Retouner au Dashboard
        </Link>
      </div> */}
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>

          <div>
            {/* Ligne de separation */}
            {/* <div className="relative py-3 sm:py-5">
             
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
            
            </div> */}
            {/* Formulaire d'inscription */}
            <form>
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* <!-- Nom --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      Nom<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="fname"
                      name="fname"
                      placeholder="Entrer votre Nom"
                    />
                  </div>
                  {/* <!-- Prenom --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      Prenom<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="lname"
                      name="lname"
                      placeholder="Entrer votre Prenom"
                    />
                  </div>
                </div>
                {/* <!-- Email --> */}
                <div>
                  <Label>
                    Email<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Entrer votre email"
                  />
                </div>
                {/* <!-- Mot de passe --> */}
                <div>
                  <Label>
                    Mot de passe<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Entrr Votre mot de passe"
                      type={showPassword ? "text" : "password"}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                {/* <!-- Checkbox --> */}
                <div className="flex items-center gap-3">
                  <Checkbox
                    className="w-5 h-5"
                    checked={isChecked}
                    onChange={setIsChecked}
                  />
                  <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                    En creant cet compte vous accepter nos   {" "}
                    <span className="text-gray-800 dark:text-white/90">
                      Termes et Conditions,
                    </span>{" "}
                    et notre {" "}
                    <span className="text-gray-800 dark:text-white">
                      Politique de Confidentialite
                    </span>
                  </p>
                </div>
                {/* <!-- Button --> */}
                <div>
                  {/* <button className="flex items-center justify-center w-full px-4 py-3 text-sm transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-indigo-500  font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600">
                    Se connecter
                  </button> */}
                  <button className="flex items-center justify-center w-full px-4 py-3 text-sm transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-brand-600  font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 ">
                    S'inscrire
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Vous avez deja un compte ? {""}
                <Link
                  to="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Connecter Vous
                </Link>
              </p>
              <br />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
