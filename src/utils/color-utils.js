/**
 * Converts a 6-digit hex color to HSL components { h, s, l }.
 * @param {string} hex - Hex color e.g., "#6366F1"
 * @returns {{ h: number, s: number, l: number }} HSL values (h: 0-360, s: 0-100, l: 0-100)
 */
export function hexToHSL(hex) {
  let cleanHex = hex.replace(/^#/, '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Updates root document CSS variables based on accent hex color.
 * @param {string} accentHex 
 */
export function applyAccentColor(accentHex) {
  if (!accentHex || !/^#[0-9A-Fa-f]{6}$/.test(accentHex)) return;
  const { h, s, l } = hexToHSL(accentHex);
  const root = document.documentElement;
  root.style.setProperty('--accent-h', `${h}`);
  root.style.setProperty('--accent-s', `${s}%`);
  root.style.setProperty('--accent-l', `${l}%`);
}

/**
 * Converts hex color to CSS rgba string with given alpha opacity.
 * @param {string} hex 
 * @param {number} alpha (0 to 1)
 * @returns {string} rgba color
 */
export function hexToRgba(hex, alpha = 1) {
  let cleanHex = hex.replace(/^#/, '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
