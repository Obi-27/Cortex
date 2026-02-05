export type SelectionState =
  | TextSelection
  | BlockSelection
  | null;

export interface TextSelection {
  kind: "text";
  blockId: string;
  anchor: number;
  focus: number;
}

export interface BlockSelection {
  kind: "block";
  blockIds: string[];
}
