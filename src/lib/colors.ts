/**
 * Francielle Color Utilities & Curated Girly Palette
 * Supports adding variations by Color Name, Color Code (Hex), or Palette Picker
 */

export interface PaletteColor {
  name: string;
  code: string;
  category: 'pink' | 'neutral' | 'metallic' | 'pastel';
}

export const GIRLY_COLOR_PALETTE: PaletteColor[] = [
  // Signature Pinks
  { name: 'Blush Pink', code: '#FFB5DB', category: 'pink' },
  { name: 'Baby Pink', code: '#FFE2EF', category: 'pink' },
  { name: 'Hot Pink', code: '#F0008E', category: 'pink' },
  { name: 'Rose Quartz', code: '#F7CAC9', category: 'pink' },
  { name: 'Rose Gold', code: '#B76E79', category: 'pink' },
  { name: 'Berry Wine', code: '#5A1136', category: 'pink' },
  
  // Neutrals & Pearls
  { name: 'Pearl White', code: '#FDFBF7', category: 'neutral' },
  { name: 'Opal White', code: '#F2F2F2', category: 'neutral' },
  { name: 'Creamy Vanilla', code: '#FFF8DC', category: 'neutral' },
  { name: 'Champagne', code: '#F7E7CE', category: 'neutral' },
  { name: 'Pearl Silver', code: '#D9D9D9', category: 'metallic' },
  { name: 'Classy Noir', code: '#1C1917', category: 'neutral' },
  
  // Pastels & Glam
  { name: 'Lavender Mist', code: '#E6E6FA', category: 'pastel' },
  { name: 'Dusty Mauve', code: '#C8A2C8', category: 'pastel' },
  { name: 'Lilac Breeze', code: '#D8B4E2', category: 'pastel' },
  { name: 'Peach Silk', code: '#FFDAB9', category: 'pastel' },
  { name: 'Coral Glow', code: '#FF7F7F', category: 'pastel' },
  { name: 'Mint Chic', code: '#D4EDDA', category: 'pastel' },
  { name: 'Baby Blue', code: '#D0E8FF', category: 'pastel' },
  { name: 'Golden Glow', code: '#FFD700', category: 'metallic' },
];

/**
 * Standard shade names mapped to hex codes for automatic swatch rendering
 */
export const COLOR_NAME_TO_HEX: Record<string, string> = {
  'blush pink': '#FFB5DB',
  'baby pink': '#FFE2EF',
  'hot pink': '#F0008E',
  'barbie pink': '#F0008E',
  'rose quartz': '#F7CAC9',
  'rose pink': '#FF69B4',
  'rose gold': '#B76E79',
  'dusty rose': '#DCAE96',
  'dusty mauve': '#C8A2C8',
  'mauve': '#E0B0FF',
  'berry': '#5A1136',
  'berry wine': '#5A1136',
  'pearl white': '#FDFBF7',
  'opal white': '#F2F2F2',
  'pearl silver': '#D9D9D9',
  'silver': '#C0C0C0',
  'creamy vanilla': '#FFF8DC',
  'vanilla': '#FFFDD0',
  'cream': '#FFFDD0',
  'champagne': '#F7E7CE',
  'champagne gold': '#F7E7CE',
  'gold': '#FFD700',
  'golden': '#FFD700',
  'golden glow': '#FFD700',
  'lavender': '#E6E6FA',
  'lavender mist': '#E6E6FA',
  'lilac': '#D8B4E2',
  'lilac breeze': '#D8B4E2',
  'peach': '#FFDAB9',
  'peach silk': '#FFDAB9',
  'coral': '#FF7F7F',
  'coral glow': '#FF7F7F',
  'mint': '#D4EDDA',
  'mint chic': '#D4EDDA',
  'sage': '#9CAF88',
  'baby blue': '#D0E8FF',
  'sky blue': '#87CEEB',
  'powder blue': '#B0E0E6',
  'black': '#000000',
  'noir': '#1C1917',
  'classy noir': '#1C1917',
  'white': '#FFFFFF',
  'nude': '#E3BC9A',
  'mocha': '#967969',
  'burgundy': '#800020',
};

/**
 * Extract hex color from string.
 * Supports:
 * - "Rose Quartz (#F7CAC9)" -> "#F7CAC9"
 * - "#FFB5DB" -> "#FFB5DB"
 * - "Blush Pink" -> "#FFB5DB" (via dictionary)
 */
export function extractColorHex(str: string): string | undefined {
  if (!str) return undefined;

  // 1. Check if string explicitly contains a hex code (#RRGGBB or #RGB)
  const hexMatch = str.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/);
  if (hexMatch) {
    const raw = hexMatch[0];
    if (raw.length === 4) {
      // expand #RGB to #RRGGBB
      return '#' + raw[1] + raw[1] + raw[2] + raw[2] + raw[3] + raw[3];
    }
    return raw.toUpperCase();
  }

  // 2. Check if clean name matches dictionary
  const clean = str.toLowerCase().replace(/[()]/g, '').trim();
  if (COLOR_NAME_TO_HEX[clean]) {
    return COLOR_NAME_TO_HEX[clean];
  }

  // 3. Partial keyword matching
  for (const [key, hex] of Object.entries(COLOR_NAME_TO_HEX)) {
    if (clean.includes(key)) {
      return hex;
    }
  }

  return undefined;
}

/**
 * Extract clean color name without hex code suffix
 * "Rose Quartz (#F7CAC9)" -> "Rose Quartz"
 */
export function extractColorName(str: string): string {
  if (!str) return '';
  // Remove parenthesized hex code if present
  const cleaned = str.replace(/\s*\([#0-9a-fA-F]+\)\s*/g, '').trim();
  return cleaned || str;
}

/**
 * Format a color option for saving
 * e.g. Name: "Rose Quartz", Code: "#F7CAC9" -> "Rose Quartz (#F7CAC9)"
 */
export function formatColorOption(name: string, code?: string): string {
  const cleanName = (name || '').trim();
  const cleanCode = (code || '').trim().toUpperCase();

  if (!cleanName && !cleanCode) return '';
  if (!cleanCode) return cleanName;
  if (!cleanName) return cleanCode;

  // If name already contains code, return name
  if (cleanName.includes(cleanCode)) return cleanName;

  // Standard formatted representation
  return `${cleanName} (${cleanCode.startsWith('#') ? cleanCode : '#' + cleanCode})`;
}

/**
 * Checks if a variation title represents colors
 */
export function isColorVariationName(name: string): boolean {
  if (!name) return false;
  const lower = name.toLowerCase();
  return (
    lower.includes('color') ||
    lower.includes('shade') ||
    lower.includes('finish') ||
    lower.includes('tint') ||
    lower.includes('hue')
  );
}

/**
 * Splits comma-separated option strings safely into individual trimmed options.
 * E.g. "XL, XX, SM" -> ["XL", "XX", "SM"]
 * Preserves parenthesized color codes like "Blush Pink (#FFB5DB), Pearl Cream (#FFF8DC)"
 */
export function splitCommaOptions(raw: string): string[] {
  if (!raw) return [];
  const parts = raw.split(/,(?![^(]*\))/);
  return parts
    .map(p => p.trim())
    .filter(Boolean);
}

/**
 * Normalizes an array of variation options, expanding any comma-separated entries.
 */
export function normalizeVariationOptions(options: string[]): string[] {
  if (!options || !Array.isArray(options)) return [];
  const result: string[] = [];
  for (const opt of options) {
    const split = splitCommaOptions(opt);
    for (const item of split) {
      if (item && !result.includes(item)) {
        result.push(item);
      }
    }
  }
  return result;
}


