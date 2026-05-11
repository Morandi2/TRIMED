import api from '../api/apiConfig';

/**
 * Script de diagnostic pour le login
 */
export const debugLogin = async (email, password) => {
    console.log('=== DEBUG LOGIN ===');
    console.log('1. Données à envoyer:', { email, password });
    
    try {
        const response = await api.post('/comptes/login/', {
            email: email,
            password: password
        });
        
        console.log('2. Réponse reçue:', response.data);
        console.log('3. Statut:', response.status);
        console.log('Connexion réussie!');
        
        return response.data;
    } catch (error) {
        console.error('Erreur de connexion:');
        console.error('   Statut:', error.response?.status);
        console.error('   Données:', error.response?.data);
        console.error('   Requête envoyée:', error.config?.data);
        
        return null;
    }
};

/**
 * Pour utiliser dans la console :
 * window.debugLogin = debugLogin;
 */
