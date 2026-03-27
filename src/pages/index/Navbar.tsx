import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

const Navbar = ({ openDemoModal }: { openDemoModal?: () => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { id: 'accueil', label: 'Accueil', path: '/' },
    { id: 'solutions', label: 'Solutions', path: '/#solutions' },
    { id: 'fonctionnalites', label: 'Ressources', path: '/#fonctionnalites' },
    { id: 'prix', label: 'Tarifs', path: '/#prix' },
    { id: 'temoignages', label: 'Témoignages', path: '/#temoignages' },
  ];

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200 py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">

            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center transform rotate-3">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">TRIMEDH</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-8">
              {menuItems.map((item) => (
                <a
                  key={item.id}
                  href={item.path}
                  className="text-slate-600 font-medium hover:text-blue-600 transition-colors flex items-center gap-1 group"
                >
                  {item.label}
                  <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-5">
              <Link to="/signin" className="text-slate-700 font-semibold hover:text-blue-600 transition-colors">
                Connexion
              </Link>
              {openDemoModal && (
                <button onClick={openDemoModal} className="bg-white text-slate-800 border-2 border-slate-200 hover:border-slate-300 px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm">
                  Voir la Démo
                </button>
              )}
              <Link to="/home">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm shadow-blue-600/20">
                  Essai Gratuit
                </button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-xl overflow-hidden animate-fadeIn">
            <div className="px-4 py-3 space-y-1">
              {menuItems.map((item) => (
                <a
                  key={item.id}
                  href={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-3 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                >
                  {item.label}
                </a>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50">
              <Link to="/signin" className="block w-full">
                <button className="w-full text-center px-4 py-3 text-slate-700 font-semibold border border-slate-200 rounded-lg bg-white hover:bg-slate-50">
                  Connexion
                </button>
              </Link>
              {openDemoModal && (
                <button onClick={() => { setIsMenuOpen(false); openDemoModal(); }} className="w-full text-center px-4 py-3 text-white font-semibold bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700">
                  Voir la Démo / Essai
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;