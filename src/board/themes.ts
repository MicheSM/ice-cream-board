import type { CSSProperties } from 'react';
import type { FontId, StyleConfig, ThemeId } from '../model/types';
import { resolveTunables } from '../model/themeDefaults';
import type { CardKind, Chrome } from './layout';
import {
  CARD_FIBERS,
  CARD_GRAIN,
  CHALK_DUST,
  CHALK_SMUDGES,
  FINE_GRAIN,
  GOLD_FOIL,
  HAMMERED_SILVER,
  OAK_SLATS,
  PAPER_BLOTCHES,
  PAPER_GRAIN,
  WOOD_H,
  WOOD_V,
} from './textures';

// What each preset looks like. The defaults the user can tune (which
// background, which card colour, fonts, frame on/off...) are in
// src/model/themeDefaults.ts; this file holds the visual building blocks.
//
// Colour rule shared by every preset: vegan = a green ink, not vegan = a
// neutral ink (white, cream or chocolate), so customers learn it once.

export interface Ink {
  vegan: string;
  regular: string;
  /** Inks for the minor text, when different (e.g. written on a polaroid's white strip). */
  minorVegan?: string;
  minorRegular?: string;
  leaf: string;
  /** CSS text-shadow, e.g. to make text look printed into chocolate. */
  shadow?: string;
  /** Ingredient icon of non-vegan flavours (default: the name's colour). */
  icon?: string;
}

export interface BackgroundSwatch {
  id: string;
  label: string;
  /** Colour shown in the editor's swatch button. */
  dot: string;
  css: CSSProperties;
}

export interface CardSwatch {
  id: string;
  label: string;
  dot: string;
  /** CSS background of the card (or of the polaroid's photo window). */
  surface: string;
  ink: Ink;
  /** Chalk only: draw a hand-drawn rectangle around the text. */
  outline?: boolean;
  /**
   * Framed only: the border, like the logo's. `color` is a CSS image (a
   * gradient, so it can look like metal), `width` a fraction of the card
   * height; `inner` adds a second, thin line just inside it.
   */
  border?: { color: string; width: number; inner?: string };
  /** CSS box-shadow of the card. */
  shadow?: string;
  /** Menu only: thin lines between the flavours (in a column) or between the columns. */
  dividers?: { color: string; rows?: boolean; columns?: boolean };
}

export interface ThemeVisual {
  id: ThemeId;
  name: string;
  description: string;
  kind: CardKind;
  frame: {
    width: number;
    css: CSSProperties;
    /** Different background for the left/right sides (e.g. wood grain running vertically). */
    sideCss?: CSSProperties;
    /** Shadow/border drawn by the background onto the frame. */
    innerShadow: (bg: BackgroundSwatch) => string;
  };
  backgrounds: BackgroundSwatch[];
  cards: CardSwatch[];
  /** What the card choice is called in the editor (default "Cartoncini"). */
  cardsLabel?: string;
  header: {
    font: FontId;
    color: string;
    rule: string;
    ruleHeight?: number;
    uppercase?: boolean;
    /** A strip across the whole board behind the header, like the paper band round a chocolate bar. */
    band?: CSSProperties;
  };
  /** Erode the text with noise so it looks written in chalk. */
  chalkText?: boolean;
  /** Draw empty cards in empty cells too (a chocolate bar has all its squares). */
  fillEmpty?: boolean;
}

const paper = (id: string, label: string, color: string): BackgroundSwatch => ({
  id,
  label,
  dot: color,
  css: {
    backgroundColor: color,
    backgroundImage: `${PAPER_GRAIN}, ${PAPER_BLOTCHES}, radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,.22))`,
    backgroundSize: '256px 256px, 1024px 1024px, 100% 100%',
  },
});

const slate = (id: string, label: string, color: string): BackgroundSwatch => ({
  id,
  label,
  dot: color,
  css: {
    backgroundColor: color,
    backgroundImage: `${CHALK_DUST}, ${CHALK_SMUDGES}, radial-gradient(ellipse at 50% 40%, rgba(255,255,255,.05), rgba(0,0,0,.35))`,
    backgroundSize: '256px 256px, 1024px 1024px, 100% 100%',
  },
});

const pastel = (id: string, label: string, color: string): BackgroundSwatch => ({
  id,
  label,
  dot: color,
  css: {
    backgroundColor: color,
    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.55) 2.5px, transparent 3px)',
    backgroundSize: '34px 34px',
  },
});

