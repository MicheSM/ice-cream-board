// Drag & drop uses the browser's built-in HTML5 API: the dragged element puts
// data in `dataTransfer`, the drop target reads it. Custom MIME-like types keep
// our drags apart from, say, a file dragged in from the desktop.
import type { DragEvent } from 'react';
import type { BoardConfig, FlavorId } from '../model/types';
import { cellKey } from '../model/types';

const FLAVOR = 'application/x-icb-flavor';
const FROM_BOARD = 'application/x-icb-from-board';

export function startFlavorDrag(e: DragEvent, id: FlavorId, fromBoard: boolean) {
  e.dataTransfer.setData(FLAVOR, id);
  if (fromBoard) e.dataTransfer.setData(FROM_BOARD, '1');
  e.dataTransfer.effectAllowed = 'move';
}

/** During dragover only the types are readable, not the data. */
export const isFlavorDrag = (e: DragEvent) => e.dataTransfer.types.includes(FLAVOR);
export const isBoardDrag = (e: DragEvent) => e.dataTransfer.types.includes(FROM_BOARD);
export const droppedFlavor = (e: DragEvent): FlavorId | null => e.dataTransfer.getData(FLAVOR) || null;

/** First empty cell in reading order (left to right, top to bottom). */
export function firstEmptyCell(board: BoardConfig): { row: number; col: number } | null {
  for (let row = 0; row < board.rows; row++)
    for (let col = 0; col < board.cols; col++) if (!board.cells[cellKey(row, col)]) return { row, col };
  return null;
}
