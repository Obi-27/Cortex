import type { EditorState } from "../state/EditorState";
import type { Patch } from "../patches/Patch";

export interface CommandContext {
  state: EditorState;
}

export interface Command {
  id: string;
  skipHistory?: boolean;
  run(ctx: CommandContext): Patch | Patch[] | null;
}
