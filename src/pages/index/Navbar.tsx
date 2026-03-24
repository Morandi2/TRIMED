import { useState } from 'react';
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { id: 'accueil', label: 'Accueil' },
    { id: 'fonctionnalites', label: 'Fonctionnalités' },
    { id: 'solutions', label: 'Solutions' },
    { id: 'mobile', label: 'App Mobile' },
    { id: 'prix', label: 'Tarifs' },
    { id: 'temoignages', label: 'Témoignages' },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-xl font-bold text-gray-800">TRIMEDH</span>
            </div>

            <div className="hidden lg:flex items-center space-x-8">
              {menuItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="text-gray-600 hover:text-green-500"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="hidden lg:flex items-center space-x-4">
              <Link to="/signin">
                <button className="text-green-600 px-4 py-2 rounded-lg font-medium">
                  Connexion
                </button>
              </Link>

              <Link to="/home">
                <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                  Démo Gratuite
                </button>
              </Link>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Menu Modal Santre */}
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Modal nan mitan */}
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">

              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">T</span>
                  </div>
                  <span className="text-base font-bold text-gray-800">TRIMEDH</span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3">
                <div className="space-y-1 px-3">
                  {menuItems.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded-lg text-sm"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="p-3 border-t mb-3 border-gray-200 space-y-2">
                <Link to="/signin" className="cta-button">
                  <button className="w-full text-green-600 py-2  mb-3 text-sm rounded-lg border border-green-200">
                    Connexion
                  </button>
                </Link>

                <Link to="/home" className="w-full">
                  <button className="w-full bg-green-500 text-white py-2 text-sm rounded-lg">
                    Démo Gratuite
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <div className="h-16"></div>
    </>
  );
};

export default Navbar;