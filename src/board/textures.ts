import { seededRandom } from './layout';

// Procedural textures: small SVG images built from noise filters
// (feTurbulence = Perlin noise) or random shapes. They're inlined as data:
// URLs and tiled as CSS backgrounds, so there are no image files to license
// or download.

const svgUrl = (body: string, size: number) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>${body}</svg>`,
  )}")`;

/** Coloured speckles whose opacity follows a noise pattern. */
function noise(opts: { freq: string; octaves: number; color: [number, number, number]; alpha: number; seed: number; size: number }) {
  const [r, g, b] = opts.color.map((c) => (c / 255).toFixed(3));
  return svgUrl(
    `<filter id='n' x='0' y='0' width='100%' height='100%'>` +
      `<feTurbulence type='fractalNoise' baseFrequency='${opts.freq}' numOctaves='${opts.octaves}' seed='${opts.seed}' stitchTiles='stitch'/>` +
      `<feColorMatrix values='0 0 0 0 ${r}  0 0 0 0 ${g}  0 0 0 0 ${b}  ${opts.alpha * 2} 0 0 0 ${-opts.alpha * 0.6}'/>` +
      `</filter><rect width='100%' height='100%' filter='url(#n)'/>`,
    opts.size,
  );
}

interface FacetOptions {
  seed: string;
  size: number;
  count: number;
  /** Radius of a facet: min + random up to min + range. */
  radius: [number, number];
  /** Number of corners: min + random up to min + range - 1. */
  sides: [number, number];
  base: string;
  /** Dark-to-bright gradients: [angle, from, to]. */
  shades: Array<[number, string, string]>;
}

/**
 * A mosaic of small flat facets, each catching the light differently: what
 * hammered or crumpled metal looks like. We draw many random polygons, each
 * filled with a dark-to-bright gradient, letting them overlap. Shapes
 * crossing the tile edge are repeated on the opposite side so the tile
 * repeats seamlessly.
 */
function facets({ seed, size, count, radius, sides: sideRange, base, shades }: FacetOptions) {
  const rnd = seededRandom(seed);
  const shapes: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = rnd() * size;
    const y = rnd() * size;
    const r = radius[0] + rnd() * radius[1];
    const sides = sideRange[0] + Math.floor(rnd() * sideRange[1]);
    const turn = rnd() * Math.PI;
    const pts = Array.from({ length: sides }, (_, k) => {
      const a = turn + (k / sides) * 2 * Math.PI;
      const rr = r * (0.7 + rnd() * 0.45);
      return [Math.cos(a) * rr, Math.sin(a) * rr];
    });
    const g = `g${Math.floor(rnd() * shades.length)}`;
    for (const ox of [-size, 0, size])
      for (const oy of [-size, 0, size]) {
        const cx = x + ox;
        const cy = y + oy;
        if (cx + r * 1.2 > 0 && cx - r * 1.2 < size && cy + r * 1.2 > 0 && cy - r * 1.2 < size)
          shapes.push(
            `<polygon points='${pts.map(([px, py]) => `${(cx + px).toFixed(1)},${(cy + py).toFixed(1)}`).join(' ')}' fill='url(#${g})'/>`,
          );
      }
  }
  const defs = shades
    .map(
      ([angle, from, to], i) =>
        `<linearGradient id='g${i}' gradientTransform='rotate(${angle} .5 .5)'>` +
        `<stop offset='0' stop-color='${from}'/><stop offset='1' stop-color='${to}'/></linearGradient>`,
    )
    .join('');
  return svgUrl(`<defs>${defs}</defs><rect width='100%' height='100%' fill='${base}'/>${shapes.join('')}`, size);
}

/**
 * Hammered chrome: a hammered metal sheet is covered in small dents, and each
 * dent reflects a different part of the room, from dark blue-grey to white.
 */
export const HAMMERED_SILVER = facets({
  seed: 'hammered',
  size: 240,
  count: 520,
  radius: [6, 7],
  sides: [5, 3],
  base: '#cdd1d7',
  shades: [
    [45, '#59606c', '#f7f8fa'],
    [225, '#6b7280', '#ffffff'],
    [90, '#b3b9c2', '#ffffff'],
    [0, '#5d6472', '#d6d9de'],
    [135, '#e9ecf0', '#8d939d'],
    [300, '#7c8594', '#f1f3f6'],
  ],
});

/**
 * Crumpled gold foil, like the wrapper of a chocolate bar: the same idea with
 * bigger, sharper (triangular) facets in golds from deep amber to almost white.
 */
