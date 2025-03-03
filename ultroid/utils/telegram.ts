/**
 * Utility functions for working with Telegram data
 */

/**
 * Get a fallback avatar based on the user's name
 * @param name User's name
 * @returns URL to a generated avatar
 */
export const getFallbackAvatar = (name: string): string => {
  // Use initials for the avatar
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  // Generate a deterministic color based on the name
  const hash = name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const hue = Math.abs(hash % 360);
  const color = `hsl(${hue}, 70%, 60%)`;
  
  // Create a data URL for a simple SVG avatar
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="${color}" />
      <text x="50" y="50" font-family="Arial" font-size="40" fill="white" text-anchor="middle" dominant-baseline="central">
        ${initials}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Check if a URL is valid
 * @param url URL to check
 * @returns True if the URL is valid
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get a user's avatar URL, with fallback
 * @param userData User data object
 * @returns URL to the user's avatar
 */
export const getUserAvatar = (userData: { name: string; avatar?: string }): string => {
  if (userData.avatar && isValidUrl(userData.avatar)) {
    return userData.avatar;
  }
  
  return getFallbackAvatar(userData.name);
}; 