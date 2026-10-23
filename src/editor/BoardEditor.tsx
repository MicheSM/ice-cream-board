import { useEffect, useState, type ReactNode } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { ScaledBoard } from '../board/Board';
import { cellRect } from '../board/layout';
import { pickData, useStore } from '../model/store';
import { cellKey, type FlavorId } from '../model/types';
import { droppedFlavor, isFlavorDrag, startFlavorDrag } from './dnd';
import { FlavorForm } from './FlavorForm';

/**
 * Centre: a live preview of the board (the very same component the monitor
 * shows) with a transparent layer of clickable / droppable cells on top.
 */
export function BoardEditor() {
  const data = useStore(useShallow(pickData));
  const placeFlavor = useStore((s) => s.placeFlavor);
  const [menu, setMenu] = useState<{ row: number; col: number } | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const { board } = data;

  const cells: ReactNode[] = [];
  for (let row = 0; row < board.rows; row++)
    for (let col = 0; col < board.cols; col++) {
      const key = cellKey(row, col);
      const r = cellRect(board, row, col);
      const placement = board.cells[key];
      cells.push(
        <div
          key={key}
          className={`cell ${placement ? 'occupied' : 'empty'} ${over === key ? 'drag-over' : ''}`}
          style={{ left: r.x, top: r.y, width: r.w, height: r.h }}
          draggable={Boolean(placement)}
          onDragStart={(e) => placement && startFlavorDrag(e, placement.flavorId, true)}
          onDragOver={(e) => {
            if (!isFlavorDrag(e)) return;
            e.preventDefault();
            setOver(key);
          }}
          onDragLeave={() => setOver(null)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(null);
            const id = droppedFlavor(e);
            if (id) placeFlavor(id, row, col);
          }}
          onClick={() => setMenu({ row, col })}
        >
          {!placement && <span className="cell-plus">+</span>}
        </div>,
      );
    }

  return (
    <main className="stage">
      <div className="stage-board">
        <ScaledBoard data={data}>{cells}</ScaledBoard>
      </div>
      <p className="hint">
        Clicca una casella per scegliere o cambiare il gusto. Puoi anche trascinare: dalla lista alla lavagna, tra le
        caselle per spostare, dalla lavagna alla lista per togliere.
      </p>
      {menu && <CellMenu {...menu} onClose={() => setMenu(null)} />}
    </main>
  );
}

function CellMenu({ row, col, onClose }: { row: number; col: number; onClose: () => void }) {
  const placement = useStore((s) => s.board.cells[cellKey(row, col)]);
  const flavors = useStore((s) => s.flavors);
  const cells = useStore((s) => s.board.cells);
  const { placeFlavor, clearCell, updateFlavor } = useStore.getState();
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const current = placement && flavors.find((f) => f.id === placement.flavorId);
  const onBoard = new Set(Object.values(cells).map((p) => p.flavorId));
  const available = flavors.filter((f) => !onBoard.has(f.id));
  const choose = (id: FlavorId) => {
    placeFlavor(id, row, col);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <h2>{current ? current.major : 'Casella vuota'}</h2>
        {current && (
          <div className="modal-actions">
            <label className="check">
              <input
                type="checkbox"
                checked={current.soldOut}
                onChange={(e) => updateFlavor(current.id, { soldOut: e.target.checked })}
              />
              Esaurito
            </label>
            <span className="spacer" />
            <button
              className="danger ghost"
              onClick={() => {
                clearCell(row, col);
                onClose();
              }}
            >
              Togli dalla lavagna
            </button>
          </div>
        )}
        {creating ? (
          <FlavorForm onDone={(id) => (id ? choose(id) : setCreating(false))} />
        ) : (
          <>
            <h3>{current ? 'Sostituisci con…' : 'Scegli un gusto'}</h3>
            {available.length === 0 && <p className="muted">Tutti i gusti sono già in lavagna.</p>}
            <ul className="pick-list">
              {available.map((f) => (
                <li key={f.id}>
                  <button onClick={() => choose(f.id)}>
                    <span className={`ink-dot ${f.vegan ? 'vegan' : ''}`} />
                    <b>{f.major}</b>
                    {f.minor && <small>{f.minor}</small>}
                  </button>
                </li>
              ))}
            </ul>
            <button className="ghost" onClick={() => setCreating(true)}>
              + Nuovo gusto
            </button>
          </>
        )}
      </div>
    </div>
  );
}
