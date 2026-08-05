/**
 * Convert Hex color to HSL object
 * @param {string} hex 
 * @returns {{h: number, s: number, l: number}}
 */
export function hexToHSL(hex) {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

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
 * Apply dynamic accent color to document root custom properties
 * @param {string} hexAccent 
 */
export function applyAccentColor(hexAccent) {
  if (!hexAccent || !/^#[0-9A-Fa-f]{6}$/.test(hexAccent)) return;
  const { h, s, l } = hexToHSL(hexAccent);
  document.documentElement.style.setProperty('--accent-h', `${h}`);
  document.documentElement.style.setProperty('--accent-s', `${s}%`);
  document.documentElement.style.setProperty('--accent-l', `${l}%`);
}
