import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { syncAcrossWindows } from '../model/store';
import { tryReconnect } from '../cast/presentation';
import { EditorApp } from './EditorApp';
import './editor.css';

syncAcrossWindows();
void tryReconnect();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EditorApp />
  </StrictMode>,
);
