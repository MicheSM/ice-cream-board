import { useState, type FormEvent } from 'react';
import { useStore } from '../model/store';
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

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!major.trim()) return;
    const values = { major: major.trim(), minor: minor.trim(), vegan };
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
