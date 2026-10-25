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

/**
 * What a flavour looks like:
 *  - cardboard, polaroid, chalk, rounded: a card on the board;
 *  - framed: a card with a thin border and a second line inside it, like the
 *    logo (filled like a label, or just the lines);
 *  - tablet: one square of a chocolate bar;
 *  - menu: no card at all, just the text, like a printed menu.
 */
export type CardKind = 'cardboard' | 'polaroid' | 'chalk' | 'rounded' | 'framed' | 'tablet' | 'menu';

/**
 * Where things go inside a card (card coordinates):
 *  - major/minor: the two text slots when the card has a minor text;
 *  - solo: the major's slot when there is no minor;
 *  - window: the "photo" area of a polaroid;
 *  - leaf: the vegan icon, top right. When it's shown, the text slot next to
 *    it gets narrower on *both* sides, so text stays centred and never
 *    touches it.
 *  - icon: the ingredient icon, in a column on the left; the text is then
 *    centred in the rest of the card.
 *  - inline: the leaf and the icon go in the text line instead, before and
 *    after the name like words; only their sizes count.
 */
export interface CardLayout {
  major: Rect;
  minor: Rect;
  solo: Rect;
  window?: Rect;
  leaf: Rect;
  icon: Rect;
  inline?: boolean;
}

/** Which marks the cards carry: the vegan leaf and the ingredient icon. */
export interface Marks {
  leaf: boolean;
  icon: boolean;
}

const MAJOR_SHARE = 0.56;

/** How thick the drawn edge of a card is (bevel, border), as a fraction of its height. */
const EDGE: Partial<Record<CardKind, number>> = { framed: 0.07, tablet: 0.1 };
/** Space between an inline leaf or icon and the name, as a fraction of the card height. */
export const INLINE_GAP = 0.05;

const narrower = (r: Rect, by: number): Rect => ({ ...r, x: r.x + by, w: r.w - 2 * by });
/** `r` giving up `left` px on its left and `right` px on its right. */
const trimmed = (r: Rect, left: number, right: number): Rect => ({ ...r, x: r.x + left, w: r.w - left - right });

export function cardLayout(kind: CardKind, size: { w: number; h: number }, marks: Marks): CardLayout {
  const { w, h } = size;
  if (kind === 'polaroid') {
    // White border, a "photo" window with the name (and the icon on its left),
    // the minor and the leaf on the strip below.
    const b = h * 0.075;
    const window = { x: b, y: b, w: w - 2 * b, h: h * 0.64 };
    const px = window.w * 0.07;
    const py = window.h * 0.12;
    let major = { x: window.x + px, y: window.y + py, w: window.w - 2 * px, h: window.h - 2 * py };
    const stripTop = window.y + window.h;
    const stripH = h - stripTop;
    const L = h * 0.17;
    const I = h * 0.3;
    const leafRect = { x: w - b * 1.4 - L, y: stripTop + (stripH - L) / 2, w: L, h: L };
    const iconRect = { x: window.x + b, y: window.y + (window.h - I) / 2, w: I, h: I };
    let minor = { x: b * 2, y: stripTop + h * 0.035, w: w - 4 * b, h: stripH - h * 0.07 };
    if (marks.leaf) minor = narrower(minor, Math.max(0, minor.x + minor.w - leafRect.x) + h * 0.02);
    if (marks.icon) major = trimmed(major, Math.max(0, iconRect.x + I + h * 0.04 - major.x), 0);
    return { major, minor, solo: major, window, leaf: leafRect, icon: iconRect };
  }
  const px = w * (kind === 'menu' ? 0.04 : 0.07);
  const py = h * 0.1;
  const content = { x: px, y: py, w: w - 2 * px, h: h - 2 * py };
  const major = { ...content, h: content.h * MAJOR_SHARE };
  const minor = { ...content, y: content.y + content.h * MAJOR_SHARE, h: content.h * (1 - MAJOR_SHARE) };
  const L = h * (kind === 'menu' ? 0.2 : 0.16);
  const I = h * 0.3;

  if (kind === 'menu') {
    // Icon, name and leaf are centred together, so the name only gives up their widths.
    const gap = h * INLINE_GAP;
    const reserve = ((marks.leaf ? L + gap : 0) + (marks.icon ? I + gap : 0)) / 2;
    return {
      major: narrower(major, reserve),
      minor,
      solo: narrower(content, reserve),
      leaf: { x: 0, y: 0, w: L, h: L },
      icon: { x: 0, y: 0, w: I, h: I },
      inline: true,
    };
  }

  // Leaf in the top-right corner, icon on the left, both inside the card's edge.
  const edge = h * (EDGE[kind] ?? 0);
  const inX = Math.max(w * 0.025, edge + h * 0.04);
  const inY = Math.max(h * 0.06, edge + h * 0.04);
  const leafRect = { x: w - inX - L, y: inY, w: L, h: L };
  const iconRect = { x: inX, y: (h - I) / 2, w: I, h: I };
  const leafReserve = marks.leaf ? Math.max(0, content.x + content.w - leafRect.x) + h * 0.015 : 0;
  if (marks.icon) {
    // The text moves right of the icon column; the leaf only needs its own side.
    const left = Math.max(0, iconRect.x + I + h * 0.04 - content.x);
    return {
      major: trimmed(major, left, leafReserve),
      minor: trimmed(minor, left, leafReserve),
      solo: trimmed(content, left, leafReserve),
      leaf: leafRect,
      icon: iconRect,
    };
  }
  return {
    major: narrower(major, leafReserve),
    minor,
    solo: narrower(content, leafReserve),
    leaf: leafRect,
    icon: iconRect,
  };
}

/** Thickness of a chocolate square's bevel, in px. */
export const bevelOf = (size: { w: number; h: number }) => Math.round(Math.min(size.w, size.h) * (EDGE.tablet ?? 0));

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
