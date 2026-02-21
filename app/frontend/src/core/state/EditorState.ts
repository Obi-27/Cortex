import type { DocumentState, MarkType } from "./DocumentState";
import type { SelectionState } from "./SelectionState";
import type { HistoryState } from "./HistoryState";

export interface EditorState {
  document: DocumentState;
  selection: SelectionState;
  history: HistoryState;
  storedMarks: MarkType[] | null;
}
