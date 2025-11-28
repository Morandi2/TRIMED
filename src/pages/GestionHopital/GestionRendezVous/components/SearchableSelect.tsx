import React, { useState, useRef, useEffect } from 'react';
import { rendezVousService } from '../services/RendezVousService';
import { Patient, Medecin } from '../types/RendezVousTypes';

interface SearchableSelectProps {
  value: string;
  onChange: (name: string, id?: number) => void;
  type: 'patient' | 'medecin';
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onChange,
  type,
  required = false,
  placeholder = "Rechercher...",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<(Patient | Medecin)[]>([]);
  const [selectedItem, setSelectedItem] = useState<Patient | Medecin | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchTerm.trim()) {
      const results = type === 'patient' 
        ? rendezVousService.rechercherPatients(searchTerm)
        : rendezVousService.rechercherMedecins(searchTerm);
      setItems(results);
    } else {
      setItems([]);
    }
  }, [searchTerm, type]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: Patient | Medecin) => {
    setSelectedItem(item);
    onChange(item.nom, 'patient_id' in item ? item.patient_id : item.medecin_id);
    setSearchTerm(item.nom);
    setIsOpen(false);

    // Si se yon patient, rempli telefòn nan automatiquement
    if (type === 'patient' && 'telephone' in item) {
      const patient = item as Patient;
      // Fòmate telefòn nan pou afichaj
      const formattedPhone = rendezVousService.formatPhoneNumber(patient.telephone);
      
      const event = new CustomEvent('patientSelected', { 
        detail: { 
          patient_id: patient.patient_id,
          patient_nom: patient.nom,
          patient_email: patient.email,
          patient_phone: formattedPhone // Itilize vèsyon fòmate a
        }
      });
      window.dispatchEvent(event);
    }

    // Si se yon medsen, rempli espesyalite nan automatiquement
    if (type === 'medecin' && 'specialite' in item) {
      const medecin = item as Medecin;
      const event = new CustomEvent('medecinSelected', { 
        detail: { 
          medecin_id: medecin.medecin_id,
          medecin_nom: medecin.nom,
          specialite: medecin.specialite
        }
      });
      window.dispatchEvent(event);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    
    if (newValue.trim()) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setSelectedItem(null);
      onChange('', undefined);
    }
  };

  const clearSelection = () => {
    setSelectedItem(null);
    setSearchTerm('');
    onChange('', undefined);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const getDisplayText = (item: Patient | Medecin) => {
    if ('specialite' in item) {
      const formattedPhone = rendezVousService.formatPhoneNumber(item.telephone);
      return `${item.nom} - ${item.specialite} (${formattedPhone})`;
    }
    const formattedPhone = rendezVousService.formatPhoneNumber(item.telephone);
    return `${item.nom} - ${formattedPhone}`;
  };

  const inputClass = `w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${className}`;

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => searchTerm.trim() && setIsOpen(true)}
          placeholder={placeholder}
          className={inputClass}
          required={required}
        />
        {selectedItem && (
          <button
            type="button"
            onClick={clearSelection}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && items.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {items.map((item) => (
            <button
              key={'patient_id' in item ? item.patient_id : item.medecin_id}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-gray-600 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
            >
              <div className="font-medium text-gray-900 dark:text-white">
                {getDisplayText(item)}
              </div>
              {'email' in item && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {item.email}
                </div>
              )}
              {'disponibilite' in item && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Disponible: {item.disponibilite?.join(', ')}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {isOpen && searchTerm.trim() && items.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
          <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-center">
            Aucun {type === 'patient' ? 'patient' : 'médecin'} trouvé
          </div>
        </div>
      )}
    </div>
  );
};