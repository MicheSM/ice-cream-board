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

/**
 * Hammered chrome: a hammered metal sheet is covered in small flat-ish dents,
 * and each dent reflects a different part of the room, so it looks like a
 * mosaic of facets ranging from dark blue-grey to bright white. We draw many
 * small random polygons, each filled with a dark-to-bright gradient, letting
 * them overlap. Shapes crossing the tile edge are repeated on the opposite
 * side so the tile repeats seamlessly.
 */
function hammered(size: number, count: number) {
  const rnd = seededRandom('hammered');
  const shapes: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = rnd() * size;
    const y = rnd() * size;
    const r = 6 + rnd() * 7;
    const sides = 5 + Math.floor(rnd() * 3);
    const turn = rnd() * Math.PI;
    const pts = Array.from({ length: sides }, (_, k) => {
      const a = turn + (k / sides) * 2 * Math.PI;
      const rr = r * (0.7 + rnd() * 0.45);
      return [Math.cos(a) * rr, Math.sin(a) * rr];
    });
    const g = `g${Math.floor(rnd() * 6)}`;
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
  const grad = (id: string, angle: number, from: string, to: string) =>
    `<linearGradient id='${id}' gradientTransform='rotate(${angle} .5 .5)'>` +
    `<stop offset='0' stop-color='${from}'/><stop offset='1' stop-color='${to}'/></linearGradient>`;
  const defs = [
    grad('g0', 45, '#59606c', '#f7f8fa'),
    grad('g1', 225, '#6b7280', '#ffffff'),
    grad('g2', 90, '#b3b9c2', '#ffffff'),
    grad('g3', 0, '#5d6472', '#d6d9de'),
    grad('g4', 135, '#e9ecf0', '#8d939d'),
    grad('g5', 300, '#7c8594', '#f1f3f6'),
  ].join('');
  return svgUrl(`<defs>${defs}</defs><rect width='100%' height='100%' fill='#cdd1d7'/>${shapes.join('')}`, size);
}

export const HAMMERED_SILVER = hammered(240, 520);

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
