// Fonts come from Fontsource: each is an npm package with the font files and
// an @font-face rule, so Vite bundles them into the app and the board never
// needs an internet connection. Only the "latin" subset (which covers
// Italian accents) and the one weight we use are included. All are under the
// SIL Open Font License.
import '@fontsource/patrick-hand/latin-400.css';
import '@fontsource/gochi-hand/latin-400.css';
import '@fontsource/kalam/latin-400.css';
import '@fontsource/caveat/latin-400.css';
import '@fontsource/bebas-neue/latin-400.css';
import '@fontsource/amatic-sc/latin-700.css';
import '@fontsource/fredoka/latin-600.css';
import '@fontsource/nunito/latin-600.css';
import '@fontsource/josefin-sans/latin-600.css';
import '@fontsource/jost/latin-500.css';
import '@fontsource/league-spartan/latin-600.css';
import type { CSSProperties } from 'react';
import type { FontId } from '../model/types';

export interface FontSpec {
  label: string;
  family: string;
  weight: number;
  /**
   * Extra space between letters (in em) when the text is in capitals. Clean
   * sans-serif capitals look much more refined with a little air between
   * them; handwriting doesn't need it.
   */
  caps?: number;
}

export const FONTS: Record<FontId, FontSpec> = {
  'patrick-hand': { label: 'Pennarello', family: 'Patrick Hand', weight: 400 },
  'gochi-hand': { label: 'Gessetto', family: 'Gochi Hand', weight: 400 },
  'amatic-sc': { label: 'Lavagna', family: 'Amatic SC', weight: 700 },
  kalam: { label: 'Penna', family: 'Kalam', weight: 400 },
  caveat: { label: 'Corsivo', family: 'Caveat', weight: 400 },
  'bebas-neue': { label: 'Manifesto', family: 'Bebas Neue', weight: 400 },
  fredoka: { label: 'Tondo', family: 'Fredoka', weight: 600 },
  nunito: { label: 'Moderno', family: 'Nunito', weight: 600 },
  'josefin-sans': { label: 'Geometrico', family: 'Josefin Sans', weight: 600, caps: 0.1 },
  jost: { label: 'Essenziale', family: 'Jost', weight: 500, caps: 0.08 },
  'league-spartan': { label: 'Locandina', family: 'League Spartan', weight: 600, caps: 0.04 },
};

/** The CSS `font` shorthand at a given size, e.g. `700 100px "Amatic SC"` (for measuring on a canvas). */
export const cssFont = (f: FontSpec, px: number) => `${f.weight} ${px}px "${f.family}"`;

/**
 * The same font as React style properties. On the page we set family, weight
 * and size separately rather than the `font` shorthand: the shorthand also
 * resets line-height, so updating it would silently undo our line spacing.
 */
export const fontStyle = (f: FontSpec, px: number): CSSProperties => ({
  fontFamily: `"${f.family}"`,
  fontWeight: f.weight,
  fontSize: px,
});

/** Letter spacing (em) for text in this font: only for capitals. */
export const tracking = (f: FontSpec, uppercase: boolean) => (uppercase ? (f.caps ?? 0) : 0);
