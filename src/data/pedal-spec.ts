import type { KnobKey } from "@/types/preset";

/**
 * Especificação conferida contra o manual do Cuvave / M-Vave Cube Baby:
 *
 * - TYPE: 9 posições de preamp. O pedal NÃO dá nome a elas — é um knob
 *   numerado que vai do limpo cristalino ao high gain. As descrições abaixo
 *   são nossa leitura desse gradiente, não nomes oficiais; ajuste conforme
 *   o usuário for ouvindo cada posição na prática.
 * - IR CAB: 9 posições. A primeira desliga a simulação de gabinete; as
 *   outras 8 são os cabinets embutidos (também sem nome no aparelho, e
 *   substituíveis por IRs próprios via USB).
 * - MOD: knob contínuo. Centro = desligado, metade da esquerda é Chorus
 *   (mais intenso quanto mais fecha), metade da direita é Phaser.
 */
export const AMP_TYPES = [
  "1 · Limpo cristalino",
  "2 · Limpo cheio",
  "3 · Limpo no limite",
  "4 · Crunch leve",
  "5 · Crunch",
  "6 · Crunch encorpado",
  "7 · Drive de lead",
  "8 · High gain",
  "9 · High gain máximo",
] as const;

export const AMP_TYPES_SHORT = [
  "1 · limpo",
  "2 · limpo",
  "3 · limpo+",
  "4 · crunch-",
  "5 · crunch",
  "6 · crunch+",
  "7 · lead",
  "8 · high gain",
  "9 · high gain+",
] as const;

export const CAB_TYPES = [
  "Sem cabinet",
  "Cabinet 1",
  "Cabinet 2",
  "Cabinet 3",
  "Cabinet 4",
  "Cabinet 5",
  "Cabinet 6",
  "Cabinet 7",
  "Cabinet 8",
] as const;

export const CAB_TYPES_SHORT = [
  "desligado",
  "cab 1",
  "cab 2",
  "cab 3",
  "cab 4",
  "cab 5",
  "cab 6",
  "cab 7",
  "cab 8",
] as const;

/** Centro do knob MOD: abaixo é Chorus, acima é Phaser, no meio desliga. */
export const MOD_CENTER = 5;

export function formatMod(value: number) {
  if (Math.abs(value - MOD_CENTER) < 0.5) return "desligado";
  const depth = Math.round((Math.abs(value - MOD_CENTER) / MOD_CENTER) * 10);
  return value < MOD_CENTER ? `Chorus ${depth}` : `Phaser ${depth}`;
}

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
  /** Para knobs contínuos cujo valor não é só um número. */
  format?: (value: number) => string;
  /** Knob de centro: o arco sai do meio (MOD). */
  centered?: boolean;
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
  {
    key: "mod",
    label: "MOD",
    max: 10,
    color: KNOB_COLORS.blue,
    mark: "E",
    format: formatMod,
    centered: true,
  },
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
