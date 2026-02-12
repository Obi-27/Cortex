import type { BlockNode } from "../../core/state/DocumentState";

export function ParagraphBlock({ block }: { block: BlockNode }) {
  return (
    <div
      contentEditable
      suppressContentEditableWarning
      data-block-id={block.id}
      style={{
        minHeight: "1.5em",
        marginBottom: 4,
        outline: "none"
      }}
    >
      {block.content.map((inline, i) => {
        if (inline.type === "text") {
          return <span key={i}>{inline.value || "\uFEFF"}</span>;
        }
        return null;
      })}
    </div>
  );
}
