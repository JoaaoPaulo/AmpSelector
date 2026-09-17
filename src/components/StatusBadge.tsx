import type { PresetStatus } from "@/types/preset";

const CONFIG: Record<PresetStatus, { label: string; className: string }> = {
  "rascunho-ia": {
    label: "Rascunho (IA)",
    className: "bg-yellow-900/40 text-yellow-300 border-yellow-700",
  },
  "testado-aprovado": {
    label: "Testado e aprovado",
    className: "bg-green-900/40 text-green-300 border-green-700",
  },
  "precisa-ajuste": {
    label: "Precisa ajuste",
    className: "bg-red-900/40 text-red-300 border-red-700",
  },
};

export function StatusBadge({ status }: { status: PresetStatus }) {
  const config = CONFIG[status];
  return (
    <span className={`text-xs px-2 py-1 rounded-full border whitespace-nowrap ${config.className}`}>
      {config.label}
    </span>
  );
}
