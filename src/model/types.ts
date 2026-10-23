// The data the app stores. Everything else (sizes, colours, positions on
// screen) is derived from this at render time.

export type FlavorId = string;

export interface Flavor {
  id: FlavorId;
  /** Main text, e.g. the Italian name ("LIMONE"). */
  major: string;
  /** Secondary text, e.g. the English name. May be empty. */
  minor: string;
  vegan: boolean;
  soldOut: boolean;
}

/** Random offsets in [-1, 1], scaled by the board's "natural" level. */
export interface Jitter {
  x: number;
  y: number;
  r: number;
}

export interface Placement {
  flavorId: FlavorId;
  jitter: Jitter;
}

/** 0 = precise, 1..3 = increasingly natural (rotated, offset) placement. */
export type NaturalLevel = 0 | 1 | 2 | 3;

export interface BoardConfig {
  rows: number;
  cols: number;
  /** Key is cellKey(row, col). Empty cells have no entry. */
  cells: Record<string, Placement>;
  /** Card size as a fraction of its grid cell (same for every card). */
  cardScale: number;
  natural: NaturalLevel;
  frame: boolean;
}

export type FontId = 'patrick-hand' | 'gochi-hand' | 'kalam' | 'caveat';

export interface StyleConfig {
  majorFont: FontId;
  minorFont: FontId;
  majorUppercase: boolean;
  leafIcon: boolean;
}

export interface AppData {
  flavors: Flavor[];
  board: BoardConfig;
  style: StyleConfig;
}

export const cellKey = (row: number, col: number) => `${row}-${col}`;
