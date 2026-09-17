import type { PresetStatus } from "@/types/preset";

const CONFIG: Record<PresetStatus, { label: string; dot: string; className: string }> = {
  "rascunho-ia": {
    label: "Rascunho",
    dot: "bg-amber-400",
    className: "bg-amber-500/10 text-amber-300 ring-amber-500/25",
  },
  "testado-aprovado": {
    label: "Aprovado",
    dot: "bg-emerald-400",
    className: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/25",
  },
  "precisa-ajuste": {
    label: "Precisa ajuste",
    dot: "bg-rose-400",
    className: "bg-rose-500/10 text-rose-300 ring-rose-500/25",
  },
};

export function StatusBadge({ status }: { status: PresetStatus }) {
  const config = CONFIG[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${config.className}`}
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
