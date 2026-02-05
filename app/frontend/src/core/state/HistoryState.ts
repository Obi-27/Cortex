import type { Patch } from "../patches/Patch";
import type { SelectionState } from "./SelectionState";

export interface HistoryEntry {
  patch: Patch;
  inverse: Patch;
  selectionBefore: SelectionState;
  selectionAfter: SelectionState;
}

export interface HistoryState {
  past: HistoryEntry[];
  future: HistoryEntry[];
}
