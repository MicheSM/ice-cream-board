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
  /** Icon of the main ingredient: a chosen one, 'none', or missing = guessed from the name. */
  icon?: IngredientId | 'none';
}

/** The ingredients we have an icon for (see src/model/ingredients.ts). */
export type IngredientId =
  | 'limone'
  | 'arancia'
  | 'fragola'
  | 'frutti-di-bosco'
  | 'mirtillo'
  | 'ciliegia'
  | 'pesca'
  | 'banana'
  | 'mela'
  | 'anguria'
  | 'cocco'
  | 'nocciola'
  | 'mandorla'
  | 'pistacchio'
  | 'cioccolato'
  | 'caffe'
  | 'latte'
  | 'uovo'
  | 'vaniglia'
  | 'yogurt'
  | 'liquirizia'
  | 'menta'
  | 'caramello'
  | 'miele'
  | 'biscotto'
  | 'torta'
  | 'cono';

/** Random offsets in [-1, 1], used when the "natural" effect is on. */
export interface Jitter {
  x: number;
  y: number;
  r: number;
}

export interface Placement {
  flavorId: FlavorId;
  jitter: Jitter;
}

/** Where the cards are. How they look is in StyleConfig. */
export interface BoardConfig {
  rows: number;
  cols: number;
  /** Key is cellKey(row, col). Empty cells have no entry. */
  cells: Record<string, Placement>;
}

export type FontId =
  | 'patrick-hand'
  | 'gochi-hand'
  | 'kalam'
  | 'caveat'
  | 'bebas-neue'
  | 'amatic-sc'
  | 'fredoka'
  | 'nunito'
  | 'josefin-sans'
  | 'jost'
  | 'league-spartan';

export type ThemeId =
  | 'classica'
  | 'lavagna'
  | 'pastello'
  | 'argento'
  | 'carta'
  | 'fondente'
  | 'tavoletta'
  | 'etichetta';

/** Everything the user can tune on top of a preset. Each preset has its own defaults. */
export interface Tunables {
  frame: boolean;
  /** Band at the top with the shop logo and the title. */
  header: boolean;
  /** Slightly rotated and offset cards, like they were stuck on by hand. */
  natural: boolean;
  /** Card size as a fraction of its grid cell (same for every card). */
  cardScale: number;
  /** Id of one of the preset's background swatches. */
  background: string;
  /** Id of one of the preset's card swatches. */
  card: string;
  majorFont: FontId;
  minorFont: FontId;
  majorUppercase: boolean;
  leafIcon: boolean;
  /** Small drawing of the flavour's main ingredient on each card. */
  ingredientIcon: boolean;
}

export interface StyleConfig {
  theme: ThemeId;
  /** Only what the user changed, per preset. Missing keys use the preset's defaults. */
  overrides: Partial<Record<ThemeId, Partial<Tunables>>>;
  /** Title shown in the header band. */
  title: string;
}

export interface AppData {
  flavors: Flavor[];
  board: BoardConfig;
  style: StyleConfig;
}

export const cellKey = (row: number, col: number) => `${row}-${col}`;
