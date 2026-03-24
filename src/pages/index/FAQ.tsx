// components/FAQ.js
import { useState } from 'react';

/**
 * Composant FAQ avec accordéon interactif
 * @returns {JSX.Element} Composant FAQ
 */
const FAQ = () => {
  // État pour suivre quelle question est ouverte
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Données des questions/réponses
  const faqData = [
    {
      id: 1,
      question: 'Combien de temps prend l\'installation ?',
      answer: 'L\'installation de base se fait en moins de 24 heures. Nous nous occupons de toute la configuration et de la formation de votre équipe. La migration de vos données existantes peut prendre 1 à 3 jours supplémentaires selon le volume.'
    },
    {
      id: 2,
      question: 'Est-ce que ça fonctionne sans internet ?',
      answer: 'Oui ! TRIMEDH dispose d\'un mode hors-ligne qui permet de continuer à travailler pendant les coupures d\'internet. Les données sont synchronisées automatiquement dès que la connexion est rétablie.'
    },
    {
      id: 3,
      question: 'Quelle formation est incluse ?',
      answer: 'Nous offrons une formation complète pour tous les utilisateurs : administrateurs, médecins, infirmières, personnel administratif. La formation inclut des sessions en présentiel, des tutoriels vidéo et une documentation complète.'
    },
    {
      id: 4,
      question: 'Comment sont sécurisées les données ?',
      answer: 'Les données sont chiffrées de bout en bout, stockées sur des serveurs locaux en Haïti avec des sauvegardes automatiques quotidiennes. Nous respectons les normes internationales de sécurité des données médicales.'
    }
  ];

  /**
   * Basculer l'état d'ouverture d'une question FAQ
   * @param {number} questionIndex - Index de la question
   */
  const handleQuestionToggle = (questionIndex: number) => {
    if (activeIndex === questionIndex) {
      setActiveIndex(null);
    } else {
      setActiveIndex(questionIndex);
    }
  }; return (
    <section id="faq" className="faq-section bg-white py-20">
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* En-tête de section */}
        <div className="section-header text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Questions Fréquentes
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tout ce que vous devez savoir sur TRIMEDH
          </p>
        </div>

        {/* Grille des questions */}
        <div className="faq-grid space-y-4">
          {faqData.map((faq, index) => (
            <div
              key={faq.id}
              className={`faq-item bg-gray-50 rounded-xl border transition-all duration-300 ${activeIndex === index
                ? 'border-emerald-300 shadow-lg'
                : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              {/* Bouton de la question */}
              <button
                className="faq-question w-full p-6 text-left flex justify-between items-center hover:bg-gray-100 transition-colors rounded-xl"
                onClick={() => handleQuestionToggle(index)}
                aria-expanded={activeIndex === index}
                aria-controls={`faq-answer-${faq.id}`}
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4">
                  {faq.question}
                </h3>
                <i className={`fas fa-chevron-down text-emerald-500 transition-transform duration-300 ${activeIndex === index ? 'rotate-180' : ''
                  }`}></i>
              </button>

              {/* Réponse */}
              <div
                id={`faq-answer-${faq.id}`}
                className={`faq-answer transition-all duration-300 overflow-hidden ${activeIndex === index
                  ? 'max-h-96 opacity-100'
                  : 'max-h-0 opacity-0'
                  }`}
              >
                <div className="px-6 pb-6">
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section de contact supplémentaire */}
        <div className="mt-12 text-center">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Vous avez d'autres questions ?
            </h3>
            <p className="text-gray-600 mb-6">
              Notre équipe est là pour vous aider à trouver la solution parfaite pour votre établissement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-colors flex items-center gap-2 justify-center">
                <i className="fas fa-phone"></i>
                Nous Contacter
              </button>
              <button className="border border-emerald-500 text-emerald-500 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-500 hover:text-white transition-colors flex items-center gap-2 justify-center">
                <i className="fas fa-envelope"></i>
                Envoyer un Email
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default FAQ;
