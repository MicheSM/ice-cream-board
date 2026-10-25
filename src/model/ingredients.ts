import type { Flavor, IngredientId } from './types';

// Which ingredient icon a flavour gets. Unless one was chosen by hand, it's
// guessed from the flavour's name: we look for known words (Italian and
// English) in the name, then in the subtitle.
//
// Some words name the *base* of a gelato rather than its flavour (crema,
// latte, yogurt...): "Yogurt ai frutti di bosco" is about the berries, and
// "Crema al caffè" about the coffee. So a specific ingredient always wins
// over a base, and otherwise the word that comes first wins.

interface Ingredient {
  label: string;
  /** Word beginnings to look for, without accents. `\\b` marks a short word that must end there. */
  words: string[];
  /** A base rather than a flavour (loses to any specific ingredient). */
  base?: boolean;
}

export const INGREDIENTS: Record<IngredientId, Ingredient> = {
  limone: { label: 'Limone', words: ['limon', 'lemon', 'lime\\b'] },
  arancia: { label: 'Arancia', words: ['aranc', 'arance', 'mandarin', 'agrum', 'pompelm', 'orange', 'citrus'] },
  fragola: { label: 'Fragola', words: ['fragol', 'strawberr'] },
  'frutti-di-bosco': {
    label: 'Frutti di bosco',
    words: ['frutti di bosco', 'frutti rossi', 'mora\\b', 'more\\b', 'lampon', 'ribes', 'raspberr', 'blackberr', 'berries'],
  },
  mirtillo: { label: 'Mirtillo', words: ['mirtill', 'blueberr'] },
  ciliegia: { label: 'Ciliegia', words: ['cilieg', 'amaren', 'visciol', 'cherr'] },
  pesca: { label: 'Pesca', words: ['pesca\\b', 'pesche\\b', 'albicocc', 'peach', 'apricot'] },
  banana: { label: 'Banana', words: ['banan'] },
  mela: { label: 'Mela', words: ['mela\\b', 'mele\\b', 'apple', 'pera\\b', 'pere\\b', 'pear\\b'] },
  anguria: { label: 'Anguria', words: ['anguri', 'cocomer', 'melon', 'watermelon'] },
  cocco: { label: 'Cocco', words: ['cocco', 'coconut'] },
  nocciola: { label: 'Nocciola', words: ['nocciol', 'gianduj', 'gianduia', 'nutella', 'hazelnut'] },
  mandorla: { label: 'Mandorla', words: ['mandorl', 'almond', 'croccant'] },
  pistacchio: { label: 'Pistacchio', words: ['pistacch', 'pistachio'] },
  cioccolato: { label: 'Cioccolato', words: ['cioccolat', 'cacao', 'fondente', 'stracciatell', 'chocolate', 'cocoa', 'bacio'] },
  caffe: { label: 'Caffè', words: ['caffe', 'coffee', 'espresso', 'cappuccin', 'tiramis', 'moka'] },
  latte: { label: 'Latte', words: ['fior di latte', 'fiordilatte', 'latte\\b', 'panna', 'milk', 'cream'], base: true },
  uovo: { label: 'Crema (uovo)', words: ['crema', 'zabaion', 'custard', 'egg\\b'], base: true },
  vaniglia: { label: 'Vaniglia', words: ['vanigli', 'vanilla'] },
  yogurt: { label: 'Yogurt', words: ['yogurt', 'yoghurt'], base: true },
  liquirizia: { label: 'Liquirizia', words: ['liquiriz', 'licorice', 'liquorice'] },
  menta: { label: 'Menta', words: ['menta\\b', 'mint\\b', 'after eight'] },
  caramello: { label: 'Caramello', words: ['caramell', 'mou\\b', 'toffee', 'dulce de leche', 'caramel'] },
  miele: { label: 'Miele', words: ['miele', 'honey'] },
  biscotto: { label: 'Biscotto', words: ['biscott', 'cookie', 'oreo', 'speculoos', 'wafer'] },
  torta: { label: 'Torta', words: ['cassata', 'torta', 'cheesecake', 'ricotta', 'sacher', 'cake\\b'] },
  cono: { label: 'Cono gelato', words: [] },
};

export const INGREDIENT_IDS = Object.keys(INGREDIENTS) as IngredientId[];

/** Lower case, without accents ("Caffè" → "caffe"). */
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

// One regular expression per ingredient: any of its words at the start of a word.
const PATTERNS = INGREDIENT_IDS.filter((id) => INGREDIENTS[id].words.length > 0).map((id) => ({
  id,
  base: INGREDIENTS[id].base ?? false,
  re: new RegExp(`(?:^|[^a-z])(?:${INGREDIENTS[id].words.join('|')})`),
}));

/** The ingredient a text is about, or null if no known word is in it. */
export function guessIngredient(text: string): IngredientId | null {
  const t = normalize(text);
  let best: { id: IngredientId; base: boolean; at: number } | null = null;
  for (const { id, base, re } of PATTERNS) {
    const m = re.exec(t);
    if (!m) continue;
    const better = !best || (best.base && !base) || (best.base === base && m.index < best.at);
    if (better) best = { id, base, at: m.index };
  }
  return best?.id ?? null;
}

/** The icon to show for a flavour (its own choice, or a guess from the name), or null for none. */
export function ingredientOf(flavor: Flavor): IngredientId | null {
  if (flavor.icon === 'none') return null;
  if (flavor.icon && flavor.icon in INGREDIENTS) return flavor.icon;
  return guessIngredient(flavor.major) ?? guessIngredient(flavor.minor);
}
