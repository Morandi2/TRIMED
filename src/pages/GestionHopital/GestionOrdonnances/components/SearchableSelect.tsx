import React, { useState, useEffect } from 'react';
import { ordonnanceService } from '../services/OrdonnanceService';

interface SearchableSelectProps {
  value: string;
  onChange: (value: string, id?: number) => void;
  error?: string;
  required?: boolean;
  type: 'patient' | 'medecin' | 'consultation';
  placeholder?: string;
}

interface Option {
  id: number;
  name: string;
  extra?: string;
  searchText?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onChange,
  error,
  required,
  type,
  placeholder
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [options, setOptions] = useState<Option[]>([]);

  useEffect(() => {
    loadOptions();
  }, [type]);

  const loadOptions = () => {
    let newOptions: Option[] = [];

    if (type === 'patient') {
      const patients = ordonnanceService.obtenirPatients();
      newOptions = patients.map(p => ({
        id: p.patient_id,
        name: `${p.prenom} ${p.nom}`,
        extra: p.telephone || 'Pas de téléphone',
        searchText: `${p.prenom} ${p.nom} ${p.telephone || ''}`
      }));
    } else if (type === 'medecin') {
      const medecins = ordonnanceService.obtenirMedecins();
      newOptions = medecins.map(m => ({
        id: m.medecin_id,
        name: `Dr. ${m.prenom} ${m.nom}`,
        extra: 'Médecin',
        searchText: `${m.prenom} ${m.nom} médecin`
      }));
    } else if (type === 'consultation') {
      const consultations = ordonnanceService.obtenirConsultations();
      newOptions = consultations.map(c => ({
        id: c.consultation_id,
        name: ordonnanceService.obtenirConsultationInfo(c.consultation_id)?.motif || `Consultation #${c.consultation_id}`,
        extra: c.motif,
        searchText: `${ordonnanceService.obtenirNomPatient(c.patient_id)} ${c.motif}`
      }));
    }

    setOptions(newOptions);
  };

  const filteredOptions = options.filter(option =>
    option.searchText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(o => o.name === value);

  const handleSelect = (option: Option) => {
    onChange(option.name, option.id);
    setIsOpen(false);
    setSearchTerm("");
    setHighlightedIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm("");
        break;
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'patient': return 'Patient';
      case 'medecin': return 'Médecin';
      case 'consultation': return 'Consultation';
      default: return '';
    }
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {getLabel()} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className={`w-full rounded-lg border px-3 py-2 text-sm text-left bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200 ${
            error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
          } ${
            isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            {selectedOption ? (
              <div className="flex flex-col">
                <span className="font-medium">{selectedOption.name}</span>
                {selectedOption.extra && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">{selectedOption.extra}</span>
                )}
              </div>
            ) : (
              <span className="text-gray-500 dark:text-gray-400">
                {placeholder || `Sélectionner ${getLabel().toLowerCase()}...`}
              </span>
            )}
            <svg
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-80 overflow-hidden">
            <div className="sticky top-0 bg-white dark:bg-gray-700 p-3 border-b border-gray-200 dark:border-gray-600">
              <input
                type="text"
                placeholder={`Rechercher ${getLabel().toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHighlightedIndex(0);
                }}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white text-gray-900 dark:bg-gray-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                autoFocus
              />
            </div>

            <div className="py-1 max-h-60 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-4 text-center">
                  <div className="text-gray-500 dark:text-gray-400 text-sm">
                    {searchTerm ? "Aucun résultat trouvé" : "Aucune option disponible"}
                  </div>
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors text-gray-900 dark:text-white ${
                      index === highlightedIndex
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-600'
                    } ${
                      option.name === value ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 dark:text-white">{option.name}</span>
                      {option.extra && (
                        <span className="text-xs text-gray-600 dark:text-gray-300">{option.extra}</span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};