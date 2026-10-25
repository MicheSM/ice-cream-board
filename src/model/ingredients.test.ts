import { describe, expect, it } from 'vitest';
import { guessIngredient, ingredientOf } from './ingredients';
import type { Flavor } from './types';

describe('guessIngredient', () => {
  it.each([
    ['Limone', 'limone'],
    ['Fragola', 'fragola'],
    ['Mora di rovo', 'frutti-di-bosco'],
    ['Mirtillo', 'mirtillo'],
    ['Nocciola', 'nocciola'],
    ['Cioccolato fondente', 'cioccolato'],
    ['Stracciatella', 'cioccolato'],
    ['Crema', 'uovo'],
    ['Cassata siciliana', 'torta'],
    ['Liquirizia', 'liquirizia'],
    ['Yogurt di pecora', 'yogurt'],
    ['Pistacchio', 'pistacchio'],
    ['Caffè', 'caffe'],
    ['Fior di latte', 'latte'],
  ])('%s → %s', (name, id) => {
    expect(guessIngredient(name)).toBe(id);
  });

  it('prefers the flavour to the base', () => {
    expect(guessIngredient('Cioccolato al latte')).toBe('cioccolato');
    expect(guessIngredient('Yogurt ai frutti di bosco')).toBe('frutti-di-bosco');
    expect(guessIngredient('Crema al caffè')).toBe('caffe');
  });

  it('matches whole word beginnings only', () => {
    expect(guessIngredient('Amore')).toBeNull(); // not "more" (blackberries)
    expect(guessIngredient('Puffo')).toBeNull();
    expect(guessIngredient('Mousse al cioccolato')).toBe('cioccolato'); // not "mou" (caramel)
    expect(guessIngredient('Melone')).toBe('anguria'); // not "mela"
  });
});

describe('ingredientOf', () => {
  const flavor = (patch: Partial<Flavor>): Flavor => ({ id: 'x', major: 'Gusto del giorno', minor: '', vegan: false, soldOut: false, ...patch });

  it('uses the chosen icon, or none', () => {
    expect(ingredientOf(flavor({ major: 'Limone', icon: 'fragola' }))).toBe('fragola');
    expect(ingredientOf(flavor({ major: 'Limone', icon: 'none' }))).toBeNull();
  });

  it('falls back to the subtitle', () => {
    expect(ingredientOf(flavor({ minor: 'Hazelnut' }))).toBe('nocciola');
  });
});
