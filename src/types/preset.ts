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
  /** Tom da música, ex: "Mi menor". */
  key: string;
  /** Casa do capotraste; 0 = sem capotraste. */
  capo: number;
  /** Posição da chave de 3 tempos da guitarra. */
  pickup: PickupPosition;
  /** Knob de tone da própria guitarra: 0 = abafado, 10 = brilhante. */
  toneKnob: number;
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
  /** Trecho específico da música, ex: "riff principal", "solo final". */
  section?: string;
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
