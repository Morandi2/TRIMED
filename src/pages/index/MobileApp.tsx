import { Stethoscope, User, WifiOff, Bell, FileSignature } from 'lucide-react';

const MobileApp = () => {
  return (
    <section id="mobile" className="py-24 bg-white overflow-hidden overflow-x-hidden" data-aos="fade-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          
          {/* Construit le téléphone en CSS pur pour remplacer l'image lourde */}
          <div className="relative mb-16 lg:mb-0 max-w-sm mx-auto w-full">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-[100px] opacity-20 transform -translate-x-12 translate-y-12"></div>
            
            <div className="relative z-10 w-[300px] h-[600px] bg-slate-900 rounded-[3rem] border-[8px] border-slate-900 shadow-2xl mx-auto overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 z-20 rounded-b-3xl w-40 mx-auto"></div>
              
              <div className="w-full h-full bg-slate-50 overflow-hidden relative flex flex-col">
                <div className="bg-blue-600 pt-12 pb-6 px-6 text-white rounded-b-3xl shadow-sm">
                   <h4 className="text-xl font-bold mb-1">Bonjour, Dr. Jean</h4>
                   <p className="text-blue-200 text-sm">3 patients en attente</p>
                </div>
                
                <div className="p-4 flex-1 space-y-4">
                   <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-bold">MR</div>
                     <div>
                       <h5 className="font-bold text-slate-800">Marie Richard</h5>
                       <p className="text-xs text-slate-500">10:30 AM • Consultation</p>
                     </div>
                   </div>
                   <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold">JL</div>
                     <div>
                       <h5 className="font-bold text-slate-800">Jean Louis</h5>
                       <p className="text-xs text-slate-500">11:00 AM • Suivi</p>
                     </div>
                   </div>
                   
                   <div className="mt-8 grid grid-cols-2 gap-3">
                      <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 flex flex-col items-center justify-center text-center gap-2">
                        <Stethoscope className="w-6 h-6" />
                        <span className="text-xs font-bold">Ordonnance</span>
                      </div>
                      <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600 flex flex-col items-center justify-center text-center gap-2">
                        <User className="w-6 h-6" />
                        <span className="text-xs font-bold">Dossier</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-10 lg:pl-8">
              <h2 className="text-sm font-bold text-blue-600 tracking-widest uppercase mb-3">
                Mobilité Absolue
              </h2>
              <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">
                Votre hôpital dans votre poche
              </h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Gardez un accès complet à vos dossiers, communiquez avec votre équipe et gérez les urgences où que vous soyez, même sans connexion internet stable.
              </p>
            </div>

            <div className="space-y-6 lg:pl-8">
              {[
                {
                  icon: <WifiOff className="w-6 h-6 text-emerald-500" />,
                  title: 'Mode Hors-ligne',
                  desc: 'Continuez à travailler. Vos données se synchroniseront automatiquement au retour de la connexion.'
                },
                {
                  icon: <Bell className="w-6 h-6 text-amber-500" />,
                  title: 'Notifications Instantanées',
                  desc: 'Recevez des alertes pour les résultats urgents, les nouveaux rendez-vous et les messages critiques.'
                },
                {
                  icon: <FileSignature className="w-6 h-6 text-indigo-500" />,
                  title: 'Prescription Mobile',
                  desc: 'Rédigez et signez électroniquement des ordonnances directement depuis le chevet du patient.'
                }
              ].map((ft, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center flex-shrink-0">
                    {ft.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">{ft.title}</h4>
                    <p className="text-slate-600 text-sm">{ft.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileApp;
