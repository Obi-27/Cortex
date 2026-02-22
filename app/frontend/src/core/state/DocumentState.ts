export type MarkType = "bold" | "italic" | "code";

export interface InlineNode {
  type: "text";
  value: string;
  marks?: MarkType[];
}

export interface BlockNode {
  id: string;
  type: "paragraph" | "heading" | "code"; // v0 core only
  content: InlineNode[];
}

export interface DocumentState {
  id: string;
  blocks: BlockNode[];
}
