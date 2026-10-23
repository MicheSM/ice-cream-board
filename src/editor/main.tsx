import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { syncAcrossWindows } from '../model/store';
import { startHistory } from '../model/history';
import { tryReconnect } from '../cast/presentation';
import { keepDataSafe, registerServiceWorker } from '../pwa/register';
import { EditorApp } from './EditorApp';
import './editor.css';

syncAcrossWindows();
startHistory();
void tryReconnect();
registerServiceWorker();
keepDataSafe();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EditorApp />
  </StrictMode>,
);
