import { useRef } from 'react';
import { FONTS } from '../board/fonts';
import { pickData, useStore } from '../model/store';
import type { AppData, FontId, NaturalLevel } from '../model/types';

const NATURAL: Array<[NaturalLevel, string]> = [
  [0, 'Preciso'],
  [1, 'Naturale 1'],
  [2, 'Naturale 2'],
  [3, 'Naturale 3'],
];

/** Right panel: how the board looks. */
export function SettingsPanel() {
  const board = useStore((s) => s.board);
  const style = useStore((s) => s.style);
  const { setGrid, setBoard, setNatural, setStyle } = useStore.getState();

  const resize = (rows: number, cols: number) => {
    if (rows < 1 || cols < 1 || rows > 8 || cols > 8) return;
    const lost = Object.keys(board.cells).filter((k) => {
      const [r, c] = k.split('-').map(Number);
      return r >= rows || c >= cols;
    }).length;
    if (lost > 0 && !confirm(`${lost} gusti usciranno dalla lavagna (restano nella lista). Continuare?`)) return;
    setGrid(rows, cols);
  };

  return (
    <aside className="panel settings">
      <h2>Lavagna</h2>

      <section>
        <h3>Griglia</h3>
        <Stepper label="Righe" value={board.rows} onChange={(n) => resize(n, board.cols)} />
        <Stepper label="Colonne" value={board.cols} onChange={(n) => resize(board.rows, n)} />
        <label>
          Dimensione cartoncini <output>{Math.round(board.cardScale * 100)}%</output>
          <input
            type="range"
            min={60}
            max={100}
            value={Math.round(board.cardScale * 100)}
            onChange={(e) => setBoard({ cardScale: Number(e.target.value) / 100 })}
          />
        </label>
      </section>

      <section>
        <h3>Effetto</h3>
        <div className="segmented">
          {NATURAL.map(([level, label]) => (
            <button
              key={level}
              className={board.natural === level ? 'active' : ''}
              onClick={() => setNatural(level)}
              title={level > 0 ? 'Clicca di nuovo per una nuova disposizione' : ''}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3>Aspetto</h3>
        <label className="check">
          <input type="checkbox" checked={board.frame} onChange={(e) => setBoard({ frame: e.target.checked })} />
          Cornice
        </label>
        <label className="check">
          <input type="checkbox" checked={style.leafIcon} onChange={(e) => setStyle({ leafIcon: e.target.checked })} />
          Foglia sui gusti vegani
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={style.majorUppercase}
            onChange={(e) => setStyle({ majorUppercase: e.target.checked })}
          />
          Nome in MAIUSCOLO
        </label>
        <FontSelect label="Font nome" value={style.majorFont} onChange={(f) => setStyle({ majorFont: f })} />
        <FontSelect label="Font sottotitolo" value={style.minorFont} onChange={(f) => setStyle({ minorFont: f })} />
      </section>

      <Backup />
    </aside>
  );
}

function Stepper({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="stepper">
      <span>{label}</span>
      <button className="icon" onClick={() => onChange(value - 1)} aria-label={`${label} meno`}>
        −
      </button>
      <output>{value}</output>
      <button className="icon" onClick={() => onChange(value + 1)} aria-label={`${label} più`}>
        +
      </button>
    </div>
  );
}

function FontSelect({ label, value, onChange }: { label: string; value: FontId; onChange: (f: FontId) => void }) {
  return (
    <label>
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value as FontId)}>
        {Object.entries(FONTS).map(([id, f]) => (
          <option key={id} value={id} style={{ fontFamily: f.family }}>
            {f.label}
          </option>
        ))}
      </select>
    </label>
  );
}

const isAppData = (d: unknown): d is AppData =>
  typeof d === 'object' && d !== null && Array.isArray((d as AppData).flavors) && 'board' in d && 'style' in d;

/** Backup to / restore from a JSON file. Also the way to move data between computers. */
function Backup() {
  const fileInput = useRef<HTMLInputElement>(null);

  const exportFile = () => {
    const json = JSON.stringify({ app: 'ice-cream-board', version: 1, data: pickData(useStore.getState()) }, null, 2);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    a.download = `ice-cream-board-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importFile = async (file: File) => {
    try {
      const { data } = JSON.parse(await file.text());
      if (!isAppData(data)) throw new Error('bad file');
      if (confirm('Sostituire tutti i gusti e le impostazioni con quelli del file?')) useStore.getState().replaceData(data);
    } catch {
      alert('File non valido.');
    }
  };

  return (
    <section>
      <h3>Backup</h3>
      <div className="row">
        <button onClick={exportFile}>Esporta</button>
        <button onClick={() => fileInput.current?.click()}>Importa…</button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void importFile(f);
            e.target.value = '';
          }}
        />
      </div>
      <button
        className="danger ghost"
        onClick={() => confirm('Ripristinare la lavagna iniziale? Perderai i gusti creati.') && useStore.getState().resetAll()}
      >
        Ripristina tutto
      </button>
    </section>
  );
}
