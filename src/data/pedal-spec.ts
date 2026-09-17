import type { KnobKey } from "@/types/preset";

/**
 * ATENÇÃO: os nomes abaixo (AMP_TYPES e CAB_TYPES) são categorias aproximadas,
 * não os nomes oficiais do manual do Cuvave Cube Baby (não confirmados ainda
 * contra o PDF original). Atualize esta lista se o usuário compartilhar os
 * nomes exatos das 9 posições de amp e das 8 posições de cabinet/IR.
 */
export const AMP_TYPES = [
  "Clean (estilo Fender)",
  "Clean Boutique",
  "Crunch britânico (estilo Marshall)",
  "Crunch americano (estilo Fender)",
  "Lead vintage (estilo Vox)",
  "Lead moderno (estilo Mesa)",
  "High gain britânico (estilo JCM)",
  "High gain moderno (estilo 5150)",
  "Simulação de violão",
  "Direto / baixo",
] as const;

export const CAB_TYPES = [
  "1x12 vintage",
  "1x12 moderno",
  "2x12 britânico",
  "2x12 americano",
  "4x12 vintage",
  "4x12 moderno high gain",
  "Corpo de violão (simulado)",
  "Direto (sem cabinet)",
] as const;

export const MOD_TYPES = ["Chorus", "Phaser"] as const;

export type KnobGroup = "neutral" | "green" | "blue" | "red";

export interface KnobDef {
  key: KnobKey;
  label: string;
  max: number;
  group: KnobGroup;
  options?: readonly string[];
}

export const KNOB_DEFS: KnobDef[] = [
  { key: "volume", label: "VOLUME", max: 10, group: "neutral" },
  { key: "irCab", label: "IR CAB", max: CAB_TYPES.length - 1, group: "green", options: CAB_TYPES },
  { key: "reverb", label: "REVERB", max: 10, group: "green" },
  { key: "mix", label: "MIX", max: 10, group: "blue" },
  { key: "fb", label: "FB", max: 10, group: "blue" },
  { key: "time", label: "TIME", max: 10, group: "blue" },
  { key: "mod", label: "MOD", max: MOD_TYPES.length - 1, group: "blue", options: MOD_TYPES },
  { key: "tone", label: "TONE", max: 10, group: "red" },
  { key: "gain", label: "GAIN", max: 10, group: "red" },
  { key: "type", label: "TYPE", max: AMP_TYPES.length - 1, group: "red", options: AMP_TYPES },
];
