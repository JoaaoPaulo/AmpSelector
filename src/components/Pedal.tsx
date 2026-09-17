"use client";

import { Knob } from "./Knob";
import { Footswitch } from "./Footswitch";
import { KNOB_DEFS, type KnobGroup } from "@/data/pedal-spec";
import type { PresetFootswitches, PresetKnobs, FootswitchKey } from "@/types/preset";

const GROUP_RING: Record<KnobGroup, string> = {
  neutral: "border-neutral-300",
  green: "border-green-500",
  blue: "border-blue-500",
  red: "border-red-500",
};

const FOOTSWITCH_LED: Record<FootswitchKey, string> = {
  a: "bg-green-500",
  b: "bg-blue-500",
  c: "bg-red-500",
};

interface PedalProps {
  knobs: PresetKnobs;
  footswitches: PresetFootswitches;
  onKnobChange: (key: keyof PresetKnobs, value: number) => void;
  onFootswitchToggle: (key: FootswitchKey) => void;
}

export function Pedal({ knobs, footswitches, onKnobChange, onFootswitchToggle }: PedalProps) {
  return (
    <div className="rounded-2xl bg-neutral-900 border border-neutral-700 p-5 sm:p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <span className="font-black italic text-lg tracking-wide text-neutral-100">CUVAVE</span>
        <span className="text-[10px] text-neutral-500 tracking-widest">CUBE BABY</span>
      </div>

      <div className="flex flex-wrap justify-center gap-x-2 gap-y-5 mb-8">
        {KNOB_DEFS.map((def) => {
          const value = knobs[def.key];
          const displayValue = def.options ? def.options[value] : undefined;
          return (
            <Knob
              key={def.key}
              label={def.label}
              value={value}
              max={def.max}
              size={44}
              ringColorClass={GROUP_RING[def.group]}
              displayValue={displayValue}
              onChange={(v) => onKnobChange(def.key, v)}
            />
          );
        })}
      </div>

      <div className="flex justify-center gap-10 sm:gap-16">
        <Footswitch
          label="IR CAB ⟷ REVERB"
          active={footswitches.a}
          ledColorClass={FOOTSWITCH_LED.a}
          onToggle={() => onFootswitchToggle("a")}
        />
        <Footswitch
          label="DELAY ⟷ MOD"
          active={footswitches.b}
          ledColorClass={FOOTSWITCH_LED.b}
          onToggle={() => onFootswitchToggle("b")}
        />
        <Footswitch
          label="TONE ⟷ AMP"
          active={footswitches.c}
          ledColorClass={FOOTSWITCH_LED.c}
          onToggle={() => onFootswitchToggle("c")}
        />
      </div>
    </div>
  );
}
