import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { ChevronLeftIcon } from '../../icons';

// Interface pour les erreurs de validation
interface Errors {
    email?: string;
    password?: string;
    nomHopital?: string;
    adresse?: string;
    telephone?: string;
    nombreLits?: string;
    confirmPassword?: string;
}

const ConnexionHopital = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showResetForm, setShowResetForm] = useState(false);
    const [showInscriptionForm, setShowInscriptionForm] = useState(false);

    // États pour le formulaire d'inscription
    const [nomHopital, setNomHopital] = useState('');
    const [adresse, setAdresse] = useState('');
    const [telephone, setTelephone] = useState('');
    const [directeur, setDirecteur] = useState('');
    const [specialites, setSpecialites] = useState('');
    const [nombreLits, setNombreLits] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // États pour les erreurs de validation avec type explicite
    const [errors, setErrors] = useState<Errors>({});

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone: string): boolean => {
        const phoneRegex = /^[0-9+\-\s()]{10,}$/;
        return phoneRegex.test(phone);
    };

    const validateForm = (formType: string): boolean => {
        const newErrors: Errors = {};

        if (formType === 'connexion') {
            if (!email) newErrors.email = "L'email est requis";
            else if (!validateEmail(email)) newErrors.email = "Format d'email invalide";

            if (!password) newErrors.password = "Le mot de passe est requis";
        }

        if (formType === 'reset') {
            if (!email) newErrors.email = "L'email est requis";
            else if (!validateEmail(email)) newErrors.email = "Format d'email invalide";
        }

        if (formType === 'inscription') {
            if (!nomHopital) newErrors.nomHopital = "Le nom de l'hôpital est requis";
            if (!adresse) newErrors.adresse = "L'adresse est requise";

            if (!telephone) newErrors.telephone = "Le téléphone est requis";
            else if (!validatePhone(telephone)) newErrors.telephone = "Format de téléphone invalide";

            if (!email) newErrors.email = "L'email est requis";
            else if (!validateEmail(email)) newErrors.email = "Format d'email invalide";

            if (!password) newErrors.password = "Le mot de passe est requis";
            else if (password.length < 6) newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";

            if (!confirmPassword) newErrors.confirmPassword = "La confirmation du mot de passe est requise";
            else if (password !== confirmPassword) newErrors.confirmPassword = "Les mots de passe ne correspondent pas";

            if (nombreLits && (isNaN(Number(nombreLits)) || parseInt(nombreLits) < 0)) {
                newErrors.nombreLits = "Le nombre de lits doit être un nombre positif";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleResetPassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm('reset')) {
            alert(`Un e-mail de réinitialisation a été envoyé à ${email}`);
            setShowResetForm(false);
            setErrors({});
        }
    };

    const handleInscription = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm('inscription')) {
            alert(`Hôpital ${nomHopital} inscrit avec succès!`);
            setShowInscriptionForm(false);
            resetInscriptionForm();
            setErrors({});
        }
    };

    const resetInscriptionForm = () => {
        setNomHopital('');
        setAdresse('');
        setTelephone('');
        setDirecteur('');
        setSpecialites('');
        setNombreLits('');
        setPassword('');
        setConfirmPassword('');
    };

    const handleConnexion = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm('connexion')) {
            // Logique de connexion
            setErrors({});
        }
    };

    const clearError = (fieldName: keyof Errors) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">



            {/* Formulaire Principal */}
            {/* Lien du retour */}
            <div className="w-full max-w-md mx-4">
                <Link
                    to="/"
                    className="inline-flex items-center mb-5 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                    <ChevronLeftIcon className="size-5" />
                    Retourner à la page d'accueil
                </Link>

                <div className="bg-white rounded-xl shadow-2xl p-8 border border-gray-100">

                    {!showResetForm && !showInscriptionForm ? (
                        // FORMULAIRE DE CONNEXION
                        <>
                            <div className="text-center mb-8">
                                <div className="flex justify-center ">
                                    <img src="/images/logo/logo-icon.svg" alt="" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-800">TRIMEDH</h1>
                                <p className="text-gray-600 mt-2">Connectez-vous à votre compte</p>
                            </div>

                            <form onSubmit={handleConnexion}>
                                <div className="mb-6">
                                    <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            clearError('email');
                                        }}
                                        className={`w-full px-4 text-black py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="john@example.com"
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                                    )}
                                </div>

                                <div className="mb-6">
                                    <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
                                        Mot de passe
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            clearError('password');
                                        }}
                                        className={`w-full text-black px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Votre mot de passe"
                                    />
                                    {errors.password && (
                                        <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-medium mb-4"
                                >
                                    Se Connecter
                                </button>
                            </form>

                            <div className="text-center space-y-3">
                                <button
                                    onClick={() => setShowResetForm(true)}
                                    className="block w-full text-blue-600 hover:text-blue-800 transition-colors text-sm"
                                >
                                    Mot de passe oublié?
                                </button>
                                <div className="border-t pt-4">
                                    <p className="text-gray-600 text-sm mb-3">Nouvel hôpital?</p>
                                    <button
                                        onClick={() => setShowInscriptionForm(true)}
                                        className="w-full text-black bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200 text-sm font-medium"
                                    >
                                        Créer un nouvel abonnement
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : showResetForm ? (
                        // FORMULAIRE RÉINITIALISATION MOT DE PASSE
                        <>
                            <div className="text-center mb-8">
                                <div className="flex justify-center mb-4">
                                    <div className="flex justify-center mb-4">
                                        <img src="/images/logo/logo-icon.svg" alt="" />
                                    </div>
                                    <h1 className="text-2xl ml-3 font-bold text-gray-800">TRIMEDH</h1>
                                </div>
                                <h1 className="text-2xl text-black font-bold text-gray-800 mb-2">Réinitialiser le mot de passe</h1>
                                <p className="text-gray-600">Vous recevrez un e-mail dans 60 secondes maximum</p>
                            </div>

                            <form onSubmit={handleResetPassword}>
                                <div className="mb-6">
                                    <label htmlFor="emailReset" className="block text-gray-700 text-sm font-medium mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="emailReset"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            clearError('email');
                                        }}
                                        className={`w-full text-black px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="john@example.com"
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                                    )}
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowResetForm(false);
                                            setErrors({});
                                        }}
                                        className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition duration-200 font-medium"
                                    >
                                        Retour
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 text-black bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition duration-200 font-medium"
                                    >
                                        Réinitialiser
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        // FORMULAIRE D'INSCRIPTION NOUVEL HÔPITAL
                        <>
                            <div className="text-center mb-6">
                                <div className="flex justify-center mb-4">
                                    <div className="flex justify-center mb-4">
                                        <img src="/images/logo/logo-icon.svg" alt="" />
                                    </div>

                                    <h1 className="text-2xl ml-3 font-bold text-gray-800">TRIMEDH</h1>
                                </div>
                                <h1 className="text-2xl font-bold text-gray-800">Nouvel Abonnement Hôpital</h1>
                                <p className="text-gray-600 mt-2">Créez votre compte hôpital</p>
                            </div>

                            <form onSubmit={handleInscription} className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">
                                        Nom de l'Hôpital *
                                    </label>
                                    <input
                                        type="text"
                                        value={nomHopital}
                                        onChange={(e) => {
                                            setNomHopital(e.target.value);
                                            clearError('nomHopital');
                                        }}
                                        className={`w-full text-black px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.nomHopital ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Hôpital Central de Paris"
                                    />
                                    {errors.nomHopital && (
                                        <p className="text-red-500 text-xs mt-1">{errors.nomHopital}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">
                                        Adresse Complète *
                                    </label>
                                    <input
                                        type="text"
                                        value={adresse}
                                        onChange={(e) => {
                                            setAdresse(e.target.value);
                                            clearError('adresse');
                                        }}
                                        className={`w-full text-black px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.adresse ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="123 Avenue des Champs-Élysées, Paris"
                                    />
                                    {errors.adresse && (
                                        <p className="text-red-500 text-xs mt-1">{errors.adresse}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-gray-700 text-sm font-medium mb-1">
                                            Téléphone *
                                        </label>
                                        <input
                                            type="tel"
                                            value={telephone}
                                            onChange={(e) => {
                                                setTelephone(e.target.value);
                                                clearError('telephone');
                                            }}
                                            className={`w-full text-black px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.telephone ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="01 23 45 67 89"
                                        />
                                        {errors.telephone && (
                                            <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 text-sm font-medium mb-1">
                                            Nombre de Lits
                                        </label>
                                        <input
                                            type="number"
                                            value={nombreLits}
                                            onChange={(e) => {
                                                setNombreLits(e.target.value);
                                                clearError('nombreLits');
                                            }}
                                            className={`w-full text-black px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.nombreLits ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="150"
                                        />
                                        {errors.nombreLits && (
                                            <p className="text-red-500 text-xs mt-1">{errors.nombreLits}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">
                                        Directeur/Médecin-Chef
                                    </label>
                                    <input
                                        type="text"
                                        value={directeur}
                                        onChange={(e) => setDirecteur(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Dr. Marie Dupont"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">
                                        Spécialités (séparées par des virgules)
                                    </label>
                                    <input
                                        type="text"
                                        value={specialites}
                                        onChange={(e) => setSpecialites(e.target.value)}
                                        className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Cardiologie, Chirurgie, Pédiatrie"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">
                                        Email Administrateur *
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            clearError('email');
                                        }}
                                        className={`w-full text-black px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="admin@hopital.com"
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-gray-700 text-sm font-medium mb-1">
                                            Mot de passe *
                                        </label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                clearError('password');
                                            }}
                                            className={`w-full text-black px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.password ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                        {errors.password && (
                                            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 text-sm font-medium mb-1">
                                            Confirmer *
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                clearError('confirmPassword');
                                            }}
                                            className={`w-full text-black px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                        {errors.confirmPassword && (
                                            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex space-x-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowInscriptionForm(false);
                                            resetInscriptionForm();
                                            setErrors({});
                                        }}
                                        className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition duration-200 font-medium"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition duration-200 font-medium"
                                    >
                                        Créer l'Abonnement
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConnexionHopital;
