export type KnobKey =
  | "volume"
  | "irCab"
  | "reverb"
  | "mix"
  | "fb"
  | "time"
  | "mod"
  | "tone"
  | "gain"
  | "type";

export type PresetKnobs = Record<KnobKey, number>;

export type FootswitchKey = "a" | "b" | "c";

export type PresetFootswitches = Record<FootswitchKey, boolean>;

export type PickupPosition = "braço" | "central" | "ponte";

export interface GuitarInfo {
  key?: string;
  capo?: number;
  pickup?: PickupPosition;
  notes?: string;
}

export type PresetStatus = "rascunho-ia" | "testado-aprovado" | "precisa-ajuste";

export const FEEDBACK_TAGS = [
  "mais-grave",
  "mais-agudo",
  "mais-gain",
  "menos-gain",
  "mais-delay",
  "menos-delay",
  "mais-reverb",
  "menos-reverb",
  "generico-demais",
  "muito-bom",
] as const;

export type FeedbackTag = (typeof FEEDBACK_TAGS)[number];

export interface FeedbackEntry {
  date: string;
  tags: FeedbackTag[];
  note?: string;
}

export interface Preset {
  id: string;
  song: string;
  artist: string;
  tags: string[];
  status: PresetStatus;
  knobs: PresetKnobs;
  footswitches: PresetFootswitches;
  guitar: GuitarInfo;
  reasoning: string;
  feedback: FeedbackEntry[];
  createdAt: string;
  updatedAt: string;
}
