import type { PresetStatus } from "@/types/preset";

const CONFIG: Record<PresetStatus, { label: string; dot: string; className: string }> = {
  "rascunho-ia": {
    label: "Rascunho",
    dot: "bg-amber-400",
    className: "border-amber-500/35 bg-amber-500/15 text-amber-200",
  },
  "testado-aprovado": {
    label: "Aprovado",
    dot: "bg-emerald-400",
    className: "border-emerald-500/35 bg-emerald-500/15 text-emerald-200",
  },
  "precisa-ajuste": {
    label: "Precisa ajuste",
    dot: "bg-rose-400",
    className: "border-rose-500/35 bg-rose-500/15 text-rose-200",
  },
};

export function StatusBadge({ status }: { status: PresetStatus }) {
  const config = CONFIG[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded border px-2 py-1 text-[11px] font-medium ${config.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

export const STATUS_LABELS: Record<PresetStatus, string> = {
  "rascunho-ia": "Rascunho (IA)",
  "testado-aprovado": "Testado e aprovado",
  "precisa-ajuste": "Precisa ajuste",
};
