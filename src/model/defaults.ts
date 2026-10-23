import type { AppData, Flavor, Jitter, Placement } from './types';
import { cellKey } from './types';

export const randomJitter = (): Jitter => ({
  x: Math.random() * 2 - 1,
  y: Math.random() * 2 - 1,
  r: Math.random() * 2 - 1,
});

// Today's real board (photos of 2026-10-23), in the same order.
const TODAY: Array<[string, string, boolean]> = [
  ['Limone', 'Lemon', true],
  ['Fragola', 'Strawberry', true],
  ['Mora di rovo', '', true],
  ['Mirtillo', 'Blueberry', true],
  ['Nocciola', 'Hazelnut', false],
  ['Cioccolato fondente', 'Dark chocolate', true],
  ['Stracciatella', 'Chocolate chip', false],
  ['Crema', 'Custard', false],
  ['Cassata siciliana', '', false],
  ['Liquirizia', 'Licorice', false],
  ['Cioccolato al latte', 'Milk chocolate', false],
  ['Yogurt di pecora', 'Sheep yogurt', false],
  ['Pistacchio', 'Pistachio', false],
];

export function makeDefaultData(): AppData {
  const flavors: Flavor[] = TODAY.map(([major, minor, vegan]) => ({
    id: crypto.randomUUID(),
    major,
    minor,
    vegan,
    soldOut: false,
  }));

  const rows = 4;
  const cols = 4;
  const cells: Record<string, Placement> = {};
  flavors.forEach((f, i) => {
    cells[cellKey(Math.floor(i / cols), i % cols)] = { flavorId: f.id, jitter: randomJitter() };
  });

  return {
    flavors,
    board: { rows, cols, cells, cardScale: 0.94, natural: 1, frame: true },
    style: { majorFont: 'patrick-hand', minorFont: 'patrick-hand', majorUppercase: true, leafIcon: true },
  };
}
