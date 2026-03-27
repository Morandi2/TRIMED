import { CalendarPlus, PhoneCall } from 'lucide-react';

const CTA = ({ openDemoModal }: { openDemoModal?: () => void }) => {
  return (
    <section className="py-24 relative overflow-hidden bg-white" data-aos="zoom-in">
      {/* Background with modern elements */}
      <div className="absolute inset-0 bg-blue-600 rounded-[3rem] mx-4 sm:mx-6 lg:mx-8 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Prêt à transformer la gestion de votre hôpital ?
          </h2>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed max-w-2xl mx-auto">
            Rejoignez les établissements de santé qui offrent déjà de meilleurs soins grâce à la centralisation et l'automatisation de TRIMEDH.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {openDemoModal && (
              <button 
                onClick={openDemoModal}
                className="w-full sm:w-auto px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-slate-50 hover:scale-105 transition-all duration-300 shadow-xl flex items-center justify-center gap-2"
              >
                <CalendarPlus className="w-5 h-5" />
                Voir la Démo
              </button>
            )}
            <a 
              href="mailto:trimedht@gmail.com"
              className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-white/30 text-white rounded-xl font-bold hover:bg-white/10 transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-5 h-5" />
              Nous Contacter
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
