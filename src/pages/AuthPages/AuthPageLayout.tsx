import React from "react";
import { Link } from "react-router-dom";
import { Check, ChevronLeft } from "lucide-react";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";
import useGoBack from "../../hooks/useGoBack";
import Logotype from "../../components/brand/Logotype";
import Symbole from "../../components/brand/Symbole";
import { OUVERTURE } from "../index/portail/contenu";

const ATOUTS = [
  "Le dossier du patient, partagé par toute l’équipe",
  "Rendez-vous, ordonnances et pharmacie au même endroit",
  "Chacun ne voit que ce que son rôle permet",
];

/**
 * Mise en page des écrans de connexion, d’inscription et de mot de passe.
 * Sur ordinateur : le robot gardien et les atouts de TRIMED à gauche, un formulaire compact à droite.
 * Sur téléphone : le formulaire seul, sous le logo.
 */
export default function AuthLayout({ children, large = false }: { children: React.ReactNode; large?: boolean }) {
  const goBack = useGoBack();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-4 pb-6 pt-16 sm:px-6 sm:pt-20 dark:bg-gray-950">
      <button
        type="button"
        onClick={goBack}
        className="group absolute left-4 top-4 z-50 flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-brand-600 sm:left-6 sm:top-6 dark:text-gray-400 dark:hover:text-brand-400"
      >
        <span className="rounded-xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-800 dark:bg-gray-900"><ChevronLeft size={18} /></span>
        <span className="hidden sm:inline">Retour</span>
      </button>

      {/* Fond : dégradés fixes (aucun flou animé) */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_55%_at_8%_0%,rgba(2,195,119,0.14),transparent_70%),radial-gradient(60%_55%_at_100%_100%,rgba(39,32,255,0.12),transparent_70%)]" aria-hidden="true" />

      <div className={`relative z-10 grid w-full overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_24px_60px_-20px_rgba(14,16,51,0.18)] dark:border-gray-800 dark:bg-gray-900 ${large ? "max-w-6xl lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]" : "max-w-[960px] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"}`}>
        {/* Panneau de marque (ordinateur) */}
        <aside className={`relative hidden flex-col overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 p-10 text-white lg:flex ${large ? "justify-start gap-12" : "justify-between"}`}>
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-trimed-vert/25" aria-hidden="true" />
          <Link to="/" className="relative inline-flex"><Logotype taille="sm" inverse /></Link>
          <div className="relative">
            <Symbole taille={84} corps="#ffffff" visage="var(--color-trimed-indigo)" vivant titre="" className="h-20 w-20 drop-shadow-[0_16px_30px_rgba(0,0,0,0.25)]" />
            <p className="mt-6 font-marque text-2xl leading-tight">{OUVERTURE.titre[0]}<br />{OUVERTURE.titre[1]}</p>
            <ul className="mt-6 space-y-3">
              {ATOUTS.map((a) => (
                <li key={a} className="flex gap-3 text-sm text-white/90">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15"><Check className="h-3.5 w-3.5" aria-hidden="true" /></span>{a}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Formulaire */}
        <main className={`flex flex-col justify-center px-6 py-10 sm:px-10 ${large ? "lg:px-12" : "lg:px-14"}`}>
          <Link to="/" className="mb-8 inline-flex self-center lg:hidden"><Logotype taille="sm" /></Link>
          <div className={`mx-auto w-full ${large ? "max-w-[640px]" : "max-w-[400px]"}`}>{children}</div>
        </main>
      </div>

      <div className="fixed bottom-5 right-5 z-50">
        <ThemeTogglerTwo />
      </div>
    </div>
  );
}
