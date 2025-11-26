import { useModal } from '../../hooks/useModal';
import { LoginModal } from './LoginModal';

export const LoginExample = () => {
  const { isOpen, openModal, closeModal } = useModal();

  return (
    <div className="p-4">
      <button
        onClick={openModal}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Ouvrir Login Modal
      </button>
      
      <LoginModal isOpen={isOpen} onClose={closeModal} />
    </div>
  );
};