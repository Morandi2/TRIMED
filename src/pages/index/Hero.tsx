import React from 'react';

const Hero = ({ openDemoModal }: { openDemoModal?: () => void }) => {
  return (
    <section id="accueil" data-aos="fade-up" data-aos-duration="1000" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-50">
      {/* Decorative Blur Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
        <div className="absolute top-[20%] left-[-10%] w-[300px] h-[300px] rounded-full bg-blue-400/20 blur-[100px] mix-blend-multiply"></div>
        <div className="absolute top-[40%] right-[-5%] w-[400px] h-[400px] rounded-full bg-emerald-400/20 blur-[120px] mix-blend-multiply"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
          
          {/* Left Side: Typography */}
          <div className="lg:col-span-6 text-center lg:text-left mb-16 lg:mb-0 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/50 border border-blue-200 text-blue-800 text-sm font-semibold mb-6 shadow-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              Plateforme #1 en Haïti
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-[4rem] font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
              Une Plateforme Simple pour la Gestion <br className="hidden lg:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">
                des Hôpitaux
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              TRIMEDH vous permet de centraliser facilement vos données médicales pour prendre de meilleures décisions et améliorer la performance de votre clinique.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
              <a href="#prix" className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-blue-600 text-white text-center font-semibold shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all duration-200">
                Essayez gratuitement
              </a>
              {openDemoModal && (
                <button onClick={openDemoModal} className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-white text-slate-700 font-semibold border border-slate-200 shadow-sm hover:bg-slate-50 hover:-translate-y-0.5 transition-all duration-200">
                  Voir la Démo
                </button>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-4 font-medium">
              Aucune carte de crédit requise
            </p>
          </div>

          {/* Right Side: Dashboard Mockup */}
          <div className="lg:col-span-6 relative z-10 w-full max-w-2xl mx-auto h-[450px]">
            {/* The main browser/dashboard window */}
            <div className="absolute inset-0 bg-white rounded-2xl shadow-2xl shadow-slate-300/60 border border-slate-100 overflow-hidden flex flex-col transform lg:translate-x-8 lg:-translate-y-4">
              
              {/* Browser Top Bar */}
              <div className="h-10 border-b border-slate-100 bg-slate-50 flex items-center px-4 space-x-2">
                <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                <div className="ml-4 flex-1 h-5 bg-white rounded-md border border-slate-200 flex items-center px-3">
                  <div className="w-1/2 h-2 bg-slate-100 rounded-full"></div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="flex-1 p-6 bg-slate-50/50 overflow-hidden flex flex-col gap-4 relative">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <h3 className="text-slate-800 font-bold text-lg">Aperçu des Performances</h3>
                    <p className="text-slate-500 text-xs font-medium">Bonjour, Dr. Jean !</p>
                  </div>
                  <div className="h-8 w-24 bg-blue-600/10 rounded-md border border-blue-600/20"></div>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Card 1 */}
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Recettes du mois</p>
                    <div className="flex justify-between items-end">
                      <h4 className="text-2xl font-bold text-slate-900">$24,500</h4>
                      <span className="text-emerald-500 text-xs font-bold flex items-center bg-emerald-50 px-1.5 py-0.5 rounded">↑ 12%</span>
                    </div>
                    {/* Fake Chart */}
                    <div className="mt-3 h-8 w-full flex items-end gap-1">
                      {[40, 60, 45, 80, 50, 90, 70, 100].map((h, i) => (
                         <div key={i} className="flex-1 rounded-t-sm bg-blue-200" style={{ height: `${h}%` }}></div>
                      ))}
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Nouveaux Patients</p>
                    <div className="flex justify-between items-end">
                      <h4 className="text-2xl font-bold text-slate-900">142</h4>
                      <span className="text-emerald-500 text-xs font-bold flex items-center bg-emerald-50 px-1.5 py-0.5 rounded">↑ 8%</span>
                    </div>
                    {/* Fake Chart Line */}
                    <div className="mt-3 h-8 w-full relative">
                       <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                         <path d="M0,25 Q10,15 20,20 T40,10 T60,20 T80,5 T100,10 L100,30 L0,30 Z" fill="#10B981" fillOpacity="0.1"/>
                         <path d="M0,25 Q10,15 20,20 T40,10 T60,20 T80,5 T100,10" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
                       </svg>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                     <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Consultations</p>
                    <div className="flex justify-between items-end">
                      <h4 className="text-2xl font-bold text-slate-900">4,521</h4>
                      <span className="text-rose-500 text-xs font-bold flex items-center bg-rose-50 px-1.5 py-0.5 rounded">↓ 2%</span>
                    </div>
                    {/* Fake Chart Line */}
                    <div className="mt-3 h-8 w-full relative">
                       <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                         <path d="M0,10 Q20,25 40,15 T70,25 T100,15" fill="none" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round"/>
                       </svg>
                    </div>
                  </div>

                  {/* Card 4 */}
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Temps d'Attente</p>
                    <div className="flex justify-between items-end">
                      <h4 className="text-2xl font-bold text-slate-900">15 min</h4>
                      <span className="text-emerald-500 text-xs font-bold flex items-center bg-emerald-50 px-1.5 py-0.5 rounded">↓ 5%</span>
                    </div>
                     {/* Circular indicator fake */}
                     <div className="mt-3 h-8 w-full flex items-center justify-between px-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden leading-none">
                           <div className="h-full bg-amber-400 w-[40%]"></div>
                        </div>
                        <span className="text-xs font-bold text-slate-400">Idéal</span>
                     </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Absolute decorative floating blobs over the mockup */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-400 opacity-20 blur-2xl rounded-full"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-500 opacity-20 blur-3xl rounded-full"></div>
            
            {/* Outline floating frame behind */}
            <div className="absolute inset-0 border-2 border-slate-200/50 rounded-3xl transform translate-x-12 translate-y-4 -z-10 bg-slate-100/30"></div>
          </div>
        </div>

        {/* Trusted By Section inside Hero */}
        <div className="pt-24 lg:pt-32 pb-8 border-t border-slate-200/60 mt-20 lg:mt-32">
          <p className="text-center text-sm font-semibold text-slate-500 uppercase tracking-widest mb-8">
            Fait confiance à plus de 7,000+ professionnels de santé
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Fake logos, replace with actual SVG paths or images */}
            <h2 className="text-xl font-bold text-slate-800">MEDICA<span className="text-blue-500">PRO</span></h2>
            <h2 className="text-xl font-extrabold text-slate-800">Hôpital<span className="font-light">Universitaire</span></h2>
            <h2 className="text-xl font-bold text-slate-800 tracking-wider">CLINIC<span className="text-emerald-500 font-black">+</span></h2>
            <h2 className="text-xl font-bold text-slate-800">SANTÉ<span className="text-rose-500">Haiti</span></h2>
            <h2 className="text-xl font-black text-slate-800 italic">Care<span className="text-indigo-500">Sync</span></h2>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
