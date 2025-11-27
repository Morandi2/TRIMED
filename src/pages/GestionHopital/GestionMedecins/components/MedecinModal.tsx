import React from 'react';
import { MedecinFormData } from '../services/MedecinService';
import { MedecinProgressForm } from './MedecinProgressForm';

interface MedecinModalProps {
  hopitalId: number;
  onSave: (formData: MedecinFormData, isModifying: boolean) => void;
  onClose: () => void;
  medecinId?: number;
}

export const MedecinModal: React.FC<MedecinModalProps> = ({
  hopitalId,
  onSave,
  onClose,
  medecinId
}) => {
  return (
    <MedecinProgressForm
      hopitalId={hopitalId}
      onSave={onSave}
      onClose={onClose}
      medecinId={medecinId}
    />
  );
};