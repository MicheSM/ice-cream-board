import { useEffect, useState } from 'react';
import { castStatus, onCastStatus, startCasting, stopCasting, type CastStatus } from '../cast/presentation';

export function openDisplayWindow() {
  // A named window: pressing the button again focuses the same window instead of opening a new one.
  window.open('display.html', 'ice-cream-board-display', 'popup,width=1280,height=720');
}

export function CastControls() {
  const [status, setStatus] = useState<CastStatus>(castStatus());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const off = onCastStatus(setStatus);
    return () => {
      off();
    };
  }, []);

  const start = async () => {
    setError(null);
    try {
      await startCasting();
    } catch (e) {
      const name = e instanceof DOMException ? e.name : '';
      // NotAllowedError = the user closed the device picker: not worth a message.
      if (name !== 'NotAllowedError' && name !== 'AbortError')
        setError(name === 'NotFoundError' ? 'Nessun Chromecast trovato' : 'Proiezione non riuscita');
    }
  };

  return (
    <>
      <button onClick={openDisplayWindow}>Apri lavagna ↗</button>
      {status === 'connected' || status === 'connecting' ? (
        <button className="danger" onClick={stopCasting}>
          {status === 'connecting' ? 'Connessione…' : '■ Stop proiezione'}
        </button>
      ) : (
        <button
          className="primary"
          onClick={start}
          disabled={status === 'unsupported'}
          title={status === 'unsupported' ? 'Questo browser non supporta «Proietta»: usa Apri lavagna + Trasmetti' : ''}
        >
          ▶ Proietta
        </button>
      )}
      {error && <span className="cast-error">{error}</span>}
    </>
  );
}