export const GOLD_FOIL = facets({
  seed: 'foil',
  size: 300,
  count: 260,
  radius: [14, 26],
  sides: [3, 2],
  base: '#c49a52',
  shades: [
    [30, '#8a6326', '#f3dc9e'],
    [200, '#a97d38', '#fff1c8'],
    [110, '#d8b66e', '#7c5620'],
    [300, '#e9cd8a', '#9b7130'],
    [70, '#6f4c1a', '#d6b06a'],
    [160, '#f7e6b2', '#b88b44'],
  ],
});

/**
 * Wood: noise stretched along one axis gives long streaks; a colour matrix
 * maps the noise value to a range of browns. `vertical` turns the grain for
 * the left and right sides of a frame.
 */
function wood(vertical: boolean) {
  const freq = vertical ? '0.09 0.004' : '0.004 0.09';
  return svgUrl(
    `<filter id='w' x='0' y='0' width='100%' height='100%'>` +
      `<feTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='4' seed='21' stitchTiles='stitch'/>` +
      `<feColorMatrix values='0.42 0 0 0 0.22  0.28 0 0 0 0.12  0.16 0 0 0 0.05  0 0 0 0 1'/>` +
      `</filter><rect width='100%' height='100%' filter='url(#w)'/>`,
    600,
  );
}

export const WOOD_H = wood(false);
export const WOOD_V = wood(true);

/** Paper: fine grain plus large soft blotches, darker than the base colour. */
export const PAPER_GRAIN = noise({ freq: '0.9', octaves: 2, color: [40, 15, 5], alpha: 0.3, seed: 3, size: 256 });
export const PAPER_BLOTCHES = noise({ freq: '0.006', octaves: 3, color: [50, 20, 8], alpha: 0.35, seed: 8, size: 1024 });

/** Chalkboard: white dust and the smudges left by an eraser. */
export const CHALK_DUST = noise({ freq: '0.8', octaves: 2, color: [255, 255, 255], alpha: 0.14, seed: 13, size: 256 });
export const CHALK_SMUDGES = noise({ freq: '0.004 0.008', octaves: 3, color: [255, 255, 255], alpha: 0.16, seed: 17, size: 1024 });

/** Cardboard and polaroid paper. */
export const CARD_GRAIN = noise({ freq: '0.7', octaves: 2, color: [140, 120, 105], alpha: 0.22, seed: 5, size: 256 });
export const CARD_FIBERS = noise({ freq: '0.012 0.25', octaves: 2, color: [10, 6, 4], alpha: 0.35, seed: 9, size: 512 });
export const FINE_GRAIN = noise({ freq: '1.2', octaves: 1, color: [90, 80, 70], alpha: 0.1, seed: 31, size: 200 });

/**
 * Light oak slats, like the wall behind the shop's counter: vertical boards
 * of slightly different tones, a grain made of noise stretched vertically,
 * and a dark groove between boards. The tile is a whole number of boards
 * wide, so it repeats without a visible seam.
 */
function oakSlats() {
  const rnd = seededRandom('oak');
  const board = 60;
  const count = 10;
  const size = board * count;
  const tones = ['#c7a175', '#c09a6c', '#cca77c', '#c39d70', '#bd966a'];
  const boards = Array.from({ length: count }, (_, i) => {
    const x = i * board;
    const tone = tones[Math.floor(rnd() * tones.length)];
    return (
      `<rect x='${x}' width='${board}' height='${size}' fill='${tone}'/>` +
      // Each board is a little darker towards its right edge, then the groove.
      `<rect x='${x}' width='${board}' height='${size}' fill='url(#side)'/>` +
      `<rect x='${x}' width='3' height='${size}' fill='#4a3320' opacity='.55'/>`
    );
  });
  return svgUrl(
    `<defs><linearGradient id='side'><stop offset='0' stop-color='#fff' stop-opacity='.1'/>` +
      `<stop offset='.6' stop-color='#fff' stop-opacity='0'/><stop offset='1' stop-color='#000' stop-opacity='.08'/></linearGradient></defs>` +
      `<filter id='g' x='0' y='0' width='100%' height='100%'>` +
      `<feTurbulence type='fractalNoise' baseFrequency='0.3 0.004' numOctaves='3' seed='12' stitchTiles='stitch'/>` +
      `<feColorMatrix values='0 0 0 0 .35  0 0 0 0 .22  0 0 0 0 .1  .8 0 0 0 -.32'/>` +
      `</filter>${boards.join('')}<rect width='100%' height='100%' filter='url(#g)'/>`,
    size,
  );
}

export const OAK_SLATS = oakSlats();
