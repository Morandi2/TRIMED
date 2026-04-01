/**
 * Calcule l'âge à partir d'une date de naissance
 * @param birthDate Chaîne de caractères représentant la date (ISO, YYYY-MM-DD, etc.)
 * @returns L'âge en nombre d'années ou "N/A" si la date est invalide
 */
export const calculateAge = (birthDate: string | undefined | null): number | string => {
  if (!birthDate) return 'N/A';
  
  const today = new Date();
  const birth = new Date(birthDate);
  
  if (isNaN(birth.getTime())) return 'N/A';

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age >= 0 ? age : 'N/A';
};

/**
 * Formate une date en format français (DD/MM/YYYY)
 */
export const formatDateFR = (dateStr: string | undefined | null): string => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('fr-FR');
};
