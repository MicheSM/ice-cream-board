import { describe, expect, it } from 'vitest';
import { migrate } from './migrate';

const v1 = (board: object, style: object) => ({
  flavors: [{ id: 'a', major: 'Limone', minor: 'Lemon', vegan: true, soldOut: false }],
  board: { rows: 4, cols: 4, cells: { '0-0': { flavorId: 'a', jitter: { x: 0, y: 0, r: 0 } } }, ...board },
  style: { majorFont: 'patrick-hand', minorFont: 'patrick-hand', majorUppercase: true, leafIcon: true, ...style },
});

describe('migrate v1 → v2', () => {
  it('keeps flavours and placements', () => {
    const d = migrate(v1({ cardScale: 0.94, natural: 1, frame: true }, {}), 1);
    expect(d.flavors).toHaveLength(1);
    expect(d.board).toEqual({ rows: 4, cols: 4, cells: { '0-0': { flavorId: 'a', jitter: { x: 0, y: 0, r: 0 } } } });
  });

  it('untouched settings become the Classica preset with no overrides', () => {
    const d = migrate(v1({ cardScale: 0.94, natural: 1, frame: true }, {}), 1);
    expect(d.style.theme).toBe('classica');
    expect(d.style.overrides).toEqual({});
  });

  it('changed settings are kept as Classica overrides; Naturale 3 becomes Naturale', () => {
    const d = migrate(v1({ cardScale: 0.8, natural: 3, frame: false }, { majorFont: 'kalam' }), 1);
    expect(d.style.overrides.classica).toEqual({ cardScale: 0.8, frame: false, majorFont: 'kalam' });
  });

  it('Preciso stays precise', () => {
    const d = migrate(v1({ cardScale: 0.94, natural: 0, frame: true }, {}), 1);
    expect(d.style.overrides.classica).toEqual({ natural: false });
  });
});
