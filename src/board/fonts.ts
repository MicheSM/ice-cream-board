// Fonts come from Fontsource: each is an npm package with the font files and
// an @font-face rule, so Vite bundles them into the app and the board never
// needs an internet connection. Only the "latin" subset (which covers
// Italian accents) and the regular weight are included. All are under the
// SIL Open Font License.
import '@fontsource/patrick-hand/latin-400.css';
import '@fontsource/gochi-hand/latin-400.css';
import '@fontsource/kalam/latin-400.css';
import '@fontsource/caveat/latin-400.css';
import type { FontId } from '../model/types';

export const FONTS: Record<FontId, { label: string; family: string }> = {
  'patrick-hand': { label: 'Pennarello (Patrick Hand)', family: 'Patrick Hand' },
  'gochi-hand': { label: 'Gessetto (Gochi Hand)', family: 'Gochi Hand' },
  kalam: { label: 'Penna (Kalam)', family: 'Kalam' },
  caveat: { label: 'Corsivo (Caveat)', family: 'Caveat' },
};
