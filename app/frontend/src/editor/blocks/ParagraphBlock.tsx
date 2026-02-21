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
      className="paragraph-block"
    >
      {block.content.map((inline, i) => {
        if (inline.type === "text") {
          let el: React.ReactNode = inline.value || "\uFEFF";
          if (inline.marks?.includes("code")) el = <code>{el}</code>;
          if (inline.marks?.includes("italic")) el = <em>{el}</em>;
          if (inline.marks?.includes("bold")) el = <strong>{el}</strong>;
          return <span key={i}>{el}</span>;
        }
        return null;
      })}
    </div>
  );
}
