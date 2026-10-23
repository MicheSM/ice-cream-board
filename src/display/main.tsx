import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ScaledBoard } from '../board/Board';
import { isReceiver, listenAsReceiver } from '../cast/presentation';
import { useShallow } from 'zustand/react/shallow';
import { pickData, syncAcrossWindows, useStore } from '../model/store';

// The display page shows the board and nothing else. It gets its data either
// from localStorage (a normal window/tab, kept fresh by `storage` events) or,
// when casted with "Proietta", from messages sent by the editor.

function DisplayApp() {
  const data = useStore(useShallow(pickData));
  // As a cast receiver we start empty and wait for the editor's first message,
  // so the TV never flashes stale or default content.
  const [ready, setReady] = useState(!isReceiver());

  useEffect(() => {
    if (!isReceiver()) return;
    void listenAsReceiver((d) => {
      useStore.getState().replaceData(d);
      setReady(true);
    });
  }, []);

  if (!ready) return null;
  return (
    <div style={{ width: '100%', height: '100%' }} onDoubleClick={() => void document.documentElement.requestFullscreen?.()}>
      <ScaledBoard data={data} />
    </div>
  );
}

syncAcrossWindows();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DisplayApp />
  </StrictMode>,
);
