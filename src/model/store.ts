import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppData, BoardConfig, Flavor, FlavorId, NaturalLevel, Placement, StyleConfig } from './types';
import { cellKey } from './types';
import { makeDefaultData, randomJitter } from './defaults';

export const STORAGE_KEY = 'ice-cream-board';

interface Actions {
  addFlavor: (f: Omit<Flavor, 'id' | 'soldOut'>) => FlavorId;
  updateFlavor: (id: FlavorId, patch: Partial<Omit<Flavor, 'id'>>) => void;
  deleteFlavor: (id: FlavorId) => void;
  /** Put a flavour in a cell. If it was already on the board it moves; a card already in the target cell swaps places with it (or goes back to the inventory). */
  placeFlavor: (id: FlavorId, row: number, col: number) => void;
  clearCell: (row: number, col: number) => void;
  removeFromBoard: (id: FlavorId) => void;
  setGrid: (rows: number, cols: number) => void;
  setBoard: (patch: Partial<Pick<BoardConfig, 'cardScale' | 'frame'>>) => void;
  /** Levels 1..3 re-roll every card's random offsets, so pressing the same button again gives a new arrangement. */
  setNatural: (level: NaturalLevel) => void;
  setStyle: (patch: Partial<StyleConfig>) => void;
  replaceData: (data: AppData) => void;
  resetAll: () => void;
}

export type State = AppData & Actions;

export const pickData = (s: AppData): AppData => ({ flavors: s.flavors, board: s.board, style: s.style });

const findCellOf = (cells: Record<string, Placement>, id: FlavorId) =>
  Object.keys(cells).find((k) => cells[k].flavorId === id);

export const useStore = create<State>()(
  persist(
    (set) => ({
      ...makeDefaultData(),

      addFlavor: (f) => {
        const id = crypto.randomUUID();
        set((s) => ({ flavors: [...s.flavors, { ...f, id, soldOut: false }] }));
        return id;
      },

      updateFlavor: (id, patch) =>
        set((s) => ({ flavors: s.flavors.map((f) => (f.id === id ? { ...f, ...patch } : f)) })),

      deleteFlavor: (id) =>
        set((s) => {
          const cells = { ...s.board.cells };
          const key = findCellOf(cells, id);
          if (key) delete cells[key];
          return { flavors: s.flavors.filter((f) => f.id !== id), board: { ...s.board, cells } };
        }),

      placeFlavor: (id, row, col) =>
        set((s) => {
          const cells = { ...s.board.cells };
          const target = cellKey(row, col);
          const source = findCellOf(cells, id);
          if (source === target) return {};
          const displaced = cells[target];
          cells[target] = { flavorId: id, jitter: source ? cells[source].jitter : randomJitter() };
          if (source) {
            if (displaced) cells[source] = displaced;
            else delete cells[source];
          }
          return { board: { ...s.board, cells } };
        }),

      clearCell: (row, col) =>
        set((s) => {
          const cells = { ...s.board.cells };
          delete cells[cellKey(row, col)];
          return { board: { ...s.board, cells } };
        }),

      removeFromBoard: (id) =>
        set((s) => {
          const cells = { ...s.board.cells };
          const key = findCellOf(cells, id);
          if (!key) return {};
          delete cells[key];
          return { board: { ...s.board, cells } };
        }),

      setGrid: (rows, cols) =>
        set((s) => {
          // Cards that end up outside the new grid go back to the inventory.
          const cells: Record<string, Placement> = {};
          for (let r = 0; r < rows; r++)
            for (let c = 0; c < cols; c++) {
              const p = s.board.cells[cellKey(r, c)];
              if (p) cells[cellKey(r, c)] = p;
            }
          return { board: { ...s.board, rows, cols, cells } };
        }),

      setBoard: (patch) => set((s) => ({ board: { ...s.board, ...patch } })),

      setNatural: (level) =>
        set((s) => {
          if (level === 0) return { board: { ...s.board, natural: 0 } };
          const cells: Record<string, Placement> = {};
          for (const [k, p] of Object.entries(s.board.cells)) cells[k] = { ...p, jitter: randomJitter() };
          return { board: { ...s.board, natural: level, cells } };
        }),

      setStyle: (patch) => set((s) => ({ style: { ...s.style, ...patch } })),

      replaceData: (data) => set(pickData(data)),

      resetAll: () => set(makeDefaultData()),
    }),
    {
      name: STORAGE_KEY,
      // Bump this when AppData changes shape, and convert old data in `migrate`,
      // so an update never wipes the shop's flavours.
      version: 1,
      partialize: (s: State) => pickData(s),
    },
  ),
);

/**
 * Keep every open window of the app in sync. When one window writes to
 * localStorage, the browser fires a `storage` event in all the *other* windows
 * of the same site; they reload the state from storage and re-render.
 */
export function syncAcrossWindows() {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) void useStore.persist.rehydrate();
  });
}
