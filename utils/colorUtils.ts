/**
 * Adjusts a hex color by a given amount.
 * @param color The hex color string (e.g., '#F8333C').
 * @param amount The amount to adjust each component (positive to brighten, negative to darken).
 * @returns The adjusted hex color string.
 */
export const adjustColor = (color: string, amount: number): string => {
  const clamp = (val: number) => Math.min(255, Math.max(0, val));
  
  // Remove the leading # if it exists
  const hex = color.replace('#', '');
  
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Adjust each color component
  const rNew = clamp(r + amount);
  const gNew = clamp(g + amount);
  const bNew = clamp(b + amount);
  
  // Convert back to hex
  const rHex = Math.round(rNew).toString(16).padStart(2, '0');
  const gHex = Math.round(gNew).toString(16).padStart(2, '0');
  const bHex = Math.round(bNew).toString(16).padStart(2, '0');
  
  return `#${rHex}${gHex}${bHex}`;
};
