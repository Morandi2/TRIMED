import React from "react";
import { Link } from "react-router-dom";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";
import useGoBack from "../../hooks/useGoBack";
import { ChevronLeft } from "lucide-react";


export default function AuthLayout({
  children,
  maxWidth = "max-w-[640px]",
}: {
  children: React.ReactNode;
  maxWidth?: string;
}) {
  const goBack = useGoBack();

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Bouton Retour Flottant */}
      <button 
        onClick={goBack}
        className="absolute top-6 left-6 sm:top-10 sm:left-10 flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 transition-all z-50 group"
      >
        <div className="p-2 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-white dark:border-gray-800 shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all">
          <ChevronLeft size={18} />
        </div>
        <span className="hidden sm:inline">Retour</span>
      </button>
      {/* Immersive Mesh Gradient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-[#00D06C]/20 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-[#2D32FF]/20 rounded-full mix-blend-multiply filter blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
         <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      {/* Main Glassmorphic Card */}
      <div className={`relative z-10 w-full ${maxWidth} animate-in fade-in zoom-in-95 duration-700 ease-out`}>
        <div className="bg-white/70 dark:bg-gray-900/80 backdrop-blur-2xl rounded-[2.5rem] border border-white dark:border-gray-800 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] overflow-hidden">
          
          <div className="p-8 sm:p-12">
            {/* Logo Header */}
            <div className="flex flex-col items-center mb-10 text-center">
              <Link to="/" className="mb-6 transform hover:scale-105 transition-transform duration-300 inline-block">
                <img
                  className="h-12 w-auto"
                  src="/images/logo/logo.svg"
                  alt="TRIMED"
                />
              </Link>
            </div>

            {/* Form Content */}
            <div className="relative pb-20">
              {children}
            </div>
          </div>

          {/* Card Footer (Optional design element) */}
          <div className="bg-gray-50/50 dark:bg-gray-800/30 px-8 py-6 border-t border-gray-100 dark:border-gray-800 text-center">
             <p className="text-xs text-gray-400 dark:text-gray-500 font-medium tracking-wide uppercase">
               Système de Gestion Hospitalière Intelligent
             </p>
          </div>
        </div>

        {/* Floating Back to Home or Help could go here */}
      </div>

      {/* Floating Theme Toggler */}
      <div className="fixed z-50 bottom-6 right-6">
        <ThemeTogglerTwo />
      </div>
    </div>
  );
}
