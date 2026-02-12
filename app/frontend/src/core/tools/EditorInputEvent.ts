export type EditorInputEvent =
  | KeyInputEvent
  | BeforeInputEvent;

export interface KeyInputEvent {
  kind: "key";
  key: string;
  shift: boolean;
  meta: boolean;
  ctrl: boolean;
  alt: boolean;
}

export interface BeforeInputEvent {
  kind: "beforeinput";
  inputType: string;
  data: string | null;
}
