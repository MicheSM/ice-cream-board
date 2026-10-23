import { useEffect, useState } from 'react';
import { redo, undo, useHistory } from '../model/history';
import { CastControls } from './CastControls';
import { FlavorList } from './FlavorList';
import { BoardEditor } from './BoardEditor';
import { SettingsPanel } from './SettingsPanel';

export function EditorApp() {
  const [help, setHelp] = useState(false);
  const { canUndo, canRedo } = useHistory();

  // Ctrl+Z / Ctrl+Y (or Ctrl+Shift+Z). Inside a text field the browser's own
  // undo for that field wins.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if ((e.target as HTMLElement).closest('input, textarea, select')) return;
      const key = e.key.toLowerCase();
      if (key === 'z' && !e.shiftKey) undo();
      else if (key === 'y' || (key === 'z' && e.shiftKey)) redo();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="editor">
      <header className="topbar">
        <h1>🍦 Ice Cream Board</h1>
        <div className="topbar-actions">
          <button className="icon" onClick={undo} disabled={!canUndo} title="Annulla (Ctrl+Z)" aria-label="Annulla">
            ↶
          </button>
          <button className="icon" onClick={redo} disabled={!canRedo} title="Ripeti (Ctrl+Y)" aria-label="Ripeti">
            ↷
          </button>
          <span className="divider" />
          <CastControls />
          <button className="ghost" onClick={() => setHelp(!help)} aria-expanded={help}>
            ? Aiuto
          </button>
        </div>
      </header>
      {help && <Help onClose={() => setHelp(false)} />}
      <FlavorList />
      <BoardEditor />
      <SettingsPanel />
    </div>
  );
}

function Help({ onClose }: { onClose: () => void }) {
  return (
    <div className="help">
      <button className="ghost close" onClick={onClose} aria-label="Chiudi">
        ✕
      </button>
      <h2>Come portare la lavagna sul monitor</h2>
      <ol>
        <li>
          <b>Proietta</b>: sceglie il Chromecast e mostra la lavagna sul monitor. Se funziona, è il modo più comodo.
        </li>
        <li>
          In alternativa, <b>Apri lavagna</b> apre una finestra con solo la lavagna. In quella finestra: tasto destro →
          <b> Trasmetti…</b> → scegli il Chromecast → in <i>Sorgenti</i> scegli <b>Trasmetti scheda</b> (mai
          “Trasmetti schermo”).
        </li>
        <li>
          Con un cavo HDMI: trascina la finestra della lavagna sul monitor e fai doppio clic per metterla a schermo
          intero.
        </li>
      </ol>
      <p>
        Ogni modifica fatta qui appare subito sul monitor. Se chiudi la finestra della lavagna, la proiezione si ferma:
        il monitor non mostra mai il resto del computer.
      </p>
    </div>
  );
}