const cream = (id: string, label: string, color: string): BackgroundSwatch => ({
  id,
  label,
  dot: color,
  css: { backgroundColor: color, backgroundImage: FINE_GRAIN, backgroundSize: '200px 200px' },
});

/** Dark backgrounds: a soft light from above and darker corners. */
const dark = (id: string, label: string, color: string): BackgroundSwatch => ({
  id,
  label,
  dot: color,
  css: {
    backgroundColor: color,
    backgroundImage: `${FINE_GRAIN}, radial-gradient(ellipse at 50% 30%, rgba(255,225,180,.08), rgba(0,0,0,.4))`,
    backgroundSize: '200px 200px, 100% 100%',
  },
});

// The logo's colours: chocolate brown, gold, silver.
const CHOCOLATE = '#5a3518';
const GOLD = 'linear-gradient(135deg, #a77b3c 0%, #e6c98e 22%, #b88a46 45%, #f2dcaa 68%, #a2773a 100%)';
const GOLD_LINE = '#bf9655';
const SILVER = '#a9a9a7';

const CARDBOARD_INK: Ink = { vegan: '#9edcaa', regular: '#f3f0e7', leaf: '#9edcaa' };
const cardboard = (id: string, label: string, color: string): CardSwatch => ({
  id,
  label,
  dot: color,
  surface: `${CARD_GRAIN}, ${CARD_FIBERS}, linear-gradient(160deg, rgba(255,255,255,.04), rgba(0,0,0,.12)), ${color}`,
  ink: CARDBOARD_INK,
});

const POLAROID_INK: Ink = {
  vegan: '#b9e6a9',
  regular: '#f7e9d5',
  minorVegan: '#3d7d44',
  minorRegular: '#5a3626',
  leaf: '#b9e6a9',
};

const CHALK_INK: Ink = { vegan: '#bfe8b4', regular: '#f2f0ea', leaf: '#bfe8b4' };
const PASTEL_INK: Ink = { vegan: '#2f7d4f', regular: '#3b2a24', leaf: '#46a06a' };

/** On light paper: chocolate names, gold or silver subtitles. */
const PAPER_INK: Ink = { vegan: '#3c7a43', regular: CHOCOLATE, minorVegan: '#5b955c', minorRegular: '#a27a43', leaf: '#4c9652', icon: '#a27a43' };
const LABEL_INK: Ink = { ...PAPER_INK, minorRegular: '#8b8b89' };
/** On dark chocolate: cream names, gold subtitles. */
const DARK_INK: Ink = { vegan: '#acdb9d', regular: '#f4ead9', minorVegan: '#93c886', minorRegular: '#cfa96a', leaf: '#acdb9d', icon: '#cfa96a' };
/** Printed on a chocolate square: a little shadow presses the letters in. */
const TABLET_INK: Ink = { ...DARK_INK, regular: '#f3e4cc', shadow: '0 2px 1px rgba(0,0,0,.45)' };
const WHITE_TABLET_INK: Ink = { ...PAPER_INK, minorRegular: '#86612c', shadow: '0 1px 0 rgba(255,255,255,.7)' };

const solid = (c: string) => `linear-gradient(${c}, ${c})`;

