import React from 'react';
// components/Hero.js

const Hero = () => {
  return (
    <>
      <div id="accueil"
        className="hero min-h-screen"
        style={{
          backgroundImage:
            "url(public/images/hero/img2.jpg)",
        }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content text-neutral-content text-center">
          <div className="">
            <h1 className="mb-5 text-5xl font-bold">Avec TRIMEDH</h1>
            <h1 className="hero-title text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Révolutionnez la Gestion
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-cyan-200 block">
                de Votre Hôpital
              </span>
              en Haïti
            </h1>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Commencer l'Essai
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors">
                Voir la Démo
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* <section id="accueil" className="min-h-screen bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Révolutionnez la Gestion Hospitalière
          </h1>
          <p className="text-xl text-white/90 mb-8">
            La première plateforme SaaS complète conçue pour les défis du système de santé haïtien
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Commencer l'Essai
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors">
              Voir la Démo
            </button>
          </div>
        </div>
      </section> */}




    </>
  );
};

export default Hero;
