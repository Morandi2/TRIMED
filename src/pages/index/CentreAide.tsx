import React from 'react';
import { Search, BookOpen, MessageCircle, HelpCircle, FileText, Settings, Mail } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const CentreAide = () => {
  const categories = [
    { icon: BookOpen, title: 'Guide de démarrage', desc: 'Apprenez les bases pour configurer votre hôpital.' },
    { icon: Settings, title: 'Paramètres', desc: 'Gestion des utilisateurs, des rôles et des services.' },
    { icon: FileText, title: 'Dossier Médical', desc: 'Comment gérer les consultations et prescriptions.' },
    { icon: HelpCircle, title: 'FAQ', desc: 'Les réponses aux questions les plus fréquentes.' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar />
      
      <div className="bg-blue-600 pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center text-white" data-aos="fade-down">
          <h1 className="text-4xl font-extrabold mb-6">Comment pouvons-nous vous aider ?</h1>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Rechercher un tutoriel, une solution..." 
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-slate-900 shadow-xl outline-none focus:ring-4 focus:ring-blue-400/20"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all group cursor-pointer" data-aos="fade-up" data-aos-delay={idx * 100}>
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <cat.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{cat.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{cat.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div data-aos="fade-right">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Vous ne trouvez pas la solution ?</h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Nos agents de support technique sont disponibles pour vous aider en direct ou via un ticket.
            </p>
            <div className="flex gap-4">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Chat en direct
              </button>
              <button className="px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Ouvrir un ticket
              </button>
            </div>
          </div>
          <div className="bg-blue-50 rounded-[2rem] p-8 md:p-12" data-aos="fade-left">
            <h3 className="font-bold text-blue-900 mb-4 uppercase tracking-widest text-sm text-center">Articles Populaires</h3>
            <ul className="space-y-4">
              {['Gérer les rendez-vous en ligne', 'Configuration du profil médecin', 'Exportation des rapports mensuels', 'Sécuriser l\'accès administratif'].map((item, i) => (
                <li key={i} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between hover:translate-x-1 transition-transform cursor-pointer">
                  <span className="font-medium text-slate-700">{item}</span>
                  <BookOpen className="w-4 h-4 text-slate-400" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CentreAide;
