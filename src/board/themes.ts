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
  HAMMERED_SILVER,
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
  header: { font: FontId; color: string; rule: string };
  /** Erode the text with noise so it looks written in chalk. */
  chalkText?: boolean;
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
    name: 'Argento',
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
};

/** The swatch with this id, or the first one if the id is unknown (e.g. renamed in an update). */
export const swatch = <T extends { id: string }>(list: T[], id: string): T => list.find((s) => s.id === id) ?? list[0];

/** Frame thickness and header: what decides where the grid goes. */
export function chromeOf(style: StyleConfig): Chrome {
  const t = resolveTunables(style);
  return { frame: t.frame ? THEMES[style.theme].frame.width : 0, header: t.header };
}
