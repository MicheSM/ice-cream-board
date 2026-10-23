import { describe, expect, it } from 'vitest';
import { bestFit, candidates, fitBoard, median, SOLO_BOOST, type Measure } from './textFit';

// A fake font where every character is 0.5em wide: at 100px, "ABCD" = 200.
const measure: Measure = (text) => text.length * 50;
const box = { w: 400, h: 200 };
const opts = {
  majorBox: { w: 400, h: 112 },
  minorBox: { w: 400, h: 88 },
  soloBox: box,
  majorFont: 'f',
  minorFont: 'f',
  measure,
};

describe('candidates / bestFit', () => {
  it('keeps short words on one line', () => {
    const fit = bestFit(candidates('LIMONE', box, 'f', measure));
    expect(fit.lines).toEqual(['LIMONE']);
  });

  it('splits long names in two balanced lines when that is much bigger', () => {
    const fit = bestFit(candidates('CASSATA SICILIANA', box, 'f', measure));
    expect(fit.lines).toEqual(['CASSATA', 'SICILIANA']);
  });

  it('handles empty text', () => {
    expect(bestFit(candidates('  ', box, 'f', measure)).size).toBe(0);
  });
});

describe('fitBoard', () => {
  const cards = [
    { major: 'LIMONE', minor: 'Lemon' },
    { major: 'FRAGOLA', minor: 'Strawberry' },
    { major: 'CREMA', minor: 'Custard' },
    { major: 'CIOCCOLATO FONDENTE', minor: 'Dark chocolate' },
    { major: 'MORA', minor: '' },
  ];
  const fits = fitBoard(cards, opts);

  it('gives most cards exactly the same major size', () => {
    const sizes = fits.slice(0, 3).map((f) => f.major.size);
    expect(new Set(sizes).size).toBe(1);
  });

  it('shrinks only the long names', () => {
    expect(fits[3].major.size).toBeLessThan(fits[0].major.size);
  });

  it('lets a major-only card grow, but not beyond the boost', () => {
    expect(fits[4].minor).toBeNull();
    expect(fits[4].major.size).toBeGreaterThan(fits[0].major.size);
    expect(fits[4].major.size).toBeLessThanOrEqual(fits[0].major.size * SOLO_BOOST + 1e-9);
  });

  it('never lets text overflow the card width', () => {
    for (const f of fits) {
      for (const line of f.major.lines) expect((measure(line, 'f') * f.major.size) / 100).toBeLessThanOrEqual(box.w);
    }
  });
});

describe('median', () => {
  it('works for odd and even lengths', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(median([])).toBe(0);
  });
});

describe('minor text', () => {
  it('is never bigger than the major on the same card', () => {
    const fits = fitBoard(
      [
        { major: 'LIMONE', minor: 'Lemon' },
        { major: 'CREMA', minor: 'Custard' },
        { major: 'CIOCCOLATO FONDENTE', minor: 'Dark' },
      ],
      opts,
    );
    for (const f of fits) expect(f.minor!.size).toBeLessThan(f.major.size);
  });
});
