import React, { useEffect, useLayoutEffect, useRef } from "react";
import { useEditor } from "./EditorProvider";
import { handleKeyDown } from "./input/keyboard";
import { handleBeforeInput } from "./input/beforeinput";
import type { BlockNode } from "../core/state/DocumentState";
import { ParagraphBlock } from "./blocks/ParagraphBlock";
import { restoreSelectionToDOM } from "./selection/stateToDom";
import { readSelectionFromDOM } from "./selection/domToState";
import { createSetSelectionCommand } from "../core/commands/setSelection";

export function EditorView() {
  const { state, dispatch, toolManager } = useEditor();
  const isRestoringSelection = useRef(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  function onKeyDown(e: React.KeyboardEvent) {
    handleKeyDown(
      e.nativeEvent,
      state,
      toolManager,
      dispatch
    );
  }

  // Native beforeinput listener — React's onBeforeInput doesn't expose inputType
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    function onNativeBeforeInput(e: Event) {
      handleBeforeInput(
        e as InputEvent,
        stateRef.current,
        toolManager,
        dispatch
      );
    }

    el.addEventListener("beforeinput", onNativeBeforeInput);
    return () => el.removeEventListener("beforeinput", onNativeBeforeInput);
  }, [toolManager, dispatch]);

  // Restore DOM selection after render
  useLayoutEffect(() => {
    isRestoringSelection.current = true;
    restoreSelectionToDOM(state.selection);
    // Use rAF to clear the flag after the browser has processed the selection change
    requestAnimationFrame(() => {
      isRestoringSelection.current = false;
    });
  });

  // Sync DOM selection changes back to state
  useEffect(() => {
    function onSelectionChange() {
      if (isRestoringSelection.current) return;

      const editorEl = editorRef.current;
      if (!editorEl) return;

      const domSel = document.getSelection();
      if (!domSel || !domSel.anchorNode || !editorEl.contains(domSel.anchorNode)) return;

      const textSel = readSelectionFromDOM();
      if (!textSel) return;

      // Avoid dispatching if selection hasn't changed
      const cur = stateRef.current.selection;
      if (
        cur &&
        cur.kind === "text" &&
        cur.anchorBlockId === textSel.anchorBlockId &&
        cur.anchorOffset === textSel.anchorOffset &&
        cur.focusBlockId === textSel.focusBlockId &&
        cur.focusOffset === textSel.focusOffset
      ) return;

      dispatch(createSetSelectionCommand(textSel));
    }

    document.addEventListener("selectionchange", onSelectionChange);
    return () => document.removeEventListener("selectionchange", onSelectionChange);
  }, [dispatch]);

  return (
    <div
      id="editor"
      ref={editorRef}
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
