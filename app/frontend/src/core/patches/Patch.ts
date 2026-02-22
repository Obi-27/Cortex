import type { BlockNode, MarkType } from "../state/DocumentState";
import type { SelectionState } from "../state/SelectionState";

export type Patch =
  | InsertBlockPatch
  | UpdateBlockPatch
  | DeleteBlockPatch
  | SetSelectionPatch
  | SetStoredMarksPatch
  | BatchPatch

export interface BatchPatch {
  type: "batch";
  patches: Patch[];
}

export interface InsertBlockPatch {
  type: "insertBlock";
  block: BlockNode;
  index: number;
}

export interface UpdateBlockPatch {
  type: "updateBlock";
  blockId: string;
  content: BlockNode["content"];
}

export interface DeleteBlockPatch {
  type: "deleteBlock";
  blockId: string;
}

export interface SetSelectionPatch {
  type: "setSelection";
  selection: SelectionState;
}

export interface SetStoredMarksPatch {
  type: "setStoredMarks";
  marks: MarkType[] | null;
}
