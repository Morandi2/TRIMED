import React from 'react';
import { ShieldCheck, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer bg-slate-50 text-slate-600 pt-20 pb-10 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center transform rotate-3 shadow-lg shadow-blue-500/20">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">TRIMEDH</span>
            </div>
            <p className="text-slate-600 leading-relaxed mb-6 pr-4">
              La plateforme SaaS de gestion hospitalière conçue par des Haïtiens, pour moderniser le système de santé local.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, idx) => (
                <a key={idx} href="#" className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all transform hover:-translate-y-1">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-slate-900 font-bold mb-6 tracking-wide">Produit</h4>
            <ul className="space-y-3">
              <li><a href="/#fonctionnalites" className="hover:text-blue-600 hover:underline transition-colors">Fonctionnalités</a></li>
              <li><a href="/#mobile" className="hover:text-blue-600 hover:underline transition-colors">App Mobile</a></li>
              <li><a href="/#prix" className="hover:text-blue-600 hover:underline transition-colors">Tarifs</a></li>
              <li><a href="/#solutions" className="hover:text-blue-600 hover:underline transition-colors">Solutions</a></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="text-slate-900 font-bold mb-6 tracking-wide">Légal & Support</h4>
            <ul className="space-y-3">
              <li><Link to="/contact" className="hover:text-blue-600 hover:underline transition-colors">Nous contacter</Link></li>
              <li><Link to="/politique-de-confidentialite" className="hover:text-blue-600 hover:underline transition-colors">Politique de confidentialité</Link></li>
              <li><Link to="/conditions-utilisation" className="hover:text-blue-600 hover:underline transition-colors">Conditions d'utilisation</Link></li>
              <li><Link to="/centre-aide" className="hover:text-blue-600 hover:underline transition-colors">Centre d'aide</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="text-slate-900 font-bold mb-6 tracking-wide">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <a href="mailto:trimedht@gmail.com" className="hover:text-blue-600 transition-colors">trimedht@gmail.com</a>
              </li>
              <li className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <a href="tel:+50940302622" className="hover:text-blue-600 transition-colors">+509 4030 2622</a>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="w-5 h-5"></span>
                  <a href="tel:+50943479901" className="hover:text-blue-600 transition-colors">+509 4347 9901</a>
                </div>
              </li>
              <li className="flex flex-start gap-3 mt-3">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Port-au-Prince, HT<br/>Haïti</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} TRIMEDH. Tous droits réservés.
          </p>
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-medium text-slate-600">
              Certifié Sécurité HIPAA / Données Médicales
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
