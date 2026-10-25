import { useState, type FormEvent } from 'react';
import { IngredientIcon } from '../board/ingredientIcons';
import { INGREDIENT_IDS, INGREDIENTS, guessIngredient } from '../model/ingredients';
import { useStore } from '../model/store';
import { resolveTunables } from '../model/themeDefaults';
import type { Flavor, FlavorId } from '../model/types';

interface Props {
  flavor?: Flavor;
  /** Called after saving, with the flavour's id (new or existing), or null on cancel/delete. */
  onDone: (id: FlavorId | null) => void;
}

/** Create or edit a flavour. Changes reach the board only when you press Salva. */
export function FlavorForm({ flavor, onDone }: Props) {
  const addFlavor = useStore((s) => s.addFlavor);
  const updateFlavor = useStore((s) => s.updateFlavor);
  const deleteFlavor = useStore((s) => s.deleteFlavor);
  const [major, setMajor] = useState(flavor?.major ?? '');
  const [minor, setMinor] = useState(flavor?.minor ?? '');
  const [vegan, setVegan] = useState(flavor?.vegan ?? false);
  const [soldOut, setSoldOut] = useState(flavor?.soldOut ?? false);
  const [icon, setIcon] = useState(flavor?.icon);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!major.trim()) return;
    const values = { major: major.trim(), minor: minor.trim(), vegan, icon };
    if (flavor) {
      updateFlavor(flavor.id, { ...values, soldOut });
      onDone(flavor.id);
    } else onDone(addFlavor(values));
  };

  const remove = () => {
    if (flavor && confirm(`Eliminare «${flavor.major}»? Sparirà anche dalla lavagna.`)) {
      deleteFlavor(flavor.id);
      onDone(null);
    }
  };

  return (
    <form className="flavor-form" onSubmit={submit} onKeyDown={(e) => e.key === 'Escape' && onDone(null)}>
      <label>
        Nome
        <input autoFocus value={major} onChange={(e) => setMajor(e.target.value)} placeholder="es. Pistacchio" />
      </label>
      <label>
        Sottotitolo <small>(facoltativo)</small>
        <input value={minor} onChange={(e) => setMinor(e.target.value)} placeholder="es. Pistachio" />
      </label>
      <label className="check">
        <input type="checkbox" checked={vegan} onChange={(e) => setVegan(e.target.checked)} />
        <span className={`ink-dot ${vegan ? 'vegan' : ''}`} /> Vegano <small>(scritta verde)</small>
      </label>
      {flavor && (
        <label className="check">
          <input type="checkbox" checked={soldOut} onChange={(e) => setSoldOut(e.target.checked)} /> Esaurito
        </label>
      )}
      <IconPicker value={icon} guess={guessIngredient(major) ?? guessIngredient(minor)} onChange={setIcon} />
      <div className="form-actions">
        {flavor && (
          <button type="button" className="danger ghost" onClick={remove}>
            Elimina
          </button>
        )}
        <span className="spacer" />
        <button type="button" className="ghost" onClick={() => onDone(null)}>
          Annulla
        </button>
        <button type="submit" className="primary" disabled={!major.trim()}>
          Salva
        </button>
      </div>
    </form>
  );
}

/**
 * Which ingredient icon the flavour shows. "Auto" (the default) guesses it
 * from the name, so it follows when you rename the flavour.
 */
function IconPicker({
  value,
  guess,
  onChange,
}: {
  value: Flavor['icon'];
  guess: ReturnType<typeof guessIngredient>;
  onChange: (icon: Flavor['icon']) => void;
}) {
  const shown = value === undefined ? guess : value === 'none' ? null : value;
  const iconsOn = useStore((s) => resolveTunables(s.style).ingredientIcon);
  return (
    <details className="icon-picker">
      <summary>
        Icona: {shown && <IngredientIcon id={shown} />}
        {shown ? INGREDIENTS[shown].label : 'nessuna'}
        {value === undefined && <small> (automatica)</small>}
      </summary>
      <div className="icon-grid">
        <button type="button" className={value === undefined ? 'active' : ''} onClick={() => onChange(undefined)} title="Scelta in base al nome">
          Auto
        </button>
        <button type="button" className={value === 'none' ? 'active' : ''} onClick={() => onChange('none')} title="Nessuna icona">
          —
        </button>
        {INGREDIENT_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className={value === id ? 'active' : ''}
            onClick={() => onChange(id)}
            title={INGREDIENTS[id].label}
            aria-label={INGREDIENTS[id].label}
          >
            <IngredientIcon id={id} />
          </button>
        ))}
      </div>
      {!iconsOn && <small>Sulla lavagna si vedono attivando «Icona dell’ingrediente» nello stile.</small>}
    </details>
  );
}
