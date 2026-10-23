import { useMemo, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { ScaledBoard } from '../board/Board';
import { FONTS } from '../board/fonts';
import { THEMES } from '../board/themes';
import { DATA_VERSION, migrate } from '../model/migrate';
import { pickData, useStore } from '../model/store';
import { THEME_IDS, hasOverrides, resolveTunables } from '../model/themeDefaults';
import type { AppData, FontId, ThemeId } from '../model/types';

/** Right panel: how the board looks. */
export function SettingsPanel() {
  const style = useStore((s) => s.style);
  const board = useStore((s) => s.board);
  const { setGrid, setTunable, resetTheme, setTitle, shuffle } = useStore.getState();
  const theme = THEMES[style.theme];
  const t = resolveTunables(style);

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
      <h2>Stile</h2>
      <PresetGallery />
      <p className="muted">{theme.description}</p>

      <section>
        <div className="section-head">
          <h3>Personalizza</h3>
          <button
            className="small ghost"
            disabled={!hasOverrides(style)}
            onClick={resetTheme}
            title="Torna alle impostazioni predefinite di questo stile"
          >
            ↺ Ripristina
          </button>
        </div>

        <span className="field-label">Sfondo</span>
        <Swatches items={theme.backgrounds} value={t.background} onChange={(id) => setTunable('background', id)} />
        {theme.cards.length > 1 && (
          <>
            <span className="field-label">Cartoncini</span>
            <Swatches items={theme.cards} value={t.card} onChange={(id) => setTunable('card', id)} />
          </>
        )}

        <span className="field-label">Effetto</span>
        <div className="segmented">
          <button className={!t.natural ? 'active' : ''} onClick={() => setTunable('natural', false)}>
            Preciso
          </button>
          <button
            className={t.natural ? 'active' : ''}
            onClick={() => (t.natural ? shuffle() : setTunable('natural', true))}
            title="Clicca di nuovo per una nuova disposizione"
          >
            Naturale {t.natural && '↻'}
          </button>
        </div>

        <label>
          Dimensione cartoncini <output>{Math.round(t.cardScale * 100)}%</output>
          <input
            type="range"
            min={60}
            max={100}
            value={Math.round(t.cardScale * 100)}
            onChange={(e) => setTunable('cardScale', Number(e.target.value) / 100)}
          />
        </label>

        <label className="check">
          <input type="checkbox" checked={t.frame} onChange={(e) => setTunable('frame', e.target.checked)} />
          Cornice
        </label>
        <label className="check">
          <input type="checkbox" checked={t.header} onChange={(e) => setTunable('header', e.target.checked)} />
          Intestazione con logo
        </label>
        {t.header && (
          <label className="indent">
            Titolo
            <input value={style.title} onChange={(e) => setTitle(e.target.value)} />
          </label>
        )}
        <label className="check">
          <input type="checkbox" checked={t.leafIcon} onChange={(e) => setTunable('leafIcon', e.target.checked)} />
          Foglia sui gusti vegani
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={t.majorUppercase}
            onChange={(e) => setTunable('majorUppercase', e.target.checked)}
          />
          Nome in MAIUSCOLO
        </label>
        <FontSelect label="Font nome" value={t.majorFont} onChange={(f) => setTunable('majorFont', f)} />
        <FontSelect label="Font sottotitolo" value={t.minorFont} onChange={(f) => setTunable('minorFont', f)} />
      </section>

      <section>
        <h3>Griglia</h3>
        <Stepper label="Righe" value={board.rows} onChange={(n) => resize(n, board.cols)} />
        <Stepper label="Colonne" value={board.cols} onChange={(n) => resize(board.rows, n)} />
      </section>

      <Backup />
    </aside>
  );
}

/** One live thumbnail per preset: the real board, drawn small, with the user's tweaks. */
function PresetGallery() {
  const data = useStore(useShallow(pickData));
  const setTheme = useStore((s) => s.setTheme);
  const previews = useMemo(
    () => THEME_IDS.map((id): [ThemeId, AppData] => [id, { ...data, style: { ...data.style, theme: id } }]),
    [data],
  );

  return (
    <div className="presets">
      {previews.map(([id, d]) => (
        <button
          key={id}
          className={`preset ${data.style.theme === id ? 'active' : ''}`}
          onClick={() => setTheme(id)}
          aria-pressed={data.style.theme === id}
        >
          <div className="preset-thumb" aria-hidden="true">
            <ScaledBoard data={d} />
          </div>
          <span>
            {THEMES[id].name}
            {hasOverrides(data.style, id) && <i className="modified" title="Personalizzato" />}
          </span>
        </button>
      ))}
    </div>
  );
}

function Swatches({
  items,
  value,
  onChange,
}: {
  items: Array<{ id: string; label: string; dot: string }>;
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="swatches">
      {items.map((s) => (
        <button
          key={s.id}
          className={`swatch ${s.id === value ? 'active' : ''}`}
          style={{ background: s.dot }}
          title={s.label}
          aria-label={s.label}
          aria-pressed={s.id === value}
          onClick={() => onChange(s.id)}
        />
      ))}
    </div>
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
          <option key={id} value={id}>
            {f.label} ({f.family})
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
    const payload = { app: 'ice-cream-board', version: DATA_VERSION, data: pickData(useStore.getState()) };
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    a.download = `ice-cream-board-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importFile = async (file: File) => {
    try {
      const { version, data } = JSON.parse(await file.text());
      // Backups made by older versions are converted like stored data is.
      const current = migrate(data, version ?? 1);
      if (!isAppData(current)) throw new Error('bad file');
      if (confirm('Sostituire tutti i gusti e le impostazioni con quelli del file?')) useStore.getState().replaceData(current);
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
