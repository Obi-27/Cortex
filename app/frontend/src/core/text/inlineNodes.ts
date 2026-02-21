import type { InlineNode, MarkType } from "../state/DocumentState";

export function marksEqual(a?: MarkType[], b?: MarkType[]): boolean {
  const aSorted = a?.length ? [...a].sort() : [];
  const bSorted = b?.length ? [...b].sort() : [];
  if (aSorted.length !== bSorted.length) return false;
  return aSorted.every((m, i) => m === bSorted[i]);
}

export function flattenContent(content: InlineNode[]): string {
  return content.map(n => n.value).join("");
}

export function mergeAdjacentNodes(content: InlineNode[]): InlineNode[] {
  const result: InlineNode[] = [];
  for (const node of content) {
    if (node.value === "") continue;
    const prev = result[result.length - 1];
    if (prev && marksEqual(prev.marks, node.marks)) {
      prev.value += node.value;
    } else {
      result.push({ type: "text", value: node.value, marks: node.marks?.length ? [...node.marks] : undefined } as InlineNode);
    }
  }
  return result.length ? result : [{ type: "text", value: "" }];
}

export function sliceContent(content: InlineNode[], start: number, end: number): InlineNode[] {
  const result: InlineNode[] = [];
  let offset = 0;

  for (const node of content) {
    const nodeStart = offset;
    const nodeEnd = offset + node.value.length;
    offset = nodeEnd;

    if (nodeEnd <= start || nodeStart >= end) continue;

    const sliceStart = Math.max(0, start - nodeStart);
    const sliceEnd = Math.min(node.value.length, end - nodeStart);
    const value = node.value.slice(sliceStart, sliceEnd);

    if (value) {
      result.push({ type: "text", value, marks: node.marks?.length ? [...node.marks] : undefined } as InlineNode);
    }
  }

  return result.length ? result : [{ type: "text", value: "" }];
}

export function spliceContent(
  content: InlineNode[],
  start: number,
  end: number,
  insert: InlineNode[]
): InlineNode[] {
  const totalLen = flattenContent(content).length;
  const before = start > 0 ? sliceContent(content, 0, start) : [];
  const after = end < totalLen ? sliceContent(content, end, totalLen) : [];
  return mergeAdjacentNodes([...before, ...insert, ...after]);
}

export function marksAt(content: InlineNode[], offset: number): MarkType[] {
  if (offset <= 0) {
    const first = content[0];
    return first?.marks?.length ? [...first.marks] : [];
  }

  let pos = 0;
  for (const node of content) {
    const nodeEnd = pos + node.value.length;
    // For a cursor at `offset`, inherit from the node whose range includes offset
    // (or the node just before if offset is at a boundary)
    if (pos < offset && offset <= nodeEnd) {
      return node.marks?.length ? [...node.marks] : [];
    }
    pos = nodeEnd;
  }

  // Past the end — inherit from last node
  const last = content[content.length - 1];
  return last?.marks?.length ? [...last.marks] : [];
}