export const THEMES: Record<ThemeId, ThemeVisual> = {
  classica: {
    id: 'classica',
    name: 'Classica',
    description: 'Come la lavagna vera: cornice argento martellato, carta rossa, cartoncini scritti a mano.',
    kind: 'cardboard',
    frame: {
      width: 64,
      css: {
        backgroundColor: '#c4c7cc',
        backgroundImage: `linear-gradient(135deg, rgba(255,255,255,.35), rgba(255,255,255,0) 40%, rgba(0,0,0,.18)), ${HAMMERED_SILVER}`,
        backgroundSize: '100% 100%, 240px 240px',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.7), inset 0 0 10px rgba(0,0,0,.45)',
      },
      innerShadow: () => '0 0 0 2px rgba(70,70,75,.55), inset 3px 4px 14px rgba(0,0,0,.5)',
    },
    backgrounds: [
      paper('rosso', 'Rosso', '#cd3a2a'),
      paper('bordeaux', 'Bordeaux', '#7c1f2b'),
      paper('blu', 'Blu notte', '#1f2e4d'),
      paper('verde', 'Verde bosco', '#1f4a38'),
      paper('kraft', 'Kraft', '#b98d5c'),
    ],
    cards: [
      cardboard('cartone', 'Cartoncino marrone', '#2c2320'),
      cardboard('nero', 'Cartoncino nero', '#1b1a1a'),
      cardboard('ardesia', 'Grigio ardesia', '#383b40'),
    ],
    header: { font: 'patrick-hand', color: '#f3f0e7', rule: 'rgba(243,240,231,.55)' },
  },

  argento: {
    id: 'argento',
    name: 'Polaroid',
    description: 'Ispirata al logo e alla locandina: oro, argento e cioccolato, gusti come polaroid.',
    kind: 'polaroid',
    frame: {
      width: 30,
      css: {
        background: 'linear-gradient(135deg, #a77b3c 0%, #e6c98e 22%, #b88a46 45%, #f2dcaa 68%, #a2773a 100%)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.4)',
      },
      // Like the logo's badge: gold border, a gap, then a thin silver line.
      innerShadow: (bg) => `0 0 0 9px ${bg.dot}, 0 0 0 12px #aeb2b8`,
    },
    backgrounds: [
      cream('crema', 'Crema', '#f8f4ec'),
      cream('bianco', 'Bianco', '#fdfcfa'),
      cream('nocciola', 'Nocciola', '#eadbc5'),
      cream('cacao', 'Cacao', '#3a2318'),
    ],
    cards: [
      {
        id: 'cioccolato',
        label: 'Cioccolato al latte',
        dot: '#5b3828',
        surface: `${CARD_GRAIN}, linear-gradient(160deg, #6a4330, #3f2419)`,
        ink: POLAROID_INK,
      },
      {
        id: 'fondente',
        label: 'Fondente',
        dot: '#2a1912',
        surface: `${CARD_GRAIN}, linear-gradient(160deg, #3b2419, #1d100b)`,
        ink: POLAROID_INK,
      },
    ],
    header: { font: 'bebas-neue', color: '#c98f52', rule: '#c9a063' },
  },

  lavagna: {
    id: 'lavagna',
    name: 'Lavagna',
    description: 'Lavagna d’ardesia con cornice di legno, scritte a gesso.',
    kind: 'chalk',
    frame: {
      width: 56,
      css: {
        backgroundColor: '#7a5232',
        backgroundImage: WOOD_H,
        backgroundSize: '600px 600px',
        boxShadow: 'inset 0 0 0 2px rgba(255,225,180,.25), inset 0 0 14px rgba(0,0,0,.55)',
      },
      sideCss: { backgroundImage: WOOD_V },
      innerShadow: () => '0 0 0 3px rgba(40,25,12,.6), inset 4px 5px 18px rgba(0,0,0,.6)',
    },
    backgrounds: [
      slate('ardesia', 'Ardesia', '#2b2f30'),
      slate('verde', 'Verde scuola', '#28433a'),
      slate('blu', 'Blu', '#243040'),
    ],
    cards: [
      { id: 'gesso', label: 'Riquadri a gesso', dot: '#f2f0ea', surface: 'transparent', ink: CHALK_INK, outline: true },
      { id: 'libero', label: 'Solo scritte', dot: '#8d918f', surface: 'transparent', ink: CHALK_INK },
    ],
    header: { font: 'amatic-sc', color: '#f2f0ea', rule: 'rgba(242,240,234,.45)' },
    chalkText: true,
  },

  pastello: {
    id: 'pastello',
    name: 'Pastello',
    description: 'Moderna e luminosa: colori pastello, cartoncini bianchi arrotondati.',
    kind: 'rounded',
    frame: {
      width: 26,
      css: { background: '#ffffff', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.06)' },
      innerShadow: () => 'inset 0 2px 12px rgba(0,0,0,.08)',
    },
    backgrounds: [
      pastel('menta', 'Menta', '#cdeee0'),
      pastel('rosa', 'Fragola', '#f9d7dd'),
      pastel('crema', 'Crema', '#fbefd9'),
      pastel('azzurro', 'Azzurro', '#d3e8f6'),
      pastel('lavanda', 'Lavanda', '#e2dbf3'),
    ],
    cards: [
      { id: 'bianco', label: 'Bianco', dot: '#ffffff', surface: '#ffffff', ink: PASTEL_INK },
      { id: 'panna', label: 'Panna', dot: '#fff8ea', surface: '#fff8ea', ink: PASTEL_INK },
    ],
    header: { font: 'fredoka', color: '#3b2a24', rule: 'rgba(59,42,36,.22)' },
  },

  carta: {
    id: 'carta',
    name: 'Carta',
    description: 'Come un menù stampato: niente cartoncini, solo i nomi in colonna su carta chiara, filetti d’oro.',
    kind: 'menu',
    frame: {
      width: 44,
      // A margin of the same paper, with a thick-and-thin gold rule.
      css: { backgroundImage: FINE_GRAIN, backgroundSize: '200px 200px' },
      innerShadow: (bg) => `0 0 0 1.5px ${GOLD_LINE}, 0 0 0 7px ${bg.dot}, 0 0 0 8px ${GOLD_LINE}`,
    },
    backgrounds: [
      cream('crema', 'Crema', '#f7f2ea'),
      cream('bianco', 'Bianco', '#fcfbf8'),
      cream('perla', 'Grigio perla', '#e9e7e2'),
      cream('nocciola', 'Nocciola', '#ecdfcb'),
    ],
    cards: [
      { id: 'filetti', label: 'Filetti tra i gusti', dot: GOLD_LINE, surface: 'transparent', ink: PAPER_INK, dividers: { color: GOLD_LINE, rows: true } },
      { id: 'colonne', label: 'Linee tra le colonne', dot: '#d9c39b', surface: 'transparent', ink: PAPER_INK, dividers: { color: GOLD_LINE, columns: true } },
      { id: 'semplice', label: 'Solo scritte', dot: '#ffffff', surface: 'transparent', ink: PAPER_INK },
    ],
    cardsLabel: 'Decorazione',
    header: { font: 'josefin-sans', color: CHOCOLATE, rule: GOLD_LINE, ruleHeight: 1.5, uppercase: true },
  },

  fondente: {
    id: 'fondente',
    name: 'Fondente',
    description: 'Scura come il cioccolato fondente, cornice d’oro e riquadri sottili come quelli del logo.',
    kind: 'framed',
    frame: {
      width: 22,
      css: { background: GOLD, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.35)' },
      // Like the logo: gold, a gap, then a thin silver line.
      innerShadow: (bg) => `0 0 0 2px ${SILVER}, 0 0 0 9px ${bg.dot}`,
    },
    backgrounds: [
      dark('fondente', 'Fondente', '#2b1a12'),
      dark('cacao', 'Cacao', '#3d261a'),
      dark('nero', 'Nero caffè', '#171311'),
      dark('notte', 'Blu notte', '#1a2232'),
    ],
    cards: [
      {
        id: 'oro',
        label: 'Oro e argento',
        dot: '#c9a063',
        surface: 'transparent',
        ink: DARK_INK,
        border: { color: GOLD, width: 0.012, inner: 'rgba(169,169,167,.6)' },
      },
      { id: 'filo', label: 'Filo d’oro', dot: '#8a6a3c', surface: 'transparent', ink: DARK_INK, border: { color: solid('#b38c52'), width: 0.008 } },
      { id: 'libero', label: 'Senza riquadri', dot: '#3d261a', surface: 'transparent', ink: DARK_INK },
    ],
    cardsLabel: 'Riquadri',
    header: { font: 'jost', color: '#d8b679', rule: '#a8834b', ruleHeight: 1.5, uppercase: true },
  },

  tavoletta: {
    id: 'tavoletta',
    name: 'Tavoletta',
    description: 'Una tavoletta di cioccolato artigianale nella carta d’oro: ogni quadretto è un gusto.',
    kind: 'tablet',
    frame: {
      width: 58,
      css: {
        backgroundColor: '#c9a061',
        backgroundImage: `linear-gradient(135deg, rgba(255,255,255,.2), rgba(255,255,255,0) 45%, rgba(60,30,0,.18)), linear-gradient(rgba(201,160,97,.3), rgba(201,160,97,.3)), ${GOLD_FOIL}`,
        backgroundSize: '100% 100%, 100% 100%, 300px 300px',
        boxShadow: 'inset 0 0 14px rgba(90,55,10,.5)',
      },
      innerShadow: () => '0 0 0 2px rgba(60,35,15,.55), 0 5px 18px rgba(0,0,0,.55)',
    },
    backgrounds: [
      dark('fondente', 'Fondente', '#24130b'),
      dark('latte', 'Al latte', '#3c2214'),
      cream('bianco', 'Bianco', '#d8c6a4'),
    ],
    cards: [
      {
        id: 'fondente',
        label: 'Fondente',
        dot: '#3b2216',
        surface: 'linear-gradient(155deg, rgba(255,255,255,.07), rgba(255,255,255,0) 45%), linear-gradient(160deg, #4a2b1b, #2f1a10)',
        ink: TABLET_INK,
      },
      {
        id: 'latte',
        label: 'Al latte',
        dot: '#6b4029',
        surface: 'linear-gradient(155deg, rgba(255,255,255,.08), rgba(255,255,255,0) 45%), linear-gradient(160deg, #7a4a30, #573220)',
        ink: TABLET_INK,
      },
      {
        id: 'bianco',
        label: 'Cioccolato bianco',
        dot: '#f1e6d0',
        surface: 'linear-gradient(155deg, rgba(255,255,255,.4), rgba(255,255,255,0) 45%), linear-gradient(160deg, #f5ecda, #e3d2b2)',
        ink: WHITE_TABLET_INK,
      },
    ],
    cardsLabel: 'Cioccolato',
    header: {
      font: 'league-spartan',
      color: CHOCOLATE,
      rule: GOLD_LINE,
      ruleHeight: 2,
      uppercase: true,
      band: {
        backgroundColor: '#f6f0e4',
        backgroundImage: `${FINE_GRAIN}, linear-gradient(rgba(255,255,255,.5), rgba(0,0,0,.06))`,
        backgroundSize: '200px 200px, 100% 100%',
        boxShadow: '0 4px 10px rgba(0,0,0,.45), inset 0 -1px 0 rgba(0,0,0,.12)',
      },
    },
    fillEmpty: true,
  },

  etichetta: {
    id: 'etichetta',
    name: 'Etichetta',
    description: 'Ogni gusto è un’etichetta come il logo, bianca con bordo d’oro, sul legno della parete del negozio.',
    kind: 'framed',
    frame: {
      width: 26,
      // Brushed steel, like the counter.
      css: {
        background: 'linear-gradient(180deg, #eef0f2, #b7bcc2 40%, #dde0e4 60%, #a6abb2)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.6), inset 0 0 6px rgba(0,0,0,.3)',
      },
      innerShadow: () => '0 0 0 1px rgba(0,0,0,.3), inset 0 3px 14px rgba(0,0,0,.3)',
    },
    backgrounds: [
      {
        id: 'rovere',
        label: 'Rovere, come la parete',
        dot: '#c6a072',
        css: {
          backgroundColor: '#c6a072',
          backgroundImage: `radial-gradient(ellipse at 50% 35%, rgba(255,240,215,.14), rgba(40,20,5,.3)), ${OAK_SLATS}`,
          backgroundSize: '100% 100%, 600px 600px',
        },
      },
      cream('bianco', 'Bianco', '#f4f2ee'),
      cream('grigio', 'Grigio', '#d5d2cc'),
      dark('cioccolato', 'Cioccolato', '#3a2418'),
    ],
    cards: [
      {
        id: 'bianca',
        label: 'Bianca',
        dot: '#fdfcfa',
        surface: '#fdfcfa',
        ink: LABEL_INK,
        border: { color: GOLD, width: 0.035, inner: SILVER },
        shadow: '0 2px 4px rgba(40,25,10,.25), 0 10px 22px rgba(40,25,10,.22)',
      },
      {
        id: 'avorio',
        label: 'Avorio',
        dot: '#f5eddd',
        surface: '#f5eddd',
        ink: LABEL_INK,
        border: { color: GOLD, width: 0.035, inner: SILVER },
        shadow: '0 2px 4px rgba(40,25,10,.25), 0 10px 22px rgba(40,25,10,.22)',
      },
      {
        id: 'cioccolato',
        label: 'Cioccolato',
        dot: '#4a2c1c',
        surface: '#4a2c1c',
        ink: DARK_INK,
        border: { color: GOLD, width: 0.035, inner: 'rgba(169,169,167,.7)' },
        shadow: '0 2px 4px rgba(20,10,5,.35), 0 10px 22px rgba(20,10,5,.3)',
      },
    ],
    cardsLabel: 'Etichette',
    header: {
      font: 'league-spartan',
      color: CHOCOLATE,
      rule: GOLD_LINE,
      ruleHeight: 2,
      uppercase: true,
      // A long white label across the wall, edged in gold like the cards.
      band: {
        background: '#fdfcfa',
        borderBlock: '5px solid',
        borderImage: `${GOLD} 1`,
        boxShadow: '0 2px 4px rgba(40,25,10,.25), 0 10px 22px rgba(40,25,10,.22)',
      },
    },
  },
};

/** The swatch with this id, or the first one if the id is unknown (e.g. renamed in an update). */
export const swatch = <T extends { id: string }>(list: T[], id: string): T => list.find((s) => s.id === id) ?? list[0];

/** Frame thickness and header: what decides where the grid goes. */
export function chromeOf(style: StyleConfig): Chrome {
  const t = resolveTunables(style);
  return { frame: t.frame ? THEMES[style.theme].frame.width : 0, header: t.header };
}
