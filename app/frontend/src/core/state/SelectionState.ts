export type SelectionState =
  | TextSelection
  | BlockSelection
  | null;

export interface TextSelection {
  kind: "text";
  anchorBlockId: string;
  anchorOffset: number;
  focusBlockId: string;
  focusOffset: number;
}

export interface BlockSelection {
  kind: "block";
  blockIds: string[];
}
