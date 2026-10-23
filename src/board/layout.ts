import type { BoardConfig, Jitter, NaturalLevel } from '../model/types';

// The board is always laid out in this fixed coordinate space ("logical
// pixels") and then scaled to the real screen. 16:9 like the monitor and the
// Chromecast output, so nothing gets letterboxed.
export const BOARD_W = 1920;
export const BOARD_H = 1080;
export const FRAME = 64;
const PADDING = 30;

/** Fraction of the card kept free around the text. */
export const CARD_PAD_X = 0.07;
export const CARD_PAD_Y = 0.1;

// Per natural level: max rotation (degrees) and max offset (fraction of the cell).
const ROT_PER_LEVEL = 1.3;
const SHIFT_PER_LEVEL = 0.025;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Where the grid lives: inside the frame (if any), minus some padding. */
export function gridArea(frame: boolean): Rect {
  const inset = (frame ? FRAME : 0) + PADDING;
  return { x: inset, y: inset, w: BOARD_W - 2 * inset, h: BOARD_H - 2 * inset };
}

export function cellRect(board: BoardConfig, row: number, col: number): Rect {
  const a = gridArea(board.frame);
  const w = a.w / board.cols;
  const h = a.h / board.rows;
  return { x: a.x + col * w, y: a.y + row * h, w, h };
}

export function cardSize(board: BoardConfig): { w: number; h: number } {
  const a = gridArea(board.frame);
  return { w: (a.w / board.cols) * board.cardScale, h: (a.h / board.rows) * board.cardScale };
}

/** The space available for text inside a card. */
export function textBox(card: { w: number; h: number }) {
  return { w: card.w * (1 - 2 * CARD_PAD_X), h: card.h * (1 - 2 * CARD_PAD_Y) };
}

/** Turns a card's stored random numbers into an actual offset and rotation. */
export function jitterTransform(j: Jitter, level: NaturalLevel, cell: Rect) {
  return {
    dx: j.x * level * SHIFT_PER_LEVEL * cell.w,
    dy: j.y * level * SHIFT_PER_LEVEL * cell.h,
    rot: j.r * level * ROT_PER_LEVEL,
  };
}

/** Small deterministic random generator: the same seed always gives the same sequence. */
export function seededRandom(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), h | 1);
    h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A slightly irregular quadrilateral, like cardboard cut with scissors.
 * Stable per card (seeded by its id), as a CSS clip-path.
 */
export function handCutClip(seed: string): string {
  const rnd = seededRandom(seed);
  const d = () => (rnd() * 0.9).toFixed(2);
  return `polygon(${d()}% ${d()}%, calc(100% - ${d()}%) ${d()}%, calc(100% - ${d()}%) calc(100% - ${d()}%), ${d()}% calc(100% - ${d()}%))`;
}
