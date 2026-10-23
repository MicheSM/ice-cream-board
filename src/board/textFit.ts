// Text fitting: picks a font size (and line breaks) for the major and minor
// text of every card on the board.
//
// Rules:
//  - Each text is laid out on 1 line, or split in 2 lines at a space.
//  - Sizes are consistent across the board: we take the *median* best size of
//    all cards as the board size, so most cards share exactly the same size
//    and only the long names shrink (like "CIOCCOLATO FONDENTE" on the real
//    board).
//  - A card without minor text gives the whole card to the major text, and
//    the major may then grow a bit beyond the board size (SOLO_BOOST).

/** Width of `text` set in `font` at 100px. */
export type Measure = (text: string, font: string) => number;

export interface Box {
  w: number;
  h: number;
}

export interface TextFit {
  lines: string[];
  size: number;
}

export interface CardFit {
  major: TextFit;
  minor: TextFit | null;
}

export const LINE_HEIGHT = 1.08;
/** How much bigger a major-only card may get than the board size. */
export const SOLO_BOOST = 1.3;
/** The minor text is never bigger than this fraction of the major size. */
export const MINOR_MAX_RATIO = 0.72;
/** ...and never bigger than this fraction of the major on the same card. */
const MINOR_MAX_RATIO_CARD = 0.9;
/** A 2-line layout must be this much bigger to win over a 1-line one. */
const PREFER_ONE_LINE = 1.15;
/** Handwritten glyphs overshoot their advance width a little. */
const WIDTH_SAFETY = 0.96;

const EMPTY: TextFit = { lines: [''], size: 0 };

function sizeFor(lines: string[], box: Box, font: string, measure: Measure): number {
  const widest = Math.max(...lines.map((l) => measure(l, font)));
  const byWidth = widest > 0 ? ((box.w * WIDTH_SAFETY) / widest) * 100 : Infinity;
  const byHeight = box.h / (lines.length * LINE_HEIGHT);
  return Math.min(byWidth, byHeight);
}

/** All the ways to lay out `text`: 1 line, then every 2-line split. */
export function candidates(text: string, box: Box, font: string, measure: Measure): TextFit[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [EMPTY];
  const one = [words.join(' ')];
  const out: TextFit[] = [{ lines: one, size: sizeFor(one, box, font, measure) }];
  for (let i = 1; i < words.length; i++) {
    const lines = [words.slice(0, i).join(' '), words.slice(i).join(' ')];
    out.push({ lines, size: sizeFor(lines, box, font, measure) });
  }
  return out;
}

/** The biggest layout, with a bias towards keeping a single line. */
export function bestFit(options: TextFit[]): TextFit {
  const [one, ...two] = options;
  const bestTwo = two.reduce<TextFit | null>((a, b) => (a && a.size >= b.size ? a : b), null);
  return bestTwo && bestTwo.size > one.size * PREFER_ONE_LINE ? bestTwo : one;
}

/** Use `cap` as the size if any layout fits at it (fewest lines first), otherwise the best smaller one. */
export function fitAtCap(options: TextFit[], cap: number): TextFit {
  const fitting = options.filter((o) => o.size >= cap);
  if (fitting.length > 0) {
    const fewest = Math.min(...fitting.map((o) => o.lines.length));
    const best = fitting.filter((o) => o.lines.length === fewest).reduce((a, b) => (a.size >= b.size ? a : b));
    return { lines: best.lines, size: cap };
  }
  return bestFit(options);
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export interface FitOptions {
  /** Text areas of a card: major and minor when there is a minor, solo when there isn't. */
  majorBox: Box;
  minorBox: Box;
  soloBox: Box;
  majorFont: string;
  minorFont: string;
  measure: Measure;
}

export function fitBoard(cards: Array<{ major: string; minor: string }>, opts: FitOptions): CardFit[] {
  const { majorBox, minorBox, soloBox, majorFont, minorFont, measure } = opts;

  const prepared = cards.map((c) => {
    const hasMinor = c.minor.trim() !== '';
    return {
      hasMinor,
      majorOptions: candidates(c.major, hasMinor ? majorBox : soloBox, majorFont, measure),
      minorOptions: hasMinor ? candidates(c.minor, minorBox, minorFont, measure) : null,
    };
  });

  // Board-wide sizes. Cards with a minor define the major size because they
  // are the common case; if there are none, all cards do.
  const withMinor = prepared.filter((p) => p.hasMinor);
  const reference = withMinor.length > 0 ? withMinor : prepared;
  const majorSize = median(reference.map((p) => bestFit(p.majorOptions).size));
  const minorSize = Math.min(
    median(withMinor.map((p) => bestFit(p.minorOptions!).size)),
    majorSize * MINOR_MAX_RATIO,
  );

  return prepared.map((p) => {
    const major = fitAtCap(p.majorOptions, p.hasMinor ? majorSize : majorSize * SOLO_BOOST);
    const minor = p.minorOptions ? fitAtCap(p.minorOptions, Math.min(minorSize, major.size * MINOR_MAX_RATIO_CARD)) : null;
    return { major, minor };
  });
}
