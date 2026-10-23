// Converting saved data from older versions of the app. Each step takes data
// in version N and returns version N+1, so any old backup or browser storage
// can be brought up to date one step at a time.

import { DEFAULT_TITLE, THEME_DEFAULTS } from './themeDefaults';
import type { AppData, FontId, Placement, Tunables } from './types';

export const DATA_VERSION = 2;

interface V1 {
  flavors: AppData['flavors'];
  board: { rows: number; cols: number; cells: Record<string, Placement>; cardScale: number; natural: number; frame: boolean };
  style: { majorFont: FontId; minorFont: FontId; majorUppercase: boolean; leafIcon: boolean };
}

/** v1 → v2: look settings move from board/style into per-preset overrides; Naturale 2/3 become Naturale. */
function v1to2(d: V1): AppData {
  const old: Partial<Tunables> = {
    frame: d.board.frame,
    natural: d.board.natural > 0,
    cardScale: d.board.cardScale,
    ...d.style,
  };
  // Keep only what differs from the Classica defaults, so future default
  // improvements still reach settings the user never touched.
  const defaults = THEME_DEFAULTS.classica;
  const overrides = Object.fromEntries(
    Object.entries(old).filter(([k, v]) => v !== undefined && v !== defaults[k as keyof Tunables]),
  ) as Partial<Tunables>;

  const { rows, cols, cells } = d.board;
  return {
    flavors: d.flavors,
    board: { rows, cols, cells },
    style: { theme: 'classica', title: DEFAULT_TITLE, overrides: Object.keys(overrides).length ? { classica: overrides } : {} },
  };
}

export function migrate(data: unknown, fromVersion: number): AppData {
  let d = data;
  if (fromVersion < 2) d = v1to2(d as V1);
  return d as AppData;
}
