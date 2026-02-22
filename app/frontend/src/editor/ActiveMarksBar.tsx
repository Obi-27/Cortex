import { useEditor } from "./EditorProvider";
import { marksAt } from "../core/text/inlineNodes";
import type { MarkType } from "../core/state/DocumentState";
import type { EditorState } from "../core/state/EditorState";

const MARK_LABELS: Record<MarkType, string> = {
  bold: "B",
  italic: "I",
  code: "<>"
};

const MARK_STYLES: Record<MarkType, React.CSSProperties> = {
  bold: { fontWeight: 700 },
  italic: { fontStyle: "italic" },
  code: { fontFamily: "monospace", fontSize: "0.85em" }
};

const ALL_MARKS: MarkType[] = ["bold", "italic", "code"];

export function ActiveMarksBar() {
  const { state } = useEditor();
  const active = getActiveMarks(state);

  return (
    <div style={{
      display: "flex",
      gap: 4,
      padding: "4px 8px",
      fontSize: 13,
      userSelect: "none",
    }}>
      {ALL_MARKS.map(mark => {
        const isActive = active.includes(mark);
        return (
          <span
            key={mark}
            style={{
              padding: "2px 6px",
              borderRadius: 3,
              background: isActive ? "#222" : "transparent",
              color: isActive ? "#fff" : "#999",
              ...MARK_STYLES[mark],
            }}
          >
            {MARK_LABELS[mark]}
          </span>
        );
      })}
    </div>
  );
}

function getActiveMarks(state: EditorState): MarkType[] {
  if (state.storedMarks) return state.storedMarks;

  const sel = state.selection;
  if (!sel || sel.kind !== "text") return [];

  const block = state.document.blocks.find(b => b.id === sel.anchorBlockId);
  if (!block) return [];

  return marksAt(block.content, sel.anchorOffset);
}
