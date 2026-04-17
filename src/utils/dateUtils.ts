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

/**
 * Formate une date et heure en format français (DD/MM/YYYY HH:mm)
 */
export const formatDateTimeFR = (dateStr: string | undefined | null): string => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Retourne une chaîne relative (ex: "Il y a 2 jours", "Aujourd'hui")
 */
export const formatRelativeDate = (dateStr: string | undefined | null): string => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'N/A';
  
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return "Aujourd'hui";
  if (diffInDays === 1) return "Hier";
  if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
  return formatDateFR(dateStr);
};
