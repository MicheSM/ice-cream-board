// Undo / redo. After every change we keep a snapshot of the data as it was
// *before* the change. Snapshots are cheap: the store never mutates objects,
// it replaces them, so a snapshot is just a few references.

import { create } from 'zustand';
import { isExternalUpdate, pickData, useStore } from './store';
import type { AppData } from './types';

const LIMIT = 100;
/** Changes closer than this are one step (e.g. dragging a slider). */
const GROUP_MS = 700;

let past: AppData[] = [];
let future: AppData[] = [];
let lastChange = 0;
let applying = false;

/** Only for the toolbar buttons (enabled / disabled). */
export const useHistory = create(() => ({ canUndo: false, canRedo: false }));
const publish = () => useHistory.setState({ canUndo: past.length > 0, canRedo: future.length > 0 });

export function startHistory() {
  useStore.subscribe((state, prev) => {
    if (applying || isExternalUpdate()) return;
    if (state.flavors === prev.flavors && state.board === prev.board && state.style === prev.style) return;
    const now = Date.now();
    if (now - lastChange > GROUP_MS) {
      past.push(pickData(prev));
      if (past.length > LIMIT) past.shift();
    }
    lastChange = now;
    future = [];
    publish();
  });
}

function apply(data: AppData) {
  applying = true;
  useStore.getState().replaceData(data);
  applying = false;
  lastChange = 0;
  publish();
}

export function undo() {
  const prev = past.pop();
  if (!prev) return;
  future.push(pickData(useStore.getState()));
  apply(prev);
}

export function redo() {
  const next = future.pop();
  if (!next) return;
  past.push(pickData(useStore.getState()));
  apply(next);
}
