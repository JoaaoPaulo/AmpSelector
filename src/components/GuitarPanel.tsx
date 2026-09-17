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
    <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-muted">
        Como deixar a guitarra
      </h2>

      <div className="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-start">
        <div className="flex flex-col items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
            Chave de 3 tempos
          </span>
          <PickupSwitch
            value={guitar.pickup}
            onChange={(pickup: PickupPosition) => onChange({ pickup })}
          />
        </div>

        <div className="flex flex-col items-center gap-2 sm:w-[150px]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
            Tone da guitarra
          </span>
          <div className="pt-1">
            <Knob
              label="TONE"
              value={guitar.toneKnob}
              max={10}
              size={74}
              cap="cream"
              color="#f59e0b"
              onChange={(toneKnob) => onChange({ toneKnob })}
            />
          </div>
          <p className="text-center text-[11px] text-white/70">{toneHint(guitar.toneKnob)}</p>
          <p className="text-center text-[10px] text-muted">0 = abafado · 10 = aberto</p>
        </div>
      </div>

      <dl className="mt-6 grid gap-3 border-t border-line pt-5 sm:grid-cols-2">
        <div className="flex items-baseline gap-2">
          <dt className="text-xs uppercase tracking-wider text-muted">Tom</dt>
          <dd className="text-sm text-white/90">{guitar.key}</dd>
        </div>
        <div className="flex items-baseline gap-2">
          <dt className="text-xs uppercase tracking-wider text-muted">Capotraste</dt>
          <dd className="text-sm text-white/90">
            {guitar.capo > 0 ? `${guitar.capo}ª casa` : "sem capotraste"}
          </dd>
        </div>
      </dl>

      {guitar.notes && (
        <p className="mt-4 rounded-xl bg-surface-2 p-4 text-sm leading-relaxed text-white/75">
          {guitar.notes}
        </p>
      )}
    </section>
  );
}
