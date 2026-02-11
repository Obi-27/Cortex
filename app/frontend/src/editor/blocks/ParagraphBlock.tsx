import type { BlockNode } from "../../core/state/DocumentState";

export function ParagraphBlock({ block }: { block: BlockNode }) {
  return (
    <div
      style={{
        minHeight: "1.5em",
        marginBottom: 4
      }}
    >
      {block.content.map((inline, i) => {
        if (inline.type === "text") {
          return <span key={i}>{inline.value}</span>;
        }
        return null;
      })}
    </div>
  );
}
