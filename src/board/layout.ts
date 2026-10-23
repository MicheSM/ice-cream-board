import type { BoardConfig, Jitter } from '../model/types';

// The board is always laid out in this fixed coordinate space ("logical
// pixels") and then scaled to the real screen. 16:9 like the monitor and the
// Chromecast output, so nothing gets letterboxed.
export const BOARD_W = 1920;
export const BOARD_H = 1080;
export const HEADER_H = 150;
const PADDING = 30;

// Natural effect: max rotation (degrees) and max offset (fraction of the cell).
const NATURAL_ROT = 1.3;
const NATURAL_SHIFT = 0.025;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** What shapes the grid: the frame thickness (0 = no frame) and the header band. */
export interface Chrome {
  frame: number;
  header: boolean;
}

/** The area inside the frame (where the background is drawn). */
export function innerArea(chrome: Chrome): Rect {
  const f = chrome.frame;
  return { x: f, y: f, w: BOARD_W - 2 * f, h: BOARD_H - 2 * f };
}

/** Where the grid lives: inside the frame, below the header, minus some padding. */
export function gridArea(chrome: Chrome): Rect {
  const inner = innerArea(chrome);
  const top = chrome.header ? HEADER_H : 0;
  return { x: inner.x + PADDING, y: inner.y + top + PADDING, w: inner.w - 2 * PADDING, h: inner.h - top - 2 * PADDING };
}

export function cellRect(board: BoardConfig, chrome: Chrome, row: number, col: number): Rect {
  const a = gridArea(chrome);
  const w = a.w / board.cols;
  const h = a.h / board.rows;
  return { x: a.x + col * w, y: a.y + row * h, w, h };
}

export function cardSize(board: BoardConfig, chrome: Chrome, scale: number): { w: number; h: number } {
  const a = gridArea(chrome);
  return { w: (a.w / board.cols) * scale, h: (a.h / board.rows) * scale };
}

export type CardKind = 'cardboard' | 'polaroid' | 'chalk' | 'rounded';

/**
 * Where things go inside a card (card coordinates):
 *  - major/minor: the two text slots when the card has a minor text;
 *  - solo: the major's slot when there is no minor;
 *  - window: the "photo" area of a polaroid;
 *  - leaf: the vegan icon. When it's shown, the text slot it sits next to
 *    gets narrower on *both* sides, so text stays centred and never touches it.
 */
export interface CardLayout {
  major: Rect;
  minor: Rect;
  solo: Rect;
  window?: Rect;
  leaf: Rect;
}

const MAJOR_SHARE = 0.56;

const narrower = (r: Rect, by: number): Rect => ({ ...r, x: r.x + by, w: r.w - 2 * by });

export function cardLayout(kind: CardKind, size: { w: number; h: number }, leaf: boolean): CardLayout {
  const { w, h } = size;
  if (kind === 'polaroid') {
    // White border, a "photo" window with the name, the minor and the leaf on the strip below.
    const b = h * 0.075;
    const window = { x: b, y: b, w: w - 2 * b, h: h * 0.64 };
    const px = window.w * 0.07;
    const py = window.h * 0.12;
    const major = { x: window.x + px, y: window.y + py, w: window.w - 2 * px, h: window.h - 2 * py };
    const stripTop = window.y + window.h;
    const stripH = h - stripTop;
    const L = h * 0.17;
    const leafRect = { x: w - b * 1.4 - L, y: stripTop + (stripH - L) / 2, w: L, h: L };
    let minor = { x: b * 2, y: stripTop + h * 0.035, w: w - 4 * b, h: stripH - h * 0.07 };
    if (leaf) minor = narrower(minor, Math.max(0, minor.x + minor.w - leafRect.x) + h * 0.02);
    return { major, minor, solo: major, window, leaf: leafRect };
  }
  const px = w * 0.07;
  const py = h * 0.1;
  const content = { x: px, y: py, w: w - 2 * px, h: h - 2 * py };
  const L = h * 0.16;
  const leafRect = { x: w - w * 0.025 - L, y: h * 0.06, w: L, h: L };
  const reserve = leaf ? Math.max(0, content.x + content.w - leafRect.x) + h * 0.015 : 0;
  const major = { ...content, h: content.h * MAJOR_SHARE };
  return {
    major: narrower(major, reserve),
    minor: { ...content, y: content.y + content.h * MAJOR_SHARE, h: content.h * (1 - MAJOR_SHARE) },
    solo: narrower(content, reserve),
    leaf: leafRect,
  };
}

/** Turns a card's stored random numbers into an actual offset and rotation. */
export function jitterTransform(j: Jitter, natural: boolean, cell: Rect) {
  if (!natural) return { dx: 0, dy: 0, rot: 0 };
  return { dx: j.x * NATURAL_SHIFT * cell.w, dy: j.y * NATURAL_SHIFT * cell.h, rot: j.r * NATURAL_ROT };
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

/** A wobbly rectangle outline, like one drawn with chalk, as an SVG path in a w×h box. */
export function chalkOutline(seed: string, w: number, h: number): string {
  const rnd = seededRandom(seed);
  const m = 6;
  const pts: Array<[number, number]> = [];
  const wob = () => (rnd() - 0.5) * 5;
  const steps = 6;
  for (let i = 0; i <= steps; i++) pts.push([m + ((w - 2 * m) * i) / steps + wob(), m + wob()]);
  for (let i = 1; i <= steps; i++) pts.push([w - m + wob(), m + ((h - 2 * m) * i) / steps + wob()]);
  for (let i = steps - 1; i >= 0; i--) pts.push([m + ((w - 2 * m) * i) / steps + wob(), h - m + wob()]);
  for (let i = steps - 1; i >= 1; i--) pts.push([m + wob(), m + ((h - 2 * m) * i) / steps + wob()]);
  return `M${pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L')} Z`;
}
