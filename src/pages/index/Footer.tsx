
// components/Footer.js
import React from 'react';

const Footer = () => {
  return (
    <footer className="footer bg-gray-900 text-white pt-16 pb-8">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Grille principale du footer */}
        <div className="footer-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          
          {/* Colonne 1 - Logo et description */}
          <div className="footer-col">
            <div className="footer-logo flex items-center gap-3 mb-6">
              <div className="logo-icon w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-lg">
                <i className="fas fa-heartbeat"></i>
              </div>
              <span className="logo-text text-2xl font-bold">TRIMEDH</span>
            </div>
            
            <p className="footer-description text-gray-400 leading-relaxed mb-6">
              La plateforme SaaS de gestion hospitalière conçue pour les défis du système de santé haïtien.
            </p>
            
            {/* Liens sociaux */}
            <div className="social-links flex gap-3">
              {[
                { icon: 'facebook-f', url: '#' },
                { icon: 'twitter', url: '#' },
                { icon: 'linkedin-in', url: '#' },
                { icon: 'instagram', url: '#' }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="social-link w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-emerald-500 hover:text-white transition-all duration-300"
                >
                  <i className={`fab fa-${social.icon}`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Colonne 2 - Navigation */}
          <div className="footer-col">
            <h4 className="text-lg font-semibold mb-6">Navigation</h4>
            <ul className="footer-links space-y-3">
              {[
                { name: 'Accueil', href: '#accueil' },
                { name: 'Fonctionnalités', href: '#fonctionnalites' },
                { name: 'Application Mobile', href: '#mobile' },
                { name: 'Tarifs', href: '#prix' },
                { name: 'Témoignages', href: '#temoignages' }
              ].map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-emerald-400 transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3 - Légal */}
          <div className="footer-col">
            <h4 className="text-lg font-semibold mb-6">Légal</h4>
            <ul className="footer-links space-y-3">
              {[
                { name: 'Politique de confidentialité', href: '#' },
                { name: 'Conditions d\'utilisation', href: '#' },
                { name: 'Mentions légales', href: '#' },
                { name: 'RGPD', href: '#' }
              ].map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-emerald-400 transition-colors duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 4 - Contact */}
          <div className="footer-col">
            <h4 className="text-lg font-semibold mb-6">Contact</h4>
            <ul className="footer-contact space-y-4">
              {[
                { icon: 'envelope', text: 'info@TRIMEDH.ht' },
                { icon: 'phone', text: '+509 48 XX-XXXX' },
                { icon: 'map-marker-alt', text: 'Port-au-Prince, Haïti' },
                { icon: 'clock', text: 'Support 24/7/365' }
              ].map((contact, index) => (
                <li key={index} className="flex items-center gap-3 text-gray-400">
                  <i className={`fas fa-${contact.icon} text-emerald-400 w-4`}></i>
                  <span className="text-sm">{contact.text}</span>
                </li>
              ))}
            </ul>

            {/* Newsletter */}
            <div className="mt-6">
              <h5 className="text-sm font-semibold text-gray-300 mb-3">
                Restez informé
              </h5>
              <div className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="email" 
                  placeholder="Votre email"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
                <button className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors whitespace-nowrap">
                  S'abonner
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Séparateur */}
        <div className="border-t border-gray-800 pt-8">
          
          {/* Ligne du bas */}
          <div className="footer-bottom flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                &copy; 2024 TRIMEDH. Tous droits réservés. Fièrement développé en Haïti.
              </p>
            </div>

            {/* Liens supplémentaires */}
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="#" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors">
                Plan du site
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors">
                Accessibilité
              </a>
              <a href="#" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors">
                Équipe
              </a>
            </div>

          </div>

          {/* Badge de certification */}
          <div className="mt-6 items-center text-center">
            <div className="inline-flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-full">
              <i className="fas fa-shield-alt text-emerald-400"></i>
              <span className="text-xs text-gray-400">
                Certifié conformité données médicales
              </span>
            </div>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;
