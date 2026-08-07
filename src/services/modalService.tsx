import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ModalMessage } from '../api/types/auth.types';

interface ModalProps {
  message: ModalMessage;
  onClose: () => void;
  autoCloseDelay?: number; // Temps avant fermeture automatique en ms
}

export const Modal: React.FC<ModalProps> = ({ 
  message, 
  onClose,
  autoCloseDelay = 5000 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animation d'entrée
    setIsVisible(true);

    // Fermeture automatique pour les messages de succès/info
    if (message.type === 'success' || message.type === 'info') {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [message, autoCloseDelay]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Laisser le temps à l'animation de sortie
  };

  // Empêcher la propagation du clic
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Styles selon le type de message
  const typeStyles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      title: 'text-green-900',
      icon: (
        <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      ),
      button: 'bg-green-600 hover:bg-green-700 text-white'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      title: 'text-red-900',
      icon: (
        <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      ),
      button: 'bg-red-600 hover:bg-red-700 text-white'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      title: 'text-blue-900',
      icon: (
        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      ),
      button: 'bg-blue-600 hover:bg-blue-700 text-white'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      title: 'text-yellow-900',
      icon: (
        <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-full">
          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
      ),
      button: 'bg-yellow-600 hover:bg-yellow-700 text-white'
    }
  };

  const style = typeStyles[message.type];

  if (!message.show) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={handleClose}
    >
      <div 
        className={`relative max-w-md w-full rounded-xl shadow-2xl transform transition-all duration-300 ${
          isVisible ? 'scale-100' : 'scale-95'
        } ${style.bg} border ${style.border}`}
        onClick={handleModalClick}
      >
        {/* Bouton de fermeture */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <div className="flex items-start space-x-4">
            {/* Icône */}
            {style.icon}
            
            {/* Contenu */}
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg font-semibold ${style.title} mb-2`}>
                {message.title}
              </h3>
              <p className={`${style.text} text-sm mb-4 whitespace-pre-line`}>
                {message.message}
              </p>
              
              {/* Boutons d'action */}
              <div className="flex justify-end space-x-3">
                {(message.type === 'error' || message.type === 'warning') && (
                  <button
                    onClick={handleClose}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${style.button}`}
                  >
                    Compris
                  </button>
                )}
                
                {message.type === 'success' && (
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    Fermer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Barre de progression pour auto-close */}
        {(message.type === 'success' || message.type === 'info') && (
          <div className="h-1 w-full bg-gray-200 rounded-b-xl overflow-hidden">
            <div 
              className={`h-full ${message.type === 'success' ? 'bg-green-500' : 'bg-blue-500'} transition-all duration-${autoCloseDelay}`}
              style={{ 
                width: isVisible ? '100%' : '0%',
                transition: `width ${autoCloseDelay}ms linear`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Hook pour utiliser le modal
export const useModal = () => {
  const [modalMessage, setModalMessage] = useState<ModalMessage>({
    type: 'info',
    title: '',
    message: '',
    show: false
  });

  const showModal = (
    type: ModalMessage['type'], 
    title: string, 
    message: string,
    autoCloseDelay?: number
  ) => {
    setModalMessage({
      type,
      title,
      message,
      show: true
    });
    
    // Retourner une fonction pour fermer manuellement
    return () => hideModal();
  };

  const hideModal = () => {
    setModalMessage(prev => ({ ...prev, show: false }));
  };

  return {
    modalMessage,
    showModal,
    hideModal,
    Modal: (props?: { autoCloseDelay?: number }) => (
      <Modal 
        message={modalMessage} 
        onClose={hideModal} 
        autoCloseDelay={props?.autoCloseDelay}
      />
    )
  };
};

// Composant pour les toasts (notifications rapides)
export const Toast: React.FC<{
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onClose: () => void;
  duration?: number;
}> = ({ type, message, onClose, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const toastStyles = {
    success: 'bg-green-500 border-green-600',
    error: 'bg-red-500 border-red-600',
    info: 'bg-blue-500 border-blue-600',
    warning: 'bg-yellow-500 border-yellow-600'
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 rounded-lg border shadow-lg text-white px-4 py-3 transform transition-all duration-300 ${
        toastStyles[type]
      } ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
    >
      <div className="flex items-center space-x-3">
        <span>{message}</span>
        <button
          onClick={handleClose}
          className="text-white hover:text-gray-200 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Hook pour les toasts
export const useToast = () => {
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    show: boolean;
  } | null>(null);

  const showToast = (
    type: 'success' | 'error' | 'info' | 'warning',
    message: string,
    duration?: number
  ) => {
    setToast({ type, message, show: true });
    
    setTimeout(() => {
      hideToast();
    }, duration || 3000);
  };

  const hideToast = () => {
    setToast(null);
  };

  return {
    toast,
    showToast,
    hideToast,
    Toast: () => toast ? (
      <Toast
        type={toast.type}
        message={toast.message}
        onClose={hideToast}
      />
    ) : null
  };
};