import type { KnobKey } from "@/types/preset";

/**
 * ATENÇÃO: os nomes em AMP_TYPES e CAB_TYPES são categorias aproximadas, não
 * os nomes oficiais do manual do Cuvave Cube Baby (não confirmados contra o
 * PDF original). Se o usuário compartilhar os nomes exatos, atualize aqui —
 * mas mantenha a ORDEM das posições, porque os presets guardam o índice.
 */
export const AMP_TYPES = [
  "Clean (estilo Fender)",
  "Clean boutique",
  "Crunch britânico (estilo Marshall)",
  "Crunch americano",
  "Lead vintage (estilo Vox)",
  "Lead moderno (estilo Mesa)",
  "High gain britânico (estilo JCM)",
  "High gain moderno (estilo 5150)",
  "Simulação de violão",
] as const;

export const CAB_TYPES = [
  "1x12 vintage",
  "1x12 moderno",
  "2x12 britânico",
  "2x12 americano",
  "4x12 vintage",
  "4x12 moderno high gain",
  "Corpo de violão",
  "Direto (sem cabinet)",
] as const;

/** Versões curtas, para caber embaixo do knob sem quebrar o layout. */
export const AMP_TYPES_SHORT = [
  "Clean Fender",
  "Clean boutique",
  "Crunch UK",
  "Crunch US",
  "Lead Vox",
  "Lead Mesa",
  "High gain UK",
  "High gain 5150",
  "Violão",
] as const;

export const CAB_TYPES_SHORT = [
  "1x12 vintage",
  "1x12 moderno",
  "2x12 UK",
  "2x12 US",
  "4x12 vintage",
  "4x12 high gain",
  "Violão",
  "Direto",
] as const;

export const MOD_TYPES = ["Chorus", "Phaser"] as const;

export const KNOB_COLORS = {
  neutral: "#cbd5e1",
  green: "#22c55e",
  blue: "#3b82f6",
  red: "#ef4444",
} as const;

export interface KnobDef {
  key: KnobKey;
  label: string;
  max: number;
  color: string;
  /** Letrinha serigrafada acima do knob no pedal real (cordas da guitarra). */
  mark?: string;
  /** Quando presente, o knob é um seletor de posições fixas. */
  options?: readonly string[];
  /** Rótulos curtos mostrados embaixo do knob. */
  shortOptions?: readonly string[];
}

export const KNOB_DEFS: KnobDef[] = [
  { key: "volume", label: "VOLUME", max: 10, color: KNOB_COLORS.neutral },
  {
    key: "irCab",
    label: "IR CAB",
    max: CAB_TYPES.length - 1,
    color: KNOB_COLORS.green,
    mark: "E",
    options: CAB_TYPES,
    shortOptions: CAB_TYPES_SHORT,
  },
  { key: "reverb", label: "REVERB", max: 10, color: KNOB_COLORS.green, mark: "A" },
  { key: "mix", label: "MIX", max: 10, color: KNOB_COLORS.blue, mark: "D" },
  { key: "fb", label: "FB", max: 10, color: KNOB_COLORS.blue, mark: "G" },
  { key: "time", label: "TIME", max: 10, color: KNOB_COLORS.blue, mark: "B" },
  { key: "mod", label: "MOD", max: MOD_TYPES.length - 1, color: KNOB_COLORS.blue, mark: "E", options: MOD_TYPES },
  { key: "tone", label: "TONE", max: 10, color: KNOB_COLORS.red, mark: "▶" },
  { key: "gain", label: "GAIN", max: 10, color: KNOB_COLORS.red, mark: "■" },
  {
    key: "type",
    label: "TYPE",
    max: AMP_TYPES.length - 1,
    color: KNOB_COLORS.red,
    mark: "◀",
    options: AMP_TYPES,
    shortOptions: AMP_TYPES_SHORT,
  },
];

export const FOOTSWITCHES = [
  { key: "a", label: "A", blocks: "IR CAB / REVERB", color: KNOB_COLORS.green },
  { key: "b", label: "B", blocks: "DELAY / MOD", color: KNOB_COLORS.blue },
  { key: "c", label: "C", blocks: "TONE / AMP", color: KNOB_COLORS.red },
] as const;
