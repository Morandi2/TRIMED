// Fonctions de validation réutilisables

export const validation = {
  /**
   * Validation d'email
   */
  validateEmail(email: string): { valid: boolean; message?: string } {
    if (!email || email.trim() === '') {
      return { valid: false, message: 'L\'email est requis' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    
    return {
      valid: isValid,
      message: isValid ? undefined : 'Format d\'email invalide'
    };
  },

  /**
   * Validation de téléphone
   */
  validatePhone(phone: string): { valid: boolean; message?: string } {
    if (!phone || phone.trim() === '') {
      return { valid: false, message: 'Le téléphone est requis' };
    }
    
    // Supprimer les espaces et caractères spéciaux pour la validation
    const cleanedPhone = phone.replace(/[\s\-()]/g, '');
    const phoneRegex = /^[0-9]{10,}$/;
    const isValid = phoneRegex.test(cleanedPhone);
    
    return {
      valid: isValid,
      message: isValid ? undefined : 'Format de téléphone invalide (minimum 10 chiffres)'
    };
  },

  /**
   * Validation de mot de passe
   */
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!password) {
      errors.push('Le mot de passe est requis');
      return { valid: false, errors };
    }
    
    if (password.length < 6) {
      errors.push('Le mot de passe doit contenir au moins 6 caractères');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une minuscule');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Validation de confirmation de mot de passe
   */
  validateConfirmPassword(password: string, confirmPassword: string): { valid: boolean; message?: string } {
    if (!confirmPassword) {
      return { valid: false, message: 'La confirmation du mot de passe est requise' };
    }
    
    const isValid = password === confirmPassword;
    
    return {
      valid: isValid,
      message: isValid ? undefined : 'Les mots de passe ne correspondent pas'
    };
  },

  /**
   * Validation de numéro d'enregistrement
   */
  validateNumeroEnregistrement(numero: string): { valid: boolean; message?: string } {
    if (!numero) {
      return { valid: true }; // Optionnel
    }
    
    const isValid = numero.length >= 5;
    
    return {
      valid: isValid,
      message: isValid ? undefined : 'Le numéro d\'enregistrement doit contenir au moins 5 caractères'
    };
  },

  /**
   * Validation de nombre de lits
   */
  validateNombreLits(nombreLits: string): { valid: boolean; message?: string } {
    if (!nombreLits || nombreLits.trim() === '') {
      return { valid: true }; // Optionnel
    }
    
    const nombre = parseInt(nombreLits);
    const isValid = !isNaN(nombre) && nombre >= 0;
    
    return {
      valid: isValid,
      message: isValid ? undefined : 'Le nombre de lits doit être un nombre positif'
    };
  },

  /**
   * Validation de champ texte obligatoire
   */
  validateRequired(text: string, fieldName: string): { valid: boolean; message?: string } {
    const isValid = !!text && text.trim() !== '';
    
    return {
      valid: isValid,
      message: isValid ? undefined : `${fieldName} est requis`
    };
  },

  /**
   * Validation de téléphone haïtien
   */
  validateHaitiPhone(phone: string): { valid: boolean; message?: string } {
    if (!phone || phone.trim() === '') {
      return { valid: false, message: 'Le téléphone est requis' };
    }
    
    // On nettoie pour ne garder que les chiffres
    const cleaned = phone.replace(/\D/g, '');
    
    // Un numéro haïtien valide a 8 chiffres (après le prefixe 509)
    // On accepte soit "509XXXXXXXX" (11 chiffres) soit "XXXXXXXX" (8 chiffres)
    if (cleaned.length === 8) return { valid: true };
    if (cleaned.length === 11 && cleaned.startsWith('509')) return { valid: true };
    
    return { 
      valid: false, 
      message: 'Format de téléphone invalide (8 chiffres requis après +509)' 
    };
  },

  /**
   * Formatage dynamique de téléphone haïtien (+509 XXXX-XXXX)
   */
  formatHaitiPhone(value: string): string {
    // Retire tout ce qui n'est pas chiffre
    let cleaned = value.replace(/\D/g, '');
    
    // Gère le préfixe 509
    if (cleaned.startsWith('509')) {
      cleaned = cleaned.slice(3);
    }
    
    // Limite à 8 chiffres
    cleaned = cleaned.slice(0, 8);
    
    // Application du masque XXXX-XXXX
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 4) return `+509 ${cleaned}`;
    return `+509 ${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  },

  /**
   * Nettoyage du téléphone pour envoi au backend (format 509XXXXXXXX)
   */
  cleanPhone(value: string): string {
    const numeric = value.replace(/\D/g, '');
    if (numeric.length === 8) return `509${numeric}`;
    if (numeric.length === 11 && numeric.startsWith('509')) return numeric;
    return numeric;
  },

  /**
   * Formatage du NIF (10 chiffres)
   */
  formatNIF(value: string): string {
    // Retire tout ce qui n'est pas chiffre
    const cleaned = value.replace(/\D/g, '');
    
    // Limite à 10 chiffres
    return cleaned.slice(0, 10);
  },

  /**
   * Formatage du Numéro MSPP (HT-MSPP-DEP-TYPE-NUM)
   */
  formatMSPP(value: string): string {
    // Force majuscules et remplace les espaces par des tirets
    let val = value.toUpperCase().replace(/\s/g, '-');
    
    // Supprime les caractères non autorisés (uniquement lettres, chiffres et tirets)
    val = val.replace(/[^A-Z0-9-]/g, '');
    
    // Supprime les doubles tirets
    val = val.replace(/-+/g, '-');

    // Aide au préfixe si l'utilisateur commence à taper sans le préfixe
    if (val.length > 0 && !val.startsWith('H')) {
        val = 'HT-MSPP-' + val;
    } else if (val === 'H') {
        val = 'HT-';
    } else if (val === 'HT') {
        val = 'HT-';
    } else if (val === 'HT-M') {
        val = 'HT-MSPP-';
    }

    return val;
  },

  /**
   * Validation de NIF
   */
  validateNIF(nif: string): { valid: boolean; message?: string } {
    if (!nif) return { valid: false, message: 'Le NIF est obligatoire' };
    
    const cleaned = nif.replace(/\D/g, '');
    const isValid = cleaned.length === 10;
    
    return {
      valid: isValid,
      message: isValid ? undefined : 'Le NIF doit contenir exactement 10 chiffres'
    };
  },

  /**
   * Validation du Numéro MSPP (Strict)
   */
  validateMSPP(mspp: string): { valid: boolean; message?: string } {
    if (!mspp) return { valid: false, message: 'Le numéro MSPP est obligatoire' };
    
    // Format attendu: HT-MSPP-[REGION]-[TYPE]-[NUMERO]
    // Exemple: HT-MSPP-OUEST-HOP-0001
    const parts = mspp.split('-');
    
    // Au moins 5 parties: HT, MSPP, REGION, TYPE, NUM
    if (parts.length < 5) {
      return { valid: false, message: 'Format MSPP invalide (ex: HT-MSPP-OUEST-HOP-0001)' };
    }

    if (parts[0] !== 'HT' || parts[1] !== 'MSPP') {
      return { valid: false, message: 'Le numéro doit commencer par HT-MSPP-' };
    }

    // Le dernier segment doit être numérique (4 chiffres idéalement)
    const lastPart = parts[parts.length - 1];
    if (!/^\d{4}$/.test(lastPart)) {
      return { valid: false, message: 'Le numéro final doit avoir 4 chiffres (ex: 0001)' };
    }

    return { valid: true };
  },

  /**
   * Capitalize first letter of each word
   */
  capitalize(value: string): string {
    return value
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

  /**
   * Validation complète pour le formulaire d'inscription
   */
  validateInscriptionForm(data: {
    nomHopital: string;
    adresse: string;
    telephone: string;
    email: string;
    password: string;
    confirmPassword: string;
    nombreLits?: string;
    numeroEnregistrement?: string;
  }): Record<string, string> {
    const errors: Record<string, string> = {};
    
    // Nom de l'hôpital
    const nomValidation = this.validateRequired(data.nomHopital, 'Le nom de l\'hôpital');
    if (!nomValidation.valid) errors.nomHopital = nomValidation.message!;
    
    // Adresse
    const adresseValidation = this.validateRequired(data.adresse, 'L\'adresse');
    if (!adresseValidation.valid) errors.adresse = adresseValidation.message!;
    
    // Téléphone (Utilise la nouvelle validation haïtienne)
    const phoneValidation = this.validateHaitiPhone(data.telephone);
    if (!phoneValidation.valid) errors.telephone = phoneValidation.message!;
    
    // Email
    const emailValidation = this.validateEmail(data.email);
    if (!emailValidation.valid) errors.email = emailValidation.message!;
    
    // Mot de passe
    const passwordValidation = this.validatePassword(data.password);
    if (!passwordValidation.valid) errors.password = passwordValidation.errors[0];
    
    // Confirmation mot de passe
    const confirmValidation = this.validateConfirmPassword(data.password, data.confirmPassword);
    if (!confirmValidation.valid) errors.confirmPassword = confirmValidation.message!;
    
    // Nombre de lits (optionnel)
    if (data.nombreLits) {
      const litsValidation = this.validateNombreLits(data.nombreLits);
      if (!litsValidation.valid) errors.nombreLits = litsValidation.message!;
    }
    
    // Numéro d'enregistrement (optionnel)
    if (data.numeroEnregistrement) {
      const numeroValidation = this.validateNumeroEnregistrement(data.numeroEnregistrement);
      if (!numeroValidation.valid) errors.numeroEnregistrement = numeroValidation.message!;
    }
    
    return errors;
  },

  /**
   * Validation pour le formulaire de connexion
   */
  validateConnexionForm(data: {
    email: string;
    password: string;
  }): Record<string, string> {
    const errors: Record<string, string> = {};
    
    // Email
    const emailValidation = this.validateEmail(data.email);
    if (!emailValidation.valid) errors.email = emailValidation.message!;
    
    // Mot de passe
    if (!data.password) {
      errors.password = 'Le mot de passe est requis';
    }
    
    return errors;
  }
};