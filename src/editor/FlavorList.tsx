import { useState } from 'react';
import { useStore } from '../model/store';
import type { Flavor, FlavorId } from '../model/types';
import { droppedFlavor, firstEmptyCell, isBoardDrag, startFlavorDrag } from './dnd';
import { FlavorForm } from './FlavorForm';

/** Left panel: every flavour card the shop owns, on the board or not. */
export function FlavorList() {
  const flavors = useStore((s) => s.flavors);
  const board = useStore((s) => s.board);
  const removeFromBoard = useStore((s) => s.removeFromBoard);
  const placeFlavor = useStore((s) => s.placeFlavor);
  const [editing, setEditing] = useState<FlavorId | 'new' | null>(null);
  const [dropping, setDropping] = useState(false);

  const onBoard = new Set(Object.values(board.cells).map((p) => p.flavorId));
  const off = flavors.filter((f) => !onBoard.has(f.id));
  const on = flavors.filter((f) => onBoard.has(f.id));

  const placeFirstFree = (id: FlavorId) => {
    const cell = firstEmptyCell(board);
    if (cell) placeFlavor(id, cell.row, cell.col);
    else alert('Nessuna casella libera: aggiungi una riga o una colonna, oppure togli un gusto.');
  };

  const row = (f: Flavor) =>
    editing === f.id ? (
      <li key={f.id}>
        <FlavorForm flavor={f} onDone={() => setEditing(null)} />
      </li>
    ) : (
      <li
        key={f.id}
        className={`flavor-row ${f.soldOut ? 'sold-out' : ''}`}
        draggable
        onDragStart={(e) => startFlavorDrag(e, f.id, false)}
      >
        <span className={`ink-dot ${f.vegan ? 'vegan' : ''}`} title={f.vegan ? 'Vegano' : 'Non vegano'} />
        <div className="flavor-names">
          <b>{f.major}</b>
          {f.minor && <small>{f.minor}</small>}
        </div>
        {f.soldOut && <span className="badge">Esaurito</span>}
        {!onBoard.has(f.id) && (
          <button className="icon" title="Metti in lavagna" onClick={() => placeFirstFree(f.id)}>
            ＋
          </button>
        )}
        <button className="icon" title="Modifica" onClick={() => setEditing(f.id)}>
          ✎
        </button>
      </li>
    );

  return (
    <aside
      className={`panel flavors ${dropping ? 'drop-target' : ''}`}
      // Dropping a card dragged from the board onto this list takes it off the board.
      onDragOver={(e) => {
        if (!isBoardDrag(e)) return;
        e.preventDefault();
        setDropping(true);
      }}
      onDragLeave={() => setDropping(false)}
      onDrop={(e) => {
        setDropping(false);
        const id = droppedFlavor(e);
        if (id && isBoardDrag(e)) removeFromBoard(id);
      }}
    >
      <div className="panel-head">
        <h2>Gusti</h2>
        <button className="primary small" onClick={() => setEditing('new')}>
          + Nuovo gusto
        </button>
      </div>
      {editing === 'new' && (
        <FlavorForm
          onDone={(id) => {
            setEditing(null);
            if (id) placeFirstFree(id);
          }}
        />
      )}
      <h3>Non in lavagna ({off.length})</h3>
      {off.length === 0 ? <p className="muted">Tutti i gusti sono in lavagna.</p> : <ul>{off.map(row)}</ul>}
      <h3>In lavagna ({on.length})</h3>
      <ul>{on.map(row)}</ul>
    </aside>
  );
}
