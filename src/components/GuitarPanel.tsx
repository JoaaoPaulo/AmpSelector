"use client";

import { Knob } from "./Knob";
import { PickupSwitch } from "./PickupSwitch";
import type { GuitarInfo, PickupPosition } from "@/types/preset";

interface GuitarPanelProps {
  guitar: GuitarInfo;
  onChange: (patch: Partial<GuitarInfo>) => void;
}

function toneHint(value: number) {
  if (value <= 2) return "bem abafado";
  if (value <= 4) return "abafado";
  if (value <= 6) return "meio termo";
  if (value <= 8) return "brilhante";
  return "totalmente aberto";
}

export function GuitarPanel({ guitar, onChange }: GuitarPanelProps) {
  return (
    <section className="rounded-lg border border-line bg-surface p-5">
      <div className="mb-4 flex flex-wrap items-baseline gap-x-5 gap-y-1">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Guitarra</h2>
        <p className="text-sm text-white/85">
          {guitar.key}
          <span className="text-muted">
            {" · "}
            {guitar.capo > 0 ? `capotraste na ${guitar.capo}ª casa` : "sem capotraste"}
          </span>
        </p>
      </div>

      <div className="grid items-start gap-6 sm:grid-cols-[auto_1fr] sm:gap-8">
        <div className="flex items-start justify-center gap-8 sm:justify-start">
          <div className="flex flex-col items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
              Chave
            </span>
            <PickupSwitch
              value={guitar.pickup}
              onChange={(pickup: PickupPosition) => onChange({ pickup })}
            />
          </div>

          <div className="flex flex-col items-center gap-1 pt-[18px]">
            <Knob
              label="TONE"
              value={guitar.toneKnob}
              max={10}
              size={72}
              cap="cream"
              color="#f59e0b"
              onChange={(toneKnob) => onChange({ toneKnob })}
            />
            <p className="text-center text-[11px] text-white/70">{toneHint(guitar.toneKnob)}</p>
          </div>
        </div>

        {guitar.notes && (
          <p className="border-t border-line pt-4 text-sm leading-relaxed text-white/70 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
            {guitar.notes}
          </p>
        )}
      </div>
    </section>
  );
}
