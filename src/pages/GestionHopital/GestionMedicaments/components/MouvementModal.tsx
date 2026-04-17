import React, { useState, useEffect } from 'react';
import { medicamentService } from '../services/MedicamentService';
import {
    MouvementFormData,
    MouvementStock,
    Medicament,
    TypeMouvement
} from '../types/MedicamentTypes';

interface MouvementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (mouvement: MouvementStock) => void;
    medicament: Medicament;
    type: TypeMouvement;
    tenantId: number;
}

export const MouvementModal: React.FC<MouvementModalProps> = ({
    isOpen,
    onClose,
    onSave,
    medicament,
    type,
    tenantId
}) => {
    const [formData, setFormData] = useState<MouvementFormData>({
        medicament_id: medicament.medicament_id,
        type: type,
        quantite: 0,
        motif: '',
        utilisateur: 'Utilisateur Actuel',
        cout_unitaire: type === 'Entrée' ? (medicament.prix_unitaire ? parseFloat(medicament.prix_unitaire) : 0) : undefined,
        destination: type === 'Sortie' ? 'Pharmacie interne' : '',
        fournisseur: type === 'Entrée' ? '' : '',
        numero_lot: (medicament as any).lot_number || '',
        date_peremption: (medicament as any).date_peremption
    });

    const [errors, setErrors] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const newErrors: string[] = [];

        if (formData.quantite <= 0) {
            newErrors.push('La quantité doit être supérieure à 0');
        }

        if (!formData.motif.trim()) {
            newErrors.push('Le motif est obligatoire');
        }

        if (type === 'Sortie' && formData.quantite > (medicament.stock_actuel || 0)) {
            newErrors.push('Stock insuffisant pour cette sortie');
        }

        if (newErrors.length > 0) {
            setErrors(newErrors);
            return;
        }

        if (isSaving) return;
        setIsSaving(true);

        try {
            const result = await medicamentService.creerMouvementStock(formData);

            if (result.success) {
                // Since result.data might not be the full movement but success is enough
                // to trigger a refresh in the parent
                onSave(result.data as MouvementStock);
                onClose();
            } else {
                setErrors(result.errors || ['Erreur lors de la création du mouvement']);
            }
        } catch (error) {
            console.error('Erreur:', error);
            setErrors(['Une erreur est survenue']);
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (field: keyof MouvementFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors.length > 0) {
            setErrors([]);
        }
    };

    const calculateStockApres = () => {
        const stockActuel = medicament.stock_actuel || 0;
        if (type === 'Entrée') {
            return stockActuel + formData.quantite;
        } else if (type === 'Sortie') {
            return stockActuel - formData.quantite;
        } else if (type === 'Ajustement') {
            return formData.quantite;
        }
        return stockActuel;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            ></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl transform transition-all duration-300 scale-100 z-[100000] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        {type === 'Entrée' ? 'Entrée de Stock' :
                            type === 'Sortie' ? 'Sortie de Stock' :
                                'Ajustement de Stock'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
                {/* Body scrollable */}
                <div className="flex-1 p-6 overflow-y-auto min-h-0">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Errors display */}
                        {errors.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">Erreurs</h3>
                                        <div className="mt-2 text-sm text-red-700">
                                            <ul className="list-disc pl-5 space-y-1">
                                                {errors.map((error, index) => (
                                                    <li key={index}>{error}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Informations du médicament */}
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <h4 className="font-medium text-gray-800 dark:text-white/90 mb-3">Médicament</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Nom:</span>
                                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">{medicament.nom}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Code ATC:</span>
                                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">{medicament.code_atc || '-'}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Stock actuel:</span>
                                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                        {medicament.stock_actuel}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Stock après:</span>
                                    <p className={`text-sm font-medium ${calculateStockApres() < 0 ? 'text-red-600' : 'text-gray-800 dark:text-white/90'
                                        }`}>
                                        {calculateStockApres()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Détails du mouvement */}
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <h4 className="font-medium text-gray-800 dark:text-white/90 mb-3">Détails du Mouvement</h4>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Quantité *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.quantite}
                                        onChange={(e) => handleInputChange('quantite', parseInt(e.target.value) || 0)}
                                        className="w-full rounded-lg border-2 border-gray-700 dark:border-yellow-400 px-3 py-2 text-sm text-gray-900 dark:text-yellow-200 bg-white dark:bg-gray-900 placeholder:text-gray-400 dark:placeholder:text-yellow-400 focus:border-blue-500 focus:ring-blue-500"
                                        min="1"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Motif *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.motif}
                                        onChange={(e) => handleInputChange('motif', e.target.value)}
                                        placeholder="Ex: Réapprovisionnement, Dispensation..."
                                        className="w-full rounded-lg border-2 border-gray-700 dark:border-yellow-400 px-3 py-2 text-sm text-gray-900 dark:text-yellow-200 bg-white dark:bg-gray-900 placeholder:text-gray-400 dark:placeholder:text-yellow-400 focus:border-blue-500 focus:ring-blue-500"
                                        required

                                    />
                                </div>

                                {type === 'Entrée' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Fournisseur
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.fournisseur}
                                                onChange={(e) => handleInputChange('fournisseur', e.target.value)}
                                                className="w-full rounded-lg border-2 border-gray-700 dark:border-yellow-400 px-3 py-2 text-sm text-gray-900 dark:text-yellow-200 bg-white dark:bg-gray-900 placeholder:text-gray-400 dark:placeholder:text-yellow-400 focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Coût unitaire (€)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={formData.cout_unitaire || ''}
                                                onChange={(e) => handleInputChange('cout_unitaire', parseFloat(e.target.value) || 0)}
                                                className="w-full rounded-lg border-2 border-gray-700 dark:border-yellow-400 px-3 py-2 text-sm text-gray-900 dark:text-yellow-200 bg-white dark:bg-gray-900 placeholder:text-gray-400 dark:placeholder:text-yellow-400 focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>
                                    </>
                                )}

                                {type === 'Sortie' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Destination
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.destination}
                                            onChange={(e) => handleInputChange('destination', e.target.value)}
                                            className="w-full rounded-lg border-2 border-gray-700 dark:border-yellow-400 px-3 py-2 text-sm text-gray-900 dark:text-yellow-200 bg-white dark:bg-gray-900 placeholder:text-gray-400 dark:placeholder:text-yellow-400 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Numéro de lot
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.numero_lot}
                                        onChange={(e) => handleInputChange('numero_lot', e.target.value)}
                                        className="w-full rounded-lg border-2 border-gray-700 dark:border-yellow-400 px-3 py-2 text-sm text-gray-900 dark:text-yellow-200 bg-white dark:bg-gray-900 placeholder:text-gray-400 dark:placeholder:text-yellow-400 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Date de péremption
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.date_peremption}
                                        onChange={(e) => handleInputChange('date_peremption', e.target.value)}
                                        className="w-full rounded-lg border-2 border-gray-700 dark:border-yellow-400 px-3 py-2 text-sm text-gray-900 dark:text-yellow-200 bg-white dark:bg-gray-900 placeholder:text-gray-400 dark:placeholder:text-yellow-400 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Résumé */}
                        {formData.cout_unitaire && type === 'Entrée' && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Résumé financier</h4>
                                <div className="text-sm text-blue-700 dark:text-blue-400">
                                    <p>Coût total: {(formData.quantite * formData.cout_unitaire).toFixed(2)} €</p>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
                {/* Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={formData.quantite <= 0 || isSaving}
                        onClick={handleSubmit}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Enregistrement...
                            </>
                        ) : 'Enregistrer le mouvement'}
                    </button>
                </div>
            </div>
        </div>
    );
};
