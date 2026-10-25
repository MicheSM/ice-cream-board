import type { StyleConfig, ThemeId, Tunables } from './types';

// The "sane defaults" of every preset. The visuals that go with them (colours,
// textures, card shapes) live in src/board/themes.ts.

// Gallery order: the real board first, then the styles inspired by the shop's logo.
export const THEME_IDS: ThemeId[] = ['classica', 'carta', 'fondente', 'tavoletta', 'etichetta', 'argento', 'lavagna', 'pastello'];

export const DEFAULT_TITLE = 'I nostri gusti';

export const THEME_DEFAULTS: Record<ThemeId, Tunables> = {
  classica: {
    frame: true,
    header: false,
    natural: true,
    cardScale: 0.94,
    background: 'rosso',
    card: 'cartone',
    majorFont: 'patrick-hand',
    minorFont: 'patrick-hand',
    majorUppercase: true,
    leafIcon: true,
    ingredientIcon: false,
  },
  argento: {
    frame: true,
    header: true,
    natural: true,
    cardScale: 0.9,
    background: 'crema',
    card: 'cioccolato',
    majorFont: 'bebas-neue',
    minorFont: 'caveat',
    majorUppercase: true,
    leafIcon: true,
    ingredientIcon: false,
  },
  lavagna: {
    frame: true,
    header: false,
    natural: true,
    cardScale: 0.94,
    background: 'ardesia',
    card: 'gesso',
    majorFont: 'amatic-sc',
    minorFont: 'caveat',
    majorUppercase: true,
    leafIcon: true,
    ingredientIcon: false,
  },
  pastello: {
    frame: false,
    header: true,
    natural: false,
    cardScale: 0.9,
    background: 'menta',
    card: 'bianco',
    majorFont: 'fredoka',
    minorFont: 'nunito',
    majorUppercase: false,
    leafIcon: true,
    ingredientIcon: false,
  },
  carta: {
    frame: true,
    header: true,
    natural: false,
    cardScale: 0.92,
    background: 'crema',
    card: 'filetti',
    majorFont: 'josefin-sans',
    minorFont: 'jost',
    majorUppercase: true,
    leafIcon: true,
    ingredientIcon: false,
  },
  fondente: {
    frame: true,
    header: true,
    natural: false,
    cardScale: 0.88,
    background: 'fondente',
    card: 'oro',
    majorFont: 'jost',
    minorFont: 'jost',
    majorUppercase: true,
    leafIcon: true,
    ingredientIcon: false,
  },
  tavoletta: {
    frame: true,
    header: true,
    natural: false,
    cardScale: 0.97,
    background: 'fondente',
    card: 'fondente',
    majorFont: 'league-spartan',
    minorFont: 'caveat',
    majorUppercase: true,
    leafIcon: true,
    ingredientIcon: false,
  },
  etichetta: {
    frame: false,
    header: true,
    natural: false,
    cardScale: 0.86,
    background: 'rovere',
    card: 'bianca',
    majorFont: 'league-spartan',
    minorFont: 'jost',
    majorUppercase: true,
    leafIcon: true,
    ingredientIcon: false,
  },
};

/** The tunables in effect: the preset's defaults with the user's changes on top. */
export const resolveTunables = (style: StyleConfig): Tunables => ({
  ...THEME_DEFAULTS[style.theme],
  ...style.overrides[style.theme],
});

export const hasOverrides = (style: StyleConfig, theme: ThemeId = style.theme) =>
  Object.keys(style.overrides[theme] ?? {}).length > 0;
