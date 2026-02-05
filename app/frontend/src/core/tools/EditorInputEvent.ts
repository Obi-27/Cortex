export type EditorInputEvent =
  | KeyInputEvent;

export interface KeyInputEvent {
  kind: "key";
  key: string;
  shift: boolean;
  meta: boolean;
  ctrl: boolean;
  alt: boolean;
}
