export interface InlineNode {
  type: "text";
  value: string;
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
