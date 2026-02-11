import React from "react";
import { useEditor } from "./EditorProvider";
import { handleKeyDown } from "./input/keyboard";
import type { BlockNode } from "../core/state/DocumentState";
import { ParagraphBlock } from "./blocks/ParagraphBlock";

export function EditorView() {
  const { state, dispatch, toolManager } = useEditor();

  function onKeyDown(e: React.KeyboardEvent) {
    handleKeyDown(
      e.nativeEvent,
      state,
      toolManager,
      dispatch
    );
  }

  return (
    <div
      id ="editor"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      {state.document.blocks.map(block => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
}

function BlockRenderer({ block }: { block: BlockNode }) {
  switch (block.type) {
    case "paragraph":
      return <ParagraphBlock block={block} />;
    default:
      return <div>Unknown block</div>;
  }
}
