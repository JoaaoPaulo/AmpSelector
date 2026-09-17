import { AMP_TYPES, CAB_TYPES, MOD_TYPES } from "@/data/pedal-spec";
import type { PresetKnobs } from "@/types/preset";

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] uppercase tracking-wider text-muted">{label}</dt>
      <dd className="truncate text-[13px] text-white/85">{value}</dd>
    </div>
  );
}

export function PedalSummary({ knobs }: { knobs: PresetKnobs }) {
  return (
    <dl className="grid grid-cols-1 gap-3 rounded-xl border border-line bg-surface px-4 py-3 sm:grid-cols-3 sm:gap-4">
      <Item label="Amp" value={AMP_TYPES[knobs.type]} />
      <Item label="Cabinet" value={CAB_TYPES[knobs.irCab]} />
      <Item label="Modulação" value={MOD_TYPES[knobs.mod]} />
    </dl>
  );
}
